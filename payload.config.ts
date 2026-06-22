import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users } from "./src/collections/Users";
import { Pages } from "./src/collections/Pages";
import { Services } from "./src/collections/Services";
import { SiteSettings } from "./src/globals/SiteSettings";
import { ContactSubmissions } from "./src/collections/ContactSubmissions";
import { Media } from "./src/collections/Media";
import { CaseStudies } from "./src/collections/CaseStudies";
import { Testimonials } from "./src/collections/Testimonials";
import { Posts } from "./src/collections/Posts";
import { PostCategories } from "./src/collections/PostCategories";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	admin: {
		user: Users.slug,
		importMap: {
			baseDir: path.resolve(dirname),
		},
		components: {
			views: {
				dashboard: {
					Component: "/src/admin/Dashboard",
					path: "/",
					meta: {
						title: "Dashboard — South West Planning Admin",
					},
				},
			},
		},
		meta: {
			titleSuffix: " — South West Planning Admin",
			icons: [],
		},
	},
	collections: [
		Users,
		Pages,
		Posts,
		PostCategories,
		Services,
		Media,
		CaseStudies,
		Testimonials,
		ContactSubmissions,
	],
	globals: [SiteSettings],
	editor: lexicalEditor(),
	secret:
		process.env.PAYLOAD_SECRET ||
		"INSECURE-DEV-SECRET-DO-NOT-USE-IN-PRODUCTION",
	typescript: {
		outputFile: path.resolve(dirname, "src/payload-types.ts"),
	},
	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URL || "",
		},
		migrationDir: path.resolve(dirname, "src/migrations"),
		push: false,
	}),
	// Vercel Blob storage plugin is deferred to v2. As of payload 3.85.1,
	// the client upload handler transitively imports payload's full server
	// bundle (pino, undici, get-tsconfig, etc.) which breaks the client
	// build with `node:` scheme errors. Until the plugin is fixed upstream
	// or we write a custom upload handler, the Media collection uses
	// `staticDir: "media"` for local-disk uploads (works in dev; not
	// persistent on Vercel serverless). The asset-migration script
	// (`scripts/migrate-assets-to-blob.mjs`) uses the Vercel Blob SDK
	// directly to bulk-upload the mirrored /public files.
	sharp,
	cors: ["http://localhost:3000"],
	csrf: ["http://localhost:3000"],
	upload: {
		limits: {
			fileSize: 50 * 1024 * 1024, // 50 MB
		},
	},
});
