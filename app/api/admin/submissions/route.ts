/**
 * /api/admin/submissions
 *   GET — paginated, searchable, filterable list
 *
 * Query params:
 *   search   — substring match on name/email/message
 *   source   — "contact-page" | "service-page" | <exact>
 *   page     — 1-indexed (default 1)
 *   pageSize — default 20, max 100
 */
import { NextResponse } from "next/server";
import { and, or, like, desc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "../../../../db";
import { contactSubmissions } from "../../../../db/schema";
import { requireAdminApi } from "../../../admin/_lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	const url = new URL(request.url);
	const search = (url.searchParams.get("search") ?? "").trim();
	const source = (url.searchParams.get("source") ?? "").trim();
	const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
	const pageSize = Math.min(
		100,
		Math.max(1, Number(url.searchParams.get("pageSize") ?? "20") || 20),
	);
	const offset = (page - 1) * pageSize;

	const conditions: SQL[] = [];
	if (search) {
		conditions.push(
			or(
				like(contactSubmissions.name, `%${search}%`),
				like(contactSubmissions.email, `%${search}%`),
				like(contactSubmissions.message, `%${search}%`),
			)!,
		);
	}
	if (source) {
		if (source === "contact-page") {
			conditions.push(eq(contactSubmissions.source, "contact-page"));
		} else if (source === "service-page") {
			conditions.push(like(contactSubmissions.source, "service-page:%"));
		} else {
			conditions.push(eq(contactSubmissions.source, source));
		}
	}
	const whereExpr =
		conditions.length > 0 ? and(...conditions) : undefined;

	const [countRow, rows] = await Promise.all([
		db
			.select({ n: sql<number>`count(*)::int` })
			.from(contactSubmissions)
			.where(whereExpr),
		db
			.select({
				id: contactSubmissions.id,
				name: contactSubmissions.name,
				email: contactSubmissions.email,
				phone: contactSubmissions.phone,
				source: contactSubmissions.source,
				message: contactSubmissions.message,
				submittedAt: contactSubmissions.submittedAt,
				ipAddress: contactSubmissions.ipAddress,
			})
			.from(contactSubmissions)
			.where(whereExpr)
			.orderBy(desc(contactSubmissions.submittedAt))
			.limit(pageSize)
			.offset(offset),
	]);

	return NextResponse.json({
		rows,
		total: countRow?.[0]?.n ?? 0,
		page,
		pageSize,
		totalPages: Math.max(1, Math.ceil((countRow?.[0]?.n ?? 0) / pageSize)),
	});
}
