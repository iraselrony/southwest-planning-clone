#!/usr/bin/env node
/**
 * Seed the `pages` collection from the static SEO map in
 * `app/_lib/seo.ts`. Idempotent: skips pages that already exist (matched
 * by slug).
 *
 * Uses top-level await so `payload run` keeps the event loop alive
 * until the work is done.
 *
 * Usage: npx payload run scripts/seed-pages.mjs
 */
import payload from "payload";
import config from "../payload.config.ts";
import { SEO, KNOWN_PAGE_SLUGS } from "../app/_lib/seo.ts";

const TITLES = {
	"/": "Home",
	"/contact": "Contact",
	"/our-services": "Our Services",
	"/privacy-cookie-policy": "Privacy & Cookie Policy",
};

await payload.init({ config, disableOnInit: true });
console.log("Seeding pages...");

let created = 0;
let skipped = 0;
for (const slug of KNOWN_PAGE_SLUGS) {
	const seo = SEO[slug];
	if (!seo) continue;

	const existing = await payload.find({
		collection: "pages",
		where: { slug: { equals: slug } },
		limit: 1,
	});
	if (existing.docs.length > 0) {
		skipped++;
		continue;
	}

	await payload.create({
		collection: "pages",
		data: {
			slug,
			title: TITLES[slug] || slug.replace(/^\//, "").replace(/-/g, " "),
			metaTitle: seo.title,
			metaDescription: seo.description,
			showInNav: !slug.startsWith("/services/"),
			body: [],
		},
	});
	created++;
	console.log(`  + ${slug}`);
}

console.log(`\nDone. Created ${created}, skipped ${skipped} (already exist).`);
process.exit(0);
