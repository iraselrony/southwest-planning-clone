import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
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
			{
				protocol: "https",
				hostname: "*.public.blob.vercel-storage.com",
			},
		],
	},
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
	experimental: {
		serverActions: {
			bodySizeLimit: "50mb",
		},
	},
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
