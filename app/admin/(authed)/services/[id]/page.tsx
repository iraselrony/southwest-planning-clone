/**
 * /admin/services/[id] — edit a service. Server component fetches
 * the service and renders the form.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "../../../../../db";
import { services as servicesTable } from "../../../../../db/schema";
import { ServiceForm } from "../_components/service-form";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: idStr } = await params;
	const id = Number(idStr);
	if (!Number.isFinite(id) || id <= 0) notFound();

	const [row] = await db
		.select()
		.from(servicesTable)
		.where(eq(servicesTable.id, id))
		.limit(1);

	if (!row) notFound();

	return (
		<div>
			<div className="mb-6 flex items-baseline justify-between">
				<div>
					<Link
						href="/admin/services"
						className="text-sm text-neutral-500 hover:text-neutral-700"
					>
						← Services
					</Link>
					<h1 className="mt-2 text-2xl font-semibold tracking-tight">
						{row.name}
					</h1>
					<p className="mt-1 font-mono text-sm text-neutral-600">
						/slug: {row.slug}
					</p>
				</div>
				<Link
					href={`/services/${row.slug}`}
					target="_blank"
					className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
				>
					Preview ↗
				</Link>
			</div>
			<ServiceForm
				mode="edit"
				initial={{
					id: row.id,
					slug: row.slug,
					name: row.name,
					subtitle: row.subtitle,
					cardImageUrl: row.cardImageUrl,
					description: row.description,
					longDescription:
						(row.longDescription as Record<string, unknown>) ?? {},
					contactFormEnabled: row.contactFormEnabled,
					displayOrder: row.displayOrder,
				}}
			/>
		</div>
	);
}
