CREATE TABLE "attachment_links" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"attachment_id" uuid NOT NULL,
	"content_id" uuid,
	"campaign_id" uuid,
	"deliverable_id" uuid,
	"product_id" uuid,
	"sample_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"original_filename" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"checksum_sha256" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "attachment_links" ADD CONSTRAINT "attachment_links_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment_links" ADD CONSTRAINT "attachment_links_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment_links" ADD CONSTRAINT "attachment_links_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment_links" ADD CONSTRAINT "attachment_links_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment_links" ADD CONSTRAINT "attachment_links_deliverable_id_deliverables_id_fk" FOREIGN KEY ("deliverable_id") REFERENCES "public"."deliverables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment_links" ADD CONSTRAINT "attachment_links_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment_links" ADD CONSTRAINT "attachment_links_sample_id_samples_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."samples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachment_links_attachment_idx" ON "attachment_links" USING btree ("attachment_id");--> statement-breakpoint
CREATE INDEX "attachment_links_owner_idx" ON "attachment_links" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "attachment_links_content_idx" ON "attachment_links" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "attachment_links_campaign_idx" ON "attachment_links" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "attachment_links_deliverable_idx" ON "attachment_links" USING btree ("deliverable_id");--> statement-breakpoint
CREATE INDEX "attachment_links_product_idx" ON "attachment_links" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "attachment_links_sample_idx" ON "attachment_links" USING btree ("sample_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attachments_storage_key_unique" ON "attachments" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "attachments_owner_archived_idx" ON "attachments" USING btree ("owner_user_id","archived_at");