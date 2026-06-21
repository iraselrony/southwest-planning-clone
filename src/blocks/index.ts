import type { Block } from "payload";

/**
 * Hero block — full-bleed background image + heading + subheading + CTA.
 * Used at the top of pages.
 */
export const HeroBlock: Block = {
	slug: "hero",
	labels: {
		singular: "Hero",
		plural: "Heroes",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			required: true,
		},
		{
			name: "subheading",
			type: "text",
		},
		{
			name: "image",
			type: "upload",
			relationTo: "media",
			required: false,
		},
		{
			name: "buttonText",
			type: "text",
		},
		{
			name: "buttonUrl",
			type: "text",
		},
	],
};

/**
 * Rich text block — Lexical editor. Default content block.
 */
export const RichTextBlock: Block = {
	slug: "richText",
	labels: {
		singular: "Rich Text",
		plural: "Rich Text",
	},
	fields: [
		{
			name: "content",
			type: "richText",
		},
	],
};

/**
 * Image and text side-by-side block. Used for "about" sections.
 */
export const ImageAndTextBlock: Block = {
	slug: "imageAndText",
	labels: {
		singular: "Image & Text",
		plural: "Image & Text",
	},
	fields: [
		{
			name: "image",
			type: "upload",
			relationTo: "media",
			required: true,
		},
		{
			name: "alt",
			type: "text",
			required: true,
		},
		{
			name: "content",
			type: "richText",
		},
		{
			name: "imagePosition",
			type: "select",
			defaultValue: "right",
			options: [
				{ label: "Left", value: "left" },
				{ label: "Right", value: "right" },
			],
		},
	],
};

/**
 * Call-to-action block — heading + subheading + button.
 */
export const CtaBlock: Block = {
	slug: "cta",
	labels: {
		singular: "CTA",
		plural: "CTAs",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			required: true,
		},
		{
			name: "subheading",
			type: "textarea",
		},
		{
			name: "buttonText",
			type: "text",
		},
		{
			name: "buttonUrl",
			type: "text",
		},
	],
};

/**
 * Service cards block — heading + list of service slugs to display.
 * Used on the homepage grid.
 */
export const ServiceCardsBlock: Block = {
	slug: "serviceCards",
	labels: {
		singular: "Service Cards",
		plural: "Service Cards",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			required: true,
		},
		{
			name: "subheading",
			type: "textarea",
		},
		{
			name: "serviceSlugs",
			type: "relationship",
			relationTo: "services",
			hasMany: true,
			required: true,
			admin: {
				description: "Select the services to feature in this card grid.",
			},
		},
	],
};
