import type { CollectionConfig } from "payload";
import { publicRead, isAdmin } from "../access";

/**
 * Media collection. New uploads go to Vercel Blob via
 * @payloadcms/storage-vercel-blob. The asset-migration script seeds this
 * collection with rows for the 70+ mirrored /public assets.
 */
export const Media: CollectionConfig = {
	slug: "media",
	admin: {
		useAsTitle: "filename",
		defaultColumns: ["filename", "filesize", "mimeType", "updatedAt"],
		description: "Images and other uploaded files. Backed by Vercel Blob.",
	},
	access: {
		read: publicRead,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	upload: {
		staticDir: "media",
		mimeTypes: ["image/*", "application/pdf"],
		imageSizes: [
			{ name: "thumbnail", width: 320, height: 320, position: "centre" },
			{ name: "card", width: 640 },
			{ name: "og", width: 1200, height: 630, position: "centre" },
		],
	},
	fields: [
		{
			name: "alt",
			type: "text",
			required: false,
			admin: {
				description: "Alt text for accessibility / SEO.",
			},
		},
		{
			name: "caption",
			type: "text",
		},
		{
			name: "sourcePath",
			type: "text",
			admin: {
				description:
					"Original /public path (set by the asset-migration script). e.g. /cdn.prod.website-files.com/62c.../foo.jpg",
				readOnly: true,
				position: "sidebar",
			},
		},
	],
	timestamps: true,
};
