import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { revalidateTag } from "next/cache";
import { publicRead, isAdmin } from "../access";
import {
	HeroBlock,
	RichTextBlock,
	ImageAndTextBlock,
	CtaBlock,
	ServiceCardsBlock,
	StatsBlock,
	TestimonialsBlock,
	FaqBlock,
	GalleryBlock,
} from "../blocks";

const revalidatePage: CollectionAfterChangeHook = ({ doc }) => {
	if (doc?.slug) {
		try {
			revalidateTag(`page:${doc.slug}`);
			if (doc.slug === "/") {
				revalidateTag("homepage");
			}
		} catch {
			// safe to ignore outside a request context
		}
	}
	return doc;
};

export const Pages: CollectionConfig = {
	slug: "pages",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["title", "slug", "template", "published", "updatedAt"],
		group: "Content",
		description: "Public pages with editable content sections.",
	},
	access: {
		read: publicRead,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	hooks: {
		afterChange: [revalidatePage],
	},
	fields: [
		{
			type: "tabs",
			tabs: [
				// ─── Content Tab ──────────────────────────────────────────────
				{
					label: "Content",
					description: "Page content and layout blocks.",
					fields: [
						{
							name: "title",
							type: "text",
							required: true,
							admin: {
								description: "Page title displayed as H1 and in admin list.",
							},
						},
						{
							name: "subtitle",
							type: "text",
							admin: {
								description: "Optional subtitle displayed below the title.",
							},
						},
						{
							name: "blocks",
							type: "blocks",
							blocks: [
								HeroBlock,
								RichTextBlock,
								ImageAndTextBlock,
								CtaBlock,
								ServiceCardsBlock,
								StatsBlock,
								TestimonialsBlock,
								FaqBlock,
								GalleryBlock,
							],
							admin: {
								description:
									"Add and arrange content blocks to build the page layout. Drag to reorder.",
							},
						},
					],
				},

				// ─── SEO Tab ──────────────────────────────────────────────────
				{
					label: "SEO",
					description: "Search engine optimization settings.",
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
									"Social media preview image (1200x630px). Used when page is shared on social platforms.",
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
					description: "Page configuration and routing.",
					fields: [
						{
							name: "slug",
							type: "text",
							required: true,
							unique: true,
							index: true,
							admin: {
								description:
									"URL path, e.g. '/' for homepage, '/about', '/contact'. Use lowercase with hyphens.",
								position: "sidebar",
							},
						},
						{
							name: "template",
							type: "select",
							defaultValue: "default",
							options: [
								{ label: "Default", value: "default" },
								{ label: "Homepage", value: "homepage" },
								{ label: "Service Page", value: "service" },
								{ label: "Contact Page", value: "contact" },
								{ label: "Landing Page", value: "landing" },
							],
							admin: {
								description:
									"Page template determines the overall layout structure.",
								position: "sidebar",
							},
						},
						{
							name: "showInNav",
							type: "checkbox",
							defaultValue: true,
							admin: {
								description: "Display this page in the main navigation menu.",
								position: "sidebar",
							},
						},
						{
							name: "navLabel",
							type: "text",
							admin: {
								description:
									"Custom navigation label (defaults to page title if empty).",
								position: "sidebar",
							},
						},
						{
							name: "published",
							type: "checkbox",
							defaultValue: true,
							admin: {
								description:
									"Unpublished pages are hidden from the public site but remain editable in admin.",
								position: "sidebar",
							},
						},
						{
							name: "featured",
							type: "checkbox",
							defaultValue: false,
							admin: {
								description:
									"Featured pages may appear in special sections (template-dependent).",
								position: "sidebar",
							},
						},
					],
				},
			],
		},
	],
	timestamps: true,
};
