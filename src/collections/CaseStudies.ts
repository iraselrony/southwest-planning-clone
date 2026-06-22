import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { revalidateTag } from "next/cache";
import { publicRead, isAdmin } from "../access";

const revalidateCaseStudy: CollectionAfterChangeHook = ({ doc }) => {
	if (doc?.slug) {
		try {
			revalidateTag(`case-study:${doc.slug}`);
			revalidateTag("case-studies");
		} catch {
			// safe to ignore outside a request context
		}
	}
	return doc;
};

export const CaseStudies: CollectionConfig = {
	slug: "case-studies",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["title", "service", "location", "year", "published"],
		group: "Business",
		description:
			"Project case studies showcasing successful planning outcomes.",
	},
	access: {
		read: publicRead,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	hooks: {
		afterChange: [revalidateCaseStudy],
	},
	fields: [
		{
			type: "tabs",
			tabs: [
				{
					label: "Overview",
					fields: [
						{
							name: "title",
							type: "text",
							required: true,
							admin: {
								description:
									"Project title, e.g. 'Residential Development in Exeter'.",
							},
						},
						{
							name: "subtitle",
							type: "text",
							admin: {
								description: "Optional subtitle or tagline.",
							},
						},
						{
							name: "featuredImage",
							type: "upload",
							relationTo: "media",
							required: true,
							admin: {
								description: "Main project image (recommended: 1200x800px).",
							},
						},
						{
							name: "summary",
							type: "textarea",
							required: true,
							admin: {
								description:
									"Brief project summary (2-3 sentences) for cards and listings.",
							},
						},
					],
				},
				{
					label: "Project Details",
					fields: [
						{
							name: "client",
							type: "text",
							required: true,
							admin: {
								description: "Client name or organization.",
							},
						},
						{
							name: "location",
							type: "text",
							required: true,
							admin: {
								description: "Project location, e.g. 'Exeter, Devon'.",
							},
						},
						{
							type: "row",
							fields: [
								{
									name: "year",
									type: "number",
									required: true,
									admin: {
										description: "Year project was completed.",
										width: "50%",
									},
								},
								{
									name: "duration",
									type: "text",
									admin: {
										description: "Project duration, e.g. '18 months'.",
										width: "50%",
									},
								},
							],
						},
						{
							name: "service",
							type: "relationship",
							relationTo: "services",
							required: true,
							admin: {
								description: "Primary service category for this project.",
							},
						},
						{
							name: "projectType",
							type: "select",
							required: true,
							options: [
								{ label: "Residential", value: "residential" },
								{ label: "Commercial", value: "commercial" },
								{ label: "Mixed-Use", value: "mixed-use" },
								{ label: "Industrial", value: "industrial" },
								{ label: "Agricultural", value: "agricultural" },
								{ label: "Other", value: "other" },
							],
						},
					],
				},
				{
					label: "Content",
					fields: [
						{
							name: "challenge",
							type: "richText",
							admin: {
								description:
									"Describe the planning challenges and constraints.",
							},
						},
						{
							name: "solution",
							type: "richText",
							admin: {
								description: "Explain the approach and solutions implemented.",
							},
						},
						{
							name: "outcome",
							type: "richText",
							admin: {
								description: "Describe the results and impact of the project.",
							},
						},
						{
							name: "gallery",
							type: "array",
							label: "Project Gallery",
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
					],
				},
				{
					label: "SEO",
					fields: [
						{
							name: "slug",
							type: "text",
							required: true,
							unique: true,
							index: true,
							admin: {
								description:
									"URL path: /case-studies/[slug]. Use lowercase with hyphens.",
								position: "sidebar",
							},
						},
						{
							name: "metaTitle",
							type: "text",
							required: true,
							admin: {
								description:
									"Page title for search engines (50-60 characters).",
							},
						},
						{
							name: "metaDescription",
							type: "textarea",
							required: true,
							admin: {
								description:
									"Page description for search results (150-160 characters).",
							},
						},
						{
							name: "ogImage",
							type: "upload",
							relationTo: "media",
							admin: {
								description: "Social media preview image (1200x630px).",
							},
						},
					],
				},
				{
					label: "Settings",
					fields: [
						{
							name: "published",
							type: "checkbox",
							defaultValue: true,
							admin: {
								description:
									"Unpublished case studies are hidden from the public site.",
								position: "sidebar",
							},
						},
						{
							name: "featured",
							type: "checkbox",
							defaultValue: false,
							admin: {
								description:
									"Featured case studies appear in prominent sections.",
								position: "sidebar",
							},
						},
						{
							name: "testimonials",
							type: "relationship",
							relationTo: "testimonials",
							hasMany: true,
							admin: {
								description: "Client testimonials related to this project.",
							},
						},
					],
				},
			],
		},
	],
	timestamps: true,
};
