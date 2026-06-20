/**
 * Rich text block editor. Tiptap-based.
 *
 * Stores content as Tiptap JSON (ProseMirror document model).
 * Day 5 wires Tiptap with the StarterKit (paragraph, headings,
 * bold, italic, bullet list, ordered list, blockquote, code, hr).
 * Link + image extensions land in Day 6 polish.
 */
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import type { RichTextBlock } from "../../../../../_lib/blocks";

export function RichTextBlockEditor({
	block,
	onChange,
}: {
	block: RichTextBlock;
	onChange: (b: RichTextBlock) => void;
}) {
	// Convert incoming content to a Tiptap document.
	const initialContent = normalizeContent(block.content);
	const [doc, setDoc] = useState(initialContent);

	const editor = useEditor({
		extensions: [StarterKit],
		content: initialContent,
		editorProps: {
			attributes: {
				class:
					"prose prose-sm max-w-none min-h-[160px] focus:outline-none",
			},
		},
		onUpdate: ({ editor }) => {
			const json = editor.getJSON();
			setDoc(json);
			onChange({ type: "rich-text-block", content: json });
		},
		immediatelyRender: false,
	});

	// Re-sync if the parent passes a different block (rare — only
	// on revert-to-default).
	useEffect(() => {
		if (!editor) return;
		const incoming = normalizeContent(block.content);
		const current = editor.getJSON();
		if (JSON.stringify(incoming) !== JSON.stringify(current)) {
			editor.commands.setContent(incoming);
			setDoc(incoming);
		}
	}, [block.content, editor]);

	if (!editor) {
		return (
			<div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-500">
				Loading editor…
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="rounded-md border border-neutral-300 bg-white p-1">
				<Toolbar editor={editor} />
				<EditorContent editor={editor} />
			</div>
			<details className="text-xs text-neutral-500">
				<summary className="cursor-pointer">View Tiptap JSON</summary>
				<pre className="mt-1 max-h-32 overflow-auto rounded bg-neutral-50 p-2 text-xs">
					{JSON.stringify(doc, null, 2)}
				</pre>
			</details>
		</div>
	);
}

function Toolbar({
	editor,
}: {
	editor: ReturnType<typeof useEditor>;
}) {
	if (!editor) return null;
	const btn = (active: boolean) =>
		`rounded px-2 py-0.5 text-xs ${
			active
				? "bg-neutral-900 text-white"
				: "bg-white text-neutral-700 hover:bg-neutral-100"
		} border border-neutral-300`;
	return (
		<div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 p-1">
			<button
				type="button"
				className={btn(editor.isActive("bold"))}
				onClick={() => editor.chain().focus().toggleBold().run()}
			>
				B
			</button>
			<button
				type="button"
				className={btn(editor.isActive("italic"))}
				onClick={() => editor.chain().focus().toggleItalic().run()}
			>
				I
			</button>
			<button
				type="button"
				className={btn(editor.isActive("heading", { level: 2 }))}
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 2 }).run()
				}
			>
				H2
			</button>
			<button
				type="button"
				className={btn(editor.isActive("heading", { level: 3 }))}
				onClick={() =>
					editor.chain().focus().toggleHeading({ level: 3 }).run()
				}
			>
				H3
			</button>
			<button
				type="button"
				className={btn(editor.isActive("bulletList"))}
				onClick={() => editor.chain().focus().toggleBulletList().run()}
			>
				• List
			</button>
			<button
				type="button"
				className={btn(editor.isActive("orderedList"))}
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
			>
				1. List
			</button>
			<button
				type="button"
				className={btn(editor.isActive("blockquote"))}
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
			>
				❝
			</button>
			<button
				type="button"
				className={btn(false)}
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
			>
				―
			</button>
		</div>
	);
}

function normalizeContent(c: unknown): object {
	if (c == null) return { type: "doc", content: [] };
	if (typeof c === "string") {
		// Treat as HTML. Tiptap accepts HTML on setContent, but for
		// the initial mount we need a doc. Parse with a simple split.
		return {
			type: "doc",
			content: c
				.split(/\n\n+/)
				.filter(Boolean)
				.map((p) => ({
					type: "paragraph",
					content: [{ type: "text", text: p.trim() }],
				})),
		};
	}
	if (typeof c === "object" && (c as { type?: string }).type === "doc") {
		return c;
	}
	return { type: "doc", content: [] };
}
