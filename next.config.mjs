/** @type {import('next').NextConfig} */
const nextConfig = {
	// `output: "standalone"` is honoured by Vercel at deploy time and is the
	// right setting for production. Locally, however, it breaks `next start`
	// (the official docs warn "next start does not work with output: standalone
	// configuration") because the standalone build does not bundle files added
	// to public/ after the trace. The deploy path (Vercel) handles public/
	// via its own CDN, so this config is correct in production but unusable
	// for local verification. We omit it here so `npm run build && npm run
	// start` correctly serves the public/ directory.
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.southwestplanningconsultancy.co.uk",
			},
			{
				protocol: "https",
				hostname: "southwestplanningconsultancy.co.uk",
			},
			{
				protocol: "https",
				hostname: "cdn.prod.website-files.com",
			},
		],
	},
	// Safety net for any external links / cached URLs that still use the
	// original Webflow `.html` paths (e.g. /contact.html, /services/housing.html).
	// The page bodies themselves are rewritten to clean URLs at render time in
	// app/_lib/page.ts → rewriteInternalLinks(), but this rewrite ensures that
	// if anyone hits a `.html` URL directly (e.g. from an old backlink or a
	// search-engine cache), they still land on the correct page.
	async rewrites() {
		const KNOWN = [
			"/",
			"/contact",
			"/our-services",
			"/privacy-cookie-policy",
			"/services/architectural-services",
			"/services/commercial-mixed-use-development",
			"/services/drone-services",
			"/services/employment-land",
			"/services/equestrian-development",
			"/services/housing",
			"/services/leisure-development",
			"/services/offices-industrial-planning",
			"/services/renewables",
			"/services/retail",
			"/services/rural-planning-development",
			"/services/school-hospital-development",
			"/services/strategic-land",
			"/services/waste-planning",
		];
		return KNOWN.flatMap((p) => {
			const htmlPath = p === "/" ? "/index.html" : `${p}.html`;
			return [{ source: htmlPath, destination: p }];
		});
	},
};

export default nextConfig;
