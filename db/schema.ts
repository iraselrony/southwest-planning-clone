/**
 * Drizzle schema. Five application tables + three Auth.js tables.
 *
 * Application tables
 * ------------------
 * - pages            — 18 page rows; holds SEO + editable body blocks
 * - services         — 14 service rows; card image + long description + order
 * - site_settings    — single row (id = 1); company info, social, footer
 * - contact_submissions — form submissions from /contact and /services/*
 * - admin_users      — email allowlist (the single admin is iraselrony@gmail.com)
 *
 * Auth.js tables
 * --------------
 * - users            — Auth.js user records (one per admin)
 * - accounts         — OAuth account links (unused for magic-link, but the
 *                      Drizzle adapter expects the table to exist)
 * - sessions         — Auth.js session records (DB strategy, optional in v5)
 * - verification_tokens — magic-link tokens
 *
 * Body / longDescription columns are `jsonb` (Tiptap document JSON, block
 * config JSON). See `app/_lib/blocks.ts` (Day 2) for the block shape
 * definitions.
 */
import {
	pgTable,
	serial,
	text,
	boolean,
	integer,
	jsonb,
	timestamp,
	primaryKey,
} from "drizzle-orm/pg-core";
import { SITE } from "../config/site";
import { SERVICES } from "../config/services";

// ---------- Application tables ----------

export const pages = pgTable("pages", {
	id: serial("id").primaryKey(),
	/** Canonical URL path: "/", "/contact", "/services/housing", etc. */
	slug: text("slug").notNull().unique(),
	/** H1 on the page (also used as the page title for the admin list). */
	title: text("title").notNull(),
	/** Browser tab + OG title. */
	metaTitle: text("meta_title").notNull(),
	/** Meta description + OG description. */
	metaDescription: text("meta_description").notNull(),
	/** Absolute URL to the OG image. Null = use SITE.defaultOgImage. */
	ogImageUrl: text("og_image_url"),
	/** Whether the page appears in the main site nav. */
	showInNav: boolean("show_in_nav").default(true).notNull(),
	/** Editable body blocks. Shape: { [zoneId: string]: BlockContent }. */
	body: jsonb("body").notNull().default({}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
	id: serial("id").primaryKey(),
	/** URL slug: housing, retail, etc. */
	slug: text("slug").notNull().unique(),
	/** Display name: "Housing Development Planning". */
	name: text("name").notNull(),
	/** Order number shown on the card: "01", "02", ..., "14". */
	subtitle: text("subtitle"),
	/** Absolute URL to the card hero image. */
	cardImageUrl: text("card_image_url"),
	/** Short description (~150 chars) for the homepage card + meta desc. */
	description: text("description").notNull(),
	/** Rich body for the service detail page. Tiptap document JSON. */
	longDescription: jsonb("long_description").notNull().default({}),
	/** Whether the contact form is enabled on this service's page. */
	contactFormEnabled: boolean("contact_form_enabled").default(true).notNull(),
	/** Display order on the homepage grid (1 = first). */
	displayOrder: integer("display_order").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
	/** Always 1 — single row. */
	id: serial("id").primaryKey(),
	logoUrl: text("logo_url"),
	companyName: text("company_name").notNull(),
	companyTagline: text("company_tagline"),
	address: text("address"),
	phoneNumbers: jsonb("phone_numbers").notNull().default([]),
	email: text("email"),
	socialLinks: jsonb("social_links").notNull().default({}),
	registrationNumber: text("registration_number"),
	registeredOffice: text("registered_office"),
	footerText: text("footer_text"),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	phone: text("phone"),
	message: text("message").notNull(),
	/** "contact-page" | "service-page:<slug>" | "other:<path>" */
	source: text("source").notNull(),
	/** Optional IP for spam detection. */
	ipAddress: text("ip_address"),
	submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

/**
 * Email allowlist for the admin dashboard. The single admin is added on
 * seed. The /admin/* route checks that the signed-in email is in this
 * table before granting access.
 *
 * `id` matches the Auth.js `users.id` (UUID-shaped by the adapter), but
 * we don't enforce a foreign key here because the users table is
 * managed by Auth.js and may have non-admin rows.
 */
export const adminUsers = pgTable("admin_users", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	name: text("name"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Auth.js v5 tables (Drizzle adapter) ----------

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name"),
	email: text("email").unique(),
	emailVerified: timestamp("email_verified", { mode: "date" }),
	image: text("image"),
});

export const accounts = pgTable(
	"accounts",
	{
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("provider_account_id").notNull(),
		refreshToken: text("refresh_token"),
		accessToken: text("access_token"),
		expiresAt: integer("expires_at"),
		tokenType: text("token_type"),
		scope: text("scope"),
		idToken: text("id_token"),
		sessionState: text("session_state"),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	}),
);

export const sessions = pgTable("sessions", {
	sessionToken: text("session_token").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
	"verification_tokens",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
	}),
);

// ---------- Type exports ----------

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;

// Re-export config so consumers can derive seed data without re-importing.
export { SITE, SERVICES };
