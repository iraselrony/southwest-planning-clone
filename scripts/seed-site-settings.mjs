#!/usr/bin/env node
/**
 * Seed the `site-settings` global with the company info, contact
 * details, social links, and footer text from the original Webflow
 * site. Idempotent: updates the existing single global instance.
 *
 * Usage: npx payload run scripts/seed-site-settings.mjs
 */
import { getPayload } from "payload";
import config from "../payload.config.ts";

const SITE_SETTINGS = {
	companyName: "South West Planning Consultancy",
	companyTagline: "Planning Consultants Southwest",
	address:
		"The Generator Hub, The Gallery, Kings Wharf, The Quay, Exeter, Devon, EX2 4AN",
	phoneNumbers: [
		{ value: "01392 984 206" },
		{ value: "07779 285 376" },
		{ value: "07525 059 569" },
	],
	email: "info@southwestplanningconsultancy.co.uk",
	registrationNumber: "13398455",
	socialLinks: {
		instagram: "",
		twitter: "",
		linkedin: "",
		facebook: "",
	},
	footerText:
		"© South West Planning Consultancy Ltd. Registered in England and Wales. Company number 13398455.",
};

async function main() {
	const payload = await getPayload({ config });
	console.log("Seeding site settings...");

	await payload.updateGlobal({
		slug: "site-settings",
		data: SITE_SETTINGS,
	});

	console.log("  ✓ site-settings updated");
	process.exit(0);
}

main().catch((e) => {
	console.error("seed-site-settings failed:", e);
	process.exit(1);
});
