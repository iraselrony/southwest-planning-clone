/**
 * Image upload component. Two paths:
 *   1. "URL mode": user pastes a URL directly (existing fields)
 *   2. "Upload mode": user picks a file → we POST to
 *      /api/admin/upload/sign to get a signed URL → we PUT the file
 *      to that URL → we set the result URL as the field value.
 *
 * Falls back to a local /api/admin/upload/local endpoint if
 * BLOB_READ_WRITE_TOKEN isn't set (local dev).
 */
"use client";

import { useState, useRef } from "react";

export function ImageUpload({
	value,
	onChange,
}: {
	value: string | null;
	onChange: (v: string | null) => void;
}) {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		setError(null);
		try {
			// 1. Get signed upload URL
			const signRes = await fetch("/api/admin/upload/sign", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					filename: file.name,
					contentType: file.type,
				}),
			});
			if (!signRes.ok) {
				throw new Error(
					`sign failed: ${signRes.status} ${signRes.statusText}`,
				);
			}
			const sign = (await signRes.json()) as {
				url: string;
				downloadUrl: string;
			};

			// 2. Upload the file
			const uploadRes = await fetch(sign.url, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			});
			if (!uploadRes.ok) {
				throw new Error(
					`upload failed: ${uploadRes.status} ${uploadRes.statusText}`,
				);
			}

			// 3. Set the result
			onChange(sign.downloadUrl);
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	}

	return (
		<div className="mt-1 space-y-2">
			{value && (
				<div className="overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 p-2">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={value}
						alt="OG image preview"
						className="max-h-32 w-auto rounded"
					/>
					<div className="mt-1 truncate font-mono text-xs text-neutral-500">
						{value}
					</div>
				</div>
			)}
			<div className="flex items-center gap-2">
				<input
					ref={fileRef}
					type="file"
					accept="image/*"
					onChange={handleFile}
					disabled={uploading}
					className="text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-800"
				/>
				{value && (
					<button
						type="button"
						onClick={() => onChange(null)}
						className="text-xs text-neutral-500 underline-offset-2 hover:underline"
					>
						Remove
					</button>
				)}
			</div>
			{uploading && (
				<p className="text-xs text-neutral-500">Uploading…</p>
			)}
			{error && <p className="text-xs text-red-600">{error}</p>}
		</div>
	);
}
