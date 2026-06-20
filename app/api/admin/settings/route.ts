/**
 * /api/admin/settings
 *   GET — return the single site_settings row (id=1)
 *   PUT — update the row
 *
 * The id=1 row is always present after the seed. If it's missing
 * (e.g. after a manual DB wipe), PUT upserts it.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../../../../db";
import { siteSettings } from "../../../../db/schema";
import { requireAdminApi } from "../../../admin/_lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;
	const [row] = await db
		.select()
		.from(siteSettings)
		.where(eq(siteSettings.id, 1))
		.limit(1);
	if (!row) {
		return NextResponse.json(
			{ error: "site_settings row not seeded" },
			{ status: 500 },
		);
	}
	return NextResponse.json(row);
}

const PutBody = z.object({
	logoUrl: z.string().url().nullable().optional(),
	companyName: z.string().min(1).max(200),
	companyTagline: z.string().max(500).nullable().optional(),
	address: z.string().max(1000).nullable().optional(),
	phoneNumbers: z.array(z.string().max(50)),
	email: z.string().email().nullable().optional(),
	socialLinks: z.record(z.string(), z.string().url()),
	registrationNumber: z.string().max(50).nullable().optional(),
	registeredOffice: z.string().max(1000).nullable().optional(),
	footerText: z.string().max(2000).nullable().optional(),
});

export async function PUT(request: Request) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}
	const parsed = PutBody.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	// Upsert: UPDATE if exists, INSERT if not.
	const [existing] = await db
		.select({ id: siteSettings.id })
		.from(siteSettings)
		.where(eq(siteSettings.id, 1))
		.limit(1);

	const data = {
		logoUrl: parsed.data.logoUrl ?? null,
		companyName: parsed.data.companyName,
		companyTagline: parsed.data.companyTagline ?? null,
		address: parsed.data.address ?? null,
		phoneNumbers: parsed.data.phoneNumbers,
		email: parsed.data.email ?? null,
		socialLinks: parsed.data.socialLinks,
		registrationNumber: parsed.data.registrationNumber ?? null,
		registeredOffice: parsed.data.registeredOffice ?? null,
		footerText: parsed.data.footerText ?? null,
		updatedAt: new Date(),
	};

	if (existing) {
		await db.update(siteSettings).set(data).where(eq(siteSettings.id, 1));
	} else {
		await db.insert(siteSettings).values({ id: 1, ...data });
	}

	// Bust the entire site. The site settings show in the header,
	// footer, and contact page (every page on the site).
	revalidatePath("/", "layout");

	return NextResponse.json({ ok: true });
}
