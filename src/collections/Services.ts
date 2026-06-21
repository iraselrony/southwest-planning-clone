import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { revalidateTag } from "next/cache";
import { publicRead, isAdmin } from "../access";

const revalidateService: CollectionAfterChangeHook = ({ doc }) => {
	if (doc?.slug) {
		try {
			revalidateTag(`service:${doc.slug}`);
			revalidateTag(`page:/services/${doc.slug}`);
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
		defaultColumns: ["subtitle", "name", "slug", "displayOrder"],
		description: "14 service entries. Order controlled by displayOrder.",
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
		{
			name: "slug",
			type: "text",
			required: true,
			unique: true,
			index: true,
		},
		{
			name: "name",
			type: "text",
			required: true,
		},
		{
			name: "subtitle",
			type: "text",
			admin: {
				description: "Order number, e.g. 01, 02 … 14",
			},
		},
		{
			name: "displayOrder",
			type: "number",
			defaultValue: 0,
			required: true,
			admin: {
				description: "Lower numbers appear first on the homepage grid.",
			},
		},
		{
			name: "cardImage",
			type: "upload",
			relationTo: "media",
		},
		{
			name: "description",
			type: "textarea",
			required: true,
			admin: {
				description: "Short blurb for the homepage card.",
			},
		},
		{
			name: "longDescription",
			type: "richText",
			admin: {
				description: "Full content for the service page body zone.",
			},
		},
		{
			name: "contactFormEnabled",
			type: "checkbox",
			defaultValue: true,
		},
	],
	timestamps: true,
};
