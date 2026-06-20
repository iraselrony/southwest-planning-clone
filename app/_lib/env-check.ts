/**
 * Environment variable validation. Runs at module load and throws
 * with a clear, actionable error if a required env var is missing
 * or looks wrong. Called from `db/index.ts` and the API routes
 * that depend on the Resend / Vercel Blob / Auth.js secrets.
 *
 * Goal: fail fast at startup, not at request time with a cryptic
 * "authjs error" or "BLOB_READ_WRITE_TOKEN is invalid".
 */
type EnvVar = {
	name: string;
	required: boolean;
	/** If set, the value must match this regex. */
	pattern?: RegExp;
	/** Free-text description shown in the error message. */
	description: string;
};

const ENV_VARS: EnvVar[] = [
	{
		name: "DATABASE_URL",
		required: true,
		pattern: /^postgres(ql)?:\/\//,
		description:
			"Postgres connection string. Use the Neon pooler URL in production: postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require",
	},
	{
		name: "AUTH_SECRET",
		required: true,
		pattern: /^.{32,}$/,
		description:
			"32+ char random string for signing Auth.js sessions. Generate with `openssl rand -base64 32`.",
	},
	{
		name: "AUTH_RESEND_KEY",
		required: true,
		pattern: /^re_/,
		description:
			"Resend API key. The Resend account's email is the only allowed recipient on the free tier.",
	},
	{
		name: "ADMIN_EMAIL",
		required: true,
		pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
		description:
			"The single admin's email (must match the email used to sign in).",
	},
	{
		name: "RESEND_API_KEY",
		required: true,
		pattern: /^re_/,
		description: "Resend API key for the /api/contact form.",
	},
	{
		name: "BLOB_READ_WRITE_TOKEN",
		required: false, // Optional in dev (falls back to /tmp)
		pattern: /^vercel_blob_(rw|fwcd)_/,
		description:
			"Vercel Blob token for the admin image upload. REQUIRED in production. Create a store in the Vercel dashboard, then copy the token.",
	},
	{
		name: "CONTACT_TO_EMAIL",
		required: false,
		description:
			"Comma-separated recipient list for the contact form. Defaults to SITE.contactEmail from config.",
	},
	{
		name: "CONTACT_FROM_EMAIL",
		required: false,
		description:
			"From address for contact-form emails. Must be on a Resend-verified domain in production (e.g. 'Acme Planning <noreply@acme.example>').",
	},
	{
		name: "AUTH_EMAIL_FROM",
		required: false,
		description:
			"From address for Auth.js magic-link emails. Must be on a Resend-verified domain in production.",
	},
];

let validated = false;

export function validateEnv(): void {
	if (validated) return;
	validated = true;

	const errors: string[] = [];
	const warnings: string[] = [];

	for (const v of ENV_VARS) {
		const val = process.env[v.name];
		if (!val) {
			if (v.required) {
				errors.push(
					`  ✗ ${v.name} is not set\n      ${v.description}`,
				);
			} else if (process.env.NODE_ENV === "production") {
				// Warn on optional vars in production
				warnings.push(
					`  ⚠ ${v.name} is not set (optional in dev, recommended in production)\n      ${v.description}`,
				);
			}
			continue;
		}
		if (v.pattern && !v.pattern.test(val)) {
			errors.push(
				`  ✗ ${v.name} doesn't match expected format\n      ${v.description}\n      Got: ${val.slice(0, 8)}…`,
			);
		}
	}

	if (errors.length > 0) {
		const msg = [
			"Environment validation failed:",
			...errors,
			"",
			"Fix these in your Vercel project settings (or .env.local for dev).",
			"See execution-plan/production-setup.md for the full guide.",
		].join("\n");
		throw new Error(msg);
	}

	if (warnings.length > 0) {
		const msg = [
			"Environment validation warnings:",
			...warnings,
		].join("\n");
		console.warn(`\n${msg}\n`);
	}
}
