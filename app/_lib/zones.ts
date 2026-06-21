/**
 * Zone map: which editable zones exist on each page.
 *
 * Each zone id matches a `data-payload-zone="<id>"` attribute placed in
 * the marked mirror HTML (see scripts/mark-zones.mjs). The corresponding
 * block content is stored in `pages.body[].zoneId` and rendered into the
 * zone at request time.
 *
 * Adding a new editable region:
 *   1. Pick a stable id (e.g. "home-clients-strip").
 *   2. Add it to the ZONES map for the page that owns it.
 *   3. Update scripts/mark-zones.mjs to wrap the equivalent region in
 *      the mirrored HTML with `data-payload-zone="home-clients-strip"`.
 *   4. In the admin, add a `body` block to the page with that zoneId.
 */
export const ZONES: Record<string, string[]> = {
	"/": [
		"home-hero",
		"about",
		"service-cards",
		"contact-cta",
	],
	"/contact": ["contact-intro", "contact-form-copy"],
	"/our-services": ["services-hero", "services-list"],
	"/privacy-cookie-policy": ["policy-body"],
};

export const SERVICE_ZONES = ["service-hero", "service-body"];

export function zonesForPage(slug: string): string[] {
	if (slug.startsWith("/services/")) {
		return SERVICE_ZONES;
	}
	return ZONES[slug] ?? [];
}
