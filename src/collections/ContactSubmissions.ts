import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { isAdmin, publicCreate } from "../access";

const autoPopulateSubject: CollectionAfterChangeHook = ({ doc, operation }) => {
	if (operation === "create" && !doc.subject) {
		const source =
			doc.source === "contact-page"
				? "Contact"
				: doc.source?.replace("service-page:", "Service: ") || "Unknown";
		return {
			...doc,
			subject: `${doc.name} - ${source}`,
		};
	}
	return doc;
};

export const ContactSubmissions: CollectionConfig = {
	slug: "contact-submissions",
	admin: {
		useAsTitle: "subject",
		defaultColumns: ["subject", "email", "status", "submittedAt"],
		group: "Inbox",
		description:
			"Contact form submissions with status tracking and internal notes.",
	},
	access: {
		read: isAdmin,
		create: publicCreate,
		update: isAdmin,
		delete: isAdmin,
	},
	hooks: {
		afterChange: [autoPopulateSubject],
	},
	fields: [
		{
			type: "tabs",
			tabs: [
				// ─── Submission Details Tab ───────────────────────────────────
				{
					label: "Submission",
					description: "Contact form submission details.",
					fields: [
						{
							name: "subject",
							type: "text",
							admin: {
								description: "Auto-generated subject line (can be edited).",
								position: "sidebar",
							},
						},
						{
							name: "name",
							type: "text",
							required: true,
							admin: {
								description: "Submitter's full name.",
							},
						},
						{
							name: "email",
							type: "email",
							required: true,
							admin: {
								description: "Submitter's email address.",
							},
						},
						{
							name: "phone",
							type: "text",
							admin: {
								description: "Submitter's phone number (optional).",
							},
						},
						{
							name: "company",
							type: "text",
							admin: {
								description: "Submitter's company name (optional).",
							},
						},
						{
							name: "message",
							type: "textarea",
							required: true,
							admin: {
								description: "Message content from the contact form.",
							},
						},
						{
							name: "source",
							type: "text",
							required: true,
							index: true,
							admin: {
								description:
									"Where the form was submitted from. Expected formats: 'contact-page' or 'service-page:<slug>'.",
								position: "sidebar",
							},
						},
						{
							name: "submittedAt",
							type: "date",
							required: true,
							admin: {
								description: "Date and time of submission.",
								position: "sidebar",
							},
						},
						{
							name: "ipAddress",
							type: "text",
							admin: {
								description: "Submitter's IP address (for spam detection).",
								position: "sidebar",
								readOnly: true,
							},
						},
					],
				},

				// ─── Status & Workflow Tab ────────────────────────────────────
				{
					label: "Status & Workflow",
					description: "Track submission status and assign to team members.",
					fields: [
						{
							name: "status",
							type: "select",
							required: true,
							defaultValue: "new",
							options: [
								{ label: "New", value: "new" },
								{ label: "Read", value: "read" },
								{ label: "In Progress", value: "in-progress" },
								{ label: "Replied", value: "replied" },
								{ label: "Converted", value: "converted" },
								{ label: "Closed", value: "closed" },
								{ label: "Spam", value: "spam" },
							],
							admin: {
								description: "Current status of this submission.",
								position: "sidebar",
							},
						},
						{
							name: "priority",
							type: "select",
							defaultValue: "normal",
							options: [
								{ label: "Low", value: "low" },
								{ label: "Normal", value: "normal" },
								{ label: "High", value: "high" },
								{ label: "Urgent", value: "urgent" },
							],
							admin: {
								description: "Priority level for this submission.",
								position: "sidebar",
							},
						},
						{
							name: "assignedTo",
							type: "relationship",
							relationTo: "users",
							admin: {
								description: "Team member responsible for this submission.",
								position: "sidebar",
							},
						},
						{
							name: "tags",
							type: "select",
							hasMany: true,
							options: [
								{ label: "Residential", value: "residential" },
								{ label: "Commercial", value: "commercial" },
								{ label: "Planning Permission", value: "planning-permission" },
								{ label: "Appeal", value: "appeal" },
								{ label: "Consultation", value: "consultation" },
								{ label: "Quote Request", value: "quote-request" },
								{ label: "Follow-up", value: "follow-up" },
							],
							admin: {
								description: "Tags for categorizing and filtering submissions.",
							},
						},
						{
							name: "internalNotes",
							type: "array",
							label: "Internal Notes",
							fields: [
								{
									name: "note",
									type: "textarea",
									required: true,
									admin: {
										description: "Internal note (not visible to submitter).",
									},
								},
								{
									name: "author",
									type: "relationship",
									relationTo: "users",
									admin: {
										description: "Team member who added this note.",
										readOnly: true,
									},
								},
								{
									name: "createdAt",
									type: "date",
									admin: {
										description: "Date note was added.",
										readOnly: true,
									},
								},
							],
							admin: {
								description:
									"Internal notes and comments (not visible to submitter).",
							},
						},
					],
				},

				// ─── Follow-up Tab ────────────────────────────────────────────
				{
					label: "Follow-up",
					description: "Track follow-up actions and outcomes.",
					fields: [
						{
							name: "repliedAt",
							type: "date",
							admin: {
								description: "Date and time of first reply.",
							},
						},
						{
							name: "replyMethod",
							type: "select",
							options: [
								{ label: "Email", value: "email" },
								{ label: "Phone", value: "phone" },
								{ label: "Meeting", value: "meeting" },
								{ label: "Other", value: "other" },
							],
							admin: {
								description: "How the initial reply was made.",
							},
						},
						{
							name: "followUpDate",
							type: "date",
							admin: {
								description: "Scheduled follow-up date (optional).",
							},
						},
						{
							name: "outcome",
							type: "select",
							options: [
								{ label: "Quote Sent", value: "quote-sent" },
								{ label: "Meeting Booked", value: "meeting-booked" },
								{ label: "Project Won", value: "project-won" },
								{ label: "Project Lost", value: "project-lost" },
								{ label: "Not Suitable", value: "not-suitable" },
								{ label: "No Response", value: "no-response" },
							],
							admin: {
								description: "Final outcome of this submission.",
							},
						},
						{
							name: "projectValue",
							type: "number",
							admin: {
								description: "Estimated project value (if converted).",
							},
						},
						{
							name: "convertedToProject",
							type: "relationship",
							relationTo: "case-studies",
							admin: {
								description:
									"Link to case study if this submission resulted in a project.",
							},
						},
					],
				},
			],
		},
	],
	timestamps: true,
};
