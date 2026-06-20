/**
 * Service create/edit form (client). Same form for new + edit, just
 * different submit URLs. Long description is a JSON textarea for
 * now (Tiptap wires in on Day 5).
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "../../../_components/image-upload";

export type ServiceForForm = {
	id?: number;
	slug: string;
	name: string;
	subtitle: string | null;
	cardImageUrl: string | null;
	description: string;
	longDescription: Record<string, unknown>;
	contactFormEnabled: boolean;
	displayOrder: number;
};

export function ServiceForm({
	initial,
	mode,
}: {
	initial: ServiceForForm;
	mode: "create" | "edit";
}) {
	const router = useRouter();
	const [name, setName] = useState(initial.name);
	const [slug, setSlug] = useState(initial.slug);
	const [subtitle, setSubtitle] = useState(initial.subtitle ?? "");
	const [cardImageUrl, setCardImageUrl] = useState<string | null>(
		initial.cardImageUrl,
	);
	const [description, setDescription] = useState(initial.description);
	const [longDescriptionText, setLongDescriptionText] = useState(
		JSON.stringify(initial.longDescription ?? {}, null, 2),
	);
	const [longDescriptionError, setLongDescriptionError] = useState<
		string | null
	>(null);
	const [contactFormEnabled, setContactFormEnabled] = useState(
		initial.contactFormEnabled,
	);
	const [savedAt, setSavedAt] = useState<Date | null>(null);
	const [isPending, startTransition] = useTransition();

	async function save() {
		let longDescription: Record<string, unknown>;
		try {
			longDescription = JSON.parse(longDescriptionText);
		} catch (e) {
			setLongDescriptionError(
				`Long description JSON is invalid: ${(e as Error).message}`,
			);
			return;
		}
		setLongDescriptionError(null);

		const payload = {
			slug: slug.trim(),
			name: name.trim(),
			subtitle: subtitle.trim() || null,
			cardImageUrl,
			description: description.trim(),
			longDescription,
			contactFormEnabled,
			displayOrder: initial.displayOrder,
		};

		const url =
			mode === "create"
				? "/api/admin/services"
				: `/api/admin/services/${initial.id}`;
		const method = mode === "create" ? "POST" : "PUT";

		const res = await fetch(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			alert(`Save failed: ${err.error ?? res.statusText ?? "unknown"}`);
			return;
		}
		setSavedAt(new Date());
		if (mode === "create") {
			// After create, go to the edit screen for the new service.
			const data = (await res.json()) as { id: number };
			startTransition(() => router.push(`/admin/services/${data.id}`));
		} else {
			startTransition(() => router.refresh());
		}
	}

	async function handleDelete() {
		if (initial.id == null) return;
		if (!confirm(`Delete "${initial.name}"? This cannot be undone.`)) {
			return;
		}
		const res = await fetch(`/api/admin/services/${initial.id}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			alert(`Delete failed: ${err.error ?? res.statusText ?? "unknown"}`);
			return;
		}
		startTransition(() => router.push("/admin/services"));
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				save();
			}}
			className="space-y-6"
		>
			{/* Identity */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
					Identity
				</h2>
				<div className="mt-4 space-y-4">
					<Field
						label="Name"
						id="name"
						value={name}
						onChange={setName}
						hint="Display name (e.g. 'Housing Development Planning')"
					/>
					<Field
						label="Slug"
						id="slug"
						value={slug}
						onChange={setSlug}
						hint="URL slug, lowercase, hyphenated (e.g. 'housing')"
					/>
					<Field
						label="Subtitle (order number)"
						id="subtitle"
						value={subtitle}
						onChange={setSubtitle}
						hint="Shown on the card (e.g. '01'). Leave blank to use display order."
					/>
				</div>
			</section>

			{/* Card */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
					Card
				</h2>
				<p className="mt-1 text-xs text-neutral-500">
					Shown on the homepage grid and the service detail page hero.
				</p>
				<div className="mt-4 space-y-4">
					<div>
						<label
							htmlFor="cardImageUrl"
							className="block text-sm font-medium text-neutral-700"
						>
							Card image
						</label>
						<ImageUpload value={cardImageUrl} onChange={setCardImageUrl} />
					</div>
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-neutral-700"
						>
							Short description
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
						/>
						<p className="mt-1 text-xs text-neutral-500">
							Shown on the card. Also used for the service page's meta
							description.
						</p>
					</div>
				</div>
			</section>

			{/* Body (Tiptap in Day 5) */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
					Long description
				</h2>
				<p className="mt-1 text-xs text-neutral-500">
					Tiptap JSON document. Day 5 replaces this with a visual rich-text
					editor.
				</p>
				<textarea
					value={longDescriptionText}
					onChange={(e) => setLongDescriptionText(e.target.value)}
					rows={12}
					spellCheck={false}
					className="mt-3 block w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
				/>
				{longDescriptionError && (
					<p className="mt-2 text-sm text-red-600">{longDescriptionError}</p>
				)}
			</section>

			{/* Settings */}
			<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
				<h2 className="text-sm font-semibold tracking-tight text-neutral-900">
					Settings
				</h2>
				<label className="mt-4 flex items-center gap-2 text-sm text-neutral-700">
					<input
						type="checkbox"
						checked={contactFormEnabled}
						onChange={(e) => setContactFormEnabled(e.target.checked)}
						className="rounded border-neutral-300"
					/>
					Show contact form on this service's page
				</label>
			</section>

			{/* Actions */}
			<div className="sticky bottom-0 -mx-6 flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-3">
				<div className="text-sm text-neutral-600">
					{isPending
						? "Saving…"
						: savedAt
							? `Saved at ${savedAt.toLocaleTimeString()}`
							: "Unsaved changes"}
				</div>
				<div className="flex items-center gap-2">
					{mode === "edit" && (
						<button
							type="button"
							onClick={handleDelete}
							disabled={isPending}
							className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
						>
							Delete
						</button>
					)}
					<button
						type="submit"
						disabled={isPending}
						className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
					>
						{isPending ? "Saving…" : mode === "create" ? "Create" : "Save"}
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
}: {
	label: string;
	id: string;
	value: string;
	onChange: (v: string) => void;
	hint?: string;
}) {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-sm font-medium text-neutral-700"
			>
				{label}
			</label>
			<input
				id={id}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
			/>
			{hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
		</div>
	);
}
