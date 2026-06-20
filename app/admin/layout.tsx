/**
 * Root admin layout. Just provides the chrome. The auth guard lives
 * in `app/admin/(authed)/layout.tsx` so /admin/login can render
 * outside it.
 *
 * Tailwind lives only inside /admin/* — the public site keeps its
 * Webflow CSS. We import a separate Tailwind entry here so the
 * public site's globals.css stays untouched.
 */
import "./admin-tailwind.css";
import { SITE } from "../../config/site";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
	title: `Admin | ${SITE.companyName}`,
	robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
			<header className="border-b border-neutral-200 bg-white">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<div className="flex items-baseline gap-3">
						<Link
							href="/admin"
							className="text-lg font-semibold tracking-tight"
						>
							{SITE.companyName}
						</Link>
						<span className="text-sm text-neutral-500">Admin</span>
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
		</div>
	);
}
