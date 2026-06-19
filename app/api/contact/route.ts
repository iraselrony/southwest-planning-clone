// TODO(payload-phase): wire to Payload submissions collection.
// Today this just logs and returns OK so the contact form has a working endpoint.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactPayload = {
	name?: string;
	email?: string;
	phone?: string;
	message?: string;
	[k: string]: unknown;
};

export async function POST(request: Request) {
	let body: ContactPayload = {};
	try {
		const contentType = request.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			body = (await request.json()) as ContactPayload;
		} else if (
			contentType.includes("application/x-www-form-urlencoded") ||
			contentType.includes("multipart/form-data")
		) {
			const form = await request.formData();
			body = Object.fromEntries(form.entries()) as ContactPayload;
		} else {
			const text = await request.text();
			body = { raw: text } as ContactPayload;
		}
	} catch (e) {
		console.error("[contact] failed to parse body", e);
	}

	console.log("[contact] submission received", {
		receivedAt: new Date().toISOString(),
		name: body.name,
		email: body.email,
		phone: body.phone,
		message: body.message,
	});

	return NextResponse.json({ ok: true, receivedAt: new Date().toISOString() });
}

export async function GET() {
	return NextResponse.json({
		ok: true,
		hint: "POST a contact submission here.",
	});
}
