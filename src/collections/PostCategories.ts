import type { CollectionConfig } from "payload";
import { publicRead, isAdmin } from "../access";

export const PostCategories: CollectionConfig = {
	slug: "post-categories",
	admin: {
		useAsTitle: "name",
		defaultColumns: ["name", "slug", "type", "updatedAt"],
		group: "Content",
		description:
			"Editorial categories used to organise posts, news, guides, and planning updates.",
	},
	access: {
		read: publicRead,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	fields: [
		{
			type: "row",
			fields: [
				{
					name: "name",
					type: "text",
					required: true,
					admin: { width: "50%" },
				},
				{
					name: "slug",
					type: "text",
					required: true,
					unique: true,
					index: true,
					admin: {
						width: "50%",
						description: "Lowercase URL handle, e.g. planning-guides.",
					},
				},
			],
		},
		{
			name: "type",
			type: "select",
			defaultValue: "topic",
			options: [
				{ label: "Topic", value: "topic" },
				{ label: "Service Area", value: "service-area" },
				{ label: "Location", value: "location" },
				{ label: "Audience", value: "audience" },
			],
			admin: {
				description:
					"Use types to keep the editorial taxonomy useful instead of creating one long messy category list.",
			},
		},
		{
			name: "description",
			type: "textarea",
			admin: {
				description:
					"Internal description for editors and optional intro copy on category archive pages.",
			},
		},
		{
			name: "featuredImage",
			type: "upload",
			relationTo: "media",
			admin: {
				description: "Optional category card image.",
			},
		},
	],
	timestamps: true,
};
