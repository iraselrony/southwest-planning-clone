/**
 * /admin/pages/[slug] — edit form for a single page. Server component
 * that fetches the page from Drizzle and passes it to the client
 * `<PageEditForm>`.
 *
 * The slug can contain "/" (e.g. "/services/housing"), so we use
 * Next.js's catch-all `[[...slug]]` pattern would be cleaner, but
 * for now we encode/decode the slug in the URL.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "../../../../../db";
import { pages as pagesTable } from "../../../../../db/schema";
import { ZONES } from "../../../../_lib/zones";
import { PageEditForm } from "./edit-form";

type RouteParams = { slug: string };

export const dynamic = "force-dynamic";

export default async function AdminPageEdit({
	params,
}: {
	params: Promise<RouteParams>;
}) {
	const { slug: rawSlug } = await params;
	const slug = decodeURIComponent(rawSlug);

	const [row] = await db
		.select()
		.from(pagesTable)
		.where(eq(pagesTable.slug, slug))
		.limit(1);

	if (!row) {
		notFound();
	}

	return (
		<div>
			<div className="mb-6 flex items-baseline justify-between">
				<div>
					<Link
						href="/admin/pages"
						className="text-sm text-neutral-500 hover:text-neutral-700"
					>
						← Pages
					</Link>
					<h1 className="mt-2 font-mono text-xl font-semibold tracking-tight">
						{row.slug}
					</h1>
					<p className="mt-1 text-sm text-neutral-600">{row.title}</p>
				</div>
				<Link
					href={row.slug}
					target="_blank"
					className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
				>
					Preview ↗
				</Link>
			</div>

			<PageEditForm
				page={{
					slug: row.slug,
					title: row.title,
					metaTitle: row.metaTitle,
					metaDescription: row.metaDescription,
					ogImageUrl: row.ogImageUrl,
					showInNav: row.showInNav,
					body: (row.body ?? {}) as Record<string, unknown>,
				}}
				zones={ZONES[slug] ?? []}
			/>
		</div>
	);
}
