#!/usr/bin/env node
/**
 * visual-diff.mjs
 * Pixel-compares the local Next.js clone against the live original for every
 * discovered URL. Triggers Webflow scroll animations on both before screenshot.
 *
 * Run: node scripts/visual-diff.mjs [localBase] [liveBase]
 *   localBase default: http://localhost:3000
 *   liveBase  default: https://www.southwestplanningconsultancy.co.uk
 */

import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

const LOCAL = process.argv[2] || "http://localhost:3000";
const LIVE =
	process.argv[3] || "https://www.southwestplanningconsultancy.co.uk";
const OUT = join(process.cwd(), "execution-plan", "screenshots", "diff");
const REPORT = join(OUT, "diff-report.md");
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
	// We don't need to send cookies/etc; just compare visual output.
});
const page = await ctx.newPage();

async function captureAll(baseUrl, label) {
	const dir = join(OUT, label);
	await mkdir(dir, { recursive: true });
	for (const url of urls) {
		const full = `${baseUrl}${url}`;
		try {
			await page.goto(full, { waitUntil: "networkidle", timeout: 60000 });
			await page.evaluate(async () => {
				const totalHeight = document.body.scrollHeight;
				const step = window.innerHeight / 2;
				for (let y = 0; y <= totalHeight; y += step) {
					window.scrollTo(0, y);
					await new Promise((r) => setTimeout(r, 200));
				}
				window.scrollTo(0, 0);
				await new Promise((r) => setTimeout(r, 500));
			});
			await page.waitForTimeout(500);
			const file =
				url === "/"
					? "index.png"
					: url.replace(/^\//, "").replace(/\//g, "_") + ".png";
			await page.screenshot({ path: join(dir, file), fullPage: true });
			process.stdout.write(`  ${label}/${url}\n`);
		} catch (e) {
			process.stdout.write(`  ${label}/${url} FAIL: ${e.message}\n`);
		}
	}
}

console.log(`Capturing local at ${LOCAL}...`);
await captureAll(LOCAL, "local");

console.log(`\nCapturing live at ${LIVE}...`);
await captureAll(LIVE, "live");

await browser.close();

// Now compare the PNGs using pixelmatch via a tiny inline diff (raw pixel diff).
// We don't have pixelmatch installed; install dynamically so this script is
// standalone.

let pixelmatch;
try {
	pixelmatch = (await import("pixelmatch")).default;
} catch {
	console.log("\nInstalling pixelmatch + pngjs for diff...");
	const { execSync } = await import("node:child_process");
	execSync("npm install --no-save --silent pixelmatch pngjs", {
		stdio: "inherit",
	});
	pixelmatch = (await import("pixelmatch")).default;
}
const { PNG } = await import("pngjs");

const report = [];
report.push(`# Visual Diff Report`);
report.push(`Local: \`${LOCAL}\`  `);
report.push(`Live:  \`${LIVE}\``);
report.push("");
report.push("Threshold: 1% pixel diff per page (per the plan).");
report.push("");
report.push("| URL | Local | Live | Pixels diff | % diff | Status |");
report.push("|-----|-------|------|-------------|--------|--------|");

for (const url of urls) {
	const name =
		url === "/"
			? "index.png"
			: url.replace(/^\//, "").replace(/\//g, "_") + ".png";
	const local = join(OUT, "local", name);
	const live = join(OUT, "live", name);
	if (!existsSync(local) || !existsSync(live)) {
		report.push(
			`| \`${url}\` | ❌ | ❌ | — | — | skipped (missing screenshot) |`,
		);
		continue;
	}
	const a = PNG.sync.read(await readFile(local));
	const b = PNG.sync.read(await readFile(live));
	// Resize to the smaller dimensions for comparison
	const w = Math.min(a.width, b.width);
	const h = Math.min(a.height, b.height);
	const aC = await cropPNG(a, w, h);
	const bC = await cropPNG(b, w, h);
	const diff = new PNG({ width: w, height: h });
	const n = pixelmatch(aC.data, bC.data, diff.data, w, h, { threshold: 0.1 });
	const total = w * h;
	const pct = ((n / total) * 100).toFixed(2);
	const status = parseFloat(pct) < 1 ? "✅" : "⚠️";
	const diffFile = `diff-${name}`;
	await writeFile(join(OUT, diffFile), PNG.sync.write(diff));
	report.push(
		`| \`${url}\` | ${a.width}×${a.height} | ${b.width}×${b.height} | ${n.toLocaleString()} | ${pct}% | ${status} |`,
	);
}

report.push("");
report.push(`_Generated: ${new Date().toISOString()}_`);
await writeFile(REPORT, report.join("\n"));
console.log(`\nReport: ${REPORT}`);

async function cropPNG(png, w, h) {
	const out = new PNG({ width: w, height: h });
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const src = (y * png.width + x) * 4;
			const dst = (y * w + x) * 4;
			out.data[dst] = png.data[src];
			out.data[dst + 1] = png.data[src + 1];
			out.data[dst + 2] = png.data[src + 2];
			out.data[dst + 3] = png.data[src + 3];
		}
	}
	return out;
}
