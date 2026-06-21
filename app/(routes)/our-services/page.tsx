// Our-services page. Renders the mirrored HTML with optional
// Payload-backed content injected into marked zones
// (services-hero, services-list).

import { readFile } from "node:fs/promises";
import DOMPurify from "isomorphic-dompurify";
import {
	buildHeadFromHtml,
	extractBodyInner,
	resolveMirrorPath,
} from "../../_lib/page";
import { getPageSeo } from "../../_lib/seo";
import { getPayloadClient } from "../../_lib/payload-client";
import type { Page, Service } from "../../_lib/types";

const SOURCE = resolveMirrorPath("our-services.html");
const PAGE_URL = "/our-services";

export const revalidate = 60;
export const dynamic = "force-dynamic";

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

async function loadAllServices(): Promise<Record<string, Service>> {
	try {
		const payload = await getPayloadClient();
		const result = await payload.find({
			collection: "services",
			limit: 100,
			depth: 1,
			sort: "displayOrder",
		});
		const map: Record<string, Service> = {};
		for (const s of result.docs as Service[]) map[s.slug] = s;
		return map;
	} catch {
		return {};
	}
}

export async function generateMetadata() {
	const seo = await getPageSeo(PAGE_URL);
	try {
		const raw = await readFile(SOURCE, "utf-8");
		return buildHeadFromHtml(raw, PAGE_URL, seo);
	} catch {
		return {
			title: seo.title,
			description: seo.description,
		};
	}
}

export default async function Page() {
	const [page, referencedServices] = await Promise.all([
		loadPage(PAGE_URL),
		loadAllServices(),
	]);

	let body = "";
	try {
		const raw = await readFile(SOURCE, "utf-8");
		body = extractBodyInner(raw, PAGE_URL, {
			page: page ?? undefined,
			referencedServices,
		});
	} catch {
		body = "<p>Failed to load mirrored content.</p>";
	}

	const clean = DOMPurify.sanitize(body, {
		USE_PROFILES: { html: true },
		ADD_ATTR: ["target", "rel", "loading"],
	});
	return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
