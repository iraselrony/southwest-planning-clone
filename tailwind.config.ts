/**
 * Tailwind config. SCOPED to the /admin/* route group — the public
 * site keeps its Webflow CSS. The content glob targets only files
 * under app/admin/ (and a few root-level files like auth.ts).
 */
import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./app/admin/**/*.{ts,tsx,js,jsx,mdx}",
		"./auth.ts",
		"./middleware.ts",
	],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/forms")],
};

export default config;
