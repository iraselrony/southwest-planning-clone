#!/usr/bin/env node
/**
 * Seed/update the `pages` collection from the static SEO map in
 * `app/_lib/seo.ts`. Idempotent: creates missing pages and updates
 * baseline admin/SEO fields for existing pages.
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

function templateFor(slug) {
	if (slug === "/") return "homepage";
	if (slug === "/contact") return "contact";
	if (slug.startsWith("/services/")) return "service";
	return "default";
}

function titleFor(slug) {
	return TITLES[slug] || slug.replace(/^\//, "").replace(/-/g, " ");
}

await payload.init({ config, disableOnInit: true });
console.log("Seeding pages...");

let created = 0;
let updated = 0;
for (const slug of KNOWN_PAGE_SLUGS) {
	const seo = SEO[slug];
	if (!seo) continue;

	const data = {
		slug,
		title: titleFor(slug),
		metaTitle: seo.title,
		metaDescription: seo.description,
		template: templateFor(slug),
		showInNav: !slug.startsWith("/services/"),
		published: true,
		featured: slug === "/",
	};

	const existing = await payload.find({
		collection: "pages",
		where: { slug: { equals: slug } },
		limit: 1,
	});

	if (existing.docs.length > 0) {
		await payload.update({
			collection: "pages",
			id: existing.docs[0].id,
			data,
		});
		updated++;
		continue;
	}

	await payload.create({
		collection: "pages",
		data: { ...data, blocks: [] },
	});
	created++;
	console.log(`  + ${slug}`);
}

console.log(`\nDone. Created ${created}, updated ${updated}.`);
process.exit(0);
