import type { GlobalConfig, GlobalAfterChangeHook } from "payload";
import { revalidateTag } from "next/cache";
import { publicRead, isAdmin } from "../access";

const revalidateSite: GlobalAfterChangeHook = () => {
	try {
		revalidateTag("site");
	} catch {
		// safe to ignore outside a request context
	}
};

export const SiteSettings: GlobalConfig = {
	slug: "site-settings",
	admin: {
		description:
			"Single instance. Header logo, contact info, social links, footer text.",
	},
	access: {
		read: publicRead,
		update: isAdmin,
	},
	hooks: {
		afterChange: [revalidateSite],
	},
	fields: [
		{
			name: "logo",
			type: "upload",
			relationTo: "media",
		},
		{
			name: "companyName",
			type: "text",
			required: true,
			defaultValue: "South West Planning Consultancy",
		},
		{
			name: "companyTagline",
			type: "text",
			defaultValue: "Planning Consultants Southwest",
		},
		{
			type: "row",
			fields: [
				{
					name: "address",
					type: "textarea",
					defaultValue:
						"The Generator Hub, The Gallery, Kings Wharf, The Quay, Exeter, Devon, EX2 4AN",
				},
				{
					name: "registeredOffice",
					type: "textarea",
				},
			],
		},
		{
			name: "phoneNumbers",
			type: "array",
			labels: { singular: "Phone Number", plural: "Phone Numbers" },
			fields: [{ name: "value", type: "text", required: true }],
			defaultValue: [
				{ value: "01392 984 206" },
				{ value: "07779 285 376" },
				{ value: "07525 059 569" },
			],
		},
		{
			name: "email",
			type: "email",
			defaultValue: "info@southwestplanningconsultancy.co.uk",
		},
		{
			name: "registrationNumber",
			type: "text",
			defaultValue: "13398455",
		},
		{
			name: "socialLinks",
			type: "group",
			label: "Social Links",
			fields: [
				{ name: "instagram", type: "text" },
				{ name: "twitter", type: "text" },
				{ name: "linkedin", type: "text" },
				{ name: "facebook", type: "text" },
			],
		},
		{
			name: "footerText",
			type: "textarea",
			defaultValue:
				"© South West Planning Consultancy Ltd. Registered in England and Wales.",
		},
	],
};
