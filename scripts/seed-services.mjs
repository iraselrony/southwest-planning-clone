#!/usr/bin/env node
/**
 * Seed the `services` collection with the 14 known services. Idempotent:
 * skips services that already exist (matched by slug).
 *
 * Order matches the original homepage grid (01–14, top-to-bottom,
 * left-to-right). The mirrored HTML's card section is the source of truth
 * for the order; verify in `execution-plan/raw-mirror/.../index.html`.
 *
 * Usage: npx payload run scripts/seed-services.mjs
 */
import { getPayload } from "payload";
import config from "../payload.config.ts";

const SERVICES = [
	{ slug: "housing",                    name: "Housing Development Planning",          subtitle: "01", displayOrder: 1,  description: "Expert planning consultancy for housing and residential development projects across the South West." },
	{ slug: "retail",                     name: "Retail Planning Consultants",           subtitle: "02", displayOrder: 2,  description: "Retail planning consultancy in the South West — change of use, impact assessments and new stores." },
	{ slug: "leisure-development",        name: "Leisure Development Planning",          subtitle: "03", displayOrder: 3,  description: "Planning advice for hotels, gyms, tourism attractions, restaurants, and sports facilities." },
	{ slug: "strategic-land",             name: "Strategic Land Promotion",              subtitle: "04", displayOrder: 4,  description: "Identifying sites, securing local plan allocations, and maximising land value for landowners and promoters." },
	{ slug: "employment-land",            name: "Employment Land Planning",              subtitle: "05", displayOrder: 5,  description: "B-class use applications, BREEAM, and economic impact assessments for business park developments." },
	{ slug: "offices-industrial-planning",name: "Office & Industrial Planning",           subtitle: "06", displayOrder: 6,  description: "Planning applications for new industrial units, warehouses, office buildings, and changes of use." },
	{ slug: "equestrian-development",     name: "Equestrian Development Planning",        subtitle: "07", displayOrder: 7,  description: "Stables, livery yards, riding schools, and ménage construction including agricultural ties." },
	{ slug: "rural-planning-development", name: "Rural Planning & Development",           subtitle: "08", displayOrder: 8,  description: "Agricultural dwellings, rural workers' housing, farm diversification, and barn conversions." },
	{ slug: "renewables",                 name: "Renewables Planning",                   subtitle: "09", displayOrder: 9,  description: "Solar advice for solar farms, wind turbines, anaerobic digestion, battery storage, and grid connection applications." },
	{ slug: "waste-planning",             name: "Waste Planning",                        subtitle: "10", displayOrder: 10, description: "Waste transfer stations, recycling facilities, composting, and energy from waste." },
	{ slug: "commercial-mixed-use-development", name: "Commercial & Mixed-Use Development", subtitle: "11", displayOrder: 11, description: "Site selection, planning applications, and stakeholder engagement for retail, leisure, and office projects." },
	{ slug: "school-hospital-development",name: "School & Hospital Development Planning", subtitle: "12", displayOrder: 12, description: "New build, extensions, and infrastructure for education and healthcare providers." },
	{ slug: "architectural-services",     name: "Architectural Services",                subtitle: "13", displayOrder: 13, description: "Concept design, technical drawings, planning applications, and sustainable design solutions." },
	{ slug: "drone-services",             name: "Drone Survey & Aerial Photography",     subtitle: "14", displayOrder: 14, description: "High-resolution site imagery, topographic surveys, and visualisations to support planning applications." },
];

async function main() {
	const payload = await getPayload({ config });
	console.log("Seeding services...");

	let created = 0;
	let skipped = 0;
	for (const svc of SERVICES) {
		const existing = await payload.find({
			collection: "services",
			where: { slug: { equals: svc.slug } },
			limit: 1,
		});
		if (existing.docs.length > 0) {
			skipped++;
			continue;
		}

		await payload.create({
			collection: "services",
			data: {
				...svc,
				contactFormEnabled: true,
			},
		});
		created++;
		console.log(`  + ${svc.slug}`);
	}

	console.log(`\nDone. Created ${created}, skipped ${skipped} (already exist).`);
	process.exit(0);
}

main().catch((e) => {
	console.error("seed-services failed:", e);
	process.exit(1);
});
