/**
 * Authed sublayout. Wraps every page in `app/admin/(authed)/*` with
 * the admin allowlist check. The /admin/login page lives outside
 * this group so it can render without a session.
 */
import { requireAdmin } from "../_lib/auth";
import type { ReactNode } from "react";

export default async function AuthedLayout({
	children,
}: {
	children: ReactNode;
}) {
	await requireAdmin();
	return <>{children}</>;
}
