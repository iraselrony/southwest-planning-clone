/**
 * Admin dashboard home. Lists the four main sections (Pages, Services,
 * Site Settings, Contact Submissions) as cards. Each links to its
 * dedicated list/edit page.
 */
import { SITE } from "../../../config/site";
import { signOut } from "../../../auth";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "../../../db";
import { pages, services, contactSubmissions } from "../../../db/schema";

const SECTIONS = [
	{
		href: "/admin/pages",
		emoji: "📄",
		title: "Pages",
		description: "Edit SEO + body content for all 18 pages",
		ready: true as const,
	},
	{
		href: "/admin/services",
		emoji: "🛠",
		title: "Services",
		description: "Add, edit, reorder the 14 services",
		ready: true as const,
	},
	{
		href: "/admin/settings",
		emoji: "⚙️",
		title: "Site Settings",
		description: "Company info, contact, social links, logo",
		ready: true as const,
	},
	{
		href: "/admin/submissions",
		emoji: "✉️",
		title: "Contact Submissions",
		description: "Browse, search, and export form submissions",
		ready: false as const,
	},
];

export const dynamic = "force-dynamic";

export default async function AdminHome() {
	const [pageCountRow] = await db.select({ n: count() }).from(pages);
	const [serviceCountRow] = await db.select({ n: count() }).from(services);
	const [submissionCountRow] = await db
		.select({ n: count() })
		.from(contactSubmissions);

	const pageCount = pageCountRow?.n ?? 0;
	const serviceCount = serviceCountRow?.n ?? 0;
	const submissionCount = submissionCountRow?.n ?? 0;

	return (
		<div>
			<div className="mb-8 flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
					<p className="mt-1 text-sm text-neutral-600">
						Welcome back. Pick a section to manage.
					</p>
				</div>
				<form
					action={async () => {
						"use server";
						await signOut({ redirectTo: "/admin/login" });
					}}
				>
					<button
						type="submit"
						className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
					>
						Sign out
					</button>
				</form>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
					<div className="mb-2 text-2xl">📄</div>
					<h2 className="text-base font-semibold">Pages</h2>
					<p className="mt-1 text-sm text-neutral-600">
						{pageCount} pages. Edit SEO and body content.
					</p>
					<Link
						href="/admin/pages"
						className="mt-3 inline-block text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
					>
						Open →
					</Link>
				</div>
				<div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
					<div className="mb-2 text-2xl">🛠</div>
					<h2 className="text-base font-semibold">Services</h2>
					<p className="mt-1 text-sm text-neutral-600">
						{serviceCount} services. Add, edit, reorder, or remove.
					</p>
					<Link
						href="/admin/services"
						className="mt-3 inline-block text-sm font-medium text-neutral-900 underline:offset-2 hover:underline"
					>
						Open →
					</Link>
				</div>
				<div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
					<div className="mb-2 text-2xl">⚙️</div>
					<h2 className="text-base font-semibold">Site Settings</h2>
					<p className="mt-1 text-sm text-neutral-600">
						Company info, contact, social links, logo.
					</p>
					<Link
						href="/admin/settings"
						className="mt-3 inline-block text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
					>
						Open →
					</Link>
				</div>
				<div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
					<div className="mb-2 text-2xl">✉️</div>
					<h2 className="text-base font-semibold">Contact Submissions</h2>
					<p className="mt-1 text-sm text-neutral-600">
						{submissionCount} submissions so far. Browse, search, and export
						CSV.
					</p>
					<Link
						href="/admin/submissions"
						className="mt-3 inline-block text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
					>
						Open →
					</Link>
				</div>
			</div>
		</div>
	);
}
