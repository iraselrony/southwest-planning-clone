import type { MetadataRoute } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

const BASE = "https://www.southwestplanningconsultancy.co.uk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const mapPath = join(process.cwd(), "execution-plan", "site-map.md");
	let raw = "";
	try {
		raw = await readFile(mapPath, "utf-8");
	} catch {
		return [{ url: `${BASE}/`, lastModified: new Date() }];
	}
	const urls: MetadataRoute.Sitemap = [];
	for (const line of raw.split("\n")) {
		const m = line.match(/^\| `([^`]+)` \| `([^`]+)` \|/);
		if (!m) continue;
		const url = m[1];
		if (url === "/") continue; // home is added below
		urls.push({ url: `${BASE}${url}`, lastModified: new Date() });
	}
	urls.unshift({
		url: `${BASE}/`,
		lastModified: new Date(),
		changeFrequency: "weekly",
		priority: 1,
	});
	return urls;
}
