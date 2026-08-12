CREATE TABLE "content_campaigns" (
	"owner_user_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	CONSTRAINT "content_campaigns_content_id_campaign_id_pk" PRIMARY KEY("content_id","campaign_id")
);
--> statement-breakpoint
CREATE TABLE "content_products" (
	"owner_user_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	CONSTRAINT "content_products_content_id_product_id_pk" PRIMARY KEY("content_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "contents" ADD COLUMN "status_before_archive" "content_status";--> statement-breakpoint
ALTER TABLE "content_campaigns" ADD CONSTRAINT "content_campaigns_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_campaigns" ADD CONSTRAINT "content_campaigns_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_campaigns" ADD CONSTRAINT "content_campaigns_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_products" ADD CONSTRAINT "content_products_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_products" ADD CONSTRAINT "content_products_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_products" ADD CONSTRAINT "content_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_campaigns_owner_idx" ON "content_campaigns" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "content_products_owner_idx" ON "content_products" USING btree ("owner_user_id");