/**
 * /admin/pages — list all 18 pages. Each row links to the edit form.
 * Shows: slug, title, last-updated.
 */
import Link from "next/link";
import { desc, asc } from "drizzle-orm";
import { db } from "../../../../db";
import { pages as pagesTable } from "../../../../db/schema";

export const dynamic = "force-dynamic";

export default async function AdminPagesList() {
	const rows = await db
		.select({
			slug: pagesTable.slug,
			title: pagesTable.title,
			metaTitle: pagesTable.metaTitle,
			showInNav: pagesTable.showInNav,
			updatedAt: pagesTable.updatedAt,
		})
		.from(pagesTable)
		.orderBy(asc(pagesTable.slug));

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
					<h1 className="mt-2 text-2xl font-semibold tracking-tight">Pages</h1>
					<p className="mt-1 text-sm text-neutral-600">
						{rows.length} pages. Edit SEO and body content.
					</p>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
				<table className="min-w-full divide-y divide-neutral-200 text-sm">
					<thead className="bg-neutral-50">
						<tr>
							<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
								Slug
							</th>
							<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
								Title
							</th>
							<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
								In nav
							</th>
							<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
								Updated
							</th>
							<th className="px-4 py-2.5 text-right font-medium text-neutral-700">
								&nbsp;
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-200">
						{rows.map((row) => (
							<tr key={row.slug} className="hover:bg-neutral-50">
								<td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
									{row.slug}
								</td>
								<td className="px-4 py-2.5 text-neutral-900">{row.title}</td>
								<td className="px-4 py-2.5 text-neutral-600">
									{row.showInNav ? "✓" : "—"}
								</td>
								<td className="px-4 py-2.5 text-neutral-600">
									{new Date(row.updatedAt).toLocaleDateString("en-GB", {
										day: "2-digit",
										month: "short",
										year: "numeric",
									})}
								</td>
								<td className="px-4 py-2.5 text-right">
									<Link
										href={`/admin/pages/${encodeURIComponent(row.slug)}`}
										className="font-medium text-neutral-900 underline-offset-2 hover:underline"
									>
										Edit
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
