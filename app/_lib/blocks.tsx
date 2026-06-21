/**
 * Block renderers: take a Payload block record (from `pages.body[].block`)
 * and emit sanitized HTML for the matching marked zone.
 *
 * Output is intended to be the inner HTML of a `<div data-payload-zone>`,
 * not a full page shell. The surrounding Webflow HTML still controls the
 * page layout and styling; these renderers only fill the marked zone.
 *
 * Sanitization is the caller's responsibility — output is run through
 * DOMPurify before being inserted via `dangerouslySetInnerHTML`.
 *
 * Lexical JSON is rendered to HTML using the official Payload 3 server
 * renderer from `@payloadcms/richtext-lexical`. Service cards read
 * referenced services from the supplied `referencedServices` map
 * (slug → service record) so the renderer can stay synchronous.
 */
import * as React from "react";
import { renderLexical } from "./lexical-server";
import type { Service } from "./types";

export type LexicalNode = {
	type?: string;
	children?: LexicalNode[];
	text?: string;
	tag?: string;
	fields?: Record<string, unknown>;
	[key: string]: unknown;
};

export type LexicalContent =
	| {
			root?: LexicalNode & { children?: LexicalNode[] };
	  }
	| LexicalNode[]
	| null
	| undefined;

export type HeroBlockData = {
	heading?: string;
	subheading?: string;
	image?: { url?: string; alt?: string } | string;
	buttonText?: string;
	buttonUrl?: string;
};

export type RichTextBlockData = {
	content?: LexicalContent;
};

export type ImageAndTextBlockData = {
	image?: { url?: string; alt?: string } | string;
	alt?: string;
	content?: LexicalContent;
	imagePosition?: "left" | "right";
};

export type CtaBlockData = {
	heading?: string;
	subheading?: string;
	buttonText?: string;
	buttonUrl?: string;
};

export type ServiceCardsBlockData = {
	heading?: string;
	subheading?: string;
	serviceSlugs?: string[];
};

export type ZoneBlock =
	| {
			blockType: "hero";
			heading?: string;
			subheading?: string;
			image?: { url?: string; alt?: string } | string;
			buttonText?: string;
			buttonUrl?: string;
	  }
	| { blockType: "richText"; content?: LexicalContent }
	| {
			blockType: "imageAndText";
			image?: { url?: string; alt?: string } | string;
			alt?: string;
			content?: LexicalContent;
			imagePosition?: "left" | "right";
	  }
	| {
			blockType: "cta";
			heading?: string;
			subheading?: string;
			buttonText?: string;
			buttonUrl?: string;
	  }
	| {
			blockType: "serviceCards";
			heading?: string;
			subheading?: string;
			serviceSlugs?: string[];
	  };

function escapeAttr(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function imageUrl(image: { url?: string } | string | undefined): string {
	if (!image) return "";
	if (typeof image === "string") return image;
	return image.url || "";
}

function imageAlt(
	image: { alt?: string } | string | undefined,
	fallback: string,
): string {
	if (typeof image === "object" && image?.alt) return image.alt;
	return fallback;
}

export function renderHeroBlock(b: HeroBlockData): string {
	const url = imageUrl(b.image);
	const alt = imageAlt(b.image, "");
	const heading = b.heading ? `<h1>${escapeHtml(b.heading)}</h1>` : "";
	const sub = b.subheading ? `<p>${escapeHtml(b.subheading)}</p>` : "";
	const cta =
		b.buttonText && b.buttonUrl
			? `<a href="${escapeAttr(b.buttonUrl)}" class="cta-button">${escapeHtml(b.buttonText)}</a>`
			: "";
	const bg = url
		? `<div class="hero-background" style="background-image:url(${escapeAttr(url)})" role="img" aria-label="${escapeAttr(alt)}"></div>`
		: "";
	return `<div class="hero-block">${bg}<div class="hero-content">${heading}${sub}${cta}</div></div>`;
}

export function renderRichTextBlock(b: RichTextBlockData): string {
	const html = renderLexical(b.content);
	return `<div class="rich-text-block">${html}</div>`;
}

export function renderImageAndTextBlock(b: ImageAndTextBlockData): string {
	const url = imageUrl(b.image);
	const alt = b.alt || imageAlt(b.image, "");
	const html = renderLexical(b.content);
	const pos = b.imagePosition === "left" ? "image-left" : "image-right";
	const img = url
		? `<div class="${pos}__image"><img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" loading="lazy" /></div>`
		: "";
	return `<div class="image-and-text-block ${pos}">${img}<div class="${pos}__text">${html}</div></div>`;
}

export function renderCtaBlock(b: CtaBlockData): string {
	const heading = b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : "";
	const sub = b.subheading ? `<p>${escapeHtml(b.subheading)}</p>` : "";
	const cta =
		b.buttonText && b.buttonUrl
			? `<a href="${escapeAttr(b.buttonUrl)}" class="cta-button">${escapeHtml(b.buttonText)}</a>`
			: "";
	return `<div class="cta-block"><div class="cta-block__inner">${heading}${sub}${cta}</div></div>`;
}

export function renderServiceCardsBlock(
	b: ServiceCardsBlockData,
	referenced: Record<string, Service>,
): string {
	const slugs = b.serviceSlugs || [];
	const cards = slugs
		.map((slug) => {
			const s = referenced[slug];
			if (!s) return "";
			const cardImage = s.cardImage as
				| { url?: string; alt?: string }
				| string
				| undefined;
			const img = imageUrl(cardImage);
			const alt = imageAlt(cardImage, s.name);
			const link = `/services/${s.slug}`;
			return `<a class="service-card" href="${escapeAttr(link)}">
				<div class="service-card__image"><img src="${escapeAttr(img)}" alt="${escapeAttr(alt)}" loading="lazy" /></div>
				<div class="service-card__subtitle">${escapeHtml(s.subtitle || "")}</div>
				<div class="service-card__name">${escapeHtml(s.name)}</div>
				<div class="service-card__description">${escapeHtml(s.description || "")}</div>
			</a>`;
		})
		.join("");
	const heading = b.heading ? `<h2>${escapeHtml(b.heading)}</h2>` : "";
	const sub = b.subheading ? `<p>${escapeHtml(b.subheading)}</p>` : "";
	return `<div class="service-cards-block">${heading}${sub}<div class="service-cards-grid">${cards}</div></div>`;
}

/**
 * Dispatch to the correct renderer for a given block. ServiceCardsBlock
 * needs the referenced services map; pass it in `context.referencedServices`.
 */
export function renderBlock(
	block: { blockType?: string; [k: string]: unknown },
	context: { referencedServices?: Record<string, Service> } = {},
): string {
	const referenced = context.referencedServices || {};
	switch (block.blockType) {
		case "hero":
			return renderHeroBlock(block as HeroBlockData);
		case "richText":
			return renderRichTextBlock(block as RichTextBlockData);
		case "imageAndText":
			return renderImageAndTextBlock(block as ImageAndTextBlockData);
		case "cta":
			return renderCtaBlock(block as CtaBlockData);
		case "serviceCards":
			return renderServiceCardsBlock(
				block as ServiceCardsBlockData,
				referenced,
			);
		default:
			return "";
	}
}
