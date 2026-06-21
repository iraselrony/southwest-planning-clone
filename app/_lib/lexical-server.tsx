/**
 * Server-side Lexical → HTML renderer.
 *
 * We don't need full Lexical support for v1 — the block editor will
 * mostly be used for the service page `longDescription` field and the
 * per-page `richText` block. Both produce the same small subset of
 * nodes: paragraph, heading (h1-h6), text, linebreak, link, list, listitem.
 *
 * The implementation walks the tree and emits HTML strings. The output
 * is run through DOMPurify in the caller (extractBodyInner) before
 * being inserted, so this renderer can be permissive.
 */
import type { LexicalContent, LexicalNode } from "./blocks";

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
	return s.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}

function renderText(node: LexicalNode): string {
	let out = "";
	const children = node.children || [];
	for (const child of children) {
		out += renderNode(child);
	}
	let text = out;
	const format = (node.format as number) || 0;
	// Lexical format flags: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code
	if (format & 16) text = `<code>${text}</code>`;
	if (format & 8) text = `<u>${text}</u>`;
	if (format & 4) text = `<s>${text}</s>`;
	if (format & 2) text = `<em>${text}</em>`;
	if (format & 1) text = `<strong>${text}</strong>`;
	return text;
}

function renderNode(node: LexicalNode): string {
	if (!node || !node.type) return "";
	switch (node.type) {
		case "root":
			return (node.children || []).map(renderNode).join("");
		case "text":
			return escapeHtml((node.text as string) || "");
		case "linebreak":
			return "<br />";
		case "paragraph": {
			const inner = (node.children || []).map(renderText).join("");
			return `<p>${inner}</p>`;
		}
		case "heading": {
			const tag = (node.tag as string) || "h2";
			const inner = (node.children || []).map(renderText).join("");
			return `<${tag}>${inner}</${tag}>`;
		}
		case "list": {
			const tag = node.listType === "number" ? "ol" : "ul";
			const inner = (node.children || []).map(renderNode).join("");
			return `<${tag}>${inner}</${tag}>`;
		}
		case "listitem": {
			const inner = (node.children || []).map(renderNode).join("");
			return `<li>${inner}</li>`;
		}
		case "link": {
			const url = (node.fields?.url as string) || (node.url as string) || "#";
			const inner = (node.children || []).map(renderText).join("");
			return `<a href="${escapeAttr(url)}">${inner}</a>`;
		}
		case "quote": {
			const inner = (node.children || []).map(renderNode).join("");
			return `<blockquote>${inner}</blockquote>`;
		}
		case "upload": {
			const value = node.value as
				| { url?: string; alt?: string }
				| string
				| undefined;
			const url = typeof value === "string" ? value : value?.url || "";
			const alt = typeof value === "string" ? "" : value?.alt || "";
			if (!url) return "";
			return `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" loading="lazy" />`;
		}
		default: {
			// Unknown node type — render its children if any, otherwise skip.
			const inner = (node.children || []).map(renderText).join("");
			return inner;
		}
	}
}

/**
 * Convert a Lexical content tree to HTML. Returns an empty string for
 * null/undefined/empty content so callers can use the result inline.
 */
export function renderLexical(content: LexicalContent): string {
	if (!content) return "";
	if (Array.isArray(content)) {
		return content.map(renderNode).join("");
	}
	if ("root" in content && content.root) {
		return renderNode(content.root);
	}
	return "";
}
