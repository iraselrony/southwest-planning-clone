/**
 * Zone map. Each page URL has 0+ editable zones. Each zone is
 * identified by a stable id and points at a CSS selector in the
 * Webflow HTML — the `extractBodyInner` helper replaces the
 * inner HTML of that element with the rendered block from the
 * `pages.body` jsonb column.
 *
 * If the DB has no row for the page, OR the page's `body` jsonb
 * has no entry for the zone, the original Webflow HTML is kept
 * (so the site is graceful when the admin hasn't filled anything
 * in yet).
 */
export type BlockType =
	| "hero-block"
	| "rich-text-block"
	| "service-cards-block"
	| "cta-block";

export type Zone = {
	/** Stable id, used as the key in the `body` jsonb column. */
	id: string;
	/** CSS selector for the element to replace. The matched
	 *  element's inner HTML is swapped for the rendered block. */
	selector: string;
	/** Block type — drives the admin editor + the renderer. */
	type: BlockType;
	/** Human-friendly description, shown in the admin. */
	description: string;
};

export const ZONES: Record<string, Zone[]> = {
	"/": [
		{
			id: "home-hero",
			// First slide of the homepage hero slider.
			selector: ".hero-slider .main-slide:first-child .hero-intro",
			type: "hero-block",
			description:
				"The headline + subheadline on the first hero slide. (The slider has 3 slides in the original; this zone only covers slide 1.)",
		},
		{
			id: "service-cards",
			// Heading + intro paragraph above the service card grid.
			selector: "#our-services-hm .dual-title",
			type: "service-cards-block",
			description:
				"The 'Our Services' heading and intro paragraph above the service card grid.",
		},
		{
			id: "contact-cta",
			// The 'Ready to get your project moving?' CTA section.
			selector: ".section.clip .action-content .stacked-title",
			type: "cta-block",
			description:
				"The contact CTA: heading + subheading + button text + button URL.",
		},
	],
};

/** All zone ids across all pages. Useful for the admin "pick a zone" UI. */
export const ALL_ZONE_IDS: string[] = Array.from(
	new Set(
		Object.values(ZONES)
			.flat()
			.map((z) => z.id),
	),
);

/** All known page URLs with editable zones. */
export const PAGES_WITH_ZONES: string[] = Object.keys(ZONES);
