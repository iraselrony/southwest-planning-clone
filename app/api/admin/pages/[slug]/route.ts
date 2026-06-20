/**
 * PUT /api/admin/pages/[slug] — update a single page.
 *
 * Body shape:
 *   {
 *     title: string,
 *     metaTitle: string,
 *     metaDescription: string,
 *     ogImageUrl: string | null,
 *     showInNav: boolean,
 *     body: Record<string, unknown>  // jsonb
 *   }
 *
 * On success: revalidates the page's public path so the change
 * appears on the live site within the next request.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../../../../../db";
import { pages as pagesTable } from "../../../../../db/schema";
import { requireAdminApi } from "../../../../admin/_lib/api-auth";

const PutBody = z.object({
	title: z.string().min(1).max(500),
	metaTitle: z.string().min(1).max(500),
	metaDescription: z.string().min(1).max(2000),
	ogImageUrl: z.string().url().nullable().optional(),
	showInNav: z.boolean(),
	body: z.record(z.string(), z.unknown()),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	const { slug: rawSlug } = await params;
	const slug = decodeURIComponent(rawSlug);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}
	const parsed = PutBody.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "Validation failed",
				issues: parsed.error.issues,
			},
			{ status: 400 },
		);
	}

	// Check the page exists.
	const [existing] = await db
		.select({ slug: pagesTable.slug })
		.from(pagesTable)
		.where(eq(pagesTable.slug, slug))
		.limit(1);
	if (!existing) {
		return NextResponse.json(
			{ error: `Page '${slug}' not found` },
			{ status: 404 },
		);
	}

	// Update.
	const updated = await db
		.update(pagesTable)
		.set({
			title: parsed.data.title,
			metaTitle: parsed.data.metaTitle,
			metaDescription: parsed.data.metaDescription,
			ogImageUrl: parsed.data.ogImageUrl ?? null,
			showInNav: parsed.data.showInNav,
			body: parsed.data.body,
			updatedAt: new Date(),
		})
		.where(eq(pagesTable.slug, slug))
		.returning({
			slug: pagesTable.slug,
			updatedAt: pagesTable.updatedAt,
		});

	// Bust the ISR cache for this public path so the change shows
	// up on the next request. Also bust the sitemap (if the page
	// appears in it) and the admin pages list.
	revalidatePath(slug);
	revalidatePath("/sitemap.xml");
	revalidatePath("/admin/pages");
	revalidatePath(`/admin/pages/${encodeURIComponent(slug)}`);

	return NextResponse.json({
		ok: true,
		slug: updated[0]?.slug,
		updatedAt: updated[0]?.updatedAt,
	});
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	const { slug: rawSlug } = await params;
	const slug = decodeURIComponent(rawSlug);

	const [row] = await db
		.select()
		.from(pagesTable)
		.where(eq(pagesTable.slug, slug))
		.limit(1);

	if (!row) {
		return NextResponse.json(
			{ error: `Page '${slug}' not found` },
			{ status: 404 },
		);
	}
	return NextResponse.json(row);
}
