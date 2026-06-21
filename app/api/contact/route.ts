// Contact form endpoint. Accepts POST from the two Webflow-style forms
// (one on /contact, one on each /services/* page) and:
//   1. Validates and normalises the form fields
//   2. Sends an email via the Resend API
//   3. Persists the submission to Payload's contactSubmissions collection
//
// Field names accept both naming conventions used in the Webflow HTML:
//   Contact page form:    First-name / Last-name / Email / Phone / Message
//   Service page forms:   First-name-2 / Last-name-2 / Email-2 / Phone-2 / Message-2
//
// Required env vars:
//   RESEND_API_KEY        Resend API key. Required for email.
//   CONTACT_TO_EMAIL      Comma-separated destination address(es).
//   CONTACT_FROM_EMAIL    From address on the email.
//   PAYLOAD_SECRET        Required for the Payload Local API (used to insert).
//   DATABASE_URL          Required for the Payload Local API.

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getPayload } from "payload";
import config from "@payload-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactPayload = {
	name?: string;
	email?: string;
	phone?: string;
	message?: string;
	source?: string;
	[k: string]: unknown;
};

function parseEmailList(
	raw: string | undefined,
	fallback: string[],
): string[] {
	const source = raw ?? fallback.join(",");
	const list = source
		.split(",")
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	return list.length > 0 ? list : fallback;
}

const TO_EMAILS = parseEmailList(process.env.CONTACT_TO_EMAIL, [
	"info@southwestplanningconsultancy.co.uk",
]);
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

function readField(
	record: Record<string, unknown>,
	...names: string[]
): string {
	for (const n of names) {
		const v = record[n];
		if (typeof v === "string" && v.trim()) return v.trim();
	}
	return "";
}

function normalisePayload(raw: Record<string, unknown>): ContactPayload {
	const first = readField(
		raw,
		"First-name",
		"First-name-2",
		"firstName",
		"first_name",
	);
	const last = readField(
		raw,
		"Last-name",
		"Last-name-2",
		"lastName",
		"last_name",
	);
	const fullName = readField(raw, "name", "Name");
	const name = fullName || [first, last].filter(Boolean).join(" ").trim();
	return {
		name,
		email: readField(raw, "Email", "Email-2", "email"),
		phone: readField(raw, "Phone", "Phone-2", "phone"),
		message: readField(raw, "Message", "Message-2", "message"),
		source:
			typeof raw.source === "string"
				? raw.source
				: readField(raw, "source") || undefined,
	};
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function buildEmailBody(
	p: ContactPayload,
	pageUrl: string,
): { text: string; html: string } {
	const text = [
		`New contact form submission`,
		``,
		`Name:    ${p.name || "(not provided)"}`,
		`Email:   ${p.email || "(not provided)"}`,
		`Phone:   ${p.phone || "(not provided)"}`,
		`Source:  ${p.source || pageUrl}`,
		`Page:    ${pageUrl}`,
		`Time:    ${new Date().toISOString()}`,
		``,
		`Message:`,
		p.message || "(empty)",
	].join("\n");

	const html = `
		<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #111;">
			<h2 style="margin: 0 0 16px;">New contact form submission</h2>
			<table cellpadding="6" style="border-collapse: collapse;">
				<tr><td><strong>Name</strong></td><td>${escapeHtml(p.name || "")}</td></tr>
				<tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(p.email || "")}">${escapeHtml(p.email || "")}</a></td></tr>
				<tr><td><strong>Phone</strong></td><td>${escapeHtml(p.phone || "")}</td></tr>
				<tr><td><strong>Source</strong></td><td>${escapeHtml(p.source || pageUrl)}</td></tr>
				<tr><td><strong>Page</strong></td><td>${escapeHtml(pageUrl)}</td></tr>
				<tr><td><strong>Time</strong></td><td>${new Date().toISOString()}</td></tr>
			</table>
			<h3 style="margin: 24px 0 8px;">Message</h3>
			<div style="white-space: pre-wrap; padding: 12px; background: #f5f5f5; border-radius: 4px;">${escapeHtml(p.message || "")}</div>
		</div>
	`;

	return { text, html };
}

/**
 * Persist the submission to Payload's contactSubmissions collection.
 * Best-effort — failures are logged but do not fail the HTTP response,
 * because the email is the user-facing success signal.
 */
async function persistSubmission(
	payload: ContactPayload,
	pageUrl: string,
): Promise<{ ok: boolean; submissionId?: string; error?: string }> {
	try {
		const payloadClient = await getPayload({ config });
		const subject = `Contact form: ${payload.name || "(no name)"} — ${payload.source || pageUrl}`;
		const created = await payloadClient.create({
			collection: "contact-submissions",
			data: {
				subject,
				name: payload.name || "",
				email: payload.email || "",
				phone: payload.phone || "",
				message: payload.message || "",
				source: payload.source || pageUrl,
				submittedAt: new Date().toISOString(),
			},
			// Don't run access checks for this internal write — the route is
			// already gated on validation.
			overrideAccess: true,
		});
		return { ok: true, submissionId: created.id as string };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error("[contact] payload insert failed", msg);
		return { ok: false, error: msg };
	}
}

export async function POST(request: Request) {
	const pageUrl =
		request.headers.get("referer") ||
		request.headers.get("origin") ||
		"unknown";
	let raw: Record<string, unknown> = {};

	try {
		const contentType = request.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			raw = (await request.json()) as Record<string, unknown>;
		} else if (
			contentType.includes("application/x-www-form-urlencoded") ||
			contentType.includes("multipart/form-data")
		) {
			const form = await request.formData();
			raw = Object.fromEntries(form.entries()) as Record<string, unknown>;
		} else {
			const text = await request.text();
			try {
				raw = JSON.parse(text) as Record<string, unknown>;
			} catch {
				raw = { raw: text };
			}
		}
	} catch (e) {
		console.error("[contact] failed to parse body", e);
		return NextResponse.json(
			{ ok: false, error: "Failed to parse request body" },
			{ status: 400 },
		);
	}

	const payload = normalisePayload(raw);
	const receivedAt = new Date().toISOString();

	const errors: string[] = [];
	if (!payload.name) errors.push("name is required");
	if (!payload.email) errors.push("email is required");
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
		errors.push("email is not valid");
	if (!payload.message) errors.push("message is required");

	if (errors.length > 0) {
		console.warn("[contact] validation failed", { errors, payload });
		return NextResponse.json({ ok: false, errors }, { status: 400 });
	}

	console.log("[contact] submission received", {
		receivedAt,
		pageUrl,
		name: payload.name,
		email: payload.email,
		phone: payload.phone,
		source: payload.source,
		messageLength: payload.message?.length ?? 0,
	});

	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) {
		console.error(
			"[contact] RESEND_API_KEY is not set — email not sent. Set it in Vercel env vars (or .env.local for dev).",
		);
		return NextResponse.json(
			{
				ok: false,
				error:
					"Email service is not configured. Please call the firm directly.",
				receivedAt,
			},
			{ status: 503 },
		);
	}

	const resend = new Resend(apiKey);
	const { text, html } = buildEmailBody(payload, pageUrl);

	const subject = `New contact form submission from ${payload.name}`;

	let emailOk = false;
	let emailId: string | undefined;
	try {
		console.log("[contact] sending", { from: FROM_EMAIL, to: TO_EMAILS, subject });

		const { data, error } = await resend.emails.send({
			from: FROM_EMAIL,
			to: TO_EMAILS,
			replyTo: payload.email,
			subject,
			text,
			html,
		});

		if (error) {
			console.error("[contact] Resend error", error);
			return NextResponse.json(
				{ ok: false, error: "Failed to send email", receivedAt },
				{ status: 502 },
			);
		}

		console.log("[contact] email sent", { id: data?.id, to: TO_EMAILS });
		emailOk = true;
		emailId = data?.id;
	} catch (e) {
		console.error("[contact] Resend exception", e);
		return NextResponse.json(
			{ ok: false, error: "Email service threw an exception", receivedAt },
			{ status: 500 },
		);
	}

	// Persist to Payload after the email send succeeds. If the email failed
	// we return early above, so reaching this point means emailOk === true.
	const persist = await persistSubmission(payload, pageUrl);

	return NextResponse.json({
		ok: emailOk,
		id: emailId,
		receivedAt,
		submissionId: persist.submissionId,
		persisted: persist.ok,
	});
}

export async function GET() {
	return NextResponse.json({
		ok: true,
		hint: "POST a contact submission here.",
	});
}
