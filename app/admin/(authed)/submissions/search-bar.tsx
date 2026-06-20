/**
 * Search + source filter bar. Submits via GET so the URL holds the
 * current state (the CSV export uses the same URL params).
 */
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const SOURCE_OPTIONS: Array<{ value: string; label: string }> = [
	{ value: "", label: "All sources" },
	{ value: "contact-page", label: "/contact" },
	{ value: "service-page", label: "/services/*" },
];

export function SearchBar({
	initialSearch,
	initialSource,
}: {
	initialSearch: string;
	initialSource: string;
}) {
	const router = useRouter();
	const [search, setSearch] = useState(initialSearch);
	const [source, setSource] = useState(initialSource);
	const [isPending, startTransition] = useTransition();

	function apply() {
		const params = new URLSearchParams();
		if (search.trim()) params.set("search", search.trim());
		if (source) params.set("source", source);
		const url = params.toString()
			? `/admin/submissions?${params}`
			: "/admin/submissions";
		startTransition(() => router.push(url));
	}

	function clear() {
		setSearch("");
		setSource("");
		startTransition(() => router.push("/admin/submissions"));
	}

	return (
		<div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
			<div className="flex-1 min-w-[200px]">
				<label
					htmlFor="search"
					className="block text-xs font-medium text-neutral-600"
				>
					Search (name, email, message)
				</label>
				<input
					id="search"
					type="search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							apply();
						}
					}}
					placeholder="e.g. jane@example.com"
					className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
				/>
			</div>
			<div>
				<label
					htmlFor="source"
					className="block text-xs font-medium text-neutral-600"
				>
					Source
				</label>
				<select
					id="source"
					value={source}
					onChange={(e) => setSource(e.target.value)}
					className="mt-1 block rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
				>
					{SOURCE_OPTIONS.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			</div>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={apply}
					disabled={isPending}
					className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
				>
					Apply
				</button>
				{(search || source) && (
					<button
						type="button"
						onClick={clear}
						disabled={isPending}
						className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
					>
						Clear
					</button>
				)}
			</div>
		</div>
	);
}
