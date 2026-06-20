/**
 * Drizzle database connection. Single shared client + Drizzle instance.
 *
 * In dev, Next.js HMR can re-evaluate modules; we cache the client on
 * `globalThis` to avoid exhausting the Postgres connection pool.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
	throw new Error(
		"DATABASE_URL is not set. Add it to .env.local (local dev) or Vercel env vars (production).",
	);
}

const globalForDb = globalThis as unknown as {
	pool?: Pool;
};

export const pool =
	globalForDb.pool ??
	new Pool({
		connectionString: process.env.DATABASE_URL,
		// Neon requires SSL; local Postgres doesn't. We always pass the
		// connection string as-is and let the server decide. If you
		// point at a Neon URL, it must include ?sslmode=require.
	});

if (process.env.NODE_ENV !== "production") {
	globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
export { schema };
