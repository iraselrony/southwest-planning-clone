/**
 * Block type definitions + HTML renderers.
 *
 * Each block type has:
 *   - A TypeScript shape (the JSON stored in the `body` jsonb)
 *   - A `renderBlock()` function that turns the JSON into HTML
 *     using the same Webflow CSS classes as the original site
 *     (so the rendered output looks identical to the static HTML)
 *
 * The renderers are used at build time by `extractBodyInner` to
 * inject CMS content into the Webflow HTML. They are also used
 * in the admin's live-preview pane (if you add one).
 */
import * as cheerio from "cheerio";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { pages as pagesTable } from "../../db/schema";
import { ZONES, type BlockType } from "./zones";

// ---------- Block shapes ----------

export type HeroBlock = {
	type: "hero-block";
	heading: string;
	subheading: string;
};

export type RichTextBlock = {
	type: "rich-text-block";
	/** Tiptap document JSON. For now, we also accept raw HTML
	 *  as a fallback (so the seed script can paste Webflow HTML
	 *  in without going through Tiptap). */
	content: unknown;
};

export type ServiceCardsBlock = {
	type: "service-cards-block";
	heading: string;
	intro: string;
	/** Slugs of the services to display. Empty = use all services
	 *  from the DB in display order. */
	serviceSlugs?: string[];
};

export type CtaBlock = {
	type: "cta-block";
	heading: string;
	subheading: string;
	buttonText: string;
	buttonUrl: string;
};

export type AnyBlock =
	| HeroBlock
	| RichTextBlock
	| ServiceCardsBlock
	| CtaBlock;

// ---------- Renderers ----------

/** Escape user-provided text for safe HTML insertion. */
function esc(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function renderBlock(block: AnyBlock): string {
	switch (block.type) {
		case "hero-block":
			return renderHero(block);
		case "rich-text-block":
			return renderRichText(block);
		case "service-cards-block":
			return renderServiceCards(block);
		case "cta-block":
			return renderCta(block);
	}
}

function renderHero(b: HeroBlock): string {
	// Match the original Webflow structure: h1.xxl-heading.two +
	// div.body-display.light (with .medium-width wrapper).
	// These classes drive the existing Webflow CSS.
	return [
		`<div class="stacked-title">`,
		`<div>`,
		`<div class="clip"><h1 class="xxl-heading two">${esc(b.heading)}</h1></div>`,
		`</div>`,
		`<div class="clip">`,
		`<div class="medium-width"><div class="body-display light">${esc(b.subheading)}</div>`,
		`</div>`,
		`</div>`,
		`</div>`,
	].join("");
}

function renderRichText(b: RichTextBlock): string {
	// For now, render Tiptap JSON by extracting the text content.
	// Day 5 polish: switch to a real Tiptap HTML renderer.
	if (typeof b.content === "string") {
		return b.content; // already HTML
	}
	// Crude text extraction for Tiptap JSON
	try {
		const json = b.content as { content?: unknown[] };
		return extractTextFromTiptap(json);
	} catch {
		return "";
	}
}

function extractTextFromTiptap(node: unknown): string {
	if (!node || typeof node !== "object") return "";
	const n = node as { type?: string; text?: string; content?: unknown[] };
	if (n.type === "text" && typeof n.text === "string") return n.text;
	if (Array.isArray(n.content)) {
		const inner = n.content.map(extractTextFromTiptap).join("");
		// Add line break for paragraph-like blocks
		if (
			n.type === "paragraph" ||
			n.type === "heading" ||
			n.type === "bulletList" ||
			n.type === "orderedList" ||
			n.type === "listItem"
		) {
			return inner + "\n";
		}
		return inner;
	}
	return "";
}

function renderServiceCards(b: ServiceCardsBlock): string {
	// For Day 5, we render the heading + intro. The actual card
	// grid is rendered server-side (see app/(routes)/page.tsx)
	// because the grid needs to query the services table.
	return [
		`<div class="dual-title services">`,
		`<h1>${esc(b.heading)}</h1>`,
		`<div class="body-display-3">${esc(b.intro)}</div>`,
		`</div>`,
	].join("");
}

function renderCta(b: CtaBlock): string {
	// Match the original Webflow structure.
	return [
		`<div class="hero-intro">`,
		`<div class="stacked-title">`,
		`<h1 class="xxl-heading">${esc(b.heading)}</h1>`,
		`<div class="body-display light">${esc(b.subheading)}</div>`,
		`</div>`,
		`</div>`,
		`<a href="${esc(b.buttonUrl)}" class="outline-button light w-inline-block">`,
		`<div class="button-text">${esc(b.buttonText)}</div>`,
		`</a>`,
	].join("");
}

// ---------- Injection + DB helper ----------

/**
 * Read the `body` jsonb for a page by slug. Returns {} if the
 * page has no row, the body is null, or the DB is unreachable.
 */
export async function getPageBody(
	slug: string,
): Promise<Record<string, unknown>> {
	try {
		const [row] = await db
			.select({ body: pagesTable.body })
			.from(pagesTable)
			.where(eq(pagesTable.slug, slug))
			.limit(1);
		if (!row || !row.body) return {};
		return (row.body as Record<string, unknown>) ?? {};
	} catch (e) {
		console.error("[blocks] DB read failed", e);
		return {};
	}
}

/**
 * Inject CMS block content into the HTML for each zone defined
 * for this page URL. The original Webflow HTML stays as the
 * fallback — if a zone has no block in the DB, the selector
 * simply isn't touched.
 */
export function injectBlocks(
	html: string,
	pageUrl: string,
	body: Record<string, unknown>,
): string {
	const zones = ZONES[pageUrl];
	if (!zones || zones.length === 0) return html;
	if (!body || Object.keys(body).length === 0) return html;

	const $ = cheerio.load(html);
	for (const zone of zones) {
		const block = body[zone.id] as AnyBlock | undefined;
		if (!block || !block.type) continue;
		const el = $(zone.selector).first();
		if (el.length === 0) {
			console.warn(
				`[blocks] zone ${zone.id} selector "${zone.selector}" not found on ${pageUrl}`,
			);
			continue;
		}
		try {
			el.html(renderBlock(block));
		} catch (e) {
			console.error(
				`[blocks] render failed for zone ${zone.id} on ${pageUrl}`,
				e,
			);
		}
	}
	return $.html();
}
