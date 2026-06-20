/**
 * API-side admin auth helper. Unlike the page-level `requireAdmin()`
 * (which redirects), the API checks return 401/403 JSON responses
 * so the client can handle them properly.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "../../../auth";
import { db } from "../../../db";
import { adminUsers } from "../../../db/schema";

export type AdminApiResult =
	| { ok: true; userId: string; email: string }
	| { ok: false; response: NextResponse };

/**
 * Verify the current session is for an admin user. Returns either
 * the admin record (ok) or a pre-built error response.
 *
 * Usage:
 *   const auth = await requireAdminApi();
 *   if (!auth.ok) return auth.response;
 *   // ... auth.userId, auth.email are safe to use
 */
export async function requireAdminApi(): Promise<AdminApiResult> {
	const session = await auth();
	if (!session?.user?.email) {
		return {
			ok: false,
			response: NextResponse.json({ error: "Not signed in" }, { status: 401 }),
		};
	}
	const [admin] = await db
		.select()
		.from(adminUsers)
		.where(eq(adminUsers.email, session.user.email))
		.limit(1);
	if (!admin) {
		return {
			ok: false,
			response: NextResponse.json({ error: "Not an admin" }, { status: 403 }),
		};
	}
	return { ok: true, userId: admin.id, email: admin.email };
}
