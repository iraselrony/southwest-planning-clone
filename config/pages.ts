/**
 * Per-page SEO data: title (browser tab + OG) and description (meta + OG).
 *
 * For the backend phase, this module is the single point of replacement.
 * The shape stays the same; the implementation swaps from a static map
 * to a Drizzle Local API lookup against a `pages` table that has these
 * same fields. The page components don't need to change.
 *
 * The original Webflow HTML has only generic placeholders for the 14
 * service pages (e.g. `<title>Southwest Planning Consultancy</title>` and
 * no description on most). This module gives every page a unique,
 * descriptive title and description so each service page ranks for its
 * own keywords.
 *
 * Title pattern: `{Service} | {CompanyName}` for service pages,
 * `{Page Name} | {CompanyName}` for the rest.
 * Description pattern: ~150 characters, includes the primary keyword.
 *
 * When you duplicate this project for a new client, edit the titles and
 * descriptions to match the new client's service offering and geography.
 * Use the same slug keys (`/`, `/contact`, `/services/<slug>`, etc.) so
 * the route generator picks them up automatically.
 */
import { SITE } from "./site";
import { SERVICES } from "./services";

export type PageSeo = {
	title: string;
	description: string;
	/** Whether this page appears in the main site nav. */
	showInNav: boolean;
	/** True for /services/* pages. */
	isService: boolean;
};

export const DEFAULT_SEO: PageSeo = {
	title: `${SITE.companyName} | Planning Consultants Southwest`,
	description: SITE.companyTagline,
	showInNav: false,
	isService: false,
};

export const PAGE_SEO: Record<string, PageSeo> = {
	"/": {
		title: `${SITE.companyName} | Planning Consultants Southwest`,
		description: `${SITE.companyShortName} is an independent planning and design consultancy based in the West Country. Expert advice on residential, commercial, agricultural, and leisure development projects across the South West of England.`,
		showInNav: false,
		isService: false,
	},
	"/contact": {
		title: `Contact | ${SITE.companyName}`,
		description: `Get in touch with ${SITE.companyName} for expert planning advice. Phone, email, and enquiry form for residential, commercial, rural, and renewable projects across the South West of England.`,
		showInNav: true,
		isService: false,
	},
	"/our-services": {
		title: `Planning Services | ${SITE.companyName}`,
		description: `We focus on providing our clients with tailored, deliverable solutions, assisting them to navigate the planning process. View all our planning services in the South West, from housing to renewables.`,
		showInNav: true,
		isService: false,
	},
	"/privacy-cookie-policy": {
		title: `Privacy & Cookie Policy | ${SITE.companyName}`,
		description: `Read the privacy and cookie policy for ${SITE.companyName}. How we collect, store, and process your personal data in compliance with UK GDPR and the Data Protection Act 2018.`,
		showInNav: false,
		isService: false,
	},

	// Service pages — generated from SERVICES
	...Object.fromEntries(
		SERVICES.map((s) => [
			`/services/${s.slug}`,
			{
				...getServiceSeo(s.slug, s.name),
				showInNav: false,
				isService: true,
			} satisfies PageSeo,
		]),
	),
};

/**
 * Per-service SEO. Hand-crafted (not auto-generated) because the
 * descriptions are tuned for the specific search intent of each
 * service. The two-line table keeps them in one place for easy review
 * when you duplicate the project.
 */
function getServiceSeo(
	slug: string,
	name: string,
): Pick<PageSeo, "title" | "description"> {
	const seo: Record<string, { title: string; description: string }> = {
		housing: {
			title: `${name} | ${SITE.companyName}`,
			description: `Expert planning consultancy for housing and residential development projects in the South West of England. From site appraisal and feasibility to planning permission and appeals.`,
		},
		"commercial-mixed-use-development": {
			title: `Commercial & Mixed-Use Development Planning | ${SITE.companyShortName}`,
			description: `Planning advice for commercial and mixed-use development schemes across the South West. Site selection, planning applications, and stakeholder engagement for retail, leisure, and office projects.`,
		},
		retail: {
			title: `Retail Planning Consultants | ${SITE.companyShortName}`,
			description: `Retail planning consultancy in the South West of England. Planning applications, change of use, and impact assessments for new retail developments and extensions to existing stores.`,
		},
		"leisure-development": {
			title: `Leisure Development Planning | ${SITE.companyShortName}`,
			description: `Leisure development planning across the South West of England. Planning advice for hotels, gyms, tourism attractions, restaurants, and sports facilities from initial concept to permission.`,
		},
		"strategic-land": {
			title: `Strategic Land Promotion | ${SITE.companyShortName}`,
			description: `Strategic land promotion and option agreements in the South West of England. Identifying sites, securing local plan allocations, and maximising land value for landowners and promoters.`,
		},
		"employment-land": {
			title: `Employment Land Planning | ${SITE.companyShortName}`,
			description: `Planning advice for employment land and business park developments across the South West of England. B-class use applications, BREEAM, and economic impact assessments.`,
		},
		"offices-industrial-planning": {
			title: `Office & Industrial Planning | ${SITE.companyShortName}`,
			description: `Office and industrial planning consultancy in the South West. Planning applications for new industrial units, warehouses, office buildings, and changes of use under the E-class.`,
		},
		"equestrian-development": {
			title: `Equestrian Development Planning | ${SITE.companyShortName}`,
			description: `Equestrian planning consultancy for stables, livery yards, riding schools, and ménage construction across the South West of England. Including agricultural ties and rural enterprise arguments.`,
		},
		"rural-planning-development": {
			title: `Rural Planning & Development | ${SITE.companyShortName}`,
			description: `Rural planning and development advice across the South West of England. Agricultural dwellings, rural workers' housing, farm diversification, and barn conversions.`,
		},
		renewables: {
			title: `Renewables Planning | ${SITE.companyShortName}`,
			description: `Planning advice for renewable energy projects in the South West of England. Solar farms, wind turbines, anaerobic digestion, battery storage, and grid connection applications.`,
		},
		"waste-planning": {
			title: `Waste Planning | ${SITE.companyShortName}`,
			description: `Waste management planning consultancy in the South West of England. Planning applications for waste transfer stations, recycling facilities, composting, and energy from waste.`,
		},
		"drone-services": {
			title: `Drone Survey & Aerial Photography | ${SITE.companyShortName}`,
			description: `Drone survey and aerial photography services across the South West of England. High-resolution site imagery, topographic surveys, and visualisations to support planning applications.`,
		},
		"architectural-services": {
			title: `Architectural Services | ${SITE.companyShortName}`,
			description: `Architectural design, planning, and project management services across the South West of England. Concept design, technical drawings, planning applications, and sustainable design solutions.`,
		},
		"school-hospital-development": {
			title: `School & Hospital Development Planning | ${SITE.companyShortName}`,
			description: `Planning advice for school and hospital development projects in the South West of England. New build, extensions, and infrastructure for education and healthcare providers.`,
		},
	};
	return seo[slug] ?? { title: `${name} | ${SITE.companyName}`, description: "" };
}

/**
 * Look up the SEO data for a page URL. Returns the default SEO if no
 * specific entry exists, so a new page never silently ends up with a
 * blank `<title>`.
 */
export function getPageSeo(slug: string): PageSeo {
	return PAGE_SEO[slug] ?? DEFAULT_SEO;
}

/** The complete list of page URLs that have explicit SEO data. */
export const KNOWN_PAGE_SLUGS: string[] = Object.keys(PAGE_SEO);
