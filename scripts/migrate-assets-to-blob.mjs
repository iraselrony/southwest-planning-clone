#!/usr/bin/env node
/**
 * Bulk-migrate the existing /public mirrored assets to Vercel Blob and
 * seed the Payload `media` collection with the resulting rows.
 *
 * Strategy:
 *   1. Walk /public/cdn.prod.website-files.com/**, /public/d3e54v103j8qbb.cloudfront.net/**,
 *      /public/ajax.googleapis.com/**, and the OG image.
 *   2. For each file, PUT it to Vercel Blob under a folder matching the
 *      original path (so the public URL prefix is preserved).
 *   3. Track each upload in media/asset-manifest.json (localPath → blobUrl).
 *   4. For each asset, create a row in the Payload `media` collection so
 *      admin pages can reference them by upload ID.
 *
 * Idempotent: re-running the script skips files that are already in the
 * manifest with the same sourcePath and same content hash.
 *
 * Usage: npx payload run scripts/migrate-assets-to-blob.mjs
 */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { put } from "@vercel/blob";
import { getPayload } from "payload";
import config from "../payload.config.ts";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");
const MANIFEST_PATH = join(ROOT, "media", "asset-manifest.json");
const MANIFEST_HASHES_PATH = join(ROOT, "media", "asset-hashes.json");

const ASSET_DIRS = [
	"cdn.prod.website-files.com",
	"d3e54v103j8qbb.cloudfront.net",
	"ajax.googleapis.com",
];

const OG_IMAGE =
	"cdn.prod.website-files.com/62c2cea31ea6c6cc6f1800b3/62c5aa23496b656c97102833_Southwest-og.jpg";

async function readJson(path, fallback) {
	if (!existsSync(path)) return fallback;
	try {
		return JSON.parse(await readFile(path, "utf-8"));
	} catch {
		return fallback;
	}
}

async function writeJson(path, data) {
	await mkdir(join(path, ".."), { recursive: true });
	await writeFile(path, JSON.stringify(data, null, 2));
}

async function* walkDir(dir) {
	if (!existsSync(dir)) return;
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			yield* walkDir(full);
		} else if (entry.isFile()) {
			yield full;
		}
	}
}

async function hashFile(path) {
	const buf = await readFile(path);
	return createHash("sha256").update(buf).digest("hex");
}

async function main() {
	if (!process.env.BLOB_READ_WRITE_TOKEN) {
		console.error(
			"BLOB_READ_WRITE_TOKEN is not set. Get one from the Vercel dashboard and put it in .env.local.",
		);
		process.exit(1);
	}

	console.log("Migrating assets to Vercel Blob...");
	const manifest = await readJson(MANIFEST_PATH, {});
	const hashes = await readJson(MANIFEST_HASHES_PATH, {});

	const payload = await getPayload({ config });
	const collection = "media";

	let uploaded = 0;
	let skipped = 0;
	let failed = 0;

	for (const assetDir of ASSET_DIRS) {
		const fullDir = join(PUBLIC, assetDir);
		if (!existsSync(fullDir)) continue;
		for await (const file of walkDir(fullDir)) {
			const rel = relative(PUBLIC, file).split(sep).join("/");
			const hash = await hashFile(file);
			if (hashes[rel] === hash && manifest[rel]) {
				skipped++;
				continue;
			}

			try {
				const buffer = await readFile(file);
				const blob = await put(rel, buffer, {
					access: "public",
					addRandomSuffix: false,
					token: process.env.BLOB_READ_WRITE_TOKEN,
				});
				manifest[rel] = blob.url;
				hashes[rel] = hash;

				// Create a media row so admin pages can reference it.
				const existing = await payload.find({
					collection,
					where: { sourcePath: { equals: `/${rel}` } },
					limit: 1,
				});
				if (existing.docs.length === 0) {
					await payload.create({
						collection,
						data: {
							alt: rel.split("/").pop() || rel,
							sourcePath: `/${rel}`,
						},
						file: {
							data: buffer,
							mimetype: guessMime(rel),
							name: rel.split("/").pop() || rel,
							size: buffer.length,
						},
					});
				}
				uploaded++;
				console.log(`  + ${rel}`);
			} catch (e) {
				failed++;
				const msg = e instanceof Error ? e.message : String(e);
				console.error(`  ! ${rel}: ${msg}`);
			}
		}
	}

	await writeJson(MANIFEST_PATH, manifest);
	await writeJson(MANIFEST_HASHES_PATH, hashes);

	console.log(
		`\nDone. Uploaded ${uploaded}, skipped ${skipped}, failed ${failed}.`,
	);
	console.log(`Manifest: ${relative(ROOT, MANIFEST_PATH)}`);
	process.exit(failed > 0 ? 1 : 0);
}

function guessMime(rel) {
	const ext = rel.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "png":
			return "image/png";
		case "webp":
			return "image/webp";
		case "gif":
			return "image/gif";
		case "svg":
			return "image/svg+xml";
		case "css":
			return "text/css";
		case "js":
			return "application/javascript";
		case "json":
			return "application/json";
		default:
			return "application/octet-stream";
	}
}

main().catch((e) => {
	console.error("migrate-assets-to-blob failed:", e);
	process.exit(1);
});
