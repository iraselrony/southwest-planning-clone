import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";

import { Users } from "./src/collections/Users";
import { Pages } from "./src/collections/Pages";
import { Services } from "./src/collections/Services";
import { SiteSettings } from "./src/globals/SiteSettings";
import { ContactSubmissions } from "./src/collections/ContactSubmissions";
import { Media } from "./src/collections/Media";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " — South West Planning Admin",
      icons: [],
    },
  },
  collections: [Users, Pages, Services, Media, ContactSubmissions],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "INSECURE-DEV-SECRET-DO-NOT-USE-IN-PRODUCTION",
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
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
  ],
  sharp,
  cors: ["http://localhost:3000"],
  csrf: ["http://localhost:3000"],
  upload: {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB
    },
  },
});
