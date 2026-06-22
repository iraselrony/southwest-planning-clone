import type {
	Access,
	CollectionAfterChangeHook,
	CollectionConfig,
} from "payload";
import { revalidateTag } from "next/cache";
import { isAdmin } from "../access";
import {
	CtaBlock,
	GalleryBlock,
	ImageAndTextBlock,
	RichTextBlock,
} from "../blocks";

const readPublishedOrAdmin: Access = ({ req: { user } }) => {
	if (user) return true;
	return { workflowStatus: { equals: "published" } };
};

const revalidatePost: CollectionAfterChangeHook = ({ doc }) => {
	try {
		revalidateTag("posts");
		if (doc?.slug) revalidateTag(`post:${doc.slug}`);
	} catch {
		// safe to ignore outside a request context
	}
	return doc;
};

export const Posts: CollectionConfig = {
	slug: "posts",
	admin: {
		useAsTitle: "title",
		defaultColumns: [
			"title",
			"type",
			"workflowStatus",
			"publishedAt",
			"updatedAt",
		],
		group: "Content",
		description:
			"Editorial hub for news, insights, guides, announcements, and planning alerts.",
	},
	access: {
		read: readPublishedOrAdmin,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	hooks: {
		afterChange: [revalidatePost],
	},
	versions: {
		drafts: true,
		maxPerDoc: 20,
	},
	fields: [
		{
			type: "tabs",
			tabs: [
				{
					label: "Editorial",
					description: "The core article content editors work on every day.",
					fields: [
						{
							name: "title",
							type: "text",
							required: true,
							admin: { description: "Clear editorial headline." },
						},
						{
							name: "subtitle",
							type: "text",
							admin: {
								description:
									"Optional deck displayed under the title on article templates.",
							},
						},
						{
							name: "excerpt",
							type: "textarea",
							required: true,
							maxLength: 240,
							admin: {
								description:
									"Short summary for cards, search snippets, and social previews. Aim for 140 to 180 characters.",
							},
						},
						{
							name: "content",
							type: "richText",
							admin: {
								description:
									"Main article body. Use headings, lists, links, and short sections for readability.",
							},
						},
						{
							name: "sections",
							type: "blocks",
							blocks: [
								RichTextBlock,
								ImageAndTextBlock,
								CtaBlock,
								GalleryBlock,
							],
							admin: {
								description:
									"Optional structured content below the article, such as callouts, image sections, CTAs, and galleries.",
							},
						},
					],
				},
				{
					label: "Publishing",
					description: "Post type, ownership, schedule, and relationships.",
					fields: [
						{
							type: "row",
							fields: [
								{
									name: "type",
									type: "select",
									required: true,
									defaultValue: "insight",
									admin: { width: "50%" },
									options: [
										{ label: "Insight", value: "insight" },
										{ label: "News", value: "news" },
										{ label: "Guide", value: "guide" },
										{ label: "Planning Alert", value: "planning-alert" },
										{ label: "Case Note", value: "case-note" },
										{ label: "Announcement", value: "announcement" },
									],
								},
								{
									name: "workflowStatus",
									label: "Workflow Status",
									type: "select",
									required: true,
									defaultValue: "draft",
									admin: { width: "50%", position: "sidebar" },
									options: [
										{ label: "Draft", value: "draft" },
										{ label: "In Review", value: "review" },
										{ label: "Published", value: "published" },
										{ label: "Archived", value: "archived" },
									],
								},
							],
						},
						{
							type: "row",
							fields: [
								{
									name: "publishedAt",
									type: "date",
									admin: {
										width: "50%",
										position: "sidebar",
										date: { pickerAppearance: "dayAndTime" },
									},
								},
								{
									name: "readingTimeMinutes",
									type: "number",
									min: 1,
									admin: {
										width: "50%",
										description:
											"Estimated reading time shown on article cards.",
									},
								},
							],
						},
						{
							name: "author",
							type: "relationship",
							relationTo: "users",
							admin: { position: "sidebar" },
						},
						{
							name: "categories",
							type: "relationship",
							relationTo: "post-categories",
							hasMany: true,
							admin: { position: "sidebar" },
						},
						{
							name: "relatedServices",
							type: "relationship",
							relationTo: "services",
							hasMany: true,
						},
						{
							name: "relatedCaseStudies",
							type: "relationship",
							relationTo: "case-studies",
							hasMany: true,
						},
						{
							name: "relatedPosts",
							type: "relationship",
							relationTo: "posts",
							hasMany: true,
							admin: { description: "Manual related reading picks." },
						},
					],
				},
				{
					label: "Media",
					description: "Images and share assets for the post.",
					fields: [
						{
							name: "featuredImage",
							type: "upload",
							relationTo: "media",
							required: true,
							admin: {
								description:
									"Card image and default article image. Recommended 1200x800px.",
							},
						},
						{
							name: "heroImage",
							type: "upload",
							relationTo: "media",
							admin: {
								description:
									"Optional wide hero image. Falls back to featured image.",
							},
						},
						{
							name: "imageCaption",
							type: "text",
							admin: {
								description: "Public caption for the hero or featured image.",
							},
						},
					],
				},
				{
					label: "SEO",
					description: "Search and social metadata.",
					fields: [
						{
							name: "slug",
							type: "text",
							required: true,
							unique: true,
							index: true,
							admin: {
								position: "sidebar",
								description:
									"URL path: /posts/[slug]. Use lowercase with hyphens.",
							},
						},
						{
							name: "metaTitle",
							type: "text",
							required: true,
							admin: {
								description: "Search title. Aim for 50 to 60 characters.",
							},
						},
						{
							name: "metaDescription",
							type: "textarea",
							required: true,
							admin: {
								description:
									"Search description. Aim for 150 to 160 characters.",
							},
						},
						{
							name: "ogImage",
							type: "upload",
							relationTo: "media",
							admin: {
								description: "Social preview image. Recommended 1200x630px.",
							},
						},
						{
							name: "canonicalUrl",
							type: "text",
							admin: {
								description: "Optional canonical URL for syndicated content.",
							},
						},
						{
							name: "keywords",
							type: "text",
							admin: {
								description: "Internal keyword notes, comma-separated.",
							},
						},
					],
				},
			],
		},
		{
			name: "featured",
			type: "checkbox",
			defaultValue: false,
			admin: {
				position: "sidebar",
				description:
					"Feature in dashboard, homepage modules, or post listings.",
			},
		},
	],
	timestamps: true,
};
