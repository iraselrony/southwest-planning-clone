/**
 * Per-page SEO data. Async: reads from the Drizzle `pages` table
 * first, falls back to the static config from `config/pages.ts` if
 * the page has no DB row (or the DB is unreachable).
 *
 * Backed by Next.js's `unstable_cache` so the public site's ISR
 * regeneration hits the cache instead of the DB on every request.
 * When the admin updates a page, it calls `revalidatePath(slug)` to
 * bust the cache for that path.
 *
 * Public surface (same as before, so route files don't need to
 * change much): `getPageSeo(slug)`, `PageSeo`, `DEFAULT_SEO`,
 * `KNOWN_PAGE_SLUGS`, `PAGE_SEO`.
 */
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "../../db";
import { pages as pagesTable } from "../../db/schema";
import {
	DEFAULT_SEO as CONFIG_DEFAULT_SEO,
	PAGE_SEO as CONFIG_PAGE_SEO,
	getPageSeo as getConfigPageSeo,
	KNOWN_PAGE_SLUGS as CONFIG_KNOWN_PAGE_SLUGS,
} from "../../config/pages";
import type { PageSeo } from "../../config/pages";

export type { PageSeo };

/** Config-only fallback (no DB). Used when the DB has no row. */
export const PAGE_SEO = CONFIG_PAGE_SEO;
export const DEFAULT_SEO = CONFIG_DEFAULT_SEO;
export const KNOWN_PAGE_SLUGS = CONFIG_KNOWN_PAGE_SLUGS;

/**
 * Read a page's SEO from the DB. Cached for 60s; bypasses cache on
 * the admin path via `revalidatePath`.
 */
const getPageSeoFromDb = unstable_cache(
	async (slug: string): Promise<PageSeo | null> => {
		try {
			const [row] = await db
				.select({
					title: pagesTable.title,
					metaTitle: pagesTable.metaTitle,
					metaDescription: pagesTable.metaDescription,
					showInNav: pagesTable.showInNav,
				})
				.from(pagesTable)
				.where(eq(pagesTable.slug, slug))
				.limit(1);
			if (!row) return null;
			return {
				title: row.metaTitle || row.title,
				description: row.metaDescription,
				showInNav: row.showInNav,
				isService: slug.startsWith("/services/"),
			};
		} catch (e) {
			// DB unreachable — fall back to config. We log so the operator
			// can see it in Vercel logs.
			console.error("[seo] DB read failed, using config fallback", e);
			return null;
		}
	},
	["page-seo"],
	{ revalidate: 60, tags: ["page-seo"] },
);

/**
 * Look up the SEO data for a page URL. DB row wins; falls back to
 * the static config. Returns the default SEO if nothing matches.
 */
export async function getPageSeo(slug: string): Promise<PageSeo> {
	const fromDb = await getPageSeoFromDb(slug);
	if (fromDb) return fromDb;
	return getConfigPageSeo(slug);
}
