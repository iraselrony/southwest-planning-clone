/**
 * Page edit form (client). Handles meta fields + body JSON.
 * Auto-saves on blur (no save button needed, but there is one too).
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PageSeo } from "../../../../../config/pages";
import { ImageUpload } from "../../../_components/image-upload";

type PageForEdit = {
	slug: string;
	title: string;
	metaTitle: string;
	metaDescription: string;
	ogImageUrl: string | null;
	showInNav: boolean;
	body: Record<string, unknown>;
};

export function PageEditForm({ page }: { page: PageForEdit }) {
	const router = useRouter();
	const [title, setTitle] = useState(page.title);
	const [metaTitle, setMetaTitle] = useState(page.metaTitle);
	const [metaDescription, setMetaDescription] = useState(
		page.metaDescription,
	);
	const [ogImageUrl, setOgImageUrl] = useState<string | null>(
		page.ogImageUrl,
	);
	const [showInNav, setShowInNav] = useState(page.showInNav);
	const [bodyText, setBodyText] = useState(
		JSON.stringify(page.body, null, 2),
	);
	const [bodyError, setBodyError] = useState<string | null>(null);
	const [savedAt, setSavedAt] = useState<Date | null>(null);
	const [isPending, startTransition] = useTransition();

	async function save() {
		let bodyJson: Record<string, unknown>;
		try {
			bodyJson = JSON.parse(bodyText);
		} catch (e) {
			setBodyError(
				`Body JSON is invalid: ${(e as Error).message}`,
			);
			return;
		}
		setBodyError(null);

		const res = await fetch(
			`/api/admin/pages/${encodeURIComponent(page.slug)}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					metaTitle,
					metaDescription,
					ogImageUrl,
					showInNav,
					body: bodyJson,
				}),
			},
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			alert(
				`Save failed: ${err.error ?? res.statusText ?? "unknown error"}`,
			);
			return;
		}
		setSavedAt(new Date());
		// Refresh the server data so the table view (in /admin/pages)
		// shows the new updated_at timestamp.
		startTransition(() => router.refresh());
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				save();
			}}
			className="space-y-6"
		>
			{/* META */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
					SEO & meta
				</h2>
				<p className="mt-1 text-xs text-neutral-500">
					Title, description, and Open Graph image. Used for
					search results and social previews.
				</p>

				<div className="mt-4 space-y-4">
					<Field
						label="Page title (H1)"
						id="title"
						value={title}
						onChange={setTitle}
					/>
					<Field
						label="Meta title (browser tab + OG title)"
						id="metaTitle"
						value={metaTitle}
						onChange={setMetaTitle}
						hint={`${metaTitle.length} chars`}
					/>
					<Field
						label="Meta description"
						id="metaDescription"
						value={metaDescription}
						onChange={setMetaDescription}
						hint={`${metaDescription.length} chars (target 140–160)`}
						multiline
					/>
					<div>
						<label
							htmlFor="ogImageUrl"
							className="block text-sm font-medium text-neutral-700"
						>
							OG image
						</label>
						<ImageUpload
							value={ogImageUrl}
							onChange={setOgImageUrl}
						/>
					</div>
					<label className="flex items-center gap-2 text-sm text-neutral-700">
						<input
							type="checkbox"
							checked={showInNav}
							onChange={(e) => setShowInNav(e.target.checked)}
							className="rounded border-neutral-300"
						/>
						Show in main nav
					</label>
				</div>
			</section>

			{/* BODY (JSON editor for now; per-zone UI lands in Day 5) */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<div className="flex items-baseline justify-between">
					<div>
						<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
							Body (editable zones)
						</h2>
						<p className="mt-1 text-xs text-neutral-500">
							JSON map of zone ID → block content. Each block
							has a <code>type</code> field. Day 5 will
							replace this with per-zone form editors.
						</p>
					</div>
				</div>
				<textarea
					value={bodyText}
					onChange={(e) => setBodyText(e.target.value)}
					rows={20}
					spellCheck={false}
					className="mt-3 block w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
				/>
				{bodyError && (
					<p className="mt-2 text-sm text-red-600">{bodyError}</p>
				)}
			</section>

			{/* SAVE */}
			<div className="sticky bottom-0 -mx-6 border-t border-neutral-200 bg-white px-6 py-3">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<div className="text-sm text-neutral-600">
						{isPending
							? "Refreshing…"
							: savedAt
								? `Saved at ${savedAt.toLocaleTimeString()}`
								: "Unsaved changes"}
					</div>
					<button
						type="submit"
						disabled={isPending}
						className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
					>
						{isPending ? "Saving…" : "Save"}
					</button>
				</div>
			</div>
		</form>
	);
}

function Field({
	label,
	id,
	value,
	onChange,
	hint,
	multiline,
}: {
	label: string;
	id: string;
	value: string;
	onChange: (v: string) => void;
	hint?: string;
	multiline?: boolean;
}) {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-sm font-medium text-neutral-700"
			>
				{label}
			</label>
			{multiline ? (
				<textarea
					id={id}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					rows={3}
					className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
				/>
			) : (
				<input
					id={id}
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
				/>
			)}
			{hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
		</div>
	);
}
