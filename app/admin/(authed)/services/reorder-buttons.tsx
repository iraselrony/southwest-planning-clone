/**
 * Up/down reorder buttons. Posts the new order to
 * /api/admin/services/reorder and refreshes the server data.
 */
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Row = { id: number; displayOrder: number };

export function ReorderButtons({
	rows,
	currentId,
}: {
	rows: Row[];
	currentId: number;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const idx = rows.findIndex((r) => r.id === currentId);
	if (idx === -1) return null;
	const canUp = idx > 0;
	const canDown = idx < rows.length - 1;

	async function move(direction: "up" | "down") {
		const orderedIds = rows.map((r) => r.id);
		const targetIdx = direction === "up" ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= orderedIds.length) return;
		// Swap
		[orderedIds[idx], orderedIds[targetIdx]] = [
			orderedIds[targetIdx],
			orderedIds[idx],
		];
		const res = await fetch("/api/admin/services/reorder", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ orderedIds }),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			alert(`Reorder failed: ${err.error ?? res.statusText ?? "unknown"}`);
			return;
		}
		startTransition(() => router.refresh());
	}

	return (
		<div className="inline-flex items-center gap-0.5">
			<button
				type="button"
				disabled={!canUp || isPending}
				onClick={() => move("up")}
				title="Move up"
				className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-30"
			>
				↑
			</button>
			<button
				type="button"
				disabled={!canDown || isPending}
				onClick={() => move("down")}
				title="Move down"
				className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-30"
			>
				↓
			</button>
		</div>
	);
}
