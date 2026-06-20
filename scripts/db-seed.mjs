/**
 * Seed script. Populates the DB with the initial data from `config/`:
 *   - admin_users: the single admin (from SITE.adminEmail)
 *   - pages: 18 rows with SEO data from config/pages.ts
 *   - services: 14 rows with names/order from config/services.ts
 *   - site_settings: single row (id=1) with company info from config/site.ts
 *
 * Idempotent: re-running won't duplicate rows (uses ON CONFLICT).
 *
 * Usage:
 *   npm run db:seed
 */
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// We import the TS configs via dynamic compile (since this is a .mjs
// file, Node can't import .ts directly). The simplest path: re-declare
// the config here. KEEP IN SYNC with config/site.ts, services.ts, pages.ts.
//
// (Alternative: use `tsx scripts/db-seed.ts` and import normally. We
//  chose .mjs to keep the script dependency-free. The duplication is
//  documented in execution-plan/backend-changelog.md.)

// --- BEGIN mirrored config (keep in sync) ---
const SITE = {
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

const SERVICES = [
	{ slug: "housing", name: "Housing Development Planning", order: 1 },
	{
		slug: "commercial-mixed-use-development",
		name: "Commercial & Mixed-Use Development",
		order: 2,
	},
	{ slug: "retail", name: "Retail Planning Consultants", order: 3 },
	{ slug: "leisure-development", name: "Leisure Development Planning", order: 4 },
	{ slug: "strategic-land", name: "Strategic Land Promotion", order: 5 },
	{ slug: "employment-land", name: "Employment Land Planning", order: 6 },
	{
		slug: "offices-industrial-planning",
		name: "Office & Industrial Planning",
		order: 7,
	},
	{
		slug: "equestrian-development",
		name: "Equestrian Development Planning",
		order: 8,
	},
	{
		slug: "rural-planning-development",
		name: "Rural Planning & Development",
		order: 9,
	},
	{ slug: "renewables", name: "Renewables Planning", order: 10 },
	{ slug: "waste-planning", name: "Waste Planning", order: 11 },
	{
		slug: "school-hospital-development",
		name: "School & Hospital Development",
		order: 12,
	},
	{
		slug: "drone-services",
		name: "Drone Survey & Aerial Photography",
		order: 13,
	},
	{ slug: "architectural-services", name: "Architectural Services", order: 14 },
];

// Page SEO descriptions (mirrored from config/pages.ts).
const PAGE_SEO = {
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
};
// Service SEO descriptions (per-service, hand-crafted)
const SERVICE_DESCRIPTIONS = {
	housing:
		"Expert planning consultancy for housing and residential development projects in the South West of England. From site appraisal and feasibility to planning permission and appeals.",
	"commercial-mixed-use-development":
		"Planning advice for commercial and mixed-use development schemes across the South West. Site selection, planning applications, and stakeholder engagement for retail, leisure, and office projects.",
	retail:
		"Retail planning consultancy in the South West of England. Planning applications, change of use, and impact assessments for new retail developments and extensions to existing stores.",
	"leisure-development":
		"Leisure development planning across the South West of England. Planning advice for hotels, gyms, tourism attractions, restaurants, and sports facilities from initial concept to permission.",
	"strategic-land":
		"Strategic land promotion and option agreements in the South West of England. Identifying sites, securing local plan allocations, and maximising land value for landowners and promoters.",
	"employment-land":
		"Planning advice for employment land and business park developments across the South West of England. B-class use applications, BREEAM, and economic impact assessments.",
	"offices-industrial-planning":
		"Office and industrial planning consultancy in the South West. Planning applications for new industrial units, warehouses, office buildings, and changes of use under the E-class.",
	"equestrian-development":
		"Equestrian planning consultancy for stables, livery yards, riding schools, and ménage construction across the South West of England. Including agricultural ties and rural enterprise arguments.",
	"rural-planning-development":
		"Rural planning and development advice across the South West of England. Agricultural dwellings, rural workers' housing, farm diversification, and barn conversions.",
	renewables:
		"Planning advice for renewable energy projects in the South West of England. Solar farms, wind turbines, anaerobic digestion, battery storage, and grid connection applications.",
	"waste-planning":
		"Waste management planning consultancy in the South West of England. Planning applications for waste transfer stations, recycling facilities, composting, and energy from waste.",
	"drone-services":
		"Drone survey and aerial photography services across the South West of England. High-resolution site imagery, topographic surveys, and visualisations to support planning applications.",
	"architectural-services":
		"Architectural design, planning, and project management services across the South West of England. Concept design, technical drawings, planning applications, and sustainable design solutions.",
	"school-hospital-development":
		"Planning advice for school and hospital development projects in the South West of England. New build, extensions, and infrastructure for education and healthcare providers.",
};
// --- END mirrored config ---

if (!process.env.DATABASE_URL) {
	// Load .env.local manually since this is a Node script, not Next.
	const envLocal = await readFile(
		resolve(projectRoot, ".env.local"),
		"utf-8",
	);
	for (const line of envLocal.split("\n")) {
		const m = line.match(/^([A-Z_]+)\s*=\s*(.+?)\s*$/);
		if (m && !process.env[m[1]]) {
			process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
		}
	}
}

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in .env.local or environment.");
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const log = (msg) => console.log(`  ${msg}`);
const ok = (msg) => console.log(`  ✓ ${msg}`);

try {
	console.log("Seeding database...\n");

	// 1. Admin user
	console.log("1. admin_users");
	await client.query(
		`INSERT INTO admin_users (id, email, name)
		 VALUES (gen_random_uuid()::text, $1, $2)
		 ON CONFLICT (email) DO NOTHING`,
		[SITE.adminEmail, "Rasel Rony"],
	);
	ok(`admin: ${SITE.adminEmail}`);

	// 2. Pages (root pages)
	console.log("\n2. pages (root)");
	for (const [slug, seo] of Object.entries(PAGE_SEO)) {
		await client.query(
			`INSERT INTO pages (slug, title, meta_title, meta_description, show_in_nav, body)
			 VALUES ($1, $2, $3, $4, $5, '{}'::jsonb)
			 ON CONFLICT (slug) DO UPDATE SET
			   title = EXCLUDED.title,
			   meta_title = EXCLUDED.meta_title,
			   meta_description = EXCLUDED.meta_description,
			   show_in_nav = EXCLUDED.show_in_nav,
			   updated_at = now()`,
			[slug, seo.title, seo.title, seo.description, seo.showInNav],
		);
		ok(`${slug}`);
	}

	// 3. Pages (service pages)
	console.log("\n3. pages (services)");
	for (const s of SERVICES) {
		const slug = `/services/${s.slug}`;
		const description = SERVICE_DESCRIPTIONS[s.slug] || "";
		const title = `${s.name} | ${SITE.companyName}`;
		const metaTitle =
			s.slug === "commercial-mixed-use-development" ||
			s.slug === "retail" ||
			s.slug === "leisure-development" ||
			s.slug === "strategic-land" ||
			s.slug === "employment-land" ||
			s.slug === "offices-industrial-planning" ||
			s.slug === "equestrian-development" ||
			s.slug === "rural-planning-development" ||
			s.slug === "renewables" ||
			s.slug === "waste-planning" ||
			s.slug === "drone-services" ||
			s.slug === "architectural-services" ||
			s.slug === "school-hospital-development"
				? `${s.name} | ${SITE.companyShortName}`
				: title;
		await client.query(
			`INSERT INTO pages (slug, title, meta_title, meta_description, show_in_nav, body)
			 VALUES ($1, $2, $3, $4, $5, '{}'::jsonb)
			 ON CONFLICT (slug) DO UPDATE SET
			   title = EXCLUDED.title,
			   meta_title = EXCLUDED.meta_title,
			   meta_description = EXCLUDED.meta_description,
			   show_in_nav = EXCLUDED.show_in_nav,
			   updated_at = now()`,
			[slug, title, metaTitle, description, false],
		);
		ok(`${slug}`);
	}

	// 4. Services
	console.log("\n4. services");
	for (const s of SERVICES) {
		const description = SERVICE_DESCRIPTIONS[s.slug] || "";
		const subtitle = String(s.order).padStart(2, "0");
		await client.query(
			`INSERT INTO services (slug, name, subtitle, description, display_order)
			 VALUES ($1, $2, $3, $4, $5)
			 ON CONFLICT (slug) DO UPDATE SET
			   name = EXCLUDED.name,
			   subtitle = EXCLUDED.subtitle,
			   description = EXCLUDED.description,
			   display_order = EXCLUDED.display_order,
			   updated_at = now()`,
			[s.slug, s.name, subtitle, description, s.order],
		);
		ok(`${s.slug} (${subtitle})`);
	}

	// 5. Site settings (single row, id=1)
	console.log("\n5. site_settings");
	const addressFull = `${SITE.address.company}, ${SITE.address.street}, ${SITE.address.city}, ${SITE.address.county}, ${SITE.address.postcode}, ${SITE.address.country}`;
	await client.query(
		`INSERT INTO site_settings (
			id, logo_url, company_name, company_tagline, address,
			phone_numbers, email, social_links,
			registration_number, registered_office, footer_text
		) VALUES (1, NULL, $1, $2, $3, $4::jsonb, $5, $6::jsonb, $7, $8, $9)
		ON CONFLICT (id) DO UPDATE SET
			company_name = EXCLUDED.company_name,
			company_tagline = EXCLUDED.company_tagline,
			address = EXCLUDED.address,
			phone_numbers = EXCLUDED.phone_numbers,
			email = EXCLUDED.email,
			social_links = EXCLUDED.social_links,
			registration_number = EXCLUDED.registration_number,
			registered_office = EXCLUDED.registered_office,
			footer_text = EXCLUDED.footer_text,
			updated_at = now()`,
		[
			SITE.companyName,
			SITE.companyTagline,
			addressFull,
			JSON.stringify(SITE.phoneNumbers),
			SITE.contactEmail,
			JSON.stringify(SITE.socialLinks),
			SITE.registration.number,
			SITE.registration.registeredOffice,
			`${SITE.companyName} has over 20 years of knowledge, experience and reach within the industry.`,
		],
	);
	ok(`site_settings (id=1)`);

	console.log("\n✅ Seed complete.\n");
} catch (e) {
	console.error("\n❌ Seed failed:", e.message);
	process.exit(1);
} finally {
	await client.end();
}
