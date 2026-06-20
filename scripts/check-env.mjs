/**
 * Validate that all required env vars are set. Run before
 * deploying or after changing Vercel env vars. Same logic as
 * `app/_lib/env-check.ts` (which runs at app startup), but
 * invokable from the command line.
 *
 * Usage:
 *   npm run check:env
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Load .env.local into process.env (we don't use dotenv as a dep
// just for this — read manually).
try {
	const envLocal = await readFile(
		resolve(projectRoot, ".env.local"),
		"utf-8",
	);
	for (const line of envLocal.split("\n")) {
		const m = line.match(/^([A-Z_]+)\s*=\s*(.+?)\s*$/);
		if (m && !process.env[m[1]]) {
			process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
		}
	}
} catch {
	// .env.local may not exist; that's fine
}

const VARS = [
	{ name: "DATABASE_URL", required: true, pattern: /^postgres(ql)?:\/\// },
	{ name: "AUTH_SECRET", required: true, pattern: /^.{32,}$/ },
	{ name: "AUTH_RESEND_KEY", required: true, pattern: /^re_/ },
	{ name: "ADMIN_EMAIL", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
	{ name: "RESEND_API_KEY", required: true, pattern: /^re_/ },
	{
		name: "BLOB_READ_WRITE_TOKEN",
		required: false,
		pattern: /^vercel_blob_(rw|fwcd)_/,
	},
	{ name: "CONTACT_TO_EMAIL", required: false },
	{ name: "CONTACT_FROM_EMAIL", required: false },
	{ name: "AUTH_EMAIL_FROM", required: false },
];

const errors = [];
const warnings = [];
const isProd = process.env.NODE_ENV === "production";

for (const v of VARS) {
	const val = process.env[v.name];
	if (!val) {
		if (v.required) {
			errors.push(`  ✗ ${v.name} is not set`);
		} else if (isProd) {
			warnings.push(`  ⚠ ${v.name} is not set (optional in dev, recommended in production)`);
		}
		continue;
	}
	if (v.pattern && !v.pattern.test(val)) {
		errors.push(`  ✗ ${v.name} doesn't match expected format (got: ${val.slice(0, 8)}…)`);
	} else {
		console.log(`  ✓ ${v.name}`);
	}
}

if (warnings.length > 0) {
	console.log("\nWarnings:");
	for (const w of warnings) console.log(w);
}

if (errors.length > 0) {
	console.log("\n❌ Environment validation failed:");
	for (const e of errors) console.log(e);
	console.log(
		"\nSee execution-plan/production-setup.md for the full setup guide.",
	);
	process.exit(1);
}

console.log("\n✅ All required env vars are set.");
