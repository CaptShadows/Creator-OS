ALTER TABLE "samples" ADD COLUMN "content_id" uuid;--> statement-breakpoint
ALTER TABLE "samples" ADD COLUMN "campaign_id" uuid;--> statement-breakpoint
ALTER TABLE "samples" ADD COLUMN "expected_delivery_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "samples" ADD CONSTRAINT "samples_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "samples" ADD CONSTRAINT "samples_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;