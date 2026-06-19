import * as cheerio from "cheerio";
import type { Metadata } from "next";

const CDN_HOSTS = [
	"cdn.prod.website-files.com",
	"d3e54v103j8qbb.cloudfront.net",
	"ajax.googleapis.com",
	"fonts.googleapis.com",
	"fonts.gstatic.com",
];

/**
 * Replace wget-emitted host-relative paths (`../cdn.prod.website-files.com/...`)
 * with root-absolute paths (`/cdn.prod.website-files.com/...`) so they resolve
 * correctly regardless of which URL the page is served from.
 */
function absolutizeAssetPaths(html: string): string {
	let out = html;
	for (const host of CDN_HOSTS) {
		// Match ../<host>/ or ./<host>/ or <host>/  and prefix with /
		out = out.replaceAll(`../${host}/`, `/${host}/`);
		out = out.replaceAll(`./${host}/`, `/${host}/`);
		out = out.replaceAll(`"${host}/`, `"/${host}/`);
		out = out.replaceAll(`'${host}/`, `'/${host}/`);
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
 * Extract just the inner HTML of <body> from a full HTML document.
 * Strips <script> tags (we re-inject them via Next.js Script in the layout).
 * Strips <link rel="stylesheet"> (re-injected by the layout).
 * Strips the <noscript> that contains the original document head fallback.
 */
export function extractBodyInner(html: string): string {
	const $ = cheerio.load(html);
	const $body = $("body").first();
	if ($body.length === 0) return "";
	$body.find("script").remove();
	$body.find("noscript").remove();
	$body.find('link[rel="stylesheet"]').remove();
	const inner = $body.html() ?? "";
	return revealWebflowAnimations(absolutizeAssetPaths(inner));
}

/**
 * Extract <head> metadata for Next.js generateMetadata.
 * Returns title, description, canonical, robots, OG, Twitter, JSON-LD.
 */
export function buildHeadFromHtml(
	html: string,
	_fallbackUrl: string,
): Metadata {
	const $ = cheerio.load(html);

	const title = $("head > title").first().text().trim() || undefined;
	const description =
		$('head > meta[name="description"]').attr("content") || undefined;
	const canonical = $('head > link[rel="canonical"]').attr("href") || undefined;
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

	const metadata: Metadata = {
		...(title ? { title } : {}),
		...(description ? { description } : {}),
		...(robots ? { robots } : {}),
		alternates: canonical ? { canonical } : undefined,
		openGraph: Object.keys(og).length
			? {
					title: og.title,
					description: og.description,
					url: og.url,
					siteName: og.site_name,
					images: og.image ? [{ url: og.image }] : undefined,
					type: (og.type as "website" | "article" | undefined) ?? "website",
				}
			: undefined,
		twitter: Object.keys(twitter).length
			? {
					...(twitter.card === "summary" ||
					twitter.card === "summary_large_image"
						? { card: twitter.card }
						: {}),
					...(twitter.title ? { title: twitter.title } : {}),
					...(twitter.description ? { description: twitter.description } : {}),
					...(twitter.image ? { images: [twitter.image] } : {}),
				}
			: undefined,
		other: {
			"theme-color": "#000000",
		},
	};

	return metadata;
}

export { absolutizeAssetPaths };
