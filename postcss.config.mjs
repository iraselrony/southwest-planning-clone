/**
 * PostCSS config. Used by Next.js to process the admin Tailwind CSS
 * file. The public site's globals.css is NOT processed by PostCSS
 * (it's loaded as a plain stylesheet in app/layout.tsx).
 */
const config = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
	},
};

export default config;
