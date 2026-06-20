/**
 * Auth.js v5 — Edge-safe base config.
 *
 * Edge-safe means: NO Drizzle, NO pg, NO Resend provider, NO Node-only
 * modules. The middleware imports this so the cookie/session check
 * works in the Edge Runtime.
 *
 * The full config in `auth.ts` spreads this and adds the providers +
 * adapter. Use `auth.ts` from server actions, server components, and
 * API routes.
 *
 * The `providers: []` is intentional — the middleware doesn't
 * initiate sign-in, it only checks the session cookie. Adding the
 * Resend provider here would require the Drizzle adapter, which
 * breaks the Edge bundle.
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
	providers: [],
	pages: {
		signIn: "/admin/login",
		verifyRequest: "/admin/login?check=email",
		error: "/admin/login?error=signin",
	},
	session: {
		// JWT (not database) so the middleware can verify the session in
		// the Edge Runtime without a DB lookup. The DB-backed sessions,
		// accounts, and verification_tokens tables are still used by the
		// adapter during sign-in, but the session cookie itself is a JWT.
		strategy: "jwt",
		maxAge: 7 * 24 * 60 * 60,
		updateAge: 24 * 60 * 60,
	},
	trustHost: true,
} satisfies NextAuthConfig;
