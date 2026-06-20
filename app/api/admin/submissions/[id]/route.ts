/**
 * /api/admin/submissions/[id]
 *   GET — single submission as JSON
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../../db";
import { contactSubmissions } from "../../../../../db/schema";
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
		.from(contactSubmissions)
		.where(eq(contactSubmissions.id, id))
		.limit(1);
	if (!row) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	return NextResponse.json(row);
}
