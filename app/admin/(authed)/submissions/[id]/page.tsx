/**
 * /admin/submissions/[id] — full view of a single submission.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "../../../../../db";
import { contactSubmissions } from "../../../../../db/schema";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionDetail({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id: idStr } = await params;
	const id = Number(idStr);
	if (!Number.isFinite(id) || id <= 0) notFound();

	const [row] = await db
		.select()
		.from(contactSubmissions)
		.where(eq(contactSubmissions.id, id))
		.limit(1);
	if (!row) notFound();

	return (
		<div>
			<div className="mb-6">
				<Link
					href="/admin/submissions"
					className="text-sm text-neutral-500 hover:text-neutral-700"
				>
					← Submissions
				</Link>
				<h1 className="mt-2 text-2xl font-semibold tracking-tight">
					Submission #{row.id}
				</h1>
				<p className="mt-1 text-sm text-neutral-600">
					Received{" "}
					{new Date(row.submittedAt).toLocaleString("en-GB", {
						day: "2-digit",
						month: "short",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						second: "2-digit",
					})}
				</p>
			</div>

			<div className="space-y-6">
				<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
					<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
						Contact
					</h2>
					<dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div>
							<dt className="text-xs font-medium text-neutral-500">
								Name
							</dt>
							<dd className="mt-0.5 text-sm text-neutral-900">
								{row.name}
							</dd>
						</div>
						<div>
							<dt className="text-xs font-medium text-neutral-500">
								Email
							</dt>
							<dd className="mt-0.5 text-sm text-neutral-900">
								<a
									href={`mailto:${row.email}`}
									className="underline-offset-2 hover:underline"
								>
									{row.email}
								</a>
							</dd>
						</div>
						{row.phone && (
							<div>
								<dt className="text-xs font-medium text-neutral-500">
									Phone
								</dt>
								<dd className="mt-0.5 text-sm text-neutral-900">
									<a
										href={`tel:${row.phone}`}
										className="underline-offset-2 hover:underline"
									>
										{row.phone}
									</a>
								</dd>
							</div>
						)}
						<div>
							<dt className="text-xs font-medium text-neutral-500">
								Source
							</dt>
							<dd className="mt-0.5 font-mono text-xs text-neutral-700">
								{row.source}
							</dd>
						</div>
						{row.ipAddress && (
							<div>
								<dt className="text-xs font-medium text-neutral-500">
									IP address
								</dt>
								<dd className="mt-0.5 font-mono text-xs text-neutral-700">
									{row.ipAddress}
								</dd>
							</div>
						)}
					</dl>
				</section>

				<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
					<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
						Message
					</h2>
					<div className="mt-3 whitespace-pre-wrap rounded-md bg-neutral-50 p-4 text-sm text-neutral-900">
						{row.message}
					</div>
				</section>
			</div>
		</div>
	);
}
