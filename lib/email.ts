// Global SMTP email sender using nodemailer.
//
// Reads SMTP config from env vars (set in Vercel project settings),
// defaulting to the kriov global SMTP server:
//   SMTP_HOST = mail.kriov.com
//   SMTP_PORT = 465
//   SMTP_SECURE = true   (SMTPS over TLS on 465)
//   SMTP_USER = noreply@kriov.com
//   SMTP_PASS = <password>
//   SMTP_FROM = noreply@kriov.com   From address
//   CONTACT_TO_EMAIL = comma-separated recipient(s)  (fallback in caller)

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export type ContactEmailInput = {
	to: string[];
	from?: string;
	replyTo?: string;
	subject: string;
	text: string;
	html: string;
};

export type SendResult = {
	ok: boolean;
	messageId?: string;
	error?: string;
};

const smtpConfig = {
	host: process.env.SMTP_HOST ?? "mail.kriov.com",
	port: Number(process.env.SMTP_PORT ?? "465"),
	secure: process.env.SMTP_SECURE !== "false", // SMTPS on 465 by default
	auth:
		process.env.SMTP_USER && process.env.SMTP_PASS
			? {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS,
				}
			: undefined,
};

const DEFAULT_FROM = process.env.SMTP_FROM ?? "noreply@kriov.com";

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter {
	if (cachedTransport) return cachedTransport;
	cachedTransport = nodemailer.createTransport(smtpConfig);
	return cachedTransport;
}

/**
 * Send an email through the global SMTP server.
 * Returns { ok: true, messageId } on success, or { ok: false, error } on failure.
 */
export async function sendContactEmail(
	input: ContactEmailInput,
): Promise<SendResult> {
	const host = smtpConfig.host;
	const port = smtpConfig.port;
	if (!smtpConfig.auth) {
		console.error(
			`[email] SMTP_USER/SMTP_PASS not set \u2014 cannot send via ${host}:${port}. Set them in Vercel env vars.`,
		);
		return { ok: false, error: "SMTP credentials are not configured" };
	}

	try {
		const transport = getTransport();
		const info = await transport.sendMail({
			from: input.from ?? DEFAULT_FROM,
			to: input.to,
			replyTo: input.replyTo,
			subject: input.subject,
			text: input.text,
			html: input.html,
		});
		return { ok: true, messageId: info.messageId };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error(`[email] SMTP send failed via ${host}:${port}`, msg);
		return { ok: false, error: msg };
	}
}
