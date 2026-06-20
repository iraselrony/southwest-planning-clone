// Contact form endpoint. Accepts POST from the two Webflow-style forms
// (one on /contact, one on each /services/* page) and forwards the
// submission as an email via the Resend API.
//
// Field names accept both naming conventions used in the Webflow HTML:
//   Contact page form:    First-name / Last-name / Email / Phone / Message
//   Service page forms:   First-name-2 / Last-name-2 / Email-2 / Phone-2 / Message-2
//
// Required env vars (set in Vercel project settings):
//   RESEND_API_KEY        Resend API key. Required.
//   CONTACT_TO_EMAIL      Comma-separated destination address(es).
//                         Default: SITE.contactEmail (see config/site.ts)
//                         Example: "info@example.com, partner@example.com"
//   CONTACT_FROM_EMAIL    From address on the email. Must be on a Resend-verified
//                         domain once you upgrade / verify. Default: onboarding@resend.dev
//                         (the Resend-provided address, valid for the free tier
//                         until you verify your own domain).
//
// In the Payload phase, this route also inserts into the `contactSubmissions`
// collection via Payload's Local API so the firm has a record of every enquiry.

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { SITE } from "../../../config/site";

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

/**
 * Parse a comma-separated env var into a list of trimmed, non-empty
 * addresses. Resend accepts `to` as either a string or a string[]; we always
 * pass an array so the same code path works for one or many recipients.
 */
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
	SITE.contactEmail,
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

	// Validation
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

	// Persist to console (and, in the Payload phase, to the contactSubmissions
	// collection). The console log is the audit trail during this phase.
	console.log("[contact] submission received", {
		receivedAt,
		pageUrl,
		name: payload.name,
		email: payload.email,
		phone: payload.phone,
		source: payload.source,
		messageLength: payload.message?.length ?? 0,
	});

	// Send via Resend
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) {
		console.error(
			"[contact] RESEND_API_KEY is not set \u2014 email not sent. Set it in Vercel env vars (or .env.local for dev).",
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

	try {
		console.log("[contact] sending", { from: FROM_EMAIL, to: TO_EMAILS, subject });

		// Send to the configured recipient list. Resend accepts a single
		// address or an array; the env var can be a single email or a
		// comma-separated list. (When the firm upgrades to a verified
		// domain, add SITE.contactEmail to the list
		// and the send will go to both addresses.)
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
		return NextResponse.json({ ok: true, id: data?.id, receivedAt });
	} catch (e) {
		console.error("[contact] Resend exception", e);
		return NextResponse.json(
			{ ok: false, error: "Email service threw an exception", receivedAt },
			{ status: 500 },
		);
	}
}

export async function GET() {
	return NextResponse.json({
		ok: true,
		hint: "POST a contact submission here.",
	});
}
