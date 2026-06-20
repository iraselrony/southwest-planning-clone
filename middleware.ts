/**
 * Root-level middleware. Runs in the Edge Runtime, so it imports the
 * Edge-safe `auth.config.ts` (no Drizzle, no pg). The middleware
 * does the lightweight "is there a session cookie?" check. The
 * deeper "is this email in the admin allowlist?" check lives in
 * `app/admin/_lib/auth.ts → requireAdmin()` (server component, Node
 * runtime, can hit Drizzle).
 */
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	const { nextUrl } = req;
	const isAdminRoute = nextUrl.pathname.startsWith("/admin");
	const isLoginPage = nextUrl.pathname === "/admin/login";
	const isAuthApi = nextUrl.pathname.startsWith("/api/auth/");

	if (!isAdminRoute || isAuthApi) return;
	if (isLoginPage) return;
	if (!req.auth) {
		const loginUrl = new URL("/admin/login", nextUrl);
		loginUrl.searchParams.set("from", nextUrl.pathname);
		return Response.redirect(loginUrl);
	}
});

export const config = {
	// Only run middleware on /admin/*. The /api/auth/* routes are
	// handled by the full Auth.js handler in app/api/auth/[...nextauth]/route.ts
	// which uses the Node runtime + Drizzle adapter. The public site
	// renders straight through without any auth overhead.
	matcher: ["/admin/:path*"],
};
