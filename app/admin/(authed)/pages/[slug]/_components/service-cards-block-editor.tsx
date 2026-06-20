/**
 * Service cards block editor. Heading + intro + service slug list.
 *
 * For Day 5, the service slug list is a multi-select. Drag-reorder
 * lands in Day 6 polish.
 */
"use client";

import type { ServiceCardsBlock } from "../../../../../_lib/blocks";

export function ServiceCardsBlockEditor({
	block,
	onChange,
}: {
	block: ServiceCardsBlock;
	onChange: (b: ServiceCardsBlock) => void;
}) {
	return (
		<div className="space-y-3">
			<div>
				<label
					htmlFor="sc-heading"
					className="block text-sm font-medium text-neutral-700"
				>
					Heading
				</label>
				<input
					id="sc-heading"
					type="text"
					value={block.heading}
					onChange={(e) => onChange({ ...block, heading: e.target.value })}
					className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
				/>
			</div>
			<div>
				<label
					htmlFor="sc-intro"
					className="block text-sm font-medium text-neutral-700"
				>
					Intro paragraph
				</label>
				<textarea
					id="sc-intro"
					value={block.intro}
					onChange={(e) => onChange({ ...block, intro: e.target.value })}
					rows={4}
					className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
				/>
			</div>
			<p className="text-xs text-neutral-500">
				The actual service card grid is generated from the services table (in
				display order). The list of slugs here is a future filter; for now leave
				it empty to show all 14 services.
			</p>
		</div>
	);
}
