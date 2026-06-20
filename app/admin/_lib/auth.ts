/**
 * Admin auth helpers. The middleware does the lightweight "is there a
 * session?" check; this module does the deeper "is the signed-in user
 * an admin?" check (email in the `admin_users` table).
 */
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "../../../auth";
import { db } from "../../../db";
import { adminUsers } from "../../../db/schema";
import { SITE } from "../../../config/site";

export type AdminSession = {
	userId: string;
	email: string;
	name: string | null;
};

/**
 * Server-side: read the current session, verify the user is in the
 * admin allowlist, and return the admin record. Redirects to
 * /admin/login if not signed in, or to /admin/login?error=forbidden
 * if signed in but not an admin.
 */
export async function requireAdmin(): Promise<AdminSession> {
	const session = await auth();
	if (!session?.user?.email) {
		redirect("/admin/login");
	}

	const [admin] = await db
		.select()
		.from(adminUsers)
		.where(eq(adminUsers.email, session.user.email))
		.limit(1);

	if (!admin) {
		// The email allowlist hasn't been seeded yet, OR the user is
		// trying to sign in with a non-admin email. Bounce them.
		redirect("/admin/login?error=forbidden");
	}

	return {
		userId: admin.id,
		email: admin.email,
		name: admin.name,
	};
}

/**
 * For the login page: if the user is already signed in AND is an
 * admin, redirect them to /admin. Otherwise return null (show the
 * login form).
 */
export async function getAdminOrNull(): Promise<AdminSession | null> {
	const session = await auth();
	if (!session?.user?.email) return null;
	const [admin] = await db
		.select()
		.from(adminUsers)
		.where(eq(adminUsers.email, session.user.email))
		.limit(1);
	if (!admin) return null;
	return { userId: admin.id, email: admin.email, name: admin.name };
}

/** The configured admin email. Surfaced in the login UI for clarity. */
export const ADMIN_EMAIL = SITE.adminEmail;
