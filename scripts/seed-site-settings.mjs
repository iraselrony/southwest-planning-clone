#!/usr/bin/env node
/**
 * Seed the `site-settings` global with the company info, contact
 * details, social links, and footer text from the original Webflow
 * site. Idempotent: updates the existing single global instance.
 *
 * Usage: npx payload run scripts/seed-site-settings.mjs
 */
import payload from "payload";
import config from "../payload.config.ts";

const SITE_SETTINGS = {
	companyName: "South West Planning Consultancy",
	companyTagline: "Planning Consultants Southwest",
	address: {
		line1: "The Generator Hub, The Gallery",
		line2: "Kings Wharf, The Quay",
		city: "Exeter",
		county: "Devon",
		postcode: "EX2 4AN",
		country: "United Kingdom",
	},
	phoneNumbers: [
		{ label: "Main", value: "01392 984 206" },
		{ label: "Mobile", value: "07779 285 376" },
		{ label: "Mobile 2", value: "07525 059 569" },
	],
	email: "info@southwestplanningconsultancy.co.uk",
	openingHours: [
		{ day: "Monday - Friday", hours: "9:00 AM - 5:00 PM" },
		{ day: "Saturday", hours: "By appointment" },
		{ day: "Sunday", hours: "Closed" },
	],
	registrationNumber: "13398455",
	socialLinks: {
		instagram: "",
		twitter: "",
		linkedin: "",
		facebook: "",
		youtube: "",
	},
	defaultMetaTitleSuffix: " | South West Planning",
	defaultMetaDescription:
		"South West Planning Consultancy provides expert planning advice for residential, commercial, rural, renewables and specialist development projects across the South West.",
	robotsTxt:
		"User-agent: *\nAllow: /\n\nSitemap: https://southwestplanningconsultancy.co.uk/sitemap.xml",
	footerText:
		"© South West Planning Consultancy Ltd. Registered in England and Wales. Company number 13398455.",
	footerLinks: [
		{
			label: "Privacy & Cookie Policy",
			url: "/privacy-cookie-policy",
			external: false,
		},
		{ label: "Contact", url: "/contact", external: false },
	],
	newsletterEnabled: false,
};

await payload.init({ config, disableOnInit: true });
console.log("Seeding site settings...");

await payload.updateGlobal({
	slug: "site-settings",
	data: SITE_SETTINGS,
});

console.log("  ✓ site-settings updated");
process.exit(0);
