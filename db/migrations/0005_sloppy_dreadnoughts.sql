CREATE TABLE "brand_deal_campaigns" (
	"owner_user_id" uuid NOT NULL,
	"brand_deal_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	CONSTRAINT "brand_deal_campaigns_brand_deal_id_campaign_id_pk" PRIMARY KEY("brand_deal_id","campaign_id")
);
--> statement-breakpoint
CREATE TABLE "brand_deal_contents" (
	"owner_user_id" uuid NOT NULL,
	"brand_deal_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	CONSTRAINT "brand_deal_contents_brand_deal_id_content_id_pk" PRIMARY KEY("brand_deal_id","content_id")
);
--> statement-breakpoint
CREATE TABLE "brand_deal_deliverables" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"brand_deal_id" uuid NOT NULL,
	"content_id" uuid,
	"title" text NOT NULL,
	"deliverable_type" text,
	"platform" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"due_at" timestamp with time zone,
	"status" text DEFAULT 'not_started' NOT NULL,
	"approval_status" text DEFAULT 'not_submitted' NOT NULL,
	"posted_at" timestamp with time zone,
	"live_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "brand_deal_products" (
	"owner_user_id" uuid NOT NULL,
	"brand_deal_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	CONSTRAINT "brand_deal_products_brand_deal_id_product_id_pk" PRIMARY KEY("brand_deal_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "brand_deal_samples" (
	"owner_user_id" uuid NOT NULL,
	"brand_deal_id" uuid NOT NULL,
	"sample_id" uuid NOT NULL,
	CONSTRAINT "brand_deal_samples_brand_deal_id_sample_id_pk" PRIMARY KEY("brand_deal_id","sample_id")
);
--> statement-breakpoint
CREATE TABLE "brand_deals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"brand_id" uuid,
	"title" text NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"source" text DEFAULT 'other' NOT NULL,
	"deal_type" text DEFAULT 'paid' NOT NULL,
	"status" text DEFAULT 'lead' NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"start_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"notes" text,
	"fixed_compensation_cents" integer,
	"gifted_value_cents" integer,
	"currency" text DEFAULT 'USD' NOT NULL,
	"commission_terms" text,
	"payment_terms" text,
	"invoice_required" boolean DEFAULT false NOT NULL,
	"invoice_number" text,
	"invoice_date" timestamp with time zone,
	"payment_due_at" timestamp with time zone,
	"payment_status" text DEFAULT 'not_due' NOT NULL,
	"amount_received_cents" integer DEFAULT 0 NOT NULL,
	"received_at" timestamp with time zone,
	"contract_signed" boolean DEFAULT false NOT NULL,
	"contract_signed_at" timestamp with time zone,
	"usage_rights" text,
	"organic_rights" boolean DEFAULT false NOT NULL,
	"paid_usage" boolean DEFAULT false NOT NULL,
	"exclusivity_category" text,
	"exclusivity_start_at" timestamp with time zone,
	"exclusivity_end_at" timestamp with time zone,
	"revision_rounds" integer,
	"ownership_notes" text,
	"disclosures" text,
	"reference_links" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "attachment_links" ADD COLUMN "brand_deal_id" uuid;--> statement-breakpoint
ALTER TABLE "brand_deal_campaigns" ADD CONSTRAINT "brand_deal_campaigns_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_campaigns" ADD CONSTRAINT "brand_deal_campaigns_brand_deal_id_brand_deals_id_fk" FOREIGN KEY ("brand_deal_id") REFERENCES "public"."brand_deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_campaigns" ADD CONSTRAINT "brand_deal_campaigns_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_contents" ADD CONSTRAINT "brand_deal_contents_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_contents" ADD CONSTRAINT "brand_deal_contents_brand_deal_id_brand_deals_id_fk" FOREIGN KEY ("brand_deal_id") REFERENCES "public"."brand_deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_contents" ADD CONSTRAINT "brand_deal_contents_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_deliverables" ADD CONSTRAINT "brand_deal_deliverables_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_deliverables" ADD CONSTRAINT "brand_deal_deliverables_brand_deal_id_brand_deals_id_fk" FOREIGN KEY ("brand_deal_id") REFERENCES "public"."brand_deals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_deliverables" ADD CONSTRAINT "brand_deal_deliverables_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_products" ADD CONSTRAINT "brand_deal_products_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_products" ADD CONSTRAINT "brand_deal_products_brand_deal_id_brand_deals_id_fk" FOREIGN KEY ("brand_deal_id") REFERENCES "public"."brand_deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_products" ADD CONSTRAINT "brand_deal_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_samples" ADD CONSTRAINT "brand_deal_samples_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_samples" ADD CONSTRAINT "brand_deal_samples_brand_deal_id_brand_deals_id_fk" FOREIGN KEY ("brand_deal_id") REFERENCES "public"."brand_deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deal_samples" ADD CONSTRAINT "brand_deal_samples_sample_id_samples_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."samples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deals" ADD CONSTRAINT "brand_deals_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_deals" ADD CONSTRAINT "brand_deals_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_deal_campaigns_owner_idx" ON "brand_deal_campaigns" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "brand_deal_contents_owner_idx" ON "brand_deal_contents" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "brand_deal_deliverables_owner_due_idx" ON "brand_deal_deliverables" USING btree ("owner_user_id","status","due_at");--> statement-breakpoint
CREATE INDEX "brand_deal_deliverables_deal_idx" ON "brand_deal_deliverables" USING btree ("brand_deal_id");--> statement-breakpoint
CREATE INDEX "brand_deal_products_owner_idx" ON "brand_deal_products" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "brand_deal_samples_owner_idx" ON "brand_deal_samples" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "brand_deals_owner_status_due_idx" ON "brand_deals" USING btree ("owner_user_id","status","due_at");--> statement-breakpoint
CREATE INDEX "brand_deals_owner_payment_idx" ON "brand_deals" USING btree ("owner_user_id","payment_status","payment_due_at");--> statement-breakpoint
ALTER TABLE "attachment_links" ADD CONSTRAINT "attachment_links_brand_deal_id_brand_deals_id_fk" FOREIGN KEY ("brand_deal_id") REFERENCES "public"."brand_deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachment_links_brand_deal_idx" ON "attachment_links" USING btree ("brand_deal_id");