/**
 * Local-dev-only upload sink. PUTs the request body to a local file
 * under /tmp/. The "URL" returned is /api/admin/upload/local?path=...
 * which can be GET'd to read the file back. Used when
 * BLOB_READ_WRITE_TOKEN isn't set.
 *
 * In production, the client uploads directly to Vercel Blob using
 * the signed URL from /api/admin/upload/sign.
 */
import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { requireAdminApi } from "../../../../admin/_lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOT = "/tmp/admin-uploads";

export async function PUT(request: Request) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	const url = new URL(request.url);
	const path = url.searchParams.get("path");
	if (!path) {
		return NextResponse.json(
			{ error: "Missing ?path=" },
			{ status: 400 },
		);
	}
	const safePath = path.replace(/\.\./g, "_");
	const fullPath = join(ROOT, safePath);
	await mkdir(dirname(fullPath), { recursive: true });
	const buf = Buffer.from(await request.arrayBuffer());
	await writeFile(fullPath, buf);
	return NextResponse.json({
		ok: true,
		path: safePath,
		bytes: buf.length,
	});
}

export async function GET(request: Request) {
	const auth = await requireAdminApi();
	if (!auth.ok) return auth.response;

	const url = new URL(request.url);
	const path = url.searchParams.get("path");
	if (!path) {
		return NextResponse.json(
			{ error: "Missing ?path=" },
			{ status: 400 },
		);
	}
	const safePath = path.replace(/\.\./g, "_");
	try {
		const data = await readFile(join(ROOT, safePath));
		return new Response(new Uint8Array(data), {
			headers: { "Content-Type": "application/octet-stream" },
		});
	} catch {
		return NextResponse.json(
			{ error: "Not found" },
			{ status: 404 },
		);
	}
}
