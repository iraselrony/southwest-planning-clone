/**
 * /api/admin/services/[id]
 *   GET    — single service
 *   PUT    — update
 *   DELETE — remove
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../../../../../db";
import { services as servicesTable } from "../../../../../db/schema";
import { requireAdminApi } from "../../../../admin/_lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;
	const { id: idStr } = await params;
	const id = Number(idStr);
	if (!Number.isFinite(id)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}
	const [row] = await db
		.select()
		.from(servicesTable)
		.where(eq(servicesTable.id, id))
		.limit(1);
	if (!row) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	return NextResponse.json(row);
}

const PutBody = z.object({
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9-]+$/),
	name: z.string().min(1).max(200),
	subtitle: z.string().max(20).nullable().optional(),
	cardImageUrl: z.string().url().nullable().optional(),
	description: z.string().min(1).max(2000),
	longDescription: z.record(z.string(), z.unknown()),
	contactFormEnabled: z.boolean(),
	displayOrder: z.number().int().min(0),
});

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;
	const { id: idStr } = await params;
	const id = Number(idStr);
	if (!Number.isFinite(id)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ error: "Invalid JSON body" },
			{ status: 400 },
		);
	}
	const parsed = PutBody.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	// Check slug uniqueness if changed.
	const [existing] = await db
		.select({ slug: servicesTable.slug })
		.from(servicesTable)
		.where(eq(servicesTable.id, id))
		.limit(1);
	if (!existing) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	if (existing.slug !== parsed.data.slug) {
		const [conflict] = await db
			.select({ id: servicesTable.id })
			.from(servicesTable)
			.where(eq(servicesTable.slug, parsed.data.slug))
			.limit(1);
		if (conflict) {
			return NextResponse.json(
				{
					error: `Slug '${parsed.data.slug}' is already used by another service`,
				},
				{ status: 409 },
			);
		}
	}

	await db
		.update(servicesTable)
		.set({
			slug: parsed.data.slug,
			name: parsed.data.name,
			subtitle: parsed.data.subtitle ?? null,
			cardImageUrl: parsed.data.cardImageUrl ?? null,
			description: parsed.data.description,
			longDescription: parsed.data.longDescription,
			contactFormEnabled: parsed.data.contactFormEnabled,
			displayOrder: parsed.data.displayOrder,
			updatedAt: new Date(),
		})
		.where(eq(servicesTable.id, id));

	// Bust caches. If the slug changed, bust both the old and the
	// new paths (and the corresponding /our-services + sitemap).
	revalidatePath("/");
	revalidatePath("/our-services");
	if (existing.slug !== parsed.data.slug) {
		revalidatePath(`/services/${existing.slug}`);
	}
	revalidatePath(`/services/${parsed.data.slug}`);
	revalidatePath("/admin/services");
	revalidatePath(`/admin/services/${id}`);
	revalidatePath("/sitemap.xml");

	return NextResponse.json({ ok: true, id });
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;
	const { id: idStr } = await params;
	const id = Number(idStr);
	if (!Number.isFinite(id)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	const [existing] = await db
		.select({ slug: servicesTable.slug })
		.from(servicesTable)
		.where(eq(servicesTable.id, id))
		.limit(1);
	if (!existing) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	await db.delete(servicesTable).where(eq(servicesTable.id, id));

	// Bust caches. The static HTML for the service page is still
	// on disk (we don't delete the route file), but revalidating
	// the path means the next request regenerates the static page
	// (and the service no longer links to it from the homepage /
	// /our-services grids).
	revalidatePath("/");
	revalidatePath("/our-services");
	revalidatePath(`/services/${existing.slug}`);
	revalidatePath("/admin/services");
	revalidatePath("/sitemap.xml");

	return NextResponse.json({ ok: true, id });
}
