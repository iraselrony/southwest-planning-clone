/**
 * /admin/services/new — create a new service. Server component
 * pre-computes the next displayOrder and renders the form.
 */
import Link from "next/link";
import { max } from "drizzle-orm";
import { db } from "../../../../../db";
import { services as servicesTable } from "../../../../../db/schema";
import { ServiceForm } from "../_components/service-form";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
	const [maxRow] = await db
		.select({ maxOrder: max(servicesTable.displayOrder) })
		.from(servicesTable);
	const nextOrder = (maxRow?.maxOrder ?? 0) + 1;

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
						New service
					</h1>
				</div>
			</div>
			<ServiceForm
				mode="create"
				initial={{
					slug: "",
					name: "",
					subtitle: String(nextOrder).padStart(2, "0"),
					cardImageUrl: null,
					description: "",
					longDescription: {},
					contactFormEnabled: true,
					displayOrder: nextOrder,
				}}
			/>
		</div>
	);
}
