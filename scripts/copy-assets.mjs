#!/usr/bin/env node
/**
 * copy-assets.mjs
 * Copies all assets (CSS, JS, images, fonts) from the raw mirror into /public,
 * preserving the host-prefixed directory structure. HTML files in the mirror
 * are NOT copied (they are consumed by the Next.js page components).
 *
 * Run: node scripts/copy-assets.mjs
 */

import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(process.cwd());
const MIRROR = join(ROOT, "execution-plan", "raw-mirror");
const PUBLIC = join(ROOT, "public");

if (!existsSync(MIRROR)) {
	console.error("raw-mirror/ not found. Run wget first.");
	process.exit(1);
}

await mkdir(PUBLIC, { recursive: true });

const entries = await readdir(MIRROR, { withFileTypes: true });
let copied = 0;
for (const entry of entries) {
	if (!entry.isDirectory()) continue;
	const src = join(MIRROR, entry.name);
	const dst = join(PUBLIC, entry.name);
	await cp(src, dst, { recursive: true });
	// count files
	const files = await readdir(src, { recursive: true, withFileTypes: true });
	const fileCount = files.filter((f) => f.isFile()).length;
	console.log(`  ${entry.name} → public/${entry.name}/  (${fileCount} files)`);
	copied += fileCount;
}
console.log(`\nCopied ${copied} files into public/`);
