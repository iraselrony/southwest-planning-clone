/**
 * /admin/settings — single form for site_settings (id=1).
 * Server component that reads the current row and passes it to the
 * client form.
 */
import { eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "../../../../db";
import { siteSettings } from "../../../../db/schema";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
	const [row] = await db
		.select()
		.from(siteSettings)
		.where(eq(siteSettings.id, 1))
		.limit(1);

	// If the row doesn't exist yet (shouldn't happen — seeded), seed
	// defaults from SITE on the fly so the form is usable.
	const initial = row ?? {
		id: 1,
		logoUrl: null,
		companyName: "South West Planning Consultancy",
		companyTagline: null,
		address: null,
		phoneNumbers: [],
		email: null,
		socialLinks: {},
		registrationNumber: null,
		registeredOffice: null,
		footerText: null,
		updatedAt: new Date(),
	};

	return (
		<div>
			<div className="mb-6">
				<Link
					href="/admin"
					className="text-sm text-neutral-500 hover:text-neutral-700"
				>
					← Dashboard
				</Link>
				<h1 className="mt-2 text-2xl font-semibold tracking-tight">
					Site settings
				</h1>
				<p className="mt-1 text-sm text-neutral-600">
					Company info, contact, social, registration. Shown in the header,
					footer, and contact page.
				</p>
			</div>
			<SettingsForm
				initial={{
					logoUrl: initial.logoUrl,
					companyName: initial.companyName,
					companyTagline: initial.companyTagline ?? "",
					address: initial.address ?? "",
					phoneNumbers: (initial.phoneNumbers as string[]) ?? [],
					email: initial.email ?? "",
					socialLinks:
						(initial.socialLinks as {
							instagram?: string;
							twitter?: string;
							linkedin?: string;
							facebook?: string;
						}) ?? {},
					registrationNumber: initial.registrationNumber ?? "",
					registeredOffice: initial.registeredOffice ?? "",
					footerText: initial.footerText ?? "",
				}}
			/>
		</div>
	);
}
