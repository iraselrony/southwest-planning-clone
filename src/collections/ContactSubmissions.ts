import type { CollectionConfig } from "payload";
import { publicCreate, isAdmin } from "../access";

/**
 * Contact form submissions. The public /api/contact route inserts here
 * after the Resend send. The admin can browse, search, and filter.
 */
export const ContactSubmissions: CollectionConfig = {
	slug: "contact-submissions",
	admin: {
		useAsTitle: "subject",
		defaultColumns: ["submittedAt", "name", "email", "source"],
		description:
			"Persisted contact form submissions. Public can create; admin can read/delete.",
	},
	access: {
		read: isAdmin,
		create: publicCreate,
		update: isAdmin,
		delete: isAdmin,
	},
	fields: [
		{
			name: "subject",
			type: "text",
			admin: {
				description:
					"Display label in the admin list. Defaults to name + source at create time.",
				position: "sidebar",
			},
		},
		{
			name: "name",
			type: "text",
			required: true,
		},
		{
			name: "email",
			type: "email",
			required: true,
		},
		{
			name: "phone",
			type: "text",
		},
		{
			name: "message",
			type: "textarea",
			required: true,
		},
		{
			name: "source",
			type: "text",
			required: true,
			index: true,
			admin: {
				description:
					"Where the form was submitted from. contact-page or service-page:<slug>",
				position: "sidebar",
			},
		},
		{
			name: "submittedAt",
			type: "date",
			required: true,
			defaultValue: () => new Date().toISOString(),
			admin: {
				date: { pickerAppearance: "dayAndTime" },
				position: "sidebar",
			},
		},
	],
	timestamps: true,
};
