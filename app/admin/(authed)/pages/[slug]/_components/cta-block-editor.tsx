/**
 * CTA block editor. Heading + subheading + button text + button URL.
 */
"use client";

import type { CtaBlock } from "../../../../../_lib/blocks";

export function CtaBlockEditor({
	block,
	onChange,
}: {
	block: CtaBlock;
	onChange: (b: CtaBlock) => void;
}) {
	return (
		<div className="space-y-3">
			<Field
				label="Heading"
				id="cta-heading"
				value={block.heading}
				onChange={(v) => onChange({ ...block, heading: v })}
			/>
			<Field
				label="Subheading"
				id="cta-subheading"
				value={block.subheading}
				onChange={(v) => onChange({ ...block, subheading: v })}
				multiline
			/>
			<div className="grid grid-cols-2 gap-3">
				<Field
					label="Button text"
					id="cta-buttonText"
					value={block.buttonText}
					onChange={(v) => onChange({ ...block, buttonText: v })}
				/>
				<Field
					label="Button URL"
					id="cta-buttonUrl"
					value={block.buttonUrl}
					onChange={(v) => onChange({ ...block, buttonUrl: v })}
				/>
			</div>
		</div>
	);
}

function Field({
	label,
	id,
	value,
	onChange,
	multiline,
}: {
	label: string;
	id: string;
	value: string;
	onChange: (v: string) => void;
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
					rows={2}
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
		</div>
	);
}
