/**
 * /admin/submissions — list of contact form submissions.
 * Search by name/email/message, filter by source, paginated.
 *
 * For Day 4 the filters live in the URL (`?search=&source=&page=`)
 * so the user can bookmark filtered views and the CSV export
 * honours the same filters.
 */
import Link from "next/link";
import { sql, and, or, like, desc, eq, type SQL } from "drizzle-orm";
import { db } from "../../../../db";
import { contactSubmissions } from "../../../../db/schema";
import { SearchBar } from "./search-bar";

const PAGE_SIZE = 20;

export const dynamic = "force-dynamic";

type SearchParams = {
	searchParams: Promise<{
		search?: string;
		source?: string;
		page?: string;
	}>;
};

export default async function AdminSubmissionsPage({
	searchParams,
}: SearchParams) {
	const params = await searchParams;
	const search = (params.search ?? "").trim();
	const source = (params.source ?? "").trim();
	const page = Math.max(1, Number(params.page ?? "1") || 1);
	const offset = (page - 1) * PAGE_SIZE;

	// Build the WHERE clause.
	const conditions: SQL[] = [];
	if (search) {
		// Search across name, email, and message
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
			// Service pages use the prefix "service-page:"
			conditions.push(like(contactSubmissions.source, "service-page:%"));
		} else {
			conditions.push(eq(contactSubmissions.source, source));
		}
	}
	const whereExpr = conditions.length > 0 ? and(...conditions) : undefined;

	// Run the count + the page query in parallel.
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
				source: contactSubmissions.source,
				message: contactSubmissions.message,
				submittedAt: contactSubmissions.submittedAt,
			})
			.from(contactSubmissions)
			.where(whereExpr)
			.orderBy(desc(contactSubmissions.submittedAt))
			.limit(PAGE_SIZE)
			.offset(offset),
	]);

	const total = countRow?.[0]?.n ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	// Build the export URL that preserves current filters.
	const exportUrl = new URLSearchParams();
	if (search) exportUrl.set("search", search);
	if (source) exportUrl.set("source", source);
	const exportHref = `/api/admin/submissions/export${
		exportUrl.toString() ? `?${exportUrl}` : ""
	}`;

	return (
		<div>
			<div className="mb-6 flex items-baseline justify-between">
				<div>
					<Link
						href="/admin"
						className="text-sm text-neutral-500 hover:text-neutral-700"
					>
						← Dashboard
					</Link>
					<h1 className="mt-2 text-2xl font-semibold tracking-tight">
						Contact submissions
					</h1>
					<p className="mt-1 text-sm text-neutral-600">
						{total} total. {rows.length} on this page.
					</p>
				</div>
				<a
					href={exportHref}
					className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
				>
					Export CSV
				</a>
			</div>

			{/* Search + filter bar (client component, submits via GET) */}
			<SearchBar initialSearch={search} initialSource={source} />

			{rows.length === 0 ? (
				<div className="mt-6 rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
					No submissions match the current filters.
				</div>
			) : (
				<div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
					<table className="min-w-full divide-y divide-neutral-200 text-sm">
						<thead className="bg-neutral-50">
							<tr>
								<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
									Date
								</th>
								<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
									Name
								</th>
								<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
									Email
								</th>
								<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
									Source
								</th>
								<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
									Message preview
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-200">
							{rows.map((row) => (
								<tr key={row.id} className="cursor-pointer hover:bg-neutral-50">
									<td className="whitespace-nowrap px-4 py-2.5 text-neutral-600">
										<Link
											href={`/admin/submissions/${row.id}`}
											className="block"
										>
											{new Date(row.submittedAt).toLocaleString("en-GB", {
												day: "2-digit",
												month: "short",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</Link>
									</td>
									<td className="px-4 py-2.5 text-neutral-900">
										<Link
											href={`/admin/submissions/${row.id}`}
											className="block"
										>
											{row.name}
										</Link>
									</td>
									<td className="px-4 py-2.5 text-neutral-700">
										<Link
											href={`/admin/submissions/${row.id}`}
											className="block"
										>
											{row.email}
										</Link>
									</td>
									<td className="px-4 py-2.5">
										<Link
											href={`/admin/submissions/${row.id}`}
											className="block"
										>
											<SourceTag source={row.source} />
										</Link>
									</td>
									<td className="max-w-md truncate px-4 py-2.5 text-neutral-600">
										<Link
											href={`/admin/submissions/${row.id}`}
											className="block"
										>
											{row.message.slice(0, 100)}
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
					<div>
						Page {page} of {totalPages}
					</div>
					<div className="flex gap-2">
						{page > 1 && (
							<PaginationLink
								page={page - 1}
								search={search}
								source={source}
								label="← Previous"
							/>
						)}
						{page < totalPages && (
							<PaginationLink
								page={page + 1}
								search={search}
								source={source}
								label="Next →"
							/>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function PaginationLink({
	page,
	search,
	source,
	label,
}: {
	page: number;
	search: string;
	source: string;
	label: string;
}) {
	const params = new URLSearchParams();
	if (search) params.set("search", search);
	if (source) params.set("source", source);
	params.set("page", String(page));
	return (
		<Link
			href={`/admin/submissions?${params}`}
			className="rounded border border-neutral-300 bg-white px-3 py-1 text-neutral-700 hover:bg-neutral-50"
		>
			{label}
		</Link>
	);
}

function SourceTag({ source }: { source: string }) {
	const styles: Record<string, string> = {
		"contact-page": "bg-emerald-100 text-emerald-800",
	};
	const defaultStyle = "bg-sky-100 text-sky-800";
	const display = source.startsWith("service-page:")
		? source.replace("service-page:", "/services/")
		: source;
	return (
		<span
			className={`inline-block rounded px-1.5 py-0.5 font-mono text-xs ${
				styles[source] ?? defaultStyle
			}`}
		>
			{display}
		</span>
	);
}
