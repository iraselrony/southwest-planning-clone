// Catch-all service page. Replaces the 14 hardcoded
// app/(routes)/services/<slug>/page.tsx folders. Looks up the service
// in Payload by slug; 404s if not found. Falls back to the mirrored
// Webflow HTML for the body so the layout and styling stay identical
// to the pre-Payload frontend.
//
// Service content can be overridden by editing the corresponding
// `pages` body blocks (zones: service-hero, service-body) and the
// service's `longDescription` (Lexical) field in the admin.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { buildHeadFromHtml, extractBodyInner, resolveMirrorPath } from "../../../_lib/page";
import { getPageSeo } from "../../../_lib/seo";
import { getPayloadClient } from "../../../_lib/payload-client";
import type { Page, Service } from "../../../_lib/types";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type Params = { slug: string };

async function loadService(slug: string): Promise<Service | null> {
	try {
		const payload = await getPayloadClient();
		const result = await payload.find({
			collection: "services",
			where: { slug: { equals: slug } },
			limit: 1,
			depth: 2,
		});
		return (result.docs[0] as Service | undefined) ?? null;
	} catch {
		return null;
	}
}

async function loadPage(slug: string): Promise<Page | null> {
	try {
		const payload = await getPayloadClient();
		const result = await payload.find({
			collection: "pages",
			where: { slug: { equals: slug } },
			limit: 1,
			depth: 2,
		});
		return (result.docs[0] as Page | undefined) ?? null;
	} catch {
		return null;
	}
}

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>;
}) {
	const { slug } = await params;
	const pageUrl = `/services/${slug}`;
	const seo = await getPageSeo(pageUrl);

	const sourcePath = resolveMirrorPath(`services/${slug}.html`);
	if (!existsSync(sourcePath)) {
		return {
			title: seo.title,
			description: seo.description,
		};
	}
	try {
		const raw = await readFile(sourcePath, "utf-8");
		return buildHeadFromHtml(raw, pageUrl, seo);
	} catch {
		return {
			title: seo.title,
			description: seo.description,
		};
	}
}

export default async function ServicePage({
	params,
}: {
	params: Promise<Params>;
}) {
	const { slug } = await params;
	const pageUrl = `/services/${slug}`;

	const service = await loadService(slug);
	if (!service) notFound();

	const page = await loadPage(pageUrl);

	// Build a referenced-services map for the serviceCards block (in case
	// the page body uses one). v1 services don't, but this is correct for
	// any future cross-references.
	const referencedServices: Record<string, Service> = {};
	if (service) referencedServices[service.slug] = service;

	const sourcePath = resolveMirrorPath(`services/${slug}.html`);
	let body = "";
	if (existsSync(sourcePath)) {
		try {
			const raw = await readFile(sourcePath, "utf-8");
			body = extractBodyInner(raw, pageUrl, {
				page: page ?? undefined,
				referencedServices,
			});
		} catch {
			body = "";
		}
	}

	// If no mirror HTML (i.e. a service was added via admin without a
	// mirror), render a minimal page shell from the service record.
	if (!body) {
		const card = service.cardImage as { url?: string; alt?: string } | string | undefined;
		const cardUrl = typeof card === "string" ? card : card?.url || "";
		const cardAlt = typeof card === "string" ? service.name : card?.alt || service.name;
		body = `
			<section class="section hero">
				<div class="container">
					<h1>${escapeHtml(service.name)}</h1>
					${service.subtitle ? `<p class="subtitle">${escapeHtml(service.subtitle)}</p>` : ""}
				</div>
			</section>
			${cardUrl ? `<section class="section"><div class="container"><img src="${escapeAttr(cardUrl)}" alt="${escapeAttr(cardAlt)}" /></div></section>` : ""}
			<section class="section">
				<div class="container">
					<p>${escapeHtml(service.description || "")}</p>
				</div>
			</section>
		`;
	}

	const clean = DOMPurify.sanitize(body, {
		USE_PROFILES: { html: true },
		ADD_ATTR: ["target", "rel", "loading"],
	});
	return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
	return s.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}
