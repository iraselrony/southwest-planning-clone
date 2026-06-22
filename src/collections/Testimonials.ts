import type { CollectionConfig } from "payload";
import { publicRead, isAdmin } from "../access";

export const Testimonials: CollectionConfig = {
	slug: "testimonials",
	admin: {
		useAsTitle: "authorName",
		defaultColumns: ["authorName", "authorRole", "rating", "published"],
		group: "Business",
		description: "Client testimonials displayed across the site.",
	},
	access: {
		read: publicRead,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	fields: [
		{
			type: "tabs",
			tabs: [
				{
					label: "Content",
					fields: [
						{
							name: "quote",
							type: "textarea",
							required: true,
							admin: {
								description:
									"The testimonial quote. Keep it authentic and specific.",
							},
						},
						{
							name: "authorName",
							type: "text",
							required: true,
							admin: {
								description: "Client's name as it should appear publicly.",
							},
						},
						{
							name: "authorRole",
							type: "text",
							admin: {
								description:
									"Client's job title or role, e.g. 'Property Developer'.",
							},
						},
						{
							name: "authorCompany",
							type: "text",
							admin: {
								description: "Client's company name (optional).",
							},
						},
						{
							name: "authorImage",
							type: "upload",
							relationTo: "media",
							admin: {
								description:
									"Optional headshot of the client (recommended: 200x200px).",
							},
						},
					],
				},
				{
					label: "Settings",
					fields: [
						{
							name: "rating",
							type: "select",
							defaultValue: "5",
							options: [
								{ label: "5 Stars", value: "5" },
								{ label: "4 Stars", value: "4" },
								{ label: "3 Stars", value: "3" },
							],
							admin: {
								description: "Star rating displayed with the testimonial.",
							},
						},
						{
							name: "service",
							type: "relationship",
							relationTo: "services",
							admin: {
								description:
									"Link this testimonial to a specific service (optional).",
							},
						},
						{
							name: "project",
							type: "relationship",
							relationTo: "case-studies",
							admin: {
								description:
									"Link this testimonial to a specific project (optional).",
							},
						},
						{
							name: "published",
							type: "checkbox",
							defaultValue: true,
							admin: {
								description:
									"Unpublished testimonials are hidden from the public site.",
								position: "sidebar",
							},
						},
						{
							name: "featured",
							type: "checkbox",
							defaultValue: false,
							admin: {
								description:
									"Featured testimonials appear in prominent sections.",
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
