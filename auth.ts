/**
 * Auth.js v5 — full config (Node runtime only).
 *
 * Imports the Edge-safe `authConfig` from `auth.config.ts` and adds the
 * Drizzle adapter (which requires Node's `pg` and `node:crypto`).
 * Use this from server actions, server components, and API routes.
 *
 * The middleware uses the Edge-safe `auth.config.ts` instead.
 */
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { authConfig } from "./auth.config";
import { validateEnv } from "./app/_lib/env-check";

validateEnv();

export const { handlers, signIn, signOut, auth } = NextAuth({
	...authConfig,
	adapter: DrizzleAdapter(db),
});
