/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
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
	// Preserve original URL paths verbatim — assets live at /wp-content/... under /public
	// No rewrites; original paths are real paths.
};

export default nextConfig;
