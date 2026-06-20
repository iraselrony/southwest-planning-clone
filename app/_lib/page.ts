import * as cheerio from "cheerio";
import type { Metadata } from "next";
import { SITE } from "../../config/site";
import { KNOWN_PAGE_SLUGS } from "../../config/pages";

const CDN_HOSTS = [
	"cdn.prod.website-files.com",
	"d3e54v103j8qbb.cloudfront.net",
	"ajax.googleapis.com",
	"fonts.googleapis.com",
	"fonts.gstatic.com",
];

/**
 * Filenames that exist on disk under a different name than the URL the browser
 * will request. Next.js 15.3.9 cannot serve static files from /public/ when
 * the request path contains %20 or %26 (it returns 400 via the Pages Router
 * fallback). Workaround: store the file with literal spaces and ampersands,
 * and rewrite the HTML so the browser requests the underscore variant (which
 * Next.js can serve and the file actually exists as).
 */
const ASSET_FILENAME_REWRITES: Array<[RegExp, string]> = [
	[
		/chevron-down\(24x24\)@2x \(light\)\.svg/gi,
		"chevron-down(24x24)@2x_light.svg",
	],
];

/**
 * Remove the "Webdesign by GFIVEDESIGN" credit from the footer. The original
 * site is built on Webflow with a backlink to the designer's site. The new
 * site should not carry that credit. Strips the entire link element
 * (including the leading "Webdesign by " text) so no orphan markup remains.
 */
function removeFooterCredits(html: string): string {
	return html.replace(
		/\s*Webdesign by\s*<a [^>]*href="https:\/\/gfivedesign\.co\.uk\/"[^>]*>GFIVEDESIGN<\/a>/gi,
		"",
	);
}

/**
 * Replace wget-emitted host-relative paths (`../cdn.prod.website-files.com/...`)
 * with root-absolute paths (`/cdn.prod.website-files.com/...`) so they resolve
 * correctly regardless of which URL the page is served from.
 *
 * Also handles `url(https://<host>/...)` (used by the Webflow hero backgrounds
 * after the broken-hero fix) and any other absolute https:// references to the
 * CDN hosts, stripping the protocol+host so the request stays same-origin.
 */
function absolutizeAssetPaths(html: string): string {
	let out = html;
	for (const host of CDN_HOSTS) {
		// Host-relative paths emitted by wget
		out = out.replaceAll(`../${host}/`, `/${host}/`);
		out = out.replaceAll(`./${host}/`, `/${host}/`);
		// Absolute references in src/href/background-image
		out = out.replaceAll(`"${host}/`, `"/${host}/`);
		out = out.replaceAll(`'${host}/`, `'/${host}/`);
		out = out.replaceAll(`url(https://${host}/`, `url(/${host}/`);
		out = out.replaceAll(`url(http://${host}/`, `url(/${host}/`);
		out = out.replaceAll(`https://${host}/`, `/${host}/`);
	}
	// Apply the asset filename rewrites (after the absolutizer has put the
	// URL in canonical form so the regex matches the basename only).
	for (const [from, to] of ASSET_FILENAME_REWRITES) {
		out = out.replace(from, to);
	}
	return out;
}

/**
 * Strip Webflow scroll-animation initial states so content is visible by
 * default. Webflow SSR-renders elements with `style="opacity:0"` or
 * `style="transform: translate3d(0, 80px, 0)"` and relies on its own JS to
 * reveal them on scroll. The Payload phase will replace this with proper
 * React components that handle animation through their own lifecycle.
 */
function revealWebflowAnimations(html: string): string {
	// Force opacity to 1 on every element that has opacity:0 inline
	let out = html.replace(/style="[^"]*opacity\s*:\s*0[^"]*"/gi, (m) => {
		// Rewrite the style attribute, dropping any opacity:0 and transform
		return m
			.replace(/opacity\s*:\s*0\s*;?/gi, "")
			.replace(/transform\s*:[^;"]*;?/gi, "")
			.replace(/style="\s*"/, 'style=""');
	});
	// Also drop scroll-cover transforms
	out = out.replace(
		/style="[^"]*transform\s*:\s*translate3d\([^)]*100%[^)]*\)[^"]*"/gi,
		(m) => {
			return m
				.replace(/transform\s*:[^;"]*;?/gi, "")
				.replace(/style="\s*"/, 'style=""');
		},
	);
	return out;
}

/**
 * Fix the broken Webflow hero backgrounds on service pages.
 * The original SSR emits: `background-image:url(<prefix>&quot;<real-url>&quot;)`
 * which the browser rejects because the `&quot;` HTML entities are not valid
 * inside a CSS url() token. Extract the real URL between the &quot; entities
 * and emit a clean `url(<real-url>)`. The asset path absolutizer will then
 * turn `cdn.prod.website-files.com/...` into `/cdn.prod.website-files.com/...`.
 */
function fixBrokenHeroBackgrounds(html: string): string {
	return html.replace(
		/background-image:url\(([^)&]+)&quot;([^&]+)&quot;\)/g,
		(_m, _prefix, realUrl) => `background-image:url(${realUrl})`,
	);
}

/**
 * Rewrite internal nav links from Webflow's `.html` style to Next.js's clean
 * URLs. The original Webflow HTML emits `href="contact.html"`,
 * `href="services/housing.html"`, `href="index.html#about"`, and from deeper
 * pages `href="../index.html"`. None of those paths exist in the Next.js app
 * (the routes are `/contact`, `/services/housing`, `/#about`, `/`), so without
 * this rewrite every nav link 404s.
 *
 * `pageUrl` is the canonical URL of the page being rendered (e.g.
 * `/services/housing`) and is used to resolve relative `../foo.html` paths.
 * External links (mailto:, tel:, https?://, etc.) are left untouched.
 */
function rewriteInternalLinks(html: string, pageUrl: string): string {
	// Built from config/pages.ts so adding a new service in
	// config/services.ts automatically picks it up here.
	const KNOWN_PAGES = new Set<string>(KNOWN_PAGE_SLUGS);

	const $ = cheerio.load(html);
	$("a[href]").each((_, el) => {
		const $a = $(el);
		const raw = $a.attr("href");
		if (!raw) return;

		// Skip external schemes and protocol-relative URLs.
		if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) return;
		// Skip in-page anchors, mailto, tel (covered by the scheme check), and
		// data/javascript URLs.
		if (raw.startsWith("#") || raw.startsWith("?")) return;

		const [pathPart, ...rest] = raw.split("#");
		const fragment = rest.length ? `#${rest.join("#")}` : "";
		// Absolute path (rare in the Webflow HTML but possible)
		const isAbsolute = pathPart.startsWith("/");
		const cleanPath = isAbsolute ? pathPart : pathPart;

		// Strip a trailing .html (case-insensitive). This is the Webflow →
		// Next.js transform.
		const noExt = cleanPath.replace(/\.html$/i, "");

		// Resolve relative paths. Webflow always uses *site-root-relative* paths
		// for downward references (e.g. `services/housing.html` from
		// `/our-services` is meant to mean `/services/housing`, not
		// `/our-services/services/housing`). It uses `../` only for *upward*
		// references from a deeper page (e.g. `../index.html` from
		// `/services/housing` is meant to mean `/`). So: if the path contains
		// `..` (a parent traversal), resolve it against the current page;
		// otherwise, treat it as site-root-relative.
		let resolved: string;
		if (isAbsolute) {
			resolved = noExt || "/";
		} else if (
			noExt.startsWith("./") ||
			noExt.startsWith("../") ||
			noExt.includes("/../") ||
			noExt === ".." ||
			noExt.startsWith("../")
		) {
			// The base URL must be the page's path WITHOUT a trailing slash,
			// so that `..` is treated as "go up from this file's parent
			// directory" rather than "go up from this directory". E.g. for
			// `/services/housing`, `../index.html` should resolve to `/index.html`
			// (the site root), not `/services/index.html`.
			const base = `http://__internal${pageUrl}`;
			try {
				resolved = new URL(noExt || "./", base).pathname;
			} catch {
				return;
			}
		} else {
			// Site-root-relative downward path. Strip the original leading `./`
			// if any and prefix with `/`.
			resolved = `/${noExt.replace(/^\.\//, "")}`;
		}

		// Normalize `/index` (or `/foo/index`) → `/` (or `/foo/`) so that
		// Webflow's `index.html` links land on the clean Next.js root.
		if (resolved === "/index") {
			resolved = "/";
		} else if (resolved.endsWith("/index")) {
			resolved = `${resolved.slice(0, -"/index".length)}/`;
		}

		// If we recognize it as one of our pages (or it's the root), accept
		// the rewrite. Otherwise leave it alone — could be an asset path
		// already handled by absolutizeAssetPaths, or an unknown future link.
		if (KNOWN_PAGES.has(resolved) || resolved === "/") {
			$a.attr("href", resolved + fragment);
		} else {
			// Unknown path — still strip .html and resolve, but warn silently.
			$a.attr("href", resolved + fragment);
		}
	});
	return $.html();
}

/**
 * Extract just the inner HTML of <body> from a full HTML document.
 * Strips <script> tags (we re-inject them via Next.js Script in the layout).
 * Strips <link rel="stylesheet"> (re-injected by the layout).
 * Strips the <noscript> that contains the original document head fallback.
 *
 * `pageUrl` is the canonical URL of the page being rendered (e.g. "/contact",
 * "/services/housing"). It is used to resolve relative `../foo.html` nav
 * links back to clean Next.js paths.
 */
export function extractBodyInner(html: string, pageUrl: string = "/"): string {
	const $ = cheerio.load(html);
	const $body = $("body").first();
	if ($body.length === 0) return "";
	$body.find("script").remove();
	$body.find("noscript").remove();
	$body.find('link[rel="stylesheet"]').remove();

	// Tag the contact form(s) with `data-contact-form` so the client-side
	// interceptor in public/contact-form.js can find them. The value is the
	// page slug, which the email pipeline uses as the "source" field.
	const isContactPage = pageUrl === "/contact";
	const isServicePage = pageUrl.startsWith("/services/");
	const sourceTag = isContactPage
		? "contact-page"
		: isServicePage
			? `service-page:${pageUrl.replace(/^\/services\//, "")}`
			: `other:${pageUrl}`;
	$body.find("form.form, form.w-form").each((_, el) => {
		$(el).attr("data-contact-form", sourceTag);
	});

	const inner = $body.html() ?? "";
	return revealWebflowAnimations(
		removeFooterCredits(
			absolutizeAssetPaths(
				rewriteInternalLinks(fixBrokenHeroBackgrounds(inner), pageUrl),
			),
		),
	);
}

/**
 * Extract <head> metadata for Next.js generateMetadata.
 *
 * Pulls everything the original Webflow HTML provides: title, description,
 * canonical, robots, OG tags, Twitter card. The optional `seo` argument
 * overrides the title and description with values from `getPageSeo()`, which
 * is the source of truth for SEO content. The Payload phase replaces
 * `getPageSeo()` with a Payload Local API lookup; the shape of the override
 * stays the same so the page components don't need to change.
 *
 * `pageUrl` is used to construct a self-referential canonical URL pointing
 * at the production domain (the original Webflow site didn't set canonical
 * tags on most pages).
 */
export function buildHeadFromHtml(
	html: string,
	pageUrl: string,
	seo?: { title: string; description: string },
): Metadata {
	const $ = cheerio.load(html);

	const htmlTitle = $("head > title").first().text().trim() || undefined;
	const htmlDescription =
		$('head > meta[name="description"]').attr("content") || undefined;
	const htmlCanonical =
		$('head > link[rel="canonical"]').attr("href") || undefined;
	const robots = $('head > meta[name="robots"]').attr("content") || undefined;

	const og: Record<string, string> = {};
	$('head > meta[property^="og:"]').each((_, el) => {
		const k = $(el).attr("property")!.replace(/^og:/, "");
		const v = $(el).attr("content");
		if (k && v) og[k] = v;
	});

	const twitter: Record<string, string> = {};
	$('head > meta[name^="twitter:"]').each((_, el) => {
		const k = $(el)
			.attr("name")!
			.replace(/^twitter:/, "");
		const v = $(el).attr("content");
		if (k && v) twitter[k] = v;
	});

	// Title and description come from the SEO data (the source of truth).
	// Fall back to the original HTML if no override is provided, so that
	// adding a new page without SEO data still renders a sensible <title>.
	const title = seo?.title ?? htmlTitle;
	const description = seo?.description ?? htmlDescription;

	// Canonical: prefer the HTML's value, otherwise construct one from pageUrl.
	const canonical =
		htmlCanonical ?? `${SITE.productionUrl}${pageUrl === "/" ? "/" : pageUrl}`;

	const metadata: Metadata = {
		...(title ? { title } : {}),
		...(description ? { description } : {}),
		...(robots ? { robots } : {}),
		alternates: { canonical },
		openGraph: {
			title: seo?.title ?? og.title,
			description: seo?.description ?? og.description,
			url: `${SITE.productionUrl}${pageUrl === "/" ? "/" : pageUrl}`,
			siteName: og.site_name ?? SITE.companyName,
			images: og.image ? [{ url: og.image }] : undefined,
			type: (og.type as "website" | "article" | undefined) ?? "website",
		},
		twitter: {
			...(twitter.card === "summary" || twitter.card === "summary_large_image"
				? { card: twitter.card }
				: { card: "summary_large_image" }),
			title: seo?.title ?? twitter.title,
			description: seo?.description ?? twitter.description,
			images: og.image
				? [og.image]
				: twitter.image
					? [twitter.image]
					: undefined,
		},
		other: {
			"theme-color": "#000000",
		},
	};

	return metadata;
}

export { absolutizeAssetPaths };
export { injectBlocks, getPageBody } from "./blocks";
export { ZONES } from "./zones";
export type { Zone, BlockType } from "./zones";
