/**
 * Drizzle Kit config. Reads the same DATABASE_URL that the app uses.
 *
 * Local dev: postgresql://swp_user:southwest_dev_pw@localhost:5432/southwest_planning
 * Production: Neon pooled URL (postgresql://...neon.tech/neondb?sslmode=require)
 *
 * `db:push` applies the current schema directly to the database (no migration
 * files written). Use it for local dev. For production, prefer
 * `db:generate` → review the migration → `db:migrate`.
 */
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load .env.local (Next.js loads it automatically at runtime, but Drizzle
// Kit runs in a separate process and doesn't).
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
	throw new Error(
		"DATABASE_URL is not set. Add it to .env.local (local dev) or Vercel env vars (production).",
	);
}

export default defineConfig({
	schema: "./db/schema.ts",
	out: "./db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
	verbose: true,
	strict: true,
});
