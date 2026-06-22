import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { revalidateTag } from "next/cache";
import { publicRead, isAdmin } from "../access";

const revalidateService: CollectionAfterChangeHook = ({ doc }) => {
	if (doc?.slug) {
		try {
			revalidateTag(`service:${doc.slug}`);
			revalidateTag(`page:/services/${doc.slug}`);
			revalidateTag("homepage"); // Services appear on homepage grid
		} catch {
			// safe to ignore outside a request context
		}
	}
	return doc;
};

export const Services: CollectionConfig = {
	slug: "services",
	admin: {
		useAsTitle: "name",
		defaultColumns: ["displayOrder", "name", "subtitle", "slug", "featured"],
		group: "Business",
		description:
			"Planning services offered by the consultancy. Displayed on the homepage grid and individual service pages.",
	},
	access: {
		read: publicRead,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	hooks: {
		afterChange: [revalidateService],
	},
	fields: [
		// ─── Content Tab ────────────────────────────────────────────────────
		{
			type: "tabs",
			tabs: [
				{
					label: "Content",
					description: "Service details displayed on the public site.",
					fields: [
						{
							name: "name",
							type: "text",
							required: true,
							admin: {
								description:
									"Service name, e.g. 'Residential Planning' or 'Commercial Development'.",
							},
						},
						{
							name: "subtitle",
							type: "text",
							admin: {
								description:
									"Optional subtitle or tagline, e.g. 'Expert guidance for your project'.",
							},
						},
						{
							name: "icon",
							type: "upload",
							relationTo: "media",
							admin: {
								description:
									"Icon displayed on the service card (recommended: 128x128px SVG or PNG).",
							},
						},
						{
							name: "cardImage",
							type: "upload",
							relationTo: "media",
							admin: {
								description:
									"Main image for the service card (recommended: 800x600px). Optional because the cloned frontend can fall back to existing Webflow assets.",
							},
						},
						{
							name: "description",
							type: "textarea",
							required: true,
							admin: {
								description:
									"Short description (2-3 sentences) shown on the homepage service card. Keep it concise.",
							},
						},
						{
							name: "gallery",
							type: "array",
							label: "Image Gallery",
							admin: {
								description:
									"Additional images displayed on the service detail page.",
							},
							fields: [
								{
									name: "image",
									type: "upload",
									relationTo: "media",
									required: true,
								},
								{
									name: "caption",
									type: "text",
								},
							],
						},
						{
							name: "longDescription",
							type: "richText",
							admin: {
								description:
									"Full service description displayed on the service detail page. Use headings, lists, and formatting to structure the content.",
							},
						},

						// ─── FAQ Section ──────────────────────────────────────
						{
							type: "collapsible",
							label: "FAQ",
							admin: {
								description:
									"Frequently asked questions specific to this service. Displayed as an accordion on the service page.",
								initCollapsed: true,
							},
							fields: [
								{
									name: "faq",
									type: "array",
									label: "Questions & Answers",
									fields: [
										{
											name: "question",
											type: "text",
											required: true,
										},
										{
											name: "answer",
											type: "richText",
											required: true,
										},
									],
								},
							],
						},
					],
				},

				// ─── SEO Tab ──────────────────────────────────────────────────
				{
					label: "SEO",
					description: "Search engine optimization for this service page.",
					fields: [
						{
							name: "metaTitle",
							type: "text",
							required: true,
							admin: {
								description:
									"Page title for search engines (50-60 characters). Include primary keyword.",
							},
						},
						{
							name: "metaDescription",
							type: "textarea",
							required: true,
							admin: {
								description:
									"Page description for search results (150-160 characters). Include call-to-action.",
							},
						},
						{
							name: "ogImage",
							type: "upload",
							relationTo: "media",
							admin: {
								description:
									"Social media preview image (1200x630px). Falls back to card image if not set.",
							},
						},
						{
							name: "keywords",
							type: "text",
							admin: {
								description:
									"Comma-separated keywords for internal reference (not used in meta tags).",
							},
						},
					],
				},

				// ─── Settings Tab ─────────────────────────────────────────────
				{
					label: "Settings",
					description: "Display and routing configuration.",
					fields: [
						{
							name: "slug",
							type: "text",
							required: true,
							unique: true,
							index: true,
							admin: {
								description:
									"URL path: /services/[slug]. Use lowercase with hyphens, e.g. 'residential-planning'.",
								position: "sidebar",
							},
						},
						{
							name: "displayOrder",
							type: "number",
							required: true,
							defaultValue: 0,
							admin: {
								description:
									"Display order on homepage (lower numbers appear first). Use 10, 20, 30 for easy reordering.",
								position: "sidebar",
							},
						},
						{
							name: "featured",
							type: "checkbox",
							defaultValue: false,
							admin: {
								description:
									"Featured services appear in a highlighted section on the homepage.",
								position: "sidebar",
							},
						},
						{
							name: "contactFormEnabled",
							type: "checkbox",
							defaultValue: true,
							admin: {
								description: "Show contact form on this service page.",
								position: "sidebar",
							},
						},
						{
							name: "published",
							type: "checkbox",
							defaultValue: true,
							admin: {
								description:
									"Unpublished services are hidden from the public site but remain editable in the admin.",
								position: "sidebar",
							},
						},

						// ─── Related Content ──────────────────────────────────
						{
							type: "collapsible",
							label: "Related Content",
							admin: {
								description: "Cross-reference other services and case studies.",
								initCollapsed: true,
							},
							fields: [
								{
									name: "relatedServices",
									type: "relationship",
									relationTo: "services",
									hasMany: true,
									admin: {
										description:
											"Other services to display in the 'Related Services' section.",
									},
								},
								{
									name: "caseStudies",
									type: "relationship",
									relationTo: "case-studies",
									hasMany: true,
									admin: {
										description:
											"Case studies to feature on this service page.",
									},
								},
							],
						},
					],
				},
			],
		},
	],
	timestamps: true,
};
