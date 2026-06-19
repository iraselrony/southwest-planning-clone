#!/usr/bin/env node
/**
 * extract-inventory.mjs
 * Walks execution-plan/raw-mirror/ and produces three tracking files:
 *   - site-map.md   : every URL discovered + local file + status
 *   - seo-audit.md  : per-page <title>, meta, OG, canonical, JSON-LD, image alts
 *   - assets.md     : media inventory (images, fonts, PDFs) with checksums
 *
 * Run: node scripts/extract-inventory.mjs
 */

import { readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative, join, dirname, basename, extname } from "node:path";
import { createHash } from "node:crypto";
import fg from "fast-glob";
import * as cheerio from "cheerio";

const ROOT = resolve(process.cwd());
const MIRROR = join(
	ROOT,
	"execution-plan",
	"raw-mirror",
	"www.southwestplanningconsultancy.co.uk",
);
const MIRROR_ALL = join(ROOT, "execution-plan", "raw-mirror");
const OUT = join(ROOT, "execution-plan");

if (!existsSync(MIRROR)) {
	console.error(`Mirror not found at ${MIRROR}. Run wget first.`);
	process.exit(1);
}

const BASE = "https://www.southwestplanningconsultancy.co.uk";

function urlFromPath(absPath) {
	const rel = relative(MIRROR, absPath).replace(/\\/g, "/");
	if (rel === "index.html") return "/";
	if (rel.endsWith("/index.html"))
		return "/" + rel.slice(0, -"index.html".length);
	if (rel.endsWith(".html")) return "/" + rel.slice(0, -".html".length);
	return "/" + rel;
}

function fileFromUrl(url) {
	if (url === "/") return "index.html";
	return url.replace(/^\//, "") + "/index.html";
}

async function sha256(p) {
	const buf = await readFile(p);
	return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

async function extractSeo(absPath) {
	const html = await readFile(absPath, "utf-8");
	const $ = cheerio.load(html, { decodeEntities: false });
	const url = urlFromPath(absPath);

	const title = $("title").first().text().trim() || null;
	const meta = (name) => $(`meta[name="${name}"]`).attr("content") || null;
	const metaProp = (p) => $(`meta[property="${p}"]`).attr("content") || null;
	const link = (rel) => $(`link[rel="${rel}"]`).attr("href") || null;

	const description = meta("description");
	const canonical = link("canonical");
	const robots = meta("robots");
	const og = {
		title: metaProp("og:title"),
		description: metaProp("og:description"),
		image: metaProp("og:image"),
		type: metaProp("og:type"),
		url: metaProp("og:url"),
	};
	const twitter = {
		card: meta("twitter:card"),
		title: meta("twitter:title"),
		description: meta("twitter:description"),
		image: meta("twitter:image"),
	};

	const jsonLd = [];
	$('script[type="application/ld+json"]').each((_, el) => {
		try {
			jsonLd.push($(el).contents().text());
		} catch {}
	});

	const images = [];
	$("img").each((_, el) => {
		images.push({
			src: $(el).attr("src") || "",
			alt: $(el).attr("alt") || "",
			width: $(el).attr("width") || null,
			height: $(el).attr("height") || null,
			loading: $(el).attr("loading") || null,
		});
	});

	const hreflang = [];
	$('link[rel="alternate"][hreflang]').each((_, el) => {
		hreflang.push({
			lang: $(el).attr("hreflang"),
			href: $(el).attr("href"),
		});
	});

	return {
		url,
		title,
		description,
		canonical,
		robots,
		og,
		twitter,
		jsonLd,
		images,
		hreflang,
	};
}

function mdEscape(s) {
	if (!s) return "";
	return String(s).replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 200);
}

async function buildSiteMap() {
	const htmlFiles = await fg("**/*.html", {
		cwd: MIRROR,
		absolute: true,
		ignore: ["**/wp-admin/**", "**/wp-login.php"],
	});

	const sorted = htmlFiles
		.map((p) => ({ path: p, url: urlFromPath(p) }))
		.sort((a, b) => a.url.localeCompare(b.url));

	let md = `# Site Map — Southwest Planning Consultancy\n\n`;
	md += `Mirror root: \`${relative(ROOT, MIRROR)}\`\n\n`;
	md += `Total pages discovered: **${sorted.length}**\n\n`;
	md += `| URL | Local file | Status |\n`;
	md += `|-----|------------|--------|\n`;
	for (const { url, path: p } of sorted) {
		const rel = relative(MIRROR, p);
		md += `| \`${mdEscape(url)}\` | \`${rel}\` | pending |\n`;
	}
	md += `\n_Last updated: ${new Date().toISOString()}_\n`;
	return { md, sorted };
}

async function buildSeoAudit(sorted) {
	let md = `# SEO Audit\n\n`;
	md += `Source: \`${relative(ROOT, MIRROR)}\`\n\n`;
	md += `One section per page. The Payload/Frontend phase must preserve every field below verbatim.\n\n`;
	md += `---\n\n`;

	for (const { path: p, url } of sorted) {
		try {
			const seo = await extractSeo(p);
			md += `## ${url}\n\n`;
			md += `- **Title**: ${seo.title ? `\`${mdEscape(seo.title)}\`` : "_missing_"}\n`;
			md += `- **Meta description**: ${seo.description ? `\`${mdEscape(seo.description)}\`` : "_missing_"}\n`;
			md += `- **Canonical**: ${seo.canonical ? `<${seo.canonical}>` : "_missing_"}\n`;
			md += `- **Robots**: ${seo.robots ? `\`${seo.robots}\`` : "_missing_"}\n`;
			md += `- **Hreflang**: ${seo.hreflang.length ? seo.hreflang.map((h) => `\`${h.lang}\`→<${h.href}>`).join(", ") : "_none_"}\n`;
			md += `- **OG**: title=${seo.og.title ? `\`${mdEscape(seo.og.title)}\`` : "_-_"} description=${seo.og.description ? `\`${mdEscape(seo.og.description)}\`` : "_-_"} image=${seo.og.image ? `\`${mdEscape(seo.og.image)}\`` : "_-_"} type=${seo.og.type || "_-_"} url=${seo.og.url || "_-_"}\n`;
			md += `- **Twitter**: card=${seo.twitter.card || "_-_"} title=${seo.twitter.title ? `\`${mdEscape(seo.twitter.title)}\`` : "_-_"}\n`;
			md += `- **JSON-LD blocks**: ${seo.jsonLd.length}\n`;
			seo.jsonLd.forEach((block, i) => {
				md += `  - Block ${i + 1}:\n`;
				block
					.split("\n")
					.slice(0, 30)
					.forEach((line) => {
						md += `    \`\`\`\n    ${line}\n    \`\`\`\n`;
					});
				if (block.split("\n").length > 30)
					md += `    \`\`\`\n    ... (truncated)\n    \`\`\`\n`;
			});
			md += `- **Images**: ${seo.images.length} total\n`;
			const imgsWithAlt = seo.images.filter((i) => i.alt).length;
			md += `  - ${imgsWithAlt} with alt text, ${seo.images.length - imgsWithAlt} missing alt\n`;
			md += `\n---\n\n`;
		} catch (e) {
			md += `## ${url}\n\n_Error extracting SEO: ${e.message}_\n\n`;
		}
	}
	return md;
}

async function buildAssets() {
	const assetFiles = await fg("**/*", {
		cwd: MIRROR_ALL,
		absolute: true,
		onlyFiles: true,
		ignore: [
			"**/*.html",
			"**/*.htm",
			"**/*.php",
			"**/*.txt",
			"**/*.log",
			"**/robots.txt",
			"www.southwestplanningconsultancy.co.uk/**",
		],
	});

	const inventory = [];
	for (const abs of assetFiles) {
		const rel = relative(MIRROR_ALL, abs);
		const ext = extname(abs).toLowerCase();
		const st = await stat(abs);
		const hash = await sha256(abs);
		let category = "other";
		if (
			[".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"].includes(ext)
		)
			category = "image";
		else if ([".woff", ".woff2", ".ttf", ".otf", ".eot"].includes(ext))
			category = "font";
		else if (ext === ".pdf") category = "pdf";
		else if ([".css", ".js", ".mjs"].includes(ext)) category = ext.slice(1);
		else if ([".mp4", ".webm", ".mov"].includes(ext)) category = "video";
		else if ([".mp3", ".wav", ".ogg"].includes(ext)) category = "audio";
		inventory.push({ path: rel, category, ext, size: st.size, hash });
	}

	inventory.sort((a, b) => a.path.localeCompare(b.path));

	let md = `# Asset Inventory\n\n`;
	md += `Source: \`${relative(ROOT, MIRROR_ALL)}\`\n\n`;
	md += `Total: **${inventory.length}** files, **${(inventory.reduce((s, a) => s + a.size, 0) / 1024 / 1024).toFixed(2)} MB**\n\n`;

	const byCat = {};
	for (const a of inventory) {
		byCat[a.category] = (byCat[a.category] || 0) + 1;
	}
	md += `| Category | Count |\n|----------|-------|\n`;
	for (const [c, n] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) {
		md += `| ${c} | ${n} |\n`;
	}
	md += `\n## All files\n\n`;
	md += `| Path | Category | Size (bytes) | SHA256 (16) |\n|------|----------|--------------|-------------|\n`;
	for (const a of inventory) {
		md += `| \`${mdEscape(a.path)}\` | ${a.category} | ${a.size} | \`${a.hash}\` |\n`;
	}
	md += `\n_Last updated: ${new Date().toISOString()}_\n`;
	return md;
}

console.log("Extracting site map...");
const { md: siteMapMd, sorted } = await buildSiteMap();
await writeFile(join(OUT, "site-map.md"), siteMapMd);
console.log(`  wrote site-map.md (${sorted.length} pages)`);

console.log("Extracting SEO audit...");
const seoMd = await buildSeoAudit(sorted);
await writeFile(join(OUT, "seo-audit.md"), seoMd);
console.log(`  wrote seo-audit.md`);

console.log("Extracting assets...");
const assetsMd = await buildAssets();
await writeFile(join(OUT, "assets.md"), assetsMd);
console.log(`  wrote assets.md`);

console.log("\nDone.");
