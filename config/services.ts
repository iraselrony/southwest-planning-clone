/**
 * The 14 service entries. `slug` drives the URL (/services/<slug>).
 * `name` is the display name (used in nav, cards, page titles).
 * `order` is the display order on the homepage grid (1 = first).
 *
 * The card image, long description, and contact-form behaviour all live
 * in the static HTML mirror for now. When the backend phase lands, these
 * fields move to the `services` Drizzle table.
 *
 * When you duplicate this project for a new client, edit this list to
 * match the new client's service offering. Order can be whatever the
 * client prefers.
 */
export type ServiceConfig = {
	slug: string;
	name: string;
	order: number;
};

export const SERVICES: ServiceConfig[] = [
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

/** All service slugs, in order. Used by KNOWN_PAGES. */
export const SERVICE_SLUGS: string[] = SERVICES.map((s) => s.slug);
