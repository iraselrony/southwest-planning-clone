import {
	type MigrateUpArgs,
	type MigrateDownArgs,
	sql,
} from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
	await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_pages_blocks_hero_buttons_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_hero_background_type" AS ENUM('image', 'video', 'color');
  CREATE TYPE "public"."enum_pages_blocks_hero_overlay_opacity" AS ENUM('none', 'light', 'medium', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_hero_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_hero_height" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_max_width" AS ENUM('narrow', 'medium', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_background_color" AS ENUM('transparent', 'light-gray', 'dark-gray', 'primary');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_padding" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_pages_blocks_image_and_text_buttons_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_image_and_text_image_ratio" AS ENUM('33-67', '50-50', '67-33');
  CREATE TYPE "public"."enum_pages_blocks_image_and_text_vertical_align" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_pages_blocks_cta_buttons_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_style" AS ENUM('default', 'dark', 'gradient', 'image');
  CREATE TYPE "public"."enum_pages_blocks_cta_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_service_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_service_cards_card_style" AS ENUM('default', 'bordered', 'shadow', 'minimal');
  CREATE TYPE "public"."enum_pages_blocks_stats_background_color" AS ENUM('white', 'light-gray', 'dark-gray', 'primary');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_layout" AS ENUM('grid', 'carousel', 'stacked');
  CREATE TYPE "public"."enum_pages_blocks_faq_style" AS ENUM('accordion', 'cards', 'list');
  CREATE TYPE "public"."enum_pages_blocks_gallery_columns" AS ENUM('2', '3', '4', 'masonry');
  CREATE TYPE "public"."enum_pages_blocks_gallery_aspect_ratio" AS ENUM('square', 'landscape', 'portrait', 'original');
  CREATE TYPE "public"."enum_pages_template" AS ENUM('default', 'homepage', 'service', 'contact', 'landing');
  CREATE TYPE "public"."enum_media_tags" AS ENUM('hero', 'card', 'gallery', 'logo', 'icon', 'og', 'document', 'drone', 'site-photo');
  CREATE TYPE "public"."enum_case_studies_project_type" AS ENUM('residential', 'commercial', 'mixed-use', 'industrial', 'agricultural', 'other');
  CREATE TYPE "public"."enum_testimonials_rating" AS ENUM('5', '4', '3');
  CREATE TYPE "public"."enum_contact_submissions_tags" AS ENUM('residential', 'commercial', 'planning-permission', 'appeal', 'consultation', 'quote-request', 'follow-up');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('new', 'read', 'in-progress', 'replied', 'converted', 'closed', 'spam');
  CREATE TYPE "public"."enum_contact_submissions_priority" AS ENUM('low', 'normal', 'high', 'urgent');
  CREATE TYPE "public"."enum_contact_submissions_reply_method" AS ENUM('email', 'phone', 'meeting', 'other');
  CREATE TYPE "public"."enum_contact_submissions_outcome" AS ENUM('quote-sent', 'meeting-booked', 'project-won', 'project-lost', 'not-suitable', 'no-response');
  CREATE TABLE "pages_blocks_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"style" "enum_pages_blocks_hero_buttons_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_image_and_text_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"style" "enum_pages_blocks_image_and_text_buttons_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"style" "enum_pages_blocks_cta_buttons_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_stats_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"icon_id" integer
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background_color" "enum_pages_blocks_stats_background_color" DEFAULT 'light-gray',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"layout" "enum_pages_blocks_testimonials_layout" DEFAULT 'grid',
  	"show_rating" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"style" "enum_pages_blocks_faq_style" DEFAULT 'accordion',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum_pages_blocks_gallery_columns" DEFAULT '3',
  	"aspect_ratio" "enum_pages_blocks_gallery_aspect_ratio" DEFAULT 'square',
  	"enable_lightbox" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "services_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" jsonb NOT NULL
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer,
  	"case_studies_id" integer
  );
  
  CREATE TABLE "media_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_media_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "case_studies_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"featured_image_id" integer NOT NULL,
  	"summary" varchar NOT NULL,
  	"client" varchar NOT NULL,
  	"location" varchar NOT NULL,
  	"year" numeric NOT NULL,
  	"duration" varchar,
  	"service_id" integer NOT NULL,
  	"project_type" "enum_case_studies_project_type" NOT NULL,
  	"challenge" jsonb,
  	"solution" jsonb,
  	"outcome" jsonb,
  	"slug" varchar NOT NULL,
  	"meta_title" varchar NOT NULL,
  	"meta_description" varchar NOT NULL,
  	"og_image_id" integer,
  	"published" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "case_studies_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"author_name" varchar NOT NULL,
  	"author_role" varchar,
  	"author_company" varchar,
  	"author_image_id" integer,
  	"rating" "enum_testimonials_rating" DEFAULT '5',
  	"service_id" integer,
  	"project_id" integer,
  	"published" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_submissions_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_contact_submissions_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "contact_submissions_internal_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar NOT NULL,
  	"author_id" integer,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" varchar NOT NULL,
  	"hours" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_accreditations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "site_settings_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"external" boolean DEFAULT false
  );
  
  ALTER TABLE "pages_body" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_body" CASCADE;
  ALTER TABLE "pages_blocks_hero" DROP CONSTRAINT "pages_blocks_hero_image_id_media_id_fk";
  
  DROP INDEX "pages_blocks_hero_image_idx";
  ALTER TABLE "pages_blocks_rich_text" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "pages_blocks_image_and_text" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "pages_blocks_service_cards" ALTER COLUMN "heading" DROP NOT NULL;
  UPDATE "media" SET "alt" = COALESCE(NULLIF("alt", ''), NULLIF("filename", ''), 'Media asset') WHERE "alt" IS NULL OR "alt" = '';
  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "footer_text" SET DEFAULT '© South West Planning Consultancy Ltd. All rights reserved.';
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'admin' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "avatar_id" integer;
  ALTER TABLE "users" ADD COLUMN "last_login" timestamp(3) with time zone;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "background_type" "enum_pages_blocks_hero_background_type" DEFAULT 'image';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "overlay_opacity" "enum_pages_blocks_hero_overlay_opacity" DEFAULT 'medium';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "background_image_id" integer;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "background_video_id" integer;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "background_color" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "text_align" "enum_pages_blocks_hero_text_align" DEFAULT 'center';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "height" "enum_pages_blocks_hero_height" DEFAULT 'medium';
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "max_width" "enum_pages_blocks_rich_text_max_width" DEFAULT 'medium';
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "text_align" "enum_pages_blocks_rich_text_text_align" DEFAULT 'left';
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "background_color" "enum_pages_blocks_rich_text_background_color" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "padding" "enum_pages_blocks_rich_text_padding" DEFAULT 'medium';
  ALTER TABLE "pages_blocks_image_and_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_image_and_text" ADD COLUMN "image_ratio" "enum_pages_blocks_image_and_text_image_ratio" DEFAULT '50-50';
  ALTER TABLE "pages_blocks_image_and_text" ADD COLUMN "vertical_align" "enum_pages_blocks_image_and_text_vertical_align" DEFAULT 'center';
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "style" "enum_pages_blocks_cta_style" DEFAULT 'default';
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "text_align" "enum_pages_blocks_cta_text_align" DEFAULT 'center';
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "background_image_id" integer;
  ALTER TABLE "pages_blocks_service_cards" ADD COLUMN "columns" "enum_pages_blocks_service_cards_columns" DEFAULT '3';
  ALTER TABLE "pages_blocks_service_cards" ADD COLUMN "card_style" "enum_pages_blocks_service_cards_card_style" DEFAULT 'default';
  ALTER TABLE "pages_blocks_service_cards" ADD COLUMN "show_button" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "pages" ADD COLUMN "keywords" varchar;
  ALTER TABLE "pages" ADD COLUMN "template" "enum_pages_template" DEFAULT 'default';
  ALTER TABLE "pages" ADD COLUMN "nav_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "published" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "pages_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "services" ADD COLUMN "icon_id" integer;
  ALTER TABLE "services" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "services" ADD COLUMN "meta_description" varchar;
  UPDATE "services" SET "meta_title" = COALESCE(NULLIF("meta_title", ''), "name" || ' | South West Planning Consultancy'), "meta_description" = COALESCE(NULLIF("meta_description", ''), "description") WHERE "meta_title" IS NULL OR "meta_title" = '' OR "meta_description" IS NULL OR "meta_description" = '';
  ALTER TABLE "services" ALTER COLUMN "meta_title" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "meta_description" SET NOT NULL;
  ALTER TABLE "services" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "services" ADD COLUMN "keywords" varchar;
  ALTER TABLE "services" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "services" ADD COLUMN "published" boolean DEFAULT true;
  ALTER TABLE "media" ADD COLUMN "credit" varchar;
  ALTER TABLE "media" ADD COLUMN "title" varchar;
  ALTER TABLE "media" ADD COLUMN "description" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filename" varchar;
  ALTER TABLE "contact_submissions" ADD COLUMN "company" varchar;
  ALTER TABLE "contact_submissions" ADD COLUMN "ip_address" varchar;
  ALTER TABLE "contact_submissions" ADD COLUMN "status" "enum_contact_submissions_status" DEFAULT 'new' NOT NULL;
  ALTER TABLE "contact_submissions" ADD COLUMN "priority" "enum_contact_submissions_priority" DEFAULT 'normal';
  ALTER TABLE "contact_submissions" ADD COLUMN "assigned_to_id" integer;
  ALTER TABLE "contact_submissions" ADD COLUMN "replied_at" timestamp(3) with time zone;
  ALTER TABLE "contact_submissions" ADD COLUMN "reply_method" "enum_contact_submissions_reply_method";
  ALTER TABLE "contact_submissions" ADD COLUMN "follow_up_date" timestamp(3) with time zone;
  ALTER TABLE "contact_submissions" ADD COLUMN "outcome" "enum_contact_submissions_outcome";
  ALTER TABLE "contact_submissions" ADD COLUMN "project_value" numeric;
  ALTER TABLE "contact_submissions" ADD COLUMN "converted_to_project_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "site_settings_phone_numbers" ADD COLUMN "label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "logo_dark_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "favicon_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "address_line1" varchar DEFAULT 'The Generator Hub, The Gallery';
  ALTER TABLE "site_settings" ADD COLUMN "address_line2" varchar DEFAULT 'Kings Wharf, The Quay';
  ALTER TABLE "site_settings" ADD COLUMN "address_city" varchar DEFAULT 'Exeter';
  ALTER TABLE "site_settings" ADD COLUMN "address_county" varchar DEFAULT 'Devon';
  ALTER TABLE "site_settings" ADD COLUMN "address_postcode" varchar DEFAULT 'EX2 4AN';
  ALTER TABLE "site_settings" ADD COLUMN "address_country" varchar DEFAULT 'United Kingdom';
  ALTER TABLE "site_settings" ADD COLUMN "map_embed_code" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "social_links_youtube" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "social_share_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "vat_number" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "default_meta_title_suffix" varchar DEFAULT ' | South West Planning';
  ALTER TABLE "site_settings" ADD COLUMN "default_meta_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "google_analytics_id" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "google_search_console_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "robots_txt" varchar DEFAULT 'User-agent: *
  Allow: /
  
  Sitemap: https://southwestplanningconsultancy.co.uk/sitemap.xml';
  ALTER TABLE "site_settings" ADD COLUMN "newsletter_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "newsletter_heading" varchar DEFAULT 'Stay Updated';
  ALTER TABLE "pages_blocks_hero_buttons" ADD CONSTRAINT "pages_blocks_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_and_text_buttons" ADD CONSTRAINT "pages_blocks_image_and_text_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_image_and_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_buttons" ADD CONSTRAINT "pages_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_stats" ADD CONSTRAINT "pages_blocks_stats_stats_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_stats" ADD CONSTRAINT "pages_blocks_stats_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_questions" ADD CONSTRAINT "pages_blocks_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_gallery" ADD CONSTRAINT "services_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_gallery" ADD CONSTRAINT "services_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faq" ADD CONSTRAINT "services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_gallery" ADD CONSTRAINT "case_studies_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_gallery" ADD CONSTRAINT "case_studies_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_author_image_id_media_id_fk" FOREIGN KEY ("author_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_case_studies_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_submissions_tags" ADD CONSTRAINT "contact_submissions_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_submissions_internal_notes" ADD CONSTRAINT "contact_submissions_internal_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_submissions_internal_notes" ADD CONSTRAINT "contact_submissions_internal_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_opening_hours" ADD CONSTRAINT "site_settings_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_accreditations" ADD CONSTRAINT "site_settings_accreditations_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_accreditations" ADD CONSTRAINT "site_settings_accreditations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_links" ADD CONSTRAINT "site_settings_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_buttons_order_idx" ON "pages_blocks_hero_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_buttons_parent_id_idx" ON "pages_blocks_hero_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_and_text_buttons_order_idx" ON "pages_blocks_image_and_text_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_and_text_buttons_parent_id_idx" ON "pages_blocks_image_and_text_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_buttons_order_idx" ON "pages_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_buttons_parent_id_idx" ON "pages_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_stats_order_idx" ON "pages_blocks_stats_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_stats_parent_id_idx" ON "pages_blocks_stats_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_stats_icon_idx" ON "pages_blocks_stats_stats" USING btree ("icon_id");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_questions_order_idx" ON "pages_blocks_faq_questions" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_questions_parent_id_idx" ON "pages_blocks_faq_questions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_images_order_idx" ON "pages_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_images_parent_id_idx" ON "pages_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_images_image_idx" ON "pages_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "services_gallery_order_idx" ON "services_gallery" USING btree ("_order");
  CREATE INDEX "services_gallery_parent_id_idx" ON "services_gallery" USING btree ("_parent_id");
  CREATE INDEX "services_gallery_image_idx" ON "services_gallery" USING btree ("image_id");
  CREATE INDEX "services_faq_order_idx" ON "services_faq" USING btree ("_order");
  CREATE INDEX "services_faq_parent_id_idx" ON "services_faq" USING btree ("_parent_id");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");
  CREATE INDEX "services_rels_case_studies_id_idx" ON "services_rels" USING btree ("case_studies_id");
  CREATE INDEX "media_tags_order_idx" ON "media_tags" USING btree ("order");
  CREATE INDEX "media_tags_parent_idx" ON "media_tags" USING btree ("parent_id");
  CREATE INDEX "case_studies_gallery_order_idx" ON "case_studies_gallery" USING btree ("_order");
  CREATE INDEX "case_studies_gallery_parent_id_idx" ON "case_studies_gallery" USING btree ("_parent_id");
  CREATE INDEX "case_studies_gallery_image_idx" ON "case_studies_gallery" USING btree ("image_id");
  CREATE INDEX "case_studies_featured_image_idx" ON "case_studies" USING btree ("featured_image_id");
  CREATE INDEX "case_studies_service_idx" ON "case_studies" USING btree ("service_id");
  CREATE UNIQUE INDEX "case_studies_slug_idx" ON "case_studies" USING btree ("slug");
  CREATE INDEX "case_studies_og_image_idx" ON "case_studies" USING btree ("og_image_id");
  CREATE INDEX "case_studies_updated_at_idx" ON "case_studies" USING btree ("updated_at");
  CREATE INDEX "case_studies_created_at_idx" ON "case_studies" USING btree ("created_at");
  CREATE INDEX "case_studies_rels_order_idx" ON "case_studies_rels" USING btree ("order");
  CREATE INDEX "case_studies_rels_parent_idx" ON "case_studies_rels" USING btree ("parent_id");
  CREATE INDEX "case_studies_rels_path_idx" ON "case_studies_rels" USING btree ("path");
  CREATE INDEX "case_studies_rels_testimonials_id_idx" ON "case_studies_rels" USING btree ("testimonials_id");
  CREATE INDEX "testimonials_author_image_idx" ON "testimonials" USING btree ("author_image_id");
  CREATE INDEX "testimonials_service_idx" ON "testimonials" USING btree ("service_id");
  CREATE INDEX "testimonials_project_idx" ON "testimonials" USING btree ("project_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "contact_submissions_tags_order_idx" ON "contact_submissions_tags" USING btree ("order");
  CREATE INDEX "contact_submissions_tags_parent_idx" ON "contact_submissions_tags" USING btree ("parent_id");
  CREATE INDEX "contact_submissions_internal_notes_order_idx" ON "contact_submissions_internal_notes" USING btree ("_order");
  CREATE INDEX "contact_submissions_internal_notes_parent_id_idx" ON "contact_submissions_internal_notes" USING btree ("_parent_id");
  CREATE INDEX "contact_submissions_internal_notes_author_idx" ON "contact_submissions_internal_notes" USING btree ("author_id");
  CREATE INDEX "site_settings_opening_hours_order_idx" ON "site_settings_opening_hours" USING btree ("_order");
  CREATE INDEX "site_settings_opening_hours_parent_id_idx" ON "site_settings_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings_accreditations_order_idx" ON "site_settings_accreditations" USING btree ("_order");
  CREATE INDEX "site_settings_accreditations_parent_id_idx" ON "site_settings_accreditations" USING btree ("_parent_id");
  CREATE INDEX "site_settings_accreditations_logo_idx" ON "site_settings_accreditations" USING btree ("logo_id");
  CREATE INDEX "site_settings_footer_links_order_idx" ON "site_settings_footer_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_links_parent_id_idx" ON "site_settings_footer_links" USING btree ("_parent_id");
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_converted_to_project_id_case_studies_id_fk" FOREIGN KEY ("converted_to_project_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_social_share_image_id_media_id_fk" FOREIGN KEY ("social_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "pages_blocks_hero_background_image_idx" ON "pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "pages_blocks_hero_background_video_idx" ON "pages_blocks_hero" USING btree ("background_video_id");
  CREATE INDEX "pages_blocks_cta_background_image_idx" ON "pages_blocks_cta" USING btree ("background_image_id");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "services_icon_idx" ON "services" USING btree ("icon_id");
  CREATE INDEX "services_og_image_idx" ON "services" USING btree ("og_image_id");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "contact_submissions_assigned_to_idx" ON "contact_submissions" USING btree ("assigned_to_id");
  CREATE INDEX "contact_submissions_converted_to_project_idx" ON "contact_submissions" USING btree ("converted_to_project_id");
  CREATE INDEX "payload_locked_documents_rels_case_studies_id_idx" ON "payload_locked_documents_rels" USING btree ("case_studies_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "site_settings_logo_dark_idx" ON "site_settings" USING btree ("logo_dark_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_social_share_image_idx" ON "site_settings" USING btree ("social_share_image_id");
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "image_id";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "button_text";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "button_url";
  ALTER TABLE "pages_blocks_image_and_text" DROP COLUMN "alt";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "button_text";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "button_url";
  ALTER TABLE "site_settings" DROP COLUMN "address";`);
}

export async function down({
	db,
	payload,
	req,
}: MigrateDownArgs): Promise<void> {
	await db.execute(sql`
   CREATE TABLE "pages_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"zone_id" varchar NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_and_text_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_submissions_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_submissions_internal_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_opening_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_accreditations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_footer_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero_buttons" CASCADE;
  DROP TABLE "pages_blocks_image_and_text_buttons" CASCADE;
  DROP TABLE "pages_blocks_cta_buttons" CASCADE;
  DROP TABLE "pages_blocks_stats_stats" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_faq_questions" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_gallery_images" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "services_gallery" CASCADE;
  DROP TABLE "services_faq" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "media_tags" CASCADE;
  DROP TABLE "case_studies_gallery" CASCADE;
  DROP TABLE "case_studies" CASCADE;
  DROP TABLE "case_studies_rels" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "contact_submissions_tags" CASCADE;
  DROP TABLE "contact_submissions_internal_notes" CASCADE;
  DROP TABLE "site_settings_opening_hours" CASCADE;
  DROP TABLE "site_settings_accreditations" CASCADE;
  DROP TABLE "site_settings_footer_links" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_avatar_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_hero" DROP CONSTRAINT "pages_blocks_hero_background_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_hero" DROP CONSTRAINT "pages_blocks_hero_background_video_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_cta" DROP CONSTRAINT "pages_blocks_cta_background_image_id_media_id_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_testimonials_fk";
  
  ALTER TABLE "services" DROP CONSTRAINT "services_icon_id_media_id_fk";
  
  ALTER TABLE "services" DROP CONSTRAINT "services_og_image_id_media_id_fk";
  
  ALTER TABLE "contact_submissions" DROP CONSTRAINT "contact_submissions_assigned_to_id_users_id_fk";
  
  ALTER TABLE "contact_submissions" DROP CONSTRAINT "contact_submissions_converted_to_project_id_case_studies_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_case_studies_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_logo_dark_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_favicon_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_social_share_image_id_media_id_fk";
  
  DROP INDEX "users_avatar_idx";
  DROP INDEX "pages_blocks_hero_background_image_idx";
  DROP INDEX "pages_blocks_hero_background_video_idx";
  DROP INDEX "pages_blocks_cta_background_image_idx";
  DROP INDEX "pages_rels_testimonials_id_idx";
  DROP INDEX "services_icon_idx";
  DROP INDEX "services_og_image_idx";
  DROP INDEX "media_sizes_hero_sizes_hero_filename_idx";
  DROP INDEX "contact_submissions_assigned_to_idx";
  DROP INDEX "contact_submissions_converted_to_project_idx";
  DROP INDEX "payload_locked_documents_rels_case_studies_id_idx";
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  DROP INDEX "site_settings_logo_dark_idx";
  DROP INDEX "site_settings_favicon_idx";
  DROP INDEX "site_settings_social_share_image_idx";
  ALTER TABLE "pages_blocks_rich_text" ALTER COLUMN "content" DROP NOT NULL;
  ALTER TABLE "pages_blocks_image_and_text" ALTER COLUMN "content" DROP NOT NULL;
  ALTER TABLE "pages_blocks_service_cards" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "footer_text" SET DEFAULT '© South West Planning Consultancy Ltd. Registered in England and Wales.';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "image_id" integer;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "button_text" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "button_url" varchar;
  ALTER TABLE "pages_blocks_image_and_text" ADD COLUMN "alt" varchar NOT NULL;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "button_text" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "button_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "address" varchar DEFAULT 'The Generator Hub, The Gallery, Kings Wharf, The Quay, Exeter, Devon, EX2 4AN';
  ALTER TABLE "pages_body" ADD CONSTRAINT "pages_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_body_order_idx" ON "pages_body" USING btree ("_order");
  CREATE INDEX "pages_body_parent_id_idx" ON "pages_body" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_image_idx" ON "pages_blocks_hero" USING btree ("image_id");
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "avatar_id";
  ALTER TABLE "users" DROP COLUMN "last_login";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "background_type";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "overlay_opacity";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "background_image_id";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "background_video_id";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "background_color";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "text_align";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "height";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "max_width";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "text_align";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "background_color";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "padding";
  ALTER TABLE "pages_blocks_image_and_text" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_image_and_text" DROP COLUMN "image_ratio";
  ALTER TABLE "pages_blocks_image_and_text" DROP COLUMN "vertical_align";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "style";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "text_align";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "background_image_id";
  ALTER TABLE "pages_blocks_service_cards" DROP COLUMN "columns";
  ALTER TABLE "pages_blocks_service_cards" DROP COLUMN "card_style";
  ALTER TABLE "pages_blocks_service_cards" DROP COLUMN "show_button";
  ALTER TABLE "pages" DROP COLUMN "subtitle";
  ALTER TABLE "pages" DROP COLUMN "keywords";
  ALTER TABLE "pages" DROP COLUMN "template";
  ALTER TABLE "pages" DROP COLUMN "nav_label";
  ALTER TABLE "pages" DROP COLUMN "published";
  ALTER TABLE "pages" DROP COLUMN "featured";
  ALTER TABLE "pages_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "services" DROP COLUMN "icon_id";
  ALTER TABLE "services" DROP COLUMN "meta_title";
  ALTER TABLE "services" DROP COLUMN "meta_description";
  ALTER TABLE "services" DROP COLUMN "og_image_id";
  ALTER TABLE "services" DROP COLUMN "keywords";
  ALTER TABLE "services" DROP COLUMN "featured";
  ALTER TABLE "services" DROP COLUMN "published";
  ALTER TABLE "media" DROP COLUMN "credit";
  ALTER TABLE "media" DROP COLUMN "title";
  ALTER TABLE "media" DROP COLUMN "description";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_url";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_width";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_height";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filename";
  ALTER TABLE "contact_submissions" DROP COLUMN "company";
  ALTER TABLE "contact_submissions" DROP COLUMN "ip_address";
  ALTER TABLE "contact_submissions" DROP COLUMN "status";
  ALTER TABLE "contact_submissions" DROP COLUMN "priority";
  ALTER TABLE "contact_submissions" DROP COLUMN "assigned_to_id";
  ALTER TABLE "contact_submissions" DROP COLUMN "replied_at";
  ALTER TABLE "contact_submissions" DROP COLUMN "reply_method";
  ALTER TABLE "contact_submissions" DROP COLUMN "follow_up_date";
  ALTER TABLE "contact_submissions" DROP COLUMN "outcome";
  ALTER TABLE "contact_submissions" DROP COLUMN "project_value";
  ALTER TABLE "contact_submissions" DROP COLUMN "converted_to_project_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "case_studies_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "site_settings_phone_numbers" DROP COLUMN "label";
  ALTER TABLE "site_settings" DROP COLUMN "logo_dark_id";
  ALTER TABLE "site_settings" DROP COLUMN "favicon_id";
  ALTER TABLE "site_settings" DROP COLUMN "address_line1";
  ALTER TABLE "site_settings" DROP COLUMN "address_line2";
  ALTER TABLE "site_settings" DROP COLUMN "address_city";
  ALTER TABLE "site_settings" DROP COLUMN "address_county";
  ALTER TABLE "site_settings" DROP COLUMN "address_postcode";
  ALTER TABLE "site_settings" DROP COLUMN "address_country";
  ALTER TABLE "site_settings" DROP COLUMN "map_embed_code";
  ALTER TABLE "site_settings" DROP COLUMN "social_links_youtube";
  ALTER TABLE "site_settings" DROP COLUMN "social_share_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "vat_number";
  ALTER TABLE "site_settings" DROP COLUMN "default_meta_title_suffix";
  ALTER TABLE "site_settings" DROP COLUMN "default_meta_description";
  ALTER TABLE "site_settings" DROP COLUMN "google_analytics_id";
  ALTER TABLE "site_settings" DROP COLUMN "google_search_console_verification";
  ALTER TABLE "site_settings" DROP COLUMN "robots_txt";
  ALTER TABLE "site_settings" DROP COLUMN "newsletter_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "newsletter_heading";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_pages_blocks_hero_buttons_style";
  DROP TYPE "public"."enum_pages_blocks_hero_background_type";
  DROP TYPE "public"."enum_pages_blocks_hero_overlay_opacity";
  DROP TYPE "public"."enum_pages_blocks_hero_text_align";
  DROP TYPE "public"."enum_pages_blocks_hero_height";
  DROP TYPE "public"."enum_pages_blocks_rich_text_max_width";
  DROP TYPE "public"."enum_pages_blocks_rich_text_text_align";
  DROP TYPE "public"."enum_pages_blocks_rich_text_background_color";
  DROP TYPE "public"."enum_pages_blocks_rich_text_padding";
  DROP TYPE "public"."enum_pages_blocks_image_and_text_buttons_style";
  DROP TYPE "public"."enum_pages_blocks_image_and_text_image_ratio";
  DROP TYPE "public"."enum_pages_blocks_image_and_text_vertical_align";
  DROP TYPE "public"."enum_pages_blocks_cta_buttons_style";
  DROP TYPE "public"."enum_pages_blocks_cta_style";
  DROP TYPE "public"."enum_pages_blocks_cta_text_align";
  DROP TYPE "public"."enum_pages_blocks_service_cards_columns";
  DROP TYPE "public"."enum_pages_blocks_service_cards_card_style";
  DROP TYPE "public"."enum_pages_blocks_stats_background_color";
  DROP TYPE "public"."enum_pages_blocks_testimonials_layout";
  DROP TYPE "public"."enum_pages_blocks_faq_style";
  DROP TYPE "public"."enum_pages_blocks_gallery_columns";
  DROP TYPE "public"."enum_pages_blocks_gallery_aspect_ratio";
  DROP TYPE "public"."enum_pages_template";
  DROP TYPE "public"."enum_media_tags";
  DROP TYPE "public"."enum_case_studies_project_type";
  DROP TYPE "public"."enum_testimonials_rating";
  DROP TYPE "public"."enum_contact_submissions_tags";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_contact_submissions_priority";
  DROP TYPE "public"."enum_contact_submissions_reply_method";
  DROP TYPE "public"."enum_contact_submissions_outcome";`);
}
