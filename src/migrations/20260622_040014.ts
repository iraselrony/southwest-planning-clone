import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_blocks_rich_text_max_width" AS ENUM('narrow', 'medium', 'wide', 'full');
  CREATE TYPE "public"."enum_posts_blocks_rich_text_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_posts_blocks_rich_text_background_color" AS ENUM('transparent', 'light-gray', 'dark-gray', 'primary');
  CREATE TYPE "public"."enum_posts_blocks_rich_text_padding" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_posts_blocks_image_and_text_buttons_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_posts_blocks_image_and_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_posts_blocks_image_and_text_image_ratio" AS ENUM('33-67', '50-50', '67-33');
  CREATE TYPE "public"."enum_posts_blocks_image_and_text_vertical_align" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_posts_blocks_cta_buttons_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_posts_blocks_cta_style" AS ENUM('default', 'dark', 'gradient', 'image');
  CREATE TYPE "public"."enum_posts_blocks_cta_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_posts_blocks_gallery_columns" AS ENUM('2', '3', '4', 'masonry');
  CREATE TYPE "public"."enum_posts_blocks_gallery_aspect_ratio" AS ENUM('square', 'landscape', 'portrait', 'original');
  CREATE TYPE "public"."enum_posts_type" AS ENUM('insight', 'news', 'guide', 'planning-alert', 'case-note', 'announcement');
  CREATE TYPE "public"."enum_posts_workflow_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_blocks_rich_text_max_width" AS ENUM('narrow', 'medium', 'wide', 'full');
  CREATE TYPE "public"."enum__posts_v_blocks_rich_text_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__posts_v_blocks_rich_text_background_color" AS ENUM('transparent', 'light-gray', 'dark-gray', 'primary');
  CREATE TYPE "public"."enum__posts_v_blocks_rich_text_padding" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__posts_v_blocks_image_and_text_buttons_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum__posts_v_blocks_image_and_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__posts_v_blocks_image_and_text_image_ratio" AS ENUM('33-67', '50-50', '67-33');
  CREATE TYPE "public"."enum__posts_v_blocks_image_and_text_vertical_align" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__posts_v_blocks_cta_buttons_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum__posts_v_blocks_cta_style" AS ENUM('default', 'dark', 'gradient', 'image');
  CREATE TYPE "public"."enum__posts_v_blocks_cta_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__posts_v_blocks_gallery_columns" AS ENUM('2', '3', '4', 'masonry');
  CREATE TYPE "public"."enum__posts_v_blocks_gallery_aspect_ratio" AS ENUM('square', 'landscape', 'portrait', 'original');
  CREATE TYPE "public"."enum__posts_v_version_type" AS ENUM('insight', 'news', 'guide', 'planning-alert', 'case-note', 'announcement');
  CREATE TYPE "public"."enum__posts_v_version_workflow_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_post_categories_type" AS ENUM('topic', 'service-area', 'location', 'audience');
  CREATE TABLE "posts_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"max_width" "enum_posts_blocks_rich_text_max_width" DEFAULT 'medium',
  	"text_align" "enum_posts_blocks_rich_text_text_align" DEFAULT 'left',
  	"background_color" "enum_posts_blocks_rich_text_background_color" DEFAULT 'transparent',
  	"padding" "enum_posts_blocks_rich_text_padding" DEFAULT 'medium',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_image_and_text_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"url" varchar,
  	"style" "enum_posts_blocks_image_and_text_buttons_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "posts_blocks_image_and_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"image_position" "enum_posts_blocks_image_and_text_image_position" DEFAULT 'right',
  	"image_ratio" "enum_posts_blocks_image_and_text_image_ratio" DEFAULT '50-50',
  	"vertical_align" "enum_posts_blocks_image_and_text_vertical_align" DEFAULT 'center',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"url" varchar,
  	"style" "enum_posts_blocks_cta_buttons_style" DEFAULT 'primary'
  );
  
  CREATE TABLE "posts_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"style" "enum_posts_blocks_cta_style" DEFAULT 'default',
  	"text_align" "enum_posts_blocks_cta_text_align" DEFAULT 'center',
  	"background_image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "posts_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum_posts_blocks_gallery_columns" DEFAULT '3',
  	"aspect_ratio" "enum_posts_blocks_gallery_aspect_ratio" DEFAULT 'square',
  	"enable_lightbox" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"type" "enum_posts_type" DEFAULT 'insight',
  	"workflow_status" "enum_posts_workflow_status" DEFAULT 'draft',
  	"published_at" timestamp(3) with time zone,
  	"reading_time_minutes" numeric,
  	"author_id" integer,
  	"featured_image_id" integer,
  	"hero_image_id" integer,
  	"image_caption" varchar,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"og_image_id" integer,
  	"canonical_url" varchar,
  	"keywords" varchar,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"post_categories_id" integer,
  	"services_id" integer,
  	"case_studies_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "_posts_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"max_width" "enum__posts_v_blocks_rich_text_max_width" DEFAULT 'medium',
  	"text_align" "enum__posts_v_blocks_rich_text_text_align" DEFAULT 'left',
  	"background_color" "enum__posts_v_blocks_rich_text_background_color" DEFAULT 'transparent',
  	"padding" "enum__posts_v_blocks_rich_text_padding" DEFAULT 'medium',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_image_and_text_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"url" varchar,
  	"style" "enum__posts_v_blocks_image_and_text_buttons_style" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_image_and_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"content" jsonb,
  	"image_id" integer,
  	"image_position" "enum__posts_v_blocks_image_and_text_image_position" DEFAULT 'right',
  	"image_ratio" "enum__posts_v_blocks_image_and_text_image_ratio" DEFAULT '50-50',
  	"vertical_align" "enum__posts_v_blocks_image_and_text_vertical_align" DEFAULT 'center',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"url" varchar,
  	"style" "enum__posts_v_blocks_cta_buttons_style" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"style" "enum__posts_v_blocks_cta_style" DEFAULT 'default',
  	"text_align" "enum__posts_v_blocks_cta_text_align" DEFAULT 'center',
  	"background_image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum__posts_v_blocks_gallery_columns" DEFAULT '3',
  	"aspect_ratio" "enum__posts_v_blocks_gallery_aspect_ratio" DEFAULT 'square',
  	"enable_lightbox" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_type" "enum__posts_v_version_type" DEFAULT 'insight',
  	"version_workflow_status" "enum__posts_v_version_workflow_status" DEFAULT 'draft',
  	"version_published_at" timestamp(3) with time zone,
  	"version_reading_time_minutes" numeric,
  	"version_author_id" integer,
  	"version_featured_image_id" integer,
  	"version_hero_image_id" integer,
  	"version_image_caption" varchar,
  	"version_slug" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_og_image_id" integer,
  	"version_canonical_url" varchar,
  	"version_keywords" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"post_categories_id" integer,
  	"services_id" integer,
  	"case_studies_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "post_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_post_categories_type" DEFAULT 'topic',
  	"description" varchar,
  	"featured_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "post_categories_id" integer;
  ALTER TABLE "posts_blocks_rich_text" ADD CONSTRAINT "posts_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_image_and_text_buttons" ADD CONSTRAINT "posts_blocks_image_and_text_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_image_and_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_image_and_text" ADD CONSTRAINT "posts_blocks_image_and_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_image_and_text" ADD CONSTRAINT "posts_blocks_image_and_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_cta_buttons" ADD CONSTRAINT "posts_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_cta" ADD CONSTRAINT "posts_blocks_cta_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_cta" ADD CONSTRAINT "posts_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_gallery_images" ADD CONSTRAINT "posts_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_gallery_images" ADD CONSTRAINT "posts_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_gallery" ADD CONSTRAINT "posts_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_rich_text" ADD CONSTRAINT "_posts_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_image_and_text_buttons" ADD CONSTRAINT "_posts_v_blocks_image_and_text_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_image_and_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_image_and_text" ADD CONSTRAINT "_posts_v_blocks_image_and_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_image_and_text" ADD CONSTRAINT "_posts_v_blocks_image_and_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_cta_buttons" ADD CONSTRAINT "_posts_v_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_cta" ADD CONSTRAINT "_posts_v_blocks_cta_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_cta" ADD CONSTRAINT "_posts_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_gallery_images" ADD CONSTRAINT "_posts_v_blocks_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_gallery_images" ADD CONSTRAINT "_posts_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_gallery" ADD CONSTRAINT "_posts_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_blocks_rich_text_order_idx" ON "posts_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "posts_blocks_rich_text_parent_id_idx" ON "posts_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_rich_text_path_idx" ON "posts_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "posts_blocks_image_and_text_buttons_order_idx" ON "posts_blocks_image_and_text_buttons" USING btree ("_order");
  CREATE INDEX "posts_blocks_image_and_text_buttons_parent_id_idx" ON "posts_blocks_image_and_text_buttons" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_image_and_text_order_idx" ON "posts_blocks_image_and_text" USING btree ("_order");
  CREATE INDEX "posts_blocks_image_and_text_parent_id_idx" ON "posts_blocks_image_and_text" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_image_and_text_path_idx" ON "posts_blocks_image_and_text" USING btree ("_path");
  CREATE INDEX "posts_blocks_image_and_text_image_idx" ON "posts_blocks_image_and_text" USING btree ("image_id");
  CREATE INDEX "posts_blocks_cta_buttons_order_idx" ON "posts_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "posts_blocks_cta_buttons_parent_id_idx" ON "posts_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_cta_order_idx" ON "posts_blocks_cta" USING btree ("_order");
  CREATE INDEX "posts_blocks_cta_parent_id_idx" ON "posts_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_cta_path_idx" ON "posts_blocks_cta" USING btree ("_path");
  CREATE INDEX "posts_blocks_cta_background_image_idx" ON "posts_blocks_cta" USING btree ("background_image_id");
  CREATE INDEX "posts_blocks_gallery_images_order_idx" ON "posts_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "posts_blocks_gallery_images_parent_id_idx" ON "posts_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_gallery_images_image_idx" ON "posts_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "posts_blocks_gallery_order_idx" ON "posts_blocks_gallery" USING btree ("_order");
  CREATE INDEX "posts_blocks_gallery_parent_id_idx" ON "posts_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_gallery_path_idx" ON "posts_blocks_gallery" USING btree ("_path");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_og_image_idx" ON "posts" USING btree ("og_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_post_categories_id_idx" ON "posts_rels" USING btree ("post_categories_id");
  CREATE INDEX "posts_rels_services_id_idx" ON "posts_rels" USING btree ("services_id");
  CREATE INDEX "posts_rels_case_studies_id_idx" ON "posts_rels" USING btree ("case_studies_id");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_blocks_rich_text_order_idx" ON "_posts_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_rich_text_parent_id_idx" ON "_posts_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_rich_text_path_idx" ON "_posts_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_image_and_text_buttons_order_idx" ON "_posts_v_blocks_image_and_text_buttons" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_image_and_text_buttons_parent_id_idx" ON "_posts_v_blocks_image_and_text_buttons" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_image_and_text_order_idx" ON "_posts_v_blocks_image_and_text" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_image_and_text_parent_id_idx" ON "_posts_v_blocks_image_and_text" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_image_and_text_path_idx" ON "_posts_v_blocks_image_and_text" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_image_and_text_image_idx" ON "_posts_v_blocks_image_and_text" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_cta_buttons_order_idx" ON "_posts_v_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_cta_buttons_parent_id_idx" ON "_posts_v_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_cta_order_idx" ON "_posts_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_cta_parent_id_idx" ON "_posts_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_cta_path_idx" ON "_posts_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_cta_background_image_idx" ON "_posts_v_blocks_cta" USING btree ("background_image_id");
  CREATE INDEX "_posts_v_blocks_gallery_images_order_idx" ON "_posts_v_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_gallery_images_parent_id_idx" ON "_posts_v_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_gallery_images_image_idx" ON "_posts_v_blocks_gallery_images" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_gallery_order_idx" ON "_posts_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_gallery_parent_id_idx" ON "_posts_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_gallery_path_idx" ON "_posts_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_posts_v_version_version_featured_image_idx" ON "_posts_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_og_image_idx" ON "_posts_v" USING btree ("version_og_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_post_categories_id_idx" ON "_posts_v_rels" USING btree ("post_categories_id");
  CREATE INDEX "_posts_v_rels_services_id_idx" ON "_posts_v_rels" USING btree ("services_id");
  CREATE INDEX "_posts_v_rels_case_studies_id_idx" ON "_posts_v_rels" USING btree ("case_studies_id");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "post_categories_slug_idx" ON "post_categories" USING btree ("slug");
  CREATE INDEX "post_categories_featured_image_idx" ON "post_categories" USING btree ("featured_image_id");
  CREATE INDEX "post_categories_updated_at_idx" ON "post_categories" USING btree ("updated_at");
  CREATE INDEX "post_categories_created_at_idx" ON "post_categories" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_categories_fk" FOREIGN KEY ("post_categories_id") REFERENCES "public"."post_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_post_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("post_categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_image_and_text_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_image_and_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_image_and_text_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_image_and_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "post_categories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_blocks_rich_text" CASCADE;
  DROP TABLE "posts_blocks_image_and_text_buttons" CASCADE;
  DROP TABLE "posts_blocks_image_and_text" CASCADE;
  DROP TABLE "posts_blocks_cta_buttons" CASCADE;
  DROP TABLE "posts_blocks_cta" CASCADE;
  DROP TABLE "posts_blocks_gallery_images" CASCADE;
  DROP TABLE "posts_blocks_gallery" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_blocks_rich_text" CASCADE;
  DROP TABLE "_posts_v_blocks_image_and_text_buttons" CASCADE;
  DROP TABLE "_posts_v_blocks_image_and_text" CASCADE;
  DROP TABLE "_posts_v_blocks_cta_buttons" CASCADE;
  DROP TABLE "_posts_v_blocks_cta" CASCADE;
  DROP TABLE "_posts_v_blocks_gallery_images" CASCADE;
  DROP TABLE "_posts_v_blocks_gallery" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "post_categories" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_post_categories_fk";
  
  DROP INDEX "payload_locked_documents_rels_posts_id_idx";
  DROP INDEX "payload_locked_documents_rels_post_categories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "post_categories_id";
  DROP TYPE "public"."enum_posts_blocks_rich_text_max_width";
  DROP TYPE "public"."enum_posts_blocks_rich_text_text_align";
  DROP TYPE "public"."enum_posts_blocks_rich_text_background_color";
  DROP TYPE "public"."enum_posts_blocks_rich_text_padding";
  DROP TYPE "public"."enum_posts_blocks_image_and_text_buttons_style";
  DROP TYPE "public"."enum_posts_blocks_image_and_text_image_position";
  DROP TYPE "public"."enum_posts_blocks_image_and_text_image_ratio";
  DROP TYPE "public"."enum_posts_blocks_image_and_text_vertical_align";
  DROP TYPE "public"."enum_posts_blocks_cta_buttons_style";
  DROP TYPE "public"."enum_posts_blocks_cta_style";
  DROP TYPE "public"."enum_posts_blocks_cta_text_align";
  DROP TYPE "public"."enum_posts_blocks_gallery_columns";
  DROP TYPE "public"."enum_posts_blocks_gallery_aspect_ratio";
  DROP TYPE "public"."enum_posts_type";
  DROP TYPE "public"."enum_posts_workflow_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_blocks_rich_text_max_width";
  DROP TYPE "public"."enum__posts_v_blocks_rich_text_text_align";
  DROP TYPE "public"."enum__posts_v_blocks_rich_text_background_color";
  DROP TYPE "public"."enum__posts_v_blocks_rich_text_padding";
  DROP TYPE "public"."enum__posts_v_blocks_image_and_text_buttons_style";
  DROP TYPE "public"."enum__posts_v_blocks_image_and_text_image_position";
  DROP TYPE "public"."enum__posts_v_blocks_image_and_text_image_ratio";
  DROP TYPE "public"."enum__posts_v_blocks_image_and_text_vertical_align";
  DROP TYPE "public"."enum__posts_v_blocks_cta_buttons_style";
  DROP TYPE "public"."enum__posts_v_blocks_cta_style";
  DROP TYPE "public"."enum__posts_v_blocks_cta_text_align";
  DROP TYPE "public"."enum__posts_v_blocks_gallery_columns";
  DROP TYPE "public"."enum__posts_v_blocks_gallery_aspect_ratio";
  DROP TYPE "public"."enum__posts_v_version_type";
  DROP TYPE "public"."enum__posts_v_version_workflow_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_post_categories_type";`)
}
