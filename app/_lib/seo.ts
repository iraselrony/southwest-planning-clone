/**
 * Thin re-export so the rest of the app can keep importing from
 * `app/_lib/seo` without churn. The actual source of truth is
 * `config/pages.ts`, which is what gets edited when you duplicate
 * the project for a new client.
 *
 * When the backend phase lands, the implementation in `config/pages.ts`
 * swaps to a Drizzle Local API lookup. The shape stays the same.
 */
export {
	getPageSeo,
	DEFAULT_SEO,
	KNOWN_PAGE_SLUGS,
	PAGE_SEO,
} from "../../config/pages";
export type { PageSeo } from "../../config/pages";
