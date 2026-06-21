#!/usr/bin/env node
/**
 * Seed the `pages.body` array with the current static content from the
 * mirrored HTML, so the admin isn't empty on first load.
 *
 * For each page slug, this script:
 *   1. Reads the marked mirror HTML (or the unmarked mirror if marked
 *      doesn't exist yet).
 *   2. For each zone defined in `app/_lib/zones.ts`, extracts the
 *      matching region (e.g. the first <h1> in the document for the
 *      "home-hero" zone) and captures its inner HTML.
 *   3. Inserts a `body` item with the captured HTML wrapped in a
 *      richTextBlock (or heroBlock for hero zones).
 *
 * Idempotent: only seeds zones that aren't already populated for a
 * given page. Safe to re-run after the mark-zones script.
 *
 * Usage: npx payload run scripts/seed-initial-zones.mjs
 *   (or node scripts/seed-initial-zones.mjs once `tsx` is available)
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
	if (PAGE_FILES[slug]) {
		return { file: PAGE_FILES[slug], base: MIRROR_BASE };
	}
	if (slug.startsWith("/services/")) {
		const serviceSlug = slug.replace(/^\/services\//, "");
		return { file: `services/${serviceSlug}.html`, base: MIRROR_BASE };
	}
	return null;
}

function extractZoneHtml($, zoneId) {
	const $zone = $(`[data-payload-zone="${zoneId}"]`).first();
	if ($zone.length > 0) {
		const innerHtml = $zone.html() || "";
		if (zoneId.endsWith("-hero")) {
			const $h = $zone.find("h1, h2").first();
			const heading = $h.text().trim();
			const $sub = $zone.find("p").first();
			const subheading = $sub.text().trim();
			return {
				blockType: "hero",
				content: { heading, subheading },
			};
		}
		return {
			blockType: "richText",
			content: lexFromHtml(innerHtml),
		};
	}

	switch (zoneId) {
		case "home-hero": {
			const $h = $("h1").first();
			const $sub = $("h1").first().next("p, div").first();
			return {
				blockType: "hero",
				content: {
					heading: $h.text().trim(),
					subheading: $sub.text().trim(),
				},
			};
		}
		case "service-hero": {
			const $h = $("h1").first();
			return {
				blockType: "hero",
				content: { heading: $h.text().trim() },
			};
		}
		default:
			return null;
	}
}

function lexFromHtml(html) {
	if (!html || !html.trim()) {
		return { root: { type: "root", children: [], direction: null, format: "", indent: 0, version: 1 } };
	}
	const text = html
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

async function main() {
	const payload = await getPayload({ config });
	console.log("Seeding initial zones...");

	const pages = await payload.find({ collection: "pages", limit: 100 });
	let updated = 0;
	let skipped = 0;

	for (const page of pages.docs) {
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

		const newBody = [];
		const existingZones = new Set(
			(page.body || []).map((b) => b.zoneId),
		);

		for (const zoneId of zoneIds) {
			if (existingZones.has(zoneId)) {
				skipped++;
				continue;
			}
			const extracted = extractZoneHtml($, zoneId);
			if (!extracted) continue;
			newBody.push({
				zoneId,
				block: { blockType: extracted.blockType, ...extracted.content },
			});
		}

		if (newBody.length === 0) continue;

		await payload.update({
			collection: "pages",
			id: page.id,
			data: {
				body: [...(page.body || []), ...newBody],
			},
		});
		updated++;
		console.log(`  + ${slug} (${newBody.length} new zones)`);
	}

	console.log(`\nDone. Updated ${updated}, skipped ${skipped} (already populated).`);
	process.exit(0);
}

main().catch((e) => {
	console.error("seed-initial-zones failed:", e);
	process.exit(1);
});
