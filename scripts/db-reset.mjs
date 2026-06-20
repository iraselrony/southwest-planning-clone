/**
 * DESTRUCTIVE: drops and recreates all public tables, then re-applies
 * the migration and re-seeds. Use only in local dev.
 *
 * Usage:
 *   npm run db:reset
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

if (!process.env.DATABASE_URL) {
	const envLocal = await readFile(resolve(projectRoot, ".env.local"), "utf-8");
	for (const line of envLocal.split("\n")) {
		const m = line.match(/^([A-Z_]+)\s*=\s*(.+?)\s*$/);
		if (m && !process.env[m[1]]) {
			process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
		}
	}
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

console.log("⚠️  Resetting database (dropping all tables)...\n");

await client.query(`
	DROP TABLE IF EXISTS verification_tokens CASCADE;
	DROP TABLE IF EXISTS sessions CASCADE;
	DROP TABLE IF EXISTS accounts CASCADE;
	DROP TABLE IF EXISTS users CASCADE;
	DROP TABLE IF EXISTS admin_users CASCADE;
	DROP TABLE IF EXISTS contact_submissions CASCADE;
	DROP TABLE IF EXISTS site_settings CASCADE;
	DROP TABLE IF EXISTS services CASCADE;
	DROP TABLE IF EXISTS pages CASCADE;
`);

console.log("✓ Dropped all tables. Re-applying migration...");

// Find the most recent migration file
const { readdirSync } = await import("node:fs");
const migrationsDir = resolve(projectRoot, "db", "migrations");
const files = readdirSync(migrationsDir)
	.filter((f) => f.endsWith(".sql"))
	.sort();
if (files.length === 0) {
	throw new Error("No migration files found in db/migrations/");
}
const migration = files[files.length - 1];
const sql = await readFile(resolve(migrationsDir, migration), "utf-8");
await client.query(sql);
console.log(`✓ Applied ${migration}`);

await client.end();
console.log("\n✓ Reset complete. Now run `npm run db:seed` to repopulate.\n");
