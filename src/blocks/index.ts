import type { Block } from "payload";

/**
 * Hero block — full-bleed background with heading, subheading, and CTA.
 * Supports image or video background with overlay options.
 */
export const HeroBlock: Block = {
	slug: "hero",
	labels: {
		singular: "Hero Section",
		plural: "Hero Sections",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			required: true,
			admin: {
				description:
					"Main heading (H1). Keep it compelling and under 60 characters.",
			},
		},
		{
			name: "subheading",
			type: "textarea",
			admin: {
				description: "Supporting text below the heading. 1-2 sentences max.",
			},
		},
		{
			type: "row",
			fields: [
				{
					name: "backgroundType",
					type: "select",
					defaultValue: "image",
					options: [
						{ label: "Image", value: "image" },
						{ label: "Video", value: "video" },
						{ label: "Color", value: "color" },
					],
					admin: {
						width: "50%",
					},
				},
				{
					name: "overlayOpacity",
					type: "select",
					defaultValue: "medium",
					options: [
						{ label: "None", value: "none" },
						{ label: "Light", value: "light" },
						{ label: "Medium", value: "medium" },
						{ label: "Dark", value: "dark" },
					],
					admin: {
						width: "50%",
						description:
							"Dark overlay improves text readability on bright backgrounds.",
					},
				},
			],
		},
		{
			name: "backgroundImage",
			type: "upload",
			relationTo: "media",
			admin: {
				description:
					"Recommended: 1920x1080px or larger. Will be cropped to fit.",
				condition: (data) =>
					data.backgroundType === "image" || !data.backgroundType,
			},
		},
		{
			name: "backgroundVideo",
			type: "upload",
			relationTo: "media",
			admin: {
				description: "MP4 format recommended. Video will loop and be muted.",
				condition: (data) => data.backgroundType === "video",
			},
		},
		{
			name: "backgroundColor",
			type: "text",
			admin: {
				description: "Hex color code, e.g. #1a1a1a",
				condition: (data) => data.backgroundType === "color",
			},
		},
		{
			name: "textAlign",
			type: "select",
			defaultValue: "center",
			options: [
				{ label: "Left", value: "left" },
				{ label: "Center", value: "center" },
				{ label: "Right", value: "right" },
			],
		},
		{
			name: "buttons",
			type: "array",
			maxRows: 2,
			fields: [
				{
					name: "text",
					type: "text",
					required: true,
				},
				{
					name: "url",
					type: "text",
					required: true,
				},
				{
					name: "style",
					type: "select",
					defaultValue: "primary",
					options: [
						{ label: "Primary", value: "primary" },
						{ label: "Secondary", value: "secondary" },
						{ label: "Outline", value: "outline" },
					],
				},
			],
		},
		{
			name: "height",
			type: "select",
			defaultValue: "medium",
			options: [
				{ label: "Small (50vh)", value: "small" },
				{ label: "Medium (75vh)", value: "medium" },
				{ label: "Large (100vh)", value: "large" },
			],
		},
	],
};

/**
 * Rich text block — Lexical editor with layout options.
 */
export const RichTextBlock: Block = {
	slug: "richText",
	labels: {
		singular: "Rich Text",
		plural: "Rich Text Sections",
	},
	fields: [
		{
			name: "content",
			type: "richText",
			required: true,
			admin: {
				description:
					"Full rich text editor with headings, lists, links, and media embeds.",
			},
		},
		{
			type: "row",
			fields: [
				{
					name: "maxWidth",
					type: "select",
					defaultValue: "medium",
					options: [
						{ label: "Narrow (640px)", value: "narrow" },
						{ label: "Medium (768px)", value: "medium" },
						{ label: "Wide (1024px)", value: "wide" },
						{ label: "Full Width", value: "full" },
					],
					admin: {
						width: "50%",
					},
				},
				{
					name: "textAlign",
					type: "select",
					defaultValue: "left",
					options: [
						{ label: "Left", value: "left" },
						{ label: "Center", value: "center" },
						{ label: "Right", value: "right" },
					],
					admin: {
						width: "50%",
					},
				},
			],
		},
		{
			name: "backgroundColor",
			type: "select",
			defaultValue: "transparent",
			options: [
				{ label: "Transparent", value: "transparent" },
				{ label: "Light Gray", value: "light-gray" },
				{ label: "Dark Gray", value: "dark-gray" },
				{ label: "Primary", value: "primary" },
			],
		},
		{
			name: "padding",
			type: "select",
			defaultValue: "medium",
			options: [
				{ label: "None", value: "none" },
				{ label: "Small", value: "small" },
				{ label: "Medium", value: "medium" },
				{ label: "Large", value: "large" },
			],
		},
	],
};

/**
 * Image and text side-by-side block with flexible layout options.
 */
export const ImageAndTextBlock: Block = {
	slug: "imageAndText",
	labels: {
		singular: "Image & Text",
		plural: "Image & Text Sections",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			admin: {
				description: "Optional section heading displayed above the content.",
			},
		},
		{
			name: "content",
			type: "richText",
			required: true,
			admin: {
				description: "Rich text content displayed alongside the image.",
			},
		},
		{
			name: "image",
			type: "upload",
			relationTo: "media",
			required: true,
			admin: {
				description: "Image displayed alongside the text content.",
			},
		},
		{
			type: "row",
			fields: [
				{
					name: "imagePosition",
					type: "select",
					defaultValue: "right",
					options: [
						{ label: "Left", value: "left" },
						{ label: "Right", value: "right" },
					],
					admin: {
						width: "50%",
						description: "Position of the image relative to the text.",
					},
				},
				{
					name: "imageRatio",
					type: "select",
					defaultValue: "50-50",
					options: [
						{ label: "33% Image / 67% Text", value: "33-67" },
						{ label: "50% Image / 50% Text", value: "50-50" },
						{ label: "67% Image / 33% Text", value: "67-33" },
					],
					admin: {
						width: "50%",
					},
				},
			],
		},
		{
			name: "verticalAlign",
			type: "select",
			defaultValue: "center",
			options: [
				{ label: "Top", value: "top" },
				{ label: "Center", value: "center" },
				{ label: "Bottom", value: "bottom" },
			],
		},
		{
			name: "buttons",
			type: "array",
			maxRows: 2,
			fields: [
				{
					name: "text",
					type: "text",
					required: true,
				},
				{
					name: "url",
					type: "text",
					required: true,
				},
				{
					name: "style",
					type: "select",
					defaultValue: "primary",
					options: [
						{ label: "Primary", value: "primary" },
						{ label: "Secondary", value: "secondary" },
						{ label: "Outline", value: "outline" },
					],
				},
			],
		},
	],
};

/**
 * Call-to-action block with multiple style options.
 */
export const CtaBlock: Block = {
	slug: "cta",
	labels: {
		singular: "Call to Action",
		plural: "Call to Action Sections",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			required: true,
			admin: {
				description: "Compelling heading that encourages action.",
			},
		},
		{
			name: "subheading",
			type: "textarea",
			admin: {
				description:
					"Supporting text that explains the benefit of taking action.",
			},
		},
		{
			name: "buttons",
			type: "array",
			maxRows: 2,
			minRows: 1,
			fields: [
				{
					name: "text",
					type: "text",
					required: true,
				},
				{
					name: "url",
					type: "text",
					required: true,
				},
				{
					name: "style",
					type: "select",
					defaultValue: "primary",
					options: [
						{ label: "Primary", value: "primary" },
						{ label: "Secondary", value: "secondary" },
						{ label: "Outline", value: "outline" },
					],
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "style",
					type: "select",
					defaultValue: "default",
					options: [
						{ label: "Default (Light)", value: "default" },
						{ label: "Dark", value: "dark" },
						{ label: "Gradient", value: "gradient" },
						{ label: "Image Background", value: "image" },
					],
					admin: {
						width: "50%",
					},
				},
				{
					name: "textAlign",
					type: "select",
					defaultValue: "center",
					options: [
						{ label: "Left", value: "left" },
						{ label: "Center", value: "center" },
						{ label: "Right", value: "right" },
					],
					admin: {
						width: "50%",
					},
				},
			],
		},
		{
			name: "backgroundImage",
			type: "upload",
			relationTo: "media",
			admin: {
				description:
					"Background image (only used when style is 'Image Background').",
				condition: (data) => data.style === "image",
			},
		},
	],
};

/**
 * Service cards block — grid of service cards with layout options.
 */
export const ServiceCardsBlock: Block = {
	slug: "serviceCards",
	labels: {
		singular: "Service Cards",
		plural: "Service Cards Sections",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			admin: {
				description: "Optional section heading displayed above the cards.",
			},
		},
		{
			name: "subheading",
			type: "textarea",
			admin: {
				description: "Optional supporting text displayed below the heading.",
			},
		},
		{
			name: "services",
			type: "relationship",
			relationTo: "services",
			hasMany: true,
			required: true,
			admin: {
				description:
					"Select the services to display. Leave empty to show all published services.",
			},
		},
		{
			type: "row",
			fields: [
				{
					name: "columns",
					type: "select",
					defaultValue: "3",
					options: [
						{ label: "2 Columns", value: "2" },
						{ label: "3 Columns", value: "3" },
						{ label: "4 Columns", value: "4" },
					],
					admin: {
						width: "50%",
					},
				},
				{
					name: "cardStyle",
					type: "select",
					defaultValue: "default",
					options: [
						{ label: "Default", value: "default" },
						{ label: "Bordered", value: "bordered" },
						{ label: "Shadow", value: "shadow" },
						{ label: "Minimal", value: "minimal" },
					],
					admin: {
						width: "50%",
					},
				},
			],
		},
		{
			name: "showButton",
			type: "checkbox",
			defaultValue: true,
			admin: {
				description: "Show 'Learn More' button on each card.",
			},
		},
	],
};

/**
 * Stats/numbers block — display key metrics or achievements.
 */
export const StatsBlock: Block = {
	slug: "stats",
	labels: {
		singular: "Statistics",
		plural: "Statistics Sections",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			admin: {
				description: "Optional section heading.",
			},
		},
		{
			name: "stats",
			type: "array",
			minRows: 2,
			maxRows: 6,
			fields: [
				{
					name: "number",
					type: "text",
					required: true,
					admin: {
						description: "The statistic value, e.g. '500+', '25', '98%'.",
					},
				},
				{
					name: "label",
					type: "text",
					required: true,
					admin: {
						description:
							"Description of the statistic, e.g. 'Projects Completed', 'Years Experience'.",
					},
				},
				{
					name: "icon",
					type: "upload",
					relationTo: "media",
					admin: {
						description: "Optional icon to display with the statistic.",
					},
				},
			],
		},
		{
			name: "backgroundColor",
			type: "select",
			defaultValue: "light-gray",
			options: [
				{ label: "White", value: "white" },
				{ label: "Light Gray", value: "light-gray" },
				{ label: "Dark Gray", value: "dark-gray" },
				{ label: "Primary", value: "primary" },
			],
		},
	],
};

/**
 * Testimonials block — display client testimonials.
 */
export const TestimonialsBlock: Block = {
	slug: "testimonials",
	labels: {
		singular: "Testimonials",
		plural: "Testimonials Sections",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			admin: {
				description: "Optional section heading, e.g. 'What Our Clients Say'.",
			},
		},
		{
			name: "testimonials",
			type: "relationship",
			relationTo: "testimonials",
			hasMany: true,
			required: true,
			admin: {
				description:
					"Select testimonials to display. Recommended: 3-6 testimonials.",
			},
		},
		{
			name: "layout",
			type: "select",
			defaultValue: "grid",
			options: [
				{ label: "Grid", value: "grid" },
				{ label: "Carousel", value: "carousel" },
				{ label: "Stacked", value: "stacked" },
			],
		},
		{
			name: "showRating",
			type: "checkbox",
			defaultValue: true,
			admin: {
				description: "Display star rating on each testimonial.",
			},
		},
	],
};

/**
 * FAQ block — frequently asked questions with accordion display.
 */
export const FaqBlock: Block = {
	slug: "faq",
	labels: {
		singular: "FAQ",
		plural: "FAQ Sections",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			admin: {
				description: "Section heading, e.g. 'Frequently Asked Questions'.",
			},
		},
		{
			name: "questions",
			type: "array",
			minRows: 1,
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
		{
			name: "style",
			type: "select",
			defaultValue: "accordion",
			options: [
				{ label: "Accordion", value: "accordion" },
				{ label: "Expandable Cards", value: "cards" },
				{ label: "Simple List", value: "list" },
			],
		},
	],
};

/**
 * Gallery block — image gallery with lightbox.
 */
export const GalleryBlock: Block = {
	slug: "gallery",
	labels: {
		singular: "Gallery",
		plural: "Gallery Sections",
	},
	fields: [
		{
			name: "heading",
			type: "text",
			admin: {
				description: "Optional section heading.",
			},
		},
		{
			name: "images",
			type: "array",
			minRows: 1,
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
			type: "row",
			fields: [
				{
					name: "columns",
					type: "select",
					defaultValue: "3",
					options: [
						{ label: "2 Columns", value: "2" },
						{ label: "3 Columns", value: "3" },
						{ label: "4 Columns", value: "4" },
						{ label: "Masonry", value: "masonry" },
					],
					admin: {
						width: "50%",
					},
				},
				{
					name: "aspectRatio",
					type: "select",
					defaultValue: "square",
					options: [
						{ label: "Square (1:1)", value: "square" },
						{ label: "Landscape (4:3)", value: "landscape" },
						{ label: "Portrait (3:4)", value: "portrait" },
						{ label: "Original", value: "original" },
					],
					admin: {
						width: "50%",
					},
				},
			],
		},
		{
			name: "enableLightbox",
			type: "checkbox",
			defaultValue: true,
			admin: {
				description:
					"Allow users to click images to view full-size in a lightbox.",
			},
		},
	],
};
