#!/usr/bin/env node
/**
 * Walk every mirrored HTML file in execution-plan/raw-mirror/ and insert
 * `<div data-payload-zone="<id>">…</div>` markers around the regions
 * that correspond to editable zones. Writes the marked HTML to
 * execution-plan/raw-mirror-marked/.
 *
 * Idempotent: re-running replaces the marked output, so the page routes
 * always read the latest marker layout.
 *
 * Marking rules (per page slug) are defined in MARKERS below. A marker
 * is a CSS selector + the zone id. The script wraps the matched element
 * (or the section containing the matched element) in the zone div.
 *
 * If a marker doesn't match (e.g. the page HTML was restructured), the
 * script logs a warning and continues without that zone. The page will
 * still render via the original Webflow HTML; that zone just won't be
 * editable from the admin.
 *
 * Usage: node scripts/mark-zones.mjs
 */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const MIRROR = join(
	ROOT,
	"execution-plan",
	"raw-mirror",
	"www.southwestplanningconsultancy.co.uk",
);
const MARKED = join(
	ROOT,
	"execution-plan",
	"raw-mirror-marked",
	"www.southwestplanningconsultancy.co.uk",
);

/**
 * Marker spec per page slug. The key is the URL slug; the value is an
 * array of { zoneId, selector }. The matched element is wrapped in a
 * `<div data-payload-zone="<zoneId>" data-payload-zone-fallback="1">`.
 *
 * Selectors use cheerio (server-side jQuery subset). The matched element
 * is wrapped, not replaced.
 */
const MARKERS = {
	"/": [
		{ zoneId: "home-hero",     selector: "h1" },
		{ zoneId: "about",         selector: ".about-section, section.about" },
		{ zoneId: "service-cards", selector: ".services-grid, .service-cards, section.services" },
		{ zoneId: "contact-cta",   selector: ".contact-cta, section.cta" },
	],
	"/contact": [
		{ zoneId: "contact-intro",     selector: ".intro, .contact-intro" },
		{ zoneId: "contact-form-copy", selector: ".form-copy, .contact-copy" },
	],
	"/our-services": [
		{ zoneId: "services-hero", selector: "h1" },
		{ zoneId: "services-list", selector: ".services-list, .service-cards" },
	],
	"/privacy-cookie-policy": [
		{ zoneId: "policy-body", selector: ".policy-body, article, main" },
	],
};

/**
 * For each service page, the same zones are used. We discover the service
 * slugs from the existing /services/ directory in the mirror.
 */
async function discoverServiceSlugs() {
	const servicesDir = join(MIRROR, "services");
	if (!existsSync(servicesDir)) return [];
	const entries = await readdir(servicesDir);
	return entries
		.filter((f) => f.endsWith(".html"))
		.map((f) => f.replace(/\.html$/, ""));
}

async function walkDir(dir) {
	const out = [];
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...(await walkDir(full)));
		} else if (entry.isFile() && entry.name.endsWith(".html")) {
			out.push(full);
		}
	}
	return out;
}

function markHtml(html, markers) {
	const $ = cheerio.load(html);
	for (const marker of markers) {
		const $el = $(marker.selector).first();
		if ($el.length === 0) {
			console.warn(
				`  ! selector "${marker.selector}" not found for zone "${marker.zoneId}"`,
			);
			continue;
		}
		const zoneHtml = $.html($el);
		// Replace the element with a wrapped version.
		$el.replaceWith(
			`<div data-payload-zone="${marker.zoneId}" data-payload-zone-fallback="1">${zoneHtml}</div>`,
		);
	}
	return $.html();
}

function pageSlugFor(relPath) {
	const noExt = relPath.replace(/\.html$/, "");
	if (noExt === "index") return "/";
	if (noExt.endsWith("/index")) return `/${noExt.slice(0, -"/index".length)}/`;
	return `/${noExt}`;
}

async function main() {
	console.log("Marking zones...");
	await mkdir(MARKED, { recursive: true });

	const files = await walkDir(MIRROR);
	let processed = 0;
	const warnings = 0;

	const serviceSlugs = await discoverServiceSlugs();
	for (const slug of serviceSlugs) {
		MARKERS[`/services/${slug}`] = [
			{ zoneId: "service-hero", selector: "h1" },
			{ zoneId: "service-body", selector: ".service-body, .content, main" },
		];
	}

	for (const file of files) {
		const rel = relative(MIRROR, file).split(sep).join("/");
		const slug = pageSlugFor(rel);
		const markers = MARKERS[slug];
		if (!markers) {
			// No zones for this page — copy the file through unchanged so
			// the routes can read it.
			const out = join(MARKED, rel);
			await mkdir(dirname(out), { recursive: true });
			const raw = await readFile(file, "utf-8");
			await writeFile(out, raw, "utf-8");
			continue;
		}

		const raw = await readFile(file, "utf-8");
		const beforeWarnings = markers.length;
		const marked = markHtml(raw, markers);
		const out = join(MARKED, rel);
		await mkdir(dirname(out), { recursive: true });
		await writeFile(out, marked, "utf-8");
		processed++;
		console.log(`  + ${rel} (${markers.length} zones)`);
	}

	console.log(`\nDone. Processed ${processed} files into ${relative(ROOT, MARKED)}.`);
	process.exit(0);
}

main().catch((e) => {
	console.error("mark-zones failed:", e);
	process.exit(1);
});
