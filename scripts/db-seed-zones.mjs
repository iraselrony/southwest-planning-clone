/**
 * Seed the `body` jsonb column on the `pages` table with initial
 * block data extracted from the current static Webflow HTML.
 *
 * For each page URL with zones, read the mirrored HTML, find the
 * element that matches the zone's CSS selector, and extract the
 * block content from it.
 *
 * Idempotent: re-running won't overwrite existing non-empty body
 * values (use --force to override).
 *
 * Usage:
 *   node scripts/db-seed-zones.mjs           # seed all (skip if body already has data)
 *   node scripts/db-seed-zones.mjs --force   # overwrite existing body
 *   node scripts/db-seed-zones.mjs /          # seed just the home page
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const MIRROR_ROOT = resolve(
	projectRoot,
	"execution-plan",
	"raw-mirror",
	"www.southwestplanningconsultancy.co.uk",
);

// --- Mirrored zone map (must match app/_lib/zones.ts) ---
const ZONES = {
	"/": [
		{
			id: "home-hero",
			selector: ".hero-slider .main-slide:first-child .hero-intro",
		},
		{
			id: "service-cards",
			selector: "#our-services-hm .dual-title",
		},
		{
			id: "contact-cta",
			selector: ".section.clip .action-content .stacked-title",
		},
	],
};

function pageToMirrorPath(pageUrl) {
	if (pageUrl === "/") return resolve(MIRROR_ROOT, "index.html");
	if (pageUrl.endsWith("/")) {
		return resolve(MIRROR_ROOT, pageUrl, "index.html");
	}
	return resolve(MIRROR_ROOT, pageUrl + ".html");
}

function extractBlockFromHtml($, zone, html) {
	const el = $(zone.selector).first();
	if (el.length === 0) return null;
	switch (zone.id) {
		case "home-hero": {
			const heading = el.find("h1.xxl-heading").text().trim() || "";
			const subheading =
				el.find(".body-display.light").text().trim() || "";
			return heading || subheading
				? { type: "hero-block", heading, subheading }
				: null;
		}
		case "service-cards": {
			const heading = el.find("h1").text().trim() || "";
			const intro = el.find(".body-display-3").text().trim() || "";
			return heading
				? {
						type: "service-cards-block",
						heading,
						intro,
						serviceSlugs: [],
					}
				: null;
		}
		case "contact-cta": {
			const heading = el.find("h1.xxl-heading").text().trim() || "";
			const subheading =
				el.find(".body-display.light").text().trim() || "";
			return heading
				? {
						type: "cta-block",
						heading,
						subheading,
						buttonText: "Get in touch",
						buttonUrl: "/contact",
					}
				: null;
		}
		default:
			return null;
	}
}

async function main() {
	const args = process.argv.slice(2);
	const force = args.includes("--force");
	const only = args.find((a) => !a.startsWith("--")) || null;

	if (!process.env.DATABASE_URL) {
		const envLocal = await readFile(
			resolve(projectRoot, ".env.local"),
			"utf-8",
		);
		for (const line of envLocal.split("\n")) {
			const m = line.match(/^([A-Z_]+)\s*=\s*(.+?)\s*$/);
			if (m && !process.env[m[1]]) {
				process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
			}
		}
	}

	const client = new pg.Client({
		connectionString: process.env.DATABASE_URL,
	});
	await client.connect();

	const pageUrls = only
		? [only]
		: Object.keys(ZONES).filter((u) => ZONES[u].length > 0);

	let totalBlocks = 0;
	let pagesUpdated = 0;
	let pagesSkipped = 0;

	for (const pageUrl of pageUrls) {
		const zones = ZONES[pageUrl] || [];
		if (zones.length === 0) continue;

		console.log(`\n${pageUrl}`);

		// Check existing body — skip if non-empty and not --force.
		const existingRes = await client.query(
			"SELECT body FROM pages WHERE slug = $1",
			[pageUrl],
		);
		if (existingRes.rows.length === 0) {
			console.log(`  ⚠ no row in pages for ${pageUrl} — run db:seed first`);
			continue;
		}
		const existingBody = existingRes.rows[0].body || {};
		if (
			!force &&
			existingBody &&
			Object.keys(existingBody).length > 0
		) {
			console.log(
				`  → skip (body has ${Object.keys(existingBody).length} keys; use --force to overwrite)`,
			);
			pagesSkipped++;
			continue;
		}

		// Read the source HTML.
		const sourcePath = pageToMirrorPath(pageUrl);
		let html;
		try {
			html = await readFile(sourcePath, "utf-8");
		} catch (e) {
			console.log(`  ⚠ could not read ${sourcePath}: ${e.message}`);
			continue;
		}

		// Extract each zone's block.
		const $ = cheerio.load(html);
		const newBody = {};
		for (const zone of zones) {
			const block = extractBlockFromHtml($, zone, html);
			if (block) {
				newBody[zone.id] = block;
				console.log(`  ✓ ${zone.id}: ${JSON.stringify(block).slice(0, 80)}…`);
				totalBlocks++;
			} else {
				console.log(`  ✗ ${zone.id}: selector didn't match`);
			}
		}

		// Update the DB.
		await client.query(
			"UPDATE pages SET body = $1::jsonb, updated_at = now() WHERE slug = $2",
			[JSON.stringify(newBody), pageUrl],
		);
		pagesUpdated++;
	}

	console.log(
		`\n✅ Done. ${pagesUpdated} page(s) updated, ${pagesSkipped} skipped, ${totalBlocks} block(s) seeded.`,
	);
	await client.end();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
