/**
 * Page edit form (client). Handles meta fields + per-zone block
 * editors. Falls back to a JSON textarea for pages with no zone
 * map (or for advanced users who want raw access).
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "../../../_components/image-upload";
import { ZoneEditor } from "./_components/zone-editor";
import type { Zone } from "../../../../_lib/zones";
import type { AnyBlock } from "../../../../_lib/blocks";

type PageForEdit = {
	slug: string;
	title: string;
	metaTitle: string;
	metaDescription: string;
	ogImageUrl: string | null;
	showInNav: boolean;
	body: Record<string, unknown>;
};

export function PageEditForm({
	page,
	zones,
}: {
	page: PageForEdit;
	zones: Zone[];
}) {
	const router = useRouter();
	const [title, setTitle] = useState(page.title);
	const [metaTitle, setMetaTitle] = useState(page.metaTitle);
	const [metaDescription, setMetaDescription] = useState(
		page.metaDescription,
	);
	const [ogImageUrl, setOgImageUrl] = useState<string | null>(page.ogImageUrl);
	const [showInNav, setShowInNav] = useState(page.showInNav);
	const [body, setBody] = useState<Record<string, unknown>>(
		page.body ?? {},
	);
	const [showRawJson, setShowRawJson] = useState(false);
	const [savedAt, setSavedAt] = useState<Date | null>(null);
	const [isPending, startTransition] = useTransition();

	async function save() {
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
					body,
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
		startTransition(() => router.refresh());
	}

	function updateBlock(zoneId: string, block: AnyBlock) {
		setBody((prev) => ({ ...prev, [zoneId]: block }));
	}

	function removeBlock(zoneId: string) {
		setBody((prev) => {
			const next = { ...prev };
			delete next[zoneId];
			return next;
		});
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

			{/* ZONES (per-zone block editors) */}
			{zones.length === 0 ? (
				<section className="rounded-lg border border-neutral-200 bg-white p-5 text-sm text-neutral-600 shadow-sm">
					This page has no editable zones defined. Add some in{" "}
					<code>app/_lib/zones.ts</code>.
				</section>
			) : (
				zones.map((zone) => (
					<ZoneEditor
						key={zone.id}
						zone={zone}
						block={body[zone.id] as AnyBlock | undefined}
						onChange={(b) => updateBlock(zone.id, b)}
						onRemove={() => removeBlock(zone.id)}
					/>
				))
			)}

			{/* RAW JSON (advanced users / power features) */}
			<section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
				<button
					type="button"
					onClick={() => setShowRawJson(!showRawJson)}
					className="block w-full px-5 py-3 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
				>
					{showRawJson ? "▼" : "▶"} Raw JSON (advanced)
				</button>
				{showRawJson && (
					<div className="border-t border-neutral-200 p-5">
						<textarea
							value={JSON.stringify(body, null, 2)}
							onChange={(e) => {
								try {
									setBody(JSON.parse(e.target.value));
								} catch {
									// ignore parse errors while typing
								}
							}}
							rows={12}
							spellCheck={false}
							className="block w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-900"
						/>
					</div>
				)}
			</section>

			{/* SAVE */}
			<div className="sticky bottom-0 -mx-6 border-t border-neutral-200 bg-white px-6 py-3">
				<div className="mx-auto flex max-w-6xl items-center justify-between">
					<div className="text-sm text-neutral-600">
						{isPending
							? "Saving…"
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
