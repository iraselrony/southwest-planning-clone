#!/usr/bin/env node
/**
 * Run all seed scripts in order. Use this for first-time setup or to
 * bring a fresh environment up to the baseline data.
 *
 * Usage: node scripts/seed-all.mjs
 */
import { spawn } from "node:child_process";

const STEPS = [
	{ name: "pages",    cmd: "node", args: ["scripts/seed-pages.mjs"] },
	{ name: "services", cmd: "node", args: ["scripts/seed-services.mjs"] },
	{ name: "settings", cmd: "node", args: ["scripts/seed-site-settings.mjs"] },
	{ name: "zones",    cmd: "node", args: ["scripts/seed-initial-zones.mjs"] },
];

function run(step) {
	return new Promise((resolve, reject) => {
		const child = spawn(step.cmd, step.args, { stdio: "inherit", env: process.env });
		child.on("exit", (code) => {
			if (code === 0) resolve();
			else reject(new Error(`${step.name} exited with code ${code}`));
		});
		child.on("error", reject);
	});
}

async function main() {
	for (const step of STEPS) {
		console.log(`\n=== ${step.name} ===\n`);
		await run(step);
	}
	console.log("\nAll seeds complete.");
	process.exit(0);
}

main().catch((e) => {
	console.error("seed-all failed:", e);
	process.exit(1);
});
