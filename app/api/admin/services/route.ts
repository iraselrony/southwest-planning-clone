/**
 * /api/admin/services
 *   GET   — list all services, ordered by displayOrder
 *   POST  — create a new service
 */
import { NextResponse } from "next/server";
import { asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../../../../db";
import { services as servicesTable } from "../../../../db/schema";
import { requireAdminApi } from "../../../admin/_lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;
	const rows = await db
		.select()
		.from(servicesTable)
		.orderBy(asc(servicesTable.displayOrder));
	return NextResponse.json(rows);
}

const PostBody = z.object({
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, hyphenated"),
	name: z.string().min(1).max(200),
	subtitle: z.string().max(20).nullable().optional(),
	cardImageUrl: z.string().url().nullable().optional(),
	description: z.string().min(1).max(2000),
	longDescription: z.record(z.string(), z.unknown()),
	contactFormEnabled: z.boolean(),
	displayOrder: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}
	const parsed = PostBody.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	// Slug must be unique.
	const existing = await db
		.select({ id: servicesTable.id })
		.from(servicesTable)
		.where(eq(servicesTable.slug, parsed.data.slug))
		.limit(1);
	if (existing.length > 0) {
		return NextResponse.json(
			{ error: `Slug '${parsed.data.slug}' already exists` },
			{ status: 409 },
		);
	}

	// Auto-compute displayOrder if not provided.
	let displayOrder = parsed.data.displayOrder;
	if (displayOrder == null) {
		const [m] = await db
			.select({ maxOrder: max(servicesTable.displayOrder) })
			.from(servicesTable);
		displayOrder = (m?.maxOrder ?? 0) + 1;
	}

	const [created] = await db
		.insert(servicesTable)
		.values({
			slug: parsed.data.slug,
			name: parsed.data.name,
			subtitle: parsed.data.subtitle ?? null,
			cardImageUrl: parsed.data.cardImageUrl ?? null,
			description: parsed.data.description,
			longDescription: parsed.data.longDescription,
			contactFormEnabled: parsed.data.contactFormEnabled,
			displayOrder,
		})
		.returning({ id: servicesTable.id });

	// Bust the public site caches that list or link to services.
	revalidatePath("/");
	revalidatePath("/our-services");
	revalidatePath(`/services/${parsed.data.slug}`);
	revalidatePath("/admin/services");
	revalidatePath("/sitemap.xml");

	return NextResponse.json({ ok: true, id: created?.id });
}
