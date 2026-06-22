import type { GlobalConfig, GlobalAfterChangeHook } from "payload";
import { revalidateTag } from "next/cache";
import { publicRead, isAdmin } from "../access";

const revalidateSite: GlobalAfterChangeHook = () => {
	try {
		revalidateTag("site");
	} catch {
		// safe to ignore outside a request context
	}
};

export const SiteSettings: GlobalConfig = {
	slug: "site-settings",
	admin: {
		description:
			"Global site configuration including branding, contact info, and SEO defaults.",
	},
	access: {
		read: publicRead,
		update: isAdmin,
	},
	hooks: {
		afterChange: [revalidateSite],
	},
	fields: [
		{
			type: "tabs",
			tabs: [
				// ─── Branding Tab ─────────────────────────────────────────────
				{
					label: "Branding",
					description: "Company identity and visual branding.",
					fields: [
						{
							name: "companyName",
							type: "text",
							required: true,
							defaultValue: "South West Planning Consultancy",
							admin: {
								description: "Official company name used throughout the site.",
							},
						},
						{
							name: "companyTagline",
							type: "text",
							defaultValue: "Planning Consultants Southwest",
							admin: {
								description:
									"Company tagline or slogan displayed with the logo.",
							},
						},
						{
							name: "logo",
							type: "upload",
							relationTo: "media",
							admin: {
								description:
									"Primary logo (SVG or PNG with transparent background recommended). Optional because the cloned frontend can use its existing logo asset.",
							},
						},
						{
							name: "logoDark",
							type: "upload",
							relationTo: "media",
							admin: {
								description: "Logo variant for dark backgrounds (optional).",
							},
						},
						{
							name: "favicon",
							type: "upload",
							relationTo: "media",
							admin: {
								description: "Browser tab icon (32x32px or 64x64px PNG/ICO).",
							},
						},
					],
				},

				// ─── Contact Tab ──────────────────────────────────────────────
				{
					label: "Contact",
					description: "Contact information and location details.",
					fields: [
						{
							name: "email",
							type: "email",
							required: true,
							defaultValue: "info@southwestplanningconsultancy.co.uk",
							admin: {
								description: "Primary contact email address.",
							},
						},
						{
							name: "phoneNumbers",
							type: "array",
							label: "Phone Numbers",
							fields: [
								{
									type: "row",
									fields: [
										{
											name: "label",
											type: "text",
											admin: {
												description: "Label, e.g. 'Main', 'Mobile', 'Fax'.",
												width: "30%",
											},
										},
										{
											name: "value",
											type: "text",
											required: true,
											admin: {
												description: "Phone number.",
												width: "70%",
											},
										},
									],
								},
							],
							defaultValue: [
								{ label: "Main", value: "01392 984 206" },
								{ label: "Mobile", value: "07779 285 376" },
								{ label: "Mobile 2", value: "07525 059 569" },
							],
						},
						{
							name: "address",
							type: "group",
							label: "Address",
							fields: [
								{
									name: "line1",
									type: "text",
									defaultValue: "The Generator Hub, The Gallery",
								},
								{
									name: "line2",
									type: "text",
									defaultValue: "Kings Wharf, The Quay",
								},
								{
									name: "city",
									type: "text",
									defaultValue: "Exeter",
								},
								{
									name: "county",
									type: "text",
									defaultValue: "Devon",
								},
								{
									name: "postcode",
									type: "text",
									defaultValue: "EX2 4AN",
								},
								{
									name: "country",
									type: "text",
									defaultValue: "United Kingdom",
								},
							],
						},
						{
							name: "mapEmbedCode",
							type: "textarea",
							admin: {
								description:
									"Google Maps embed code for contact page (optional).",
							},
						},
						{
							name: "openingHours",
							type: "array",
							label: "Opening Hours",
							fields: [
								{
									type: "row",
									fields: [
										{
											name: "day",
											type: "text",
											required: true,
											admin: {
												description:
													"Day of week, e.g. 'Monday', 'Tuesday-Friday'.",
												width: "40%",
											},
										},
										{
											name: "hours",
											type: "text",
											required: true,
											admin: {
												description:
													"Hours, e.g. '9:00 AM - 5:00 PM', 'Closed'.",
												width: "60%",
											},
										},
									],
								},
							],
							defaultValue: [
								{ day: "Monday - Friday", hours: "9:00 AM - 5:00 PM" },
								{ day: "Saturday", hours: "By appointment" },
								{ day: "Sunday", hours: "Closed" },
							],
						},
					],
				},

				// ─── Social Media Tab ─────────────────────────────────────────
				{
					label: "Social Media",
					description: "Social media profiles and links.",
					fields: [
						{
							name: "socialLinks",
							type: "group",
							label: "Social Profiles",
							fields: [
								{
									name: "linkedin",
									type: "text",
									admin: {
										description: "LinkedIn company page URL.",
									},
								},
								{
									name: "twitter",
									type: "text",
									admin: {
										description: "Twitter/X profile URL.",
									},
								},
								{
									name: "facebook",
									type: "text",
									admin: {
										description: "Facebook page URL.",
									},
								},
								{
									name: "instagram",
									type: "text",
									admin: {
										description: "Instagram profile URL.",
									},
								},
								{
									name: "youtube",
									type: "text",
									admin: {
										description: "YouTube channel URL.",
									},
								},
							],
						},
						{
							name: "socialShareImage",
							type: "upload",
							relationTo: "media",
							admin: {
								description:
									"Default image used when sharing the site on social media (1200x630px).",
							},
						},
					],
				},

				// ─── Legal Tab ────────────────────────────────────────────────
				{
					label: "Legal",
					description: "Company registration and legal information.",
					fields: [
						{
							name: "registrationNumber",
							type: "text",
							defaultValue: "13398455",
							admin: {
								description: "Companies House registration number.",
							},
						},
						{
							name: "registeredOffice",
							type: "textarea",
							admin: {
								description:
									"Registered office address (if different from main address).",
							},
						},
						{
							name: "vatNumber",
							type: "text",
							admin: {
								description: "VAT registration number (if applicable).",
							},
						},
						{
							name: "accreditations",
							type: "array",
							label: "Accreditations & Memberships",
							fields: [
								{
									name: "name",
									type: "text",
									required: true,
									admin: {
										description: "Accreditation name, e.g. 'RTPI Member'.",
									},
								},
								{
									name: "logo",
									type: "upload",
									relationTo: "media",
									admin: {
										description: "Accreditation logo (optional).",
									},
								},
								{
									name: "url",
									type: "text",
									admin: {
										description: "Link to accreditation page (optional).",
									},
								},
							],
						},
					],
				},

				// ─── SEO Defaults Tab ─────────────────────────────────────────
				{
					label: "SEO Defaults",
					description: "Default SEO settings used across the site.",
					fields: [
						{
							name: "defaultMetaTitleSuffix",
							type: "text",
							defaultValue: " | South West Planning",
							admin: {
								description:
									"Suffix appended to page titles, e.g. ' | South West Planning'.",
							},
						},
						{
							name: "defaultMetaDescription",
							type: "textarea",
							admin: {
								description:
									"Fallback meta description for pages without custom descriptions.",
							},
						},
						{
							name: "googleAnalyticsId",
							type: "text",
							admin: {
								description:
									"Google Analytics measurement ID (e.g. 'G-XXXXXXXXXX').",
							},
						},
						{
							name: "googleSearchConsoleVerification",
							type: "text",
							admin: {
								description: "Google Search Console verification code.",
							},
						},
						{
							name: "robotsTxt",
							type: "textarea",
							defaultValue:
								"User-agent: *\nAllow: /\n\nSitemap: https://southwestplanningconsultancy.co.uk/sitemap.xml",
							admin: {
								description: "Custom robots.txt content.",
							},
						},
					],
				},

				// ─── Footer Tab ───────────────────────────────────────────────
				{
					label: "Footer",
					description: "Footer content and links.",
					fields: [
						{
							name: "footerText",
							type: "textarea",
							defaultValue:
								"© South West Planning Consultancy Ltd. All rights reserved.",
							admin: {
								description: "Copyright text displayed in the footer.",
							},
						},
						{
							name: "footerLinks",
							type: "array",
							label: "Footer Links",
							fields: [
								{
									name: "label",
									type: "text",
									required: true,
								},
								{
									name: "url",
									type: "text",
									required: true,
								},
								{
									name: "external",
									type: "checkbox",
									defaultValue: false,
									admin: {
										description: "Open link in new tab.",
									},
								},
							],
						},
						{
							name: "newsletterEnabled",
							type: "checkbox",
							defaultValue: false,
							admin: {
								description: "Show newsletter signup form in footer.",
							},
						},
						{
							name: "newsletterHeading",
							type: "text",
							defaultValue: "Stay Updated",
							admin: {
								description: "Heading for newsletter signup (only if enabled).",
								condition: (data) => data.newsletterEnabled === true,
							},
						},
					],
				},
			],
		},
	],
};
