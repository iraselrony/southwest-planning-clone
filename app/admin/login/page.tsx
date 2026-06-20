/**
 * Admin login. Single email input → "Send magic link" button.
 *
 * Flow:
 *  1. User enters their email
 *  2. We POST to Auth.js's signin/email endpoint
 *  3. Auth.js sends a Resend email with the magic link
 *  4. User clicks the link → redirected to /admin (after the admin
 *     allowlist check in `requireAdmin`)
 *  5. If signed in already, redirect to /admin
 */
import { redirect } from "next/navigation";
import { signIn } from "../../../auth";
import { getAdminOrNull, ADMIN_EMAIL } from "../_lib/auth";
import { SITE } from "../../../config/site";

type SearchParams = {
	searchParams: Promise<{ from?: string; check?: string; error?: string }>;
};

export const metadata = {
	title: `Sign in | ${SITE.companyName} Admin`,
};

export default async function LoginPage({ searchParams }: SearchParams) {
	const params = await searchParams;

	// Already signed in AND an admin? Bounce to /admin.
	const admin = await getAdminOrNull();
	if (admin) {
		redirect(params.from || "/admin");
	}

	return (
		<div className="mx-auto mt-12 max-w-md">
			<div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
				<h1 className="text-xl font-semibold tracking-tight">
					Sign in
				</h1>
				<p className="mt-1 text-sm text-neutral-600">
					Enter your email to receive a one-click sign-in link.
				</p>

				{params.check === "email" && (
					<div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
						Check your email. We sent a sign-in link to the address
						you entered. The link expires in 24 hours.
					</div>
				)}

				{params.error === "forbidden" && (
					<div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
						That email isn't on the admin allowlist. The single
						admin is <strong>{ADMIN_EMAIL}</strong>. If that's
						you, contact the project owner to be added.
					</div>
				)}

				{params.error === "signin" && (
					<div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
						Something went wrong. Try again, or contact the
						project owner if the problem persists.
					</div>
				)}

				<form
					className="mt-6 space-y-4"
					action={async (formData) => {
						"use server";
						const email = formData.get("email")?.toString().trim();
						if (!email) return;
						// Auth.js handles the email send + DB token insert.
						// We pass `redirectTo` so the callback lands back on
						// /admin (or the original `from` page) after the
						// user clicks the magic link.
						await signIn("resend", {
							email,
							redirectTo: params.from || "/admin",
						});
					}}
				>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-neutral-700"
						>
							Email
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							autoComplete="email"
							placeholder="you@example.com"
							className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
					</div>
					<button
						type="submit"
						className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
					>
						Send magic link
					</button>
				</form>
			</div>

			<p className="mt-6 text-center text-xs text-neutral-500">
				Only the configured admin can sign in. Magic links expire in
				24 hours.
			</p>
		</div>
	);
}
