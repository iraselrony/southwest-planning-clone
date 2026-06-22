#!/usr/bin/env node
/**
 * Seed the new `pages.blocks` layout field with starter content extracted
 * from the mirrored Webflow HTML, so editors have real content examples in
 * the Payload admin.
 *
 * This replaces the old `pages.body[].zoneId` seeding flow. It does not
 * affect the public Webflow-clone fallback HTML; it only gives the admin
 * editable block records to start from.
 *
 * Usage: npx payload run scripts/seed-initial-zones.mjs
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as cheerio from "cheerio";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import { ZONES, SERVICE_ZONES } from "../app/_lib/zones.ts";

const MIRROR_BASE = join(
	process.cwd(),
	"execution-plan",
	"raw-mirror",
	"www.southwestplanningconsultancy.co.uk",
);
const MARKED_BASE = join(
	process.cwd(),
	"execution-plan",
	"raw-mirror-marked",
	"www.southwestplanningconsultancy.co.uk",
);

const PAGE_FILES = {
	"/": "index.html",
	"/contact": "contact.html",
	"/our-services": "our-services.html",
	"/privacy-cookie-policy": "privacy-cookie-policy.html",
};

function fileFor(slug) {
	if (PAGE_FILES[slug]) return { file: PAGE_FILES[slug], base: MIRROR_BASE };
	if (slug.startsWith("/services/")) {
		const serviceSlug = slug.replace(/^\/services\//, "");
		return { file: `services/${serviceSlug}.html`, base: MIRROR_BASE };
	}
	return null;
}

function lexFromHtml(html) {
	const text = (html || "")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	return {
		root: {
			type: "root",
			direction: null,
			format: "",
			indent: 0,
			version: 1,
			children: text
				? [
						{
							type: "paragraph",
							direction: null,
							format: "",
							indent: 0,
							version: 1,
							textFormat: 0,
							children: [
								{
									type: "text",
									format: 0,
									text,
									version: 1,
									mode: "normal",
									detail: 0,
									style: "",
								},
							],
						},
					]
				: [],
		},
	};
}

function extractBlock($, zoneId) {
	const $zone = $(`[data-payload-zone="${zoneId}"]`).first();
	if ($zone.length > 0) {
		if (zoneId.endsWith("-hero")) {
			const heading = $zone.find("h1, h2").first().text().trim();
			const subheading = $zone.find("p").first().text().trim();
			return { blockType: "hero", heading, subheading };
		}
		return { blockType: "richText", content: lexFromHtml($zone.html() || "") };
	}

	switch (zoneId) {
		case "home-hero": {
			const heading = $("h1").first().text().trim();
			const subheading = $("h1").first().next("p, div").first().text().trim();
			return { blockType: "hero", heading, subheading };
		}
		case "service-hero": {
			const heading = $("h1").first().text().trim();
			return { blockType: "hero", heading };
		}
		default:
			return null;
	}
}

const payload = await getPayload({ config });
console.log("Seeding starter page blocks...");

const pages = await payload.find({ collection: "pages", limit: 100 });
let updated = 0;
let skipped = 0;

for (const page of pages.docs) {
	if (Array.isArray(page.blocks) && page.blocks.length > 0) {
		skipped++;
		continue;
	}

	const slug = page.slug;
	const zoneIds =
		ZONES[slug] ?? (slug.startsWith("/services/") ? SERVICE_ZONES : []);
	if (zoneIds.length === 0) continue;

	const file = fileFor(slug);
	if (!file) continue;

	const markedPath = join(MARKED_BASE, file.file);
	const sourcePath = existsSync(markedPath)
		? markedPath
		: join(file.base, file.file);
	if (!existsSync(sourcePath)) {
		console.log(`  ! no source for ${slug}`);
		continue;
	}

	const raw = await readFile(sourcePath, "utf-8");
	const $ = cheerio.load(raw);
	const blocks = zoneIds
		.map((zoneId) => extractBlock($, zoneId))
		.filter(Boolean);

	if (blocks.length === 0) continue;

	await payload.update({
		collection: "pages",
		id: page.id,
		data: { blocks },
	});
	updated++;
	console.log(`  + ${slug} (${blocks.length} blocks)`);
}

console.log(
	`\nDone. Updated ${updated}, skipped ${skipped} (already populated).`,
);
process.exit(0);
