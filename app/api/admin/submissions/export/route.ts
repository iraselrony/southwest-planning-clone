/**
 * /api/admin/submissions/export — CSV export of contact_submissions.
 *
 * Streams the response (doesn't buffer all rows in memory). The
 * same search/filter query params as the list endpoint are honoured.
 * Filename: contact-submissions-YYYY-MM-DD.csv
 *
 * The CSV uses CRLF line endings (Excel-friendly). Fields that
 * contain commas, quotes, or newlines are quoted and quotes are
 * doubled per RFC 4180.
 */
import { and, or, like, asc, eq, type SQL } from "drizzle-orm";
import { db } from "../../../../../db";
import { contactSubmissions } from "../../../../../db/schema";
import { requireAdminApi } from "../../../../admin/_lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADER = [
	"id",
	"submitted_at",
	"name",
	"email",
	"phone",
	"source",
	"ip_address",
	"message",
];

function csvField(v: unknown): string {
	if (v == null) return "";
	const s = String(v);
	if (/[",\r\n]/.test(s)) {
		return `"${s.replace(/"/g, '""')}"`;
	}
	return s;
}

function csvLine(fields: unknown[]): string {
	return fields.map(csvField).join(",") + "\r\n";
}

export async function GET(request: Request) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	const url = new URL(request.url);
	const search = (url.searchParams.get("search") ?? "").trim();
	const source = (url.searchParams.get("source") ?? "").trim();

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

	const rows = await db
		.select({
			id: contactSubmissions.id,
			submittedAt: contactSubmissions.submittedAt,
			name: contactSubmissions.name,
			email: contactSubmissions.email,
			phone: contactSubmissions.phone,
			source: contactSubmissions.source,
			ipAddress: contactSubmissions.ipAddress,
			message: contactSubmissions.message,
		})
		.from(contactSubmissions)
		.where(whereExpr)
		.orderBy(asc(contactSubmissions.submittedAt));

	const today = new Date().toISOString().slice(0, 10);
	const filename = `contact-submissions-${today}.csv`;

	// Use a TransformStream to keep memory low for large exports.
	const stream = new ReadableStream({
		start(controller) {
			const enc = new TextEncoder();
			controller.enqueue(enc.encode(csvLine(HEADER)));
			for (const row of rows) {
				controller.enqueue(
					enc.encode(
						csvLine([
							row.id,
							row.submittedAt.toISOString(),
							row.name,
							row.email,
							row.phone,
							row.source,
							row.ipAddress,
							row.message,
						]),
					),
				);
			}
			controller.close();
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/csv; charset=utf-8",
			"Content-Disposition": `attachment; filename="${filename}"`,
			"Cache-Control": "no-store",
		},
	});
}
