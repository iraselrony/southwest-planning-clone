/**
 * POST /api/admin/upload/sign — return a Vercel Blob signed upload
 * URL. The client PUTs the file directly to Blob (faster than
 * proxying through the Vercel function).
 *
 * Body: { filename: string, contentType?: string }
 * Response: { url: string, downloadUrl: string, pathname: string }
 *
 * For local dev (no BLOB_READ_WRITE_TOKEN set), we fall back to
 * writing the file to /tmp and serving it via a local endpoint.
 */
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdminApi } from "../../../../admin/_lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	let body: { filename?: string; contentType?: string };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}
	const filename = (body.filename ?? "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
	const pathname = `admin-uploads/${Date.now()}-${filename}`;

	if (process.env.BLOB_READ_WRITE_TOKEN) {
		// Production: get a Vercel Blob signed upload URL.
		const blob = await put(pathname, new Blob([]), {
			access: "public",
			addRandomSuffix: false,
			token: process.env.BLOB_READ_WRITE_TOKEN,
			// allowOverwrite is implicit; we use unique timestamps to avoid collisions
		});
		return NextResponse.json({
			url: blob.url,
			downloadUrl: blob.url,
			pathname: blob.pathname,
		});
	}

	// Local dev fallback: return a same-origin upload URL.
	// The client PUTs the file body to /api/admin/upload/local?path=...
	const localUrl = `/api/admin/upload/local?path=${encodeURIComponent(pathname)}`;
	return NextResponse.json({
		url: localUrl,
		downloadUrl: localUrl,
		pathname,
		local: true,
	});
}
