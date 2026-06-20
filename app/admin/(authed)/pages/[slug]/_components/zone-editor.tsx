/**
 * Per-zone block editor. Wraps the type-specific editor with a
 * header that shows the zone id, description, and a "Revert to
 * default" button (which clears the block from the body, falling
 * back to the original Webflow HTML on the public site).
 */
"use client";

import type { Zone } from "../../../../../_lib/zones";
import type {
	AnyBlock,
	HeroBlock,
	CtaBlock,
	ServiceCardsBlock,
	RichTextBlock,
} from "../../../../../_lib/blocks";
import { HeroBlockEditor } from "./hero-block-editor";
import { CtaBlockEditor } from "./cta-block-editor";
import { ServiceCardsBlockEditor } from "./service-cards-block-editor";
import { RichTextBlockEditor } from "./rich-text-block-editor";

export function ZoneEditor({
	zone,
	block,
	onChange,
	onRemove,
}: {
	zone: Zone;
	block: AnyBlock | undefined;
	onChange: (block: AnyBlock) => void;
	onRemove: () => void;
}) {
	// The block to pass to the editor. Falls back to an empty block
	// of the zone's expected type if the body has nothing yet.
	const editorBlock = resolveBlock(zone, block);

	return (
		<section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
			<header className="mb-4 flex items-baseline justify-between">
				<div>
					<h2 className="font-mono text-sm font-semibold tracking-tight text-neutral-900">
						{zone.id}
					</h2>
					<p className="mt-0.5 text-xs text-neutral-500">
						{zone.description}
					</p>
				</div>
				{block && (
					<button
						type="button"
						onClick={() => {
							if (
								confirm(
									`Revert the "${zone.id}" block to the default? The original Webflow content will show on the public site.`,
								)
							) {
								onRemove();
							}
						}}
						className="text-xs text-neutral-500 underline-offset-2 hover:underline"
					>
						Revert to default
					</button>
				)}
			</header>

			{zone.type === "hero-block" ? (
				<HeroBlockEditor
					block={editorBlock as HeroBlock}
					onChange={onChange}
				/>
			) : zone.type === "cta-block" ? (
				<CtaBlockEditor
					block={editorBlock as CtaBlock}
					onChange={onChange}
				/>
			) : zone.type === "service-cards-block" ? (
				<ServiceCardsBlockEditor
					block={editorBlock as ServiceCardsBlock}
					onChange={onChange}
				/>
			) : zone.type === "rich-text-block" ? (
				<RichTextBlockEditor
					block={editorBlock as RichTextBlock}
					onChange={onChange}
				/>
			) : (
				<p className="text-sm text-neutral-500">
					Unknown zone type: {zone.type}
				</p>
			)}
		</section>
	);
}

function resolveBlock(
	zone: Zone,
	block: AnyBlock | undefined,
): AnyBlock {
	if (block) return block;
	switch (zone.type) {
		case "hero-block":
			return { type: "hero-block", heading: "", subheading: "" };
		case "cta-block":
			return {
				type: "cta-block",
				heading: "",
				subheading: "",
				buttonText: "Get in touch",
				buttonUrl: "/contact",
			};
		case "service-cards-block":
			return {
				type: "service-cards-block",
				heading: "",
				intro: "",
				serviceSlugs: [],
			};
		case "rich-text-block":
			return { type: "rich-text-block", content: "" };
	}
}
