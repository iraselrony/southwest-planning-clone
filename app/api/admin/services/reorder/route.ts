/**
 * /api/admin/services/reorder — bulk-update displayOrder for a list
 * of service IDs in the order provided.
 *
 * Body: { orderedIds: number[] }
 *
 * On success, every row's displayOrder is set to its index in the
 * array. We do this in a single transaction so a partial failure
 * doesn't leave the list half-sorted.
 */
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../../../../../db";
import { services as servicesTable } from "../../../../../db/schema";
import { requireAdminApi } from "../../../../admin/_lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
	orderedIds: z.array(z.number().int().positive()).min(1),
});

export async function POST(request: Request) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return NextResponse.json(
			{ error: "Invalid JSON body" },
			{ status: 400 },
		);
	}
	const parsed = Body.safeParse(raw);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Validation failed", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const { orderedIds } = parsed.data;

	// Use a single CASE statement so the update is one round-trip.
	// Also verifies every id exists; a missing id is a 404.
	const existing = await db
		.select({ id: servicesTable.id })
		.from(servicesTable);
	const existingIds = new Set(existing.map((r) => r.id));
	for (const id of orderedIds) {
		if (!existingIds.has(id)) {
			return NextResponse.json(
				{ error: `Service id ${id} not found` },
				{ status: 404 },
			);
		}
	}

	const cases = orderedIds
		.map(
			(id, idx) =>
				sql`WHEN ${id} THEN ${idx + 1}`,
		)
		.reduce<ReturnType<typeof sql>>(
			(acc, cur) => sql`${acc} ${cur}`,
			sql``,
		);

	await db
		.update(servicesTable)
		.set({
			displayOrder: sql`(CASE ${servicesTable.id} ${cases} END)`,
		})
		.where(sql`${servicesTable.id} IN (${sql.join(orderedIds, sql`, `)})`);

	// Bust caches.
	revalidatePath("/");
	revalidatePath("/our-services");
	revalidatePath("/admin/services");

	return NextResponse.json({ ok: true, count: orderedIds.length });
}
