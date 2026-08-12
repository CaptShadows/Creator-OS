CREATE TYPE "public"."content_status" AS ENUM('idea', 'scripting', 'ready_to_film', 'filmed', 'edited', 'ready_to_post', 'posted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."sample_status" AS ENUM('requested', 'pending', 'approved', 'shipped', 'arrived', 'content_needed', 'completed');--> statement-breakpoint
CREATE TABLE "asset_references" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"content_id" uuid,
	"campaign_id" uuid,
	"deliverable_id" uuid,
	"product_id" uuid,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"external_id" text,
	"path" text,
	"display_name" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"brand_id" uuid,
	"name" text NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"start_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"brief_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "compensations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"type" text NOT NULL,
	"agreed_amount_cents" integer,
	"commission_basis_points" integer,
	"expected_payment_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"concept" text,
	"content_type" text,
	"content_pillar" text,
	"status" "content_status" DEFAULT 'idea' NOT NULL,
	"hook" text,
	"script" text,
	"caption" text,
	"notes" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"planned_film_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"content_id" uuid,
	"title" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"due_at" timestamp with time zone,
	"required_platform" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "integration_states" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"platform_account_id" uuid,
	"integration" text NOT NULL,
	"status" text DEFAULT 'not_configured' NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"last_success_at" timestamp with time zone,
	"last_error" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"compensation_id" uuid,
	"status" text DEFAULT 'expected' NOT NULL,
	"amount_cents" integer NOT NULL,
	"due_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"payment_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "platform_accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"display_name" text NOT NULL,
	"handle" text,
	"external_account_id" text,
	"account_type" text,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "product_platform_listings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"platform_account_id" uuid,
	"platform" text NOT NULL,
	"external_product_id" text,
	"external_url" text,
	"affiliate_url" text,
	"commission_basis_points" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"brand_id" uuid,
	"name" text NOT NULL,
	"category" text,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"platform_account_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"external_post_id" text,
	"external_url" text,
	"platform_caption_override" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "samples" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"source_platform" text,
	"status" "sample_status" DEFAULT 'requested' NOT NULL,
	"requested_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"shipped_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"tracking_reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "asset_references" ADD CONSTRAINT "asset_references_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_references" ADD CONSTRAINT "asset_references_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_references" ADD CONSTRAINT "asset_references_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_references" ADD CONSTRAINT "asset_references_deliverable_id_deliverables_id_fk" FOREIGN KEY ("deliverable_id") REFERENCES "public"."deliverables"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_references" ADD CONSTRAINT "asset_references_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compensations" ADD CONSTRAINT "compensations_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compensations" ADD CONSTRAINT "compensations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_states" ADD CONSTRAINT "integration_states_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_states" ADD CONSTRAINT "integration_states_platform_account_id_platform_accounts_id_fk" FOREIGN KEY ("platform_account_id") REFERENCES "public"."platform_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_compensation_id_compensations_id_fk" FOREIGN KEY ("compensation_id") REFERENCES "public"."compensations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_accounts" ADD CONSTRAINT "platform_accounts_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_platform_listings" ADD CONSTRAINT "product_platform_listings_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_platform_listings" ADD CONSTRAINT "product_platform_listings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_platform_listings" ADD CONSTRAINT "product_platform_listings_platform_account_id_platform_accounts_id_fk" FOREIGN KEY ("platform_account_id") REFERENCES "public"."platform_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_platform_account_id_platform_accounts_id_fk" FOREIGN KEY ("platform_account_id") REFERENCES "public"."platform_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "samples" ADD CONSTRAINT "samples_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "samples" ADD CONSTRAINT "samples_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_references_owner_type_idx" ON "asset_references" USING btree ("owner_user_id","type");--> statement-breakpoint
CREATE INDEX "asset_references_content_idx" ON "asset_references" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "brands_owner_name_idx" ON "brands" USING btree ("owner_user_id","name");--> statement-breakpoint
CREATE INDEX "campaigns_owner_status_due_idx" ON "campaigns" USING btree ("owner_user_id","status","due_at");--> statement-breakpoint
CREATE INDEX "compensations_owner_expected_idx" ON "compensations" USING btree ("owner_user_id","expected_payment_at");--> statement-breakpoint
CREATE INDEX "compensations_campaign_idx" ON "compensations" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "contents_owner_status_idx" ON "contents" USING btree ("owner_user_id","status");--> statement-breakpoint
CREATE INDEX "contents_owner_film_date_idx" ON "contents" USING btree ("owner_user_id","planned_film_at");--> statement-breakpoint
CREATE INDEX "deliverables_owner_status_due_idx" ON "deliverables" USING btree ("owner_user_id","status","due_at");--> statement-breakpoint
CREATE INDEX "deliverables_campaign_idx" ON "deliverables" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_states_owner_integration_account_unique" ON "integration_states" USING btree ("owner_user_id","integration","platform_account_id");--> statement-breakpoint
CREATE INDEX "integration_states_owner_status_idx" ON "integration_states" USING btree ("owner_user_id","status");--> statement-breakpoint
CREATE INDEX "payments_owner_status_due_idx" ON "payments" USING btree ("owner_user_id","status","due_at");--> statement-breakpoint
CREATE INDEX "payments_compensation_idx" ON "payments" USING btree ("compensation_id");--> statement-breakpoint
CREATE INDEX "platform_accounts_owner_platform_idx" ON "platform_accounts" USING btree ("owner_user_id","platform");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_accounts_external_unique" ON "platform_accounts" USING btree ("owner_user_id","platform","external_account_id");--> statement-breakpoint
CREATE INDEX "product_listings_product_idx" ON "product_platform_listings" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_listings_owner_platform_idx" ON "product_platform_listings" USING btree ("owner_user_id","platform");--> statement-breakpoint
CREATE INDEX "products_owner_active_name_idx" ON "products" USING btree ("owner_user_id","active","name");--> statement-breakpoint
CREATE INDEX "publications_owner_status_date_idx" ON "publications" USING btree ("owner_user_id","status","scheduled_at");--> statement-breakpoint
CREATE INDEX "publications_content_idx" ON "publications" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "samples_owner_status_idx" ON "samples" USING btree ("owner_user_id","status");--> statement-breakpoint
CREATE INDEX "samples_product_idx" ON "samples" USING btree ("product_id");