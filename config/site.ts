/**
 * Site-level configuration. The single source of truth for everything
 * site-specific: company name, production domain, contact info, social
 * links, and the admin email allowlist for the future dashboard.
 *
 * When you duplicate this project for a new client, edit this file
 * (plus config/services.ts and config/pages.ts) and run the relevant
 * scripts. The Next.js app picks up the new values on next build.
 *
 * See: execution-plan/duplicate-for-new-client.md
 */
export type SiteConfig = {
	/** Full legal company name. Used in <title>, OG site_name, footer, etc. */
	companyName: string;
	/** Shorter form used in body copy and SEO descriptions. */
	companyShortName: string;
	/** Default tagline / fallback meta description. */
	companyTagline: string;
	/** Production canonical URL. Used for sitemap, OG URLs, canonical tags. */
	productionUrl: string;
	/** Default recipient for the contact form. */
	contactEmail: string;
	address: {
		company: string;
		street: string;
		city: string;
		county: string;
		postcode: string;
		country: string;
	};
	/** Phone numbers, in display order. */
	phoneNumbers: string[];
	socialLinks: {
		instagram?: string;
		twitter?: string;
		linkedin?: string;
		facebook?: string;
	};
	registration: {
		number: string;
		registeredOffice: string;
	};
	/** Path to the default OG image (used when a page has no custom image). */
	defaultOgImage: string;
	/** Email allowlist for the admin dashboard (Auth.js v5). */
	adminEmail: string;
};

export const SITE: SiteConfig = {
	companyName: "South West Planning Consultancy",
	companyShortName: "South West Planning",
	companyTagline:
		"South West Planning is an independent practice based in the West Country and providing planning and design consultancy services throughout the area",
	productionUrl: "https://www.southwestplanningconsultancy.co.uk",
	contactEmail: "info@southwestplanningconsultancy.co.uk",
	address: {
		company: "South West Planning Consultancy Ltd",
		street: "The Generator Hub, The Gallery, Kings Wharf, The Quay",
		city: "Exeter",
		county: "Devon",
		postcode: "EX2 4AN",
		country: "England",
	},
	phoneNumbers: ["01392 984 206", "07779 285 376", "07525 059 569"],
	socialLinks: {
		instagram: "https://www.instagram.com/southwestplanningconsultancy/",
		twitter: "https://twitter.com/planning_swest",
		linkedin: "https://www.linkedin.com/company/southwest-planning-consultancy/",
		facebook: "https://www.facebook.com/swplanningconsultancy",
	},
	registration: {
		number: "13398455",
		registeredOffice:
			"The Generator Hub, The Gallery, Kings Wharf, The Quay, Exeter, Devon, England, EX2 4AN",
	},
	defaultOgImage: "/Southwest-og.jpg",
	adminEmail: "iraselrony@gmail.com",
};
