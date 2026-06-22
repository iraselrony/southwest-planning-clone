import type { CollectionConfig } from "payload";
import { publicRead, isAdmin } from "../access";

export const Media: CollectionConfig = {
	slug: "media",
	admin: {
		useAsTitle: "filename",
		defaultColumns: ["filename", "alt", "mimeType", "filesize", "updatedAt"],
		group: "Assets",
		description: "Images, documents, and other uploaded files.",
	},
	access: {
		read: publicRead,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	upload: {
		staticDir: "media",
		mimeTypes: ["image/*", "application/pdf", "video/*"],
		imageSizes: [
			{ name: "thumbnail", width: 400, height: 300, position: "centre" },
			{ name: "card", width: 768, height: 512, position: "centre" },
			{ name: "hero", width: 1920, height: 1080, position: "centre" },
			{ name: "og", width: 1200, height: 630, position: "centre" },
		],
		adminThumbnail: "thumbnail",
	},
	fields: [
		// ─── Core ───────────────────────────────────────────────────────────
		{
			name: "alt",
			type: "text",
			required: true,
			admin: {
				description:
					"Required for all images. Used for accessibility (screen readers) and SEO. Be descriptive, e.g. 'Aerial view of Exeter city centre' not 'image1'.",
			},
		},
		{
			name: "caption",
			type: "text",
			admin: {
				description:
					"Optional caption displayed below the image on the public site.",
			},
		},
		{
			name: "credit",
			type: "text",
			admin: {
				description:
					"Photographer or source credit, e.g. '© SW Planning 2024'.",
			},
		},

		// ─── Focal Point ────────────────────────────────────────────────────
		{
			type: "collapsible",
			label: "Focal Point",
			admin: {
				description:
					"Control which part of the image stays visible when cropped. Click 'Edit Focal Point' in the image preview to set interactively, or enter coordinates manually (0-100).",
				initCollapsed: true,
			},
			fields: [
				{
					type: "row",
					fields: [
						{
							name: "focalX",
							type: "number",
							min: 0,
							max: 100,
							defaultValue: 50,
							admin: {
								description:
									"Horizontal focal point (0 = left edge, 100 = right edge).",
								step: 1,
							},
						},
						{
							name: "focalY",
							type: "number",
							min: 0,
							max: 100,
							defaultValue: 50,
							admin: {
								description:
									"Vertical focal point (0 = top edge, 100 = bottom edge).",
								step: 1,
							},
						},
					],
				},
			],
		},

		// ─── SEO ────────────────────────────────────────────────────────────
		{
			type: "collapsible",
			label: "SEO",
			admin: {
				description: "Search engine metadata for this media asset.",
				initCollapsed: true,
			},
			fields: [
				{
					name: "title",
					type: "text",
					admin: {
						description:
							"SEO title for the image (defaults to filename). Used when this image is shared on social media.",
					},
				},
				{
					name: "description",
					type: "textarea",
					admin: {
						description: "SEO description for the image.",
					},
				},
			],
		},

		// ─── Internal ───────────────────────────────────────────────────────
		{
			name: "sourcePath",
			type: "text",
			admin: {
				description:
					"Original file path before migration (read-only). Used by the asset-migration script.",
				readOnly: true,
				position: "sidebar",
			},
		},
		{
			name: "tags",
			type: "select",
			hasMany: true,
			admin: {
				description: "Tags for organizing media in the library.",
				position: "sidebar",
			},
			options: [
				{ label: "Hero", value: "hero" },
				{ label: "Card", value: "card" },
				{ label: "Gallery", value: "gallery" },
				{ label: "Logo", value: "logo" },
				{ label: "Icon", value: "icon" },
				{ label: "OG Image", value: "og" },
				{ label: "Document", value: "document" },
				{ label: "Drone", value: "drone" },
				{ label: "Site Photo", value: "site-photo" },
			],
		},
	],
	timestamps: true,
};
