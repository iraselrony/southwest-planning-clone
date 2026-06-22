import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

export const Users: CollectionConfig = {
	slug: "users",
	auth: true,
	admin: {
		useAsTitle: "email",
		defaultColumns: ["email", "role", "lastLogin", "createdAt"],
		group: "Settings",
		description: "Admin users with access to the CMS dashboard.",
	},
	access: {
		create: isAdmin,
		read: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	fields: [
		{
			name: "role",
			type: "select",
			required: true,
			defaultValue: "admin",
			options: [
				{ label: "Administrator", value: "admin" },
				{ label: "Editor", value: "editor" },
			],
			admin: {
				description:
					"Administrator has full access. Editor can only edit content.",
				position: "sidebar",
			},
		},
		{
			name: "name",
			type: "text",
			admin: {
				description: "Display name shown in the admin interface.",
			},
		},
		{
			name: "avatar",
			type: "upload",
			relationTo: "media",
			admin: {
				description: "Profile picture displayed in the admin header.",
				position: "sidebar",
			},
		},
		{
			name: "lastLogin",
			type: "date",
			admin: {
				readOnly: true,
				position: "sidebar",
				description: "Automatically updated when user logs in.",
			},
		},
	],
	hooks: {
		beforeLogin: [
			({ user }) => {
				// Update lastLogin timestamp
				return { ...user, lastLogin: new Date().toISOString() };
			},
		],
	},
	timestamps: true,
};
