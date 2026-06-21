/**
 * Per-page SEO data: title (browser tab + OG) and description (meta + OG).
 *
 * The static map below is the source of truth at build time and the
 * fallback at runtime if the Payload Local API is unreachable. The
 * `getPageSeo(slug)` function is unchanged in signature; it now first
 * tries a Payload lookup, then falls back to the hardcoded map, then to
 * DEFAULT_SEO. Page components do not need to change.
 *
 * Title pattern: `{Service} | South West Planning Consultancy` for service
 * pages, `{Page Name} | South West Planning Consultancy` for the rest.
 * Description pattern: ~150 characters, includes the service area
 * ("South West") and the primary keyword for the page.
 */

import { unstable_cache } from "next/cache";
import { getPayloadClient } from "./payload-client";

export type PageSeo = {
	title: string;
	description: string;
};

const DEFAULT_SEO: PageSeo = {
	title: "South West Planning Consultancy | Planning Consultants Southwest",
	description:
		"South West Planning is an independent practice based in the West Country and providing planning and design consultancy services throughout the area",
};

export const SEO: Record<string, PageSeo> = {
	"/": {
		title: "South West Planning Consultancy | Planning Consultants Southwest",
		description:
			"South West Planning is an independent planning and design consultancy based in the West Country. Expert advice on residential, commercial, agricultural, and leisure development projects across the South West of England.",
	},
	"/contact": {
		title: "Contact | South West Planning Consultancy",
		description:
			"Get in touch with South West Planning Consultancy for expert planning advice. Phone, email, and enquiry form for residential, commercial, rural, and renewable projects across the South West of England.",
	},
	"/our-services": {
		title: "Planning Services | South West Planning Consultancy",
		description:
			"We focus on providing our clients with tailored, deliverable solutions, assisting them to navigate the planning process. View all our planning services in the South West, from housing to renewables.",
	},
	"/privacy-cookie-policy": {
		title: "Privacy & Cookie Policy | South West Planning Consultancy",
		description:
			"Read the privacy and cookie policy for South West Planning Consultancy. How we collect, store, and process your personal data in compliance with UK GDPR and the Data Protection Act 2018.",
	},
	"/services/housing": {
		title: "Housing Development Planning | South West Planning Consultancy",
		description:
			"Expert planning consultancy for housing and residential development projects in the South West of England. From site appraisal and feasibility to planning permission and appeals.",
	},
	"/services/commercial-mixed-use-development": {
		title: "Commercial & Mixed-Use Development Planning | South West Planning",
		description:
			"Planning advice for commercial and mixed-use development schemes across the South West. Site selection, planning applications, and stakeholder engagement for retail, leisure, and office projects.",
	},
	"/services/retail": {
		title: "Retail Planning Consultants | South West Planning",
		description:
			"Retail planning consultancy in the South West of England. Planning applications, change of use, and impact assessments for new retail developments and extensions to existing stores.",
	},
	"/services/leisure-development": {
		title: "Leisure Development Planning | South West Planning",
		description:
			"Leisure development planning across the South West of England. Planning advice for hotels, gyms, tourism attractions, restaurants, and sports facilities from initial concept to permission.",
	},
	"/services/strategic-land": {
		title: "Strategic Land Promotion | South West Planning",
		description:
			"Strategic land promotion and option agreements in the South West of England. Identifying sites, securing local plan allocations, and maximising land value for landowners and promoters.",
	},
	"/services/employment-land": {
		title: "Employment Land Planning | South West Planning",
		description:
			"Planning advice for employment land and business park developments across the South West of England. B-class use applications, BREEAM, and economic impact assessments.",
	},
	"/services/offices-industrial-planning": {
		title: "Office & Industrial Planning | South West Planning",
		description:
			"Office and industrial planning consultancy in the South West. Planning applications for new industrial units, warehouses, office buildings, and changes of use under the E-class.",
	},
	"/services/equestrian-development": {
		title: "Equestrian Development Planning | South West Planning",
		description:
			"Equestrian planning consultancy for stables, livery yards, riding schools, and ménage construction across the South West of England. Including agricultural ties and rural enterprise arguments.",
	},
	"/services/rural-planning-development": {
		title: "Rural Planning & Development | South West Planning",
		description:
			"Rural planning and development advice across the South West of England. Agricultural dwellings, rural workers' housing, farm diversification, and barn conversions.",
	},
	"/services/renewables": {
		title: "Renewables Planning | South West Planning",
		description:
			"Planning advice for renewable energy projects in the South West of England. Solar farms, wind turbines, anaerobic digestion, battery storage, and grid connection applications.",
	},
	"/services/waste-planning": {
		title: "Waste Planning | South West Planning",
		description:
			"Waste management planning consultancy in the South West of England. Planning applications for waste transfer stations, recycling facilities, composting, and energy from waste.",
	},
	"/services/drone-services": {
		title: "Drone Survey & Aerial Photography | South West Planning",
		description:
			"Drone survey and aerial photography services across the South West of England. High-resolution site imagery, topographic surveys, and visualisations to support planning applications.",
	},
	"/services/architectural-services": {
		title: "Architectural Services | South West Planning",
		description:
			"Architectural design, planning, and project management services across the South West of England. Concept design, technical drawings, planning applications, and sustainable design solutions.",
	},
	"/services/school-hospital-development": {
		title: "School & Hospital Development Planning | South West Planning",
		description:
			"Planning advice for school and hospital development projects in the South West of England. New build, extensions, and infrastructure for education and healthcare providers.",
	},
};

/**
 * The complete list of page URLs that have explicit SEO data. Useful for
 * the sitemap and for asserting coverage in tests.
 */
export const KNOWN_PAGE_SLUGS = Object.keys(SEO);

/**
 * Cached Payload lookup for a single page's SEO data. Cached by the page
 * slug with a tag-based revalidation: edits in the admin call
 * `revalidateTag('page:<slug>')` and the next request gets fresh data.
 *
 * Returns null if the DB is unreachable or the row doesn't exist (the
 * caller falls back to the static map).
 */
const fetchSeoFromPayload = unstable_cache(
	async (slug: string): Promise<PageSeo | null> => {
		try {
			const payload = await getPayloadClient();
			const result = await payload.find({
				collection: "pages",
				where: { slug: { equals: slug } },
				limit: 1,
				depth: 0,
			});
			const doc = result.docs[0];
			if (!doc) return null;
			return {
				title: doc.metaTitle || doc.title || "",
				description: doc.metaDescription || "",
			};
		} catch {
			return null;
		}
	},
	["page-seo"],
	{ tags: ["pages"], revalidate: 60 },
);

/**
 * Look up the SEO data for a page URL. Tries Payload first, then the
 * hardcoded map, then DEFAULT_SEO. The hardcoded map exists so that
 * (1) the build still works before migrations are run, and (2) the site
 * is never blank if the DB is down.
 */
export async function getPageSeo(slug: string): Promise<PageSeo> {
	const fromDb = await fetchSeoFromPayload(slug);
	if (fromDb && fromDb.title) {
		return {
			title: fromDb.title,
			description: fromDb.description || DEFAULT_SEO.description,
		};
	}
	const fromStatic = SEO[slug];
	if (fromStatic) return fromStatic;
	return DEFAULT_SEO;
}
