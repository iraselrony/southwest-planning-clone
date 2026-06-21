#!/usr/bin/env node
/**
 * Payload-specific verification. Hits the local dev server and asserts:
 *   - /admin returns 200 or 302
 *   - /admin/login returns 200
 *   - 18 pages in the `pages` Local API
 *   - 14 services in the `services` Local API
 *   - siteSettings global is populated
 *
 * Usage: node scripts/verify-payload.mjs [baseUrl]
 */
import { getPayload } from "payload";
import config from "../payload.config.ts";

const BASE = process.argv[2] || "http://localhost:3000";

const checks = [];
const pass = (msg) => {
	console.log("  ✓", msg);
	checks.push({ ok: true, msg });
};
const fail = (msg) => {
	console.log("  ✗", msg);
	checks.push({ ok: false, msg });
};

console.log(`Verifying Payload at ${BASE}\n`);

console.log("1. Admin routes");
for (const path of ["/admin", "/admin/login"]) {
	try {
		const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
		if (res.status === 200 || res.status === 302 || res.status === 303) {
			pass(`${path} → ${res.status}`);
		} else {
			fail(`${path} → ${res.status}`);
		}
	} catch (e) {
		fail(`${path} → ${e.message}`);
	}
}

console.log("\n2. Payload collections");
let payload;
try {
	payload = await getPayload({ config });
} catch (e) {
	fail(`getPayload failed: ${e.message}`);
	const failed = checks.filter((c) => !c.ok).length;
	console.log(`\n${failed} check(s) failed.`);
	process.exit(1);
}

try {
	const pages = await payload.find({ collection: "pages", limit: 100 });
	if (pages.docs.length >= 18) {
		pass(`pages collection has ${pages.docs.length} docs (>= 18)`);
	} else {
		fail(`pages collection has ${pages.docs.length} docs (expected >= 18)`);
	}
} catch (e) {
	fail(`pages find failed: ${e.message}`);
}

try {
	const services = await payload.find({ collection: "services", limit: 100 });
	if (services.docs.length >= 14) {
		pass(`services collection has ${services.docs.length} docs (>= 14)`);
	} else {
		fail(
			`services collection has ${services.docs.length} docs (expected >= 14)`,
		);
	}
} catch (e) {
	fail(`services find failed: ${e.message}`);
}

try {
	const settings = await payload.findGlobal({ slug: "site-settings" });
	if (settings && settings.companyName) {
		pass(`site-settings populated: companyName=${settings.companyName}`);
	} else {
		fail(`site-settings missing companyName`);
	}
} catch (e) {
	fail(`site-settings find failed: ${e.message}`);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${"=".repeat(60)}`);
console.log(
	`Total: ${checks.length} checks, ${checks.length - failed} passed, ${failed} failed`,
);
if (failed === 0) {
	console.log("\n✅ All Payload checks passed.");
	process.exit(0);
} else {
	console.log(`\n❌ ${failed} check(s) failed.`);
	process.exit(1);
}
