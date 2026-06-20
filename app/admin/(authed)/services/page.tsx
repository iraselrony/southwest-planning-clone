/**
 * /admin/services — list of 14 services with edit/delete + reorder.
 *
 * Reorder uses up/down buttons (POST /api/admin/services/reorder) —
 * drag-and-drop with @dnd-kit lands in Day 6 polish.
 */
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "../../../../db";
import { services as servicesTable } from "../../../../db/schema";
import { ReorderButtons } from "./reorder-buttons";

export const dynamic = "force-dynamic";

export default async function AdminServicesList() {
	const rows = await db
		.select({
			id: servicesTable.id,
			slug: servicesTable.slug,
			name: servicesTable.name,
			subtitle: servicesTable.subtitle,
			displayOrder: servicesTable.displayOrder,
			contactFormEnabled: servicesTable.contactFormEnabled,
		})
		.from(servicesTable)
		.orderBy(asc(servicesTable.displayOrder));

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
						Services
					</h1>
					<p className="mt-1 text-sm text-neutral-600">
						{rows.length} services. Add, edit, reorder, or
						remove.
					</p>
				</div>
				<Link
					href="/admin/services/new"
					className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800"
				>
					+ New service
				</Link>
			</div>

			<div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
				<table className="min-w-full divide-y divide-neutral-200 text-sm">
					<thead className="bg-neutral-50">
						<tr>
							<th className="w-12 px-2 py-2.5 text-center text-xs font-medium text-neutral-500">
								#
							</th>
							<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
								Name
							</th>
							<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
								Slug
							</th>
							<th className="px-4 py-2.5 text-left font-medium text-neutral-700">
								Contact form
							</th>
							<th className="w-40 px-2 py-2.5 text-right font-medium text-neutral-700">
								&nbsp;
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-200">
						{rows.map((row, idx) => (
							<tr key={row.id} className="hover:bg-neutral-50">
								<td className="px-2 py-2.5 text-center font-mono text-xs text-neutral-500">
									{row.subtitle ?? row.displayOrder}
								</td>
								<td className="px-4 py-2.5 text-neutral-900">
									{row.name}
								</td>
								<td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
									{row.slug}
								</td>
								<td className="px-4 py-2.5 text-neutral-600">
									{row.contactFormEnabled ? "✓" : "—"}
								</td>
								<td className="px-2 py-2.5">
									<div className="flex items-center justify-end gap-1">
										<ReorderButtons
											rows={rows.map((r) => ({
												id: r.id,
												displayOrder: r.displayOrder,
											}))}
											currentId={row.id}
										/>
										<Link
											href={`/admin/services/${row.id}`}
											className="ml-2 font-medium text-neutral-900 underline-offset-2 hover:underline"
										>
											Edit
										</Link>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
