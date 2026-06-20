/**
 * Admin dashboard home. Lists the four main sections (Pages, Services,
 * Site Settings, Contact Submissions) as cards. Each links to its
 * dedicated list/edit page (added on Day 2-4).
 */
import { SITE } from "../../../config/site";
import { signOut } from "../../../auth";
import Link from "next/link";

const SECTIONS = [
	{
		href: "/admin/pages",
		emoji: "📄",
		title: "Pages",
		description: "Edit SEO + body content for all 18 pages",
		status: "coming-soon" as const,
	},
	{
		href: "/admin/services",
		emoji: "🛠",
		title: "Services",
		description: "Add, edit, reorder the 14 services",
		status: "coming-soon" as const,
	},
	{
		href: "/admin/settings",
		emoji: "⚙️",
		title: "Site Settings",
		description: "Company info, contact, social links, logo",
		status: "coming-soon" as const,
	},
	{
		href: "/admin/submissions",
		emoji: "✉️",
		title: "Contact Submissions",
		description: "Browse, search, and export form submissions",
		status: "coming-soon" as const,
	},
];

export default async function AdminHome() {
	return (
		<div>
			<div className="mb-8 flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Dashboard
					</h1>
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
				{SECTIONS.map((s) => (
					<div
						key={s.href}
						className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
					>
						<div className="mb-2 text-2xl">{s.emoji}</div>
						<h2 className="text-base font-semibold">{s.title}</h2>
						<p className="mt-1 text-sm text-neutral-600">
							{s.description}
						</p>
						{s.status === "coming-soon" ? (
							<p className="mt-3 text-xs text-neutral-400">
								Coming in a later build.
							</p>
						) : (
							<Link
								href={s.href}
								className="mt-3 inline-block text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
							>
								Open →
							</Link>
						)}
					</div>
				))}
			</div>

			<div className="mt-8 rounded-lg border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
				<strong className="font-semibold text-neutral-900">
					Build status
				</strong>
				: Day 1 of the 6-day custom dashboard build is complete —
				auth, DB schema, and the magic-link login flow are working.
				Pages, Services, Settings, and Submissions UIs land in
				Days 2-5.
			</div>
		</div>
	);
}
