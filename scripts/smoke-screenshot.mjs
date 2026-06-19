#!/usr/bin/env node
/**
 * smoke-screenshot.mjs
 * Quick smoke test: take full-page screenshots of every discovered URL on the
 * local dev server. Used during iteration; the proper visual-diff against the
 * live original lives in scripts/visual-diff.mjs.
 *
 * Run: node scripts/smoke-screenshot.mjs [baseUrl]
 */

import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = join(process.cwd(), "execution-plan", "screenshots", "smoke");
await mkdir(OUT, { recursive: true });

const siteMap = await readFile(
	join(process.cwd(), "execution-plan", "site-map.md"),
	"utf-8",
);
const urls = [];
for (const line of siteMap.split("\n")) {
	const m = line.match(/^\| `([^`]+)` \|/);
	if (m) urls.push(m[1]);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
	viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (err) =>
	errors.push({ url: page.url(), type: "pageerror", msg: err.message }),
);
page.on("console", (msg) => {
	if (msg.type() === "error")
		errors.push({ url: page.url(), type: "console", msg: msg.text() });
});
page.on("response", (res) => {
	if (res.status() >= 400)
		errors.push({
			url: page.url(),
			type: "http",
			status: res.status(),
			resource: res.url(),
		});
});

console.log(`Smoke screenshot: ${urls.length} URLs against ${BASE}`);
for (const url of urls) {
	const full = `${BASE}${url}`;
	try {
		await page.goto(full, { waitUntil: "networkidle", timeout: 30000 });
		// Webflow scroll animations only fire on actual scroll. Trigger them by
		// slowly scrolling to the bottom, then back to top, before screenshotting.
		await page.evaluate(async () => {
			const totalHeight = document.body.scrollHeight;
			const step = window.innerHeight / 2;
			for (let y = 0; y <= totalHeight; y += step) {
				window.scrollTo(0, y);
				await new Promise((r) => setTimeout(r, 150));
			}
			window.scrollTo(0, 0);
			await new Promise((r) => setTimeout(r, 500));
		});
		await page.waitForTimeout(500);
		const file =
			url === "/"
				? "index.png"
				: url.replace(/^\//, "").replace(/\//g, "_") + ".png";
		await page.screenshot({ path: join(OUT, file), fullPage: true });
		console.log(`  ✓ ${url}`);
	} catch (e) {
		console.log(`  ✗ ${url}: ${e.message}`);
	}
}

await browser.close();

if (errors.length) {
	console.log(`\nErrors/warnings (${errors.length}):`);
	for (const e of errors.slice(0, 30))
		console.log(
			`  ${e.type}: ${e.msg || e.status} — ${e.url}${e.resource ? " [" + e.resource + "]" : ""}`,
		);
	if (errors.length > 30) console.log(`  ... ${errors.length - 30} more`);
	await writeFile(join(OUT, "_errors.json"), JSON.stringify(errors, null, 2));
}

console.log(`\nScreenshots in: ${OUT}`);
