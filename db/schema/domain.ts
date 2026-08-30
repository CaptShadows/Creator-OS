import { boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./foundation";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
};
const metadata = () => jsonb("metadata").$type<Record<string, unknown>>().notNull().default({});

export const contentStatus = pgEnum("content_status", ["idea", "scripting", "ready_to_film", "filmed", "edited", "ready_to_post", "posted", "archived"]);
export const sampleStatus = pgEnum("sample_status", ["requested", "pending", "approved", "shipped", "arrived", "content_needed", "completed"]);

export const platformAccounts = pgTable("platform_accounts", {
  id: uuid("id").primaryKey(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  displayName: text("display_name").notNull(),
  handle: text("handle"),
  externalAccountId: text("external_account_id"),
  accountType: text("account_type"),
  active: boolean("active").default(true).notNull(),
  metadata: metadata(),
  ...timestamps,
}, (table) => [
  index("platform_accounts_owner_platform_idx").on(table.ownerUserId, table.platform),
  uniqueIndex("platform_accounts_external_unique").on(table.ownerUserId, table.platform, table.externalAccountId),
]);

export const contents = pgTable("contents", {
  id: uuid("id").primaryKey(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  concept: text("concept"),
  contentType: text("content_type"),
  contentPillar: text("content_pillar"),
  status: contentStatus("status").default("idea").notNull(),
  statusBeforeArchive: contentStatus("status_before_archive"),
  hook: text("hook"), script: text("script"), caption: text("caption"), notes: text("notes"),
  priority: integer("priority").default(0).notNull(),
  plannedFilmAt: timestamp("planned_film_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("contents_owner_status_idx").on(table.ownerUserId, table.status),
  index("contents_owner_film_date_idx").on(table.ownerUserId, table.plannedFilmAt),
]);

export const publications = pgTable("publications", {
  id: uuid("id").primaryKey(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: uuid("content_id").notNull().references(() => contents.id, { onDelete: "restrict" }),
  platformAccountId: uuid("platform_account_id").notNull().references(() => platformAccounts.id, { onDelete: "restrict" }),
  status: text("status").default("draft").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  externalPostId: text("external_post_id"), externalUrl: text("external_url"), platformCaptionOverride: text("platform_caption_override"),
  metadata: metadata(),
  ...timestamps,
}, (table) => [index("publications_owner_status_date_idx").on(table.ownerUserId, table.status, table.scheduledAt), index("publications_content_idx").on(table.contentId)]);

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), website: text("website"), notes: text("notes"), ...timestamps,
}, (table) => [index("brands_owner_name_idx").on(table.ownerUserId, table.name)]);

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  name: text("name").notNull(), status: text("status").default("planned").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }), dueAt: timestamp("due_at", { withTimezone: true }),
  briefReference: text("brief_reference"), notes: text("notes"), ...timestamps,
}, (table) => [index("campaigns_owner_status_due_idx").on(table.ownerUserId, table.status, table.dueAt)]);

export const brandDeals = pgTable("brand_deals", {
  id: uuid("id").primaryKey(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  title: text("title").notNull(), contactName: text("contact_name"), contactEmail: text("contact_email"),
  source: text("source").default("other").notNull(), dealType: text("deal_type").default("paid").notNull(),
  status: text("status").default("lead").notNull(), priority: integer("priority").default(1).notNull(),
  startAt: timestamp("start_at", { withTimezone: true }), dueAt: timestamp("due_at", { withTimezone: true }), notes: text("notes"),
  fixedCompensationCents: integer("fixed_compensation_cents"), giftedValueCents: integer("gifted_value_cents"),
  currency: text("currency").default("USD").notNull(), commissionTerms: text("commission_terms"), paymentTerms: text("payment_terms"),
  invoiceRequired: boolean("invoice_required").default(false).notNull(), invoiceNumber: text("invoice_number"), invoiceDate: timestamp("invoice_date", { withTimezone: true }),
  paymentDueAt: timestamp("payment_due_at", { withTimezone: true }), paymentStatus: text("payment_status").default("not_due").notNull(),
  amountReceivedCents: integer("amount_received_cents").default(0).notNull(), receivedAt: timestamp("received_at", { withTimezone: true }),
  contractSigned: boolean("contract_signed").default(false).notNull(), contractSignedAt: timestamp("contract_signed_at", { withTimezone: true }),
  usageRights: text("usage_rights"), organicRights: boolean("organic_rights").default(false).notNull(), paidUsage: boolean("paid_usage").default(false).notNull(),
  exclusivityCategory: text("exclusivity_category"), exclusivityStartAt: timestamp("exclusivity_start_at", { withTimezone: true }), exclusivityEndAt: timestamp("exclusivity_end_at", { withTimezone: true }),
  revisionRounds: integer("revision_rounds"), ownershipNotes: text("ownership_notes"), disclosures: text("disclosures"), referenceLinks: text("reference_links"),
  ...timestamps,
}, (table) => [index("brand_deals_owner_status_due_idx").on(table.ownerUserId, table.status, table.dueAt), index("brand_deals_owner_payment_idx").on(table.ownerUserId, table.paymentStatus, table.paymentDueAt)]);

export const brandDealDeliverables = pgTable("brand_deal_deliverables", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brandDealId: uuid("brand_deal_id").notNull().references(() => brandDeals.id, { onDelete: "restrict" }),
  contentId: uuid("content_id").references(() => contents.id, { onDelete: "set null" }),
  title: text("title").notNull(), deliverableType: text("deliverable_type"), platform: text("platform"), quantity: integer("quantity").default(1).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }), status: text("status").default("not_started").notNull(), approvalStatus: text("approval_status").default("not_submitted").notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }), liveUrl: text("live_url"), notes: text("notes"), ...timestamps,
}, (table) => [index("brand_deal_deliverables_owner_due_idx").on(table.ownerUserId, table.status, table.dueAt), index("brand_deal_deliverables_deal_idx").on(table.brandDealId)]);

export const brandDealCampaigns = pgTable("brand_deal_campaigns", { ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), brandDealId: uuid("brand_deal_id").notNull().references(() => brandDeals.id, { onDelete: "cascade" }), campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }) }, (table) => [primaryKey({ columns: [table.brandDealId, table.campaignId] }), index("brand_deal_campaigns_owner_idx").on(table.ownerUserId)]);
export const brandDealContents = pgTable("brand_deal_contents", { ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), brandDealId: uuid("brand_deal_id").notNull().references(() => brandDeals.id, { onDelete: "cascade" }), contentId: uuid("content_id").notNull().references(() => contents.id, { onDelete: "cascade" }) }, (table) => [primaryKey({ columns: [table.brandDealId, table.contentId] }), index("brand_deal_contents_owner_idx").on(table.ownerUserId)]);

export const deliverables = pgTable("deliverables", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "restrict" }),
  contentId: uuid("content_id").references(() => contents.id, { onDelete: "set null" }),
  title: text("title").notNull(), status: text("status").default("not_started").notNull(), dueAt: timestamp("due_at", { withTimezone: true }),
  requiredPlatform: text("required_platform"), notes: text("notes"), ...timestamps,
}, (table) => [index("deliverables_owner_status_due_idx").on(table.ownerUserId, table.status, table.dueAt), index("deliverables_campaign_idx").on(table.campaignId)]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }), name: text("name").notNull(), category: text("category"), notes: text("notes"), active: boolean("active").default(true).notNull(), ...timestamps,
}, (table) => [index("products_owner_active_name_idx").on(table.ownerUserId, table.active, table.name)]);

export const productPlatformListings = pgTable("product_platform_listings", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }), platformAccountId: uuid("platform_account_id").references(() => platformAccounts.id, { onDelete: "set null" }),
  platform: text("platform").notNull(), externalProductId: text("external_product_id"), externalUrl: text("external_url"), affiliateUrl: text("affiliate_url"), commissionBasisPoints: integer("commission_basis_points"), status: text("status").default("active").notNull(), metadata: metadata(), ...timestamps,
}, (table) => [index("product_listings_product_idx").on(table.productId), index("product_listings_owner_platform_idx").on(table.ownerUserId, table.platform)]);

export const samples = pgTable("samples", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  contentId: uuid("content_id").references(() => contents.id, { onDelete: "set null" }), campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  sourcePlatform: text("source_platform"), status: sampleStatus("status").default("requested").notNull(), requestedAt: timestamp("requested_at", { withTimezone: true }), approvedAt: timestamp("approved_at", { withTimezone: true }), shippedAt: timestamp("shipped_at", { withTimezone: true }), receivedAt: timestamp("received_at", { withTimezone: true }), expectedDeliveryAt: timestamp("expected_delivery_at", { withTimezone: true }), trackingReference: text("tracking_reference"), notes: text("notes"), ...timestamps,
}, (table) => [index("samples_owner_status_idx").on(table.ownerUserId, table.status), index("samples_product_idx").on(table.productId)]);

export const compensations = pgTable("compensations", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "restrict" }),
  type: text("type").notNull(), agreedAmountCents: integer("agreed_amount_cents"), commissionBasisPoints: integer("commission_basis_points"), expectedPaymentAt: timestamp("expected_payment_at", { withTimezone: true }), notes: text("notes"), ...timestamps,
}, (table) => [index("compensations_owner_expected_idx").on(table.ownerUserId, table.expectedPaymentAt), index("compensations_campaign_idx").on(table.campaignId)]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "restrict" }), compensationId: uuid("compensation_id").references(() => compensations.id, { onDelete: "restrict" }),
  status: text("status").default("expected").notNull(), amountCents: integer("amount_cents").notNull(), dueAt: timestamp("due_at", { withTimezone: true }), receivedAt: timestamp("received_at", { withTimezone: true }), paymentReference: text("payment_reference"), notes: text("notes"), ...timestamps,
}, (table) => [index("payments_owner_status_due_idx").on(table.ownerUserId, table.status, table.dueAt), index("payments_compensation_idx").on(table.compensationId)]);

export const assetReferences = pgTable("asset_references", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: uuid("content_id").references(() => contents.id, { onDelete: "set null" }), campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }), deliverableId: uuid("deliverable_id").references(() => deliverables.id, { onDelete: "set null" }), productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  type: text("type").notNull(), provider: text("provider").notNull(), externalId: text("external_id"), path: text("path"), displayName: text("display_name").notNull(), metadata: metadata(), ...timestamps,
}, (table) => [index("asset_references_owner_type_idx").on(table.ownerUserId, table.type), index("asset_references_content_idx").on(table.contentId)]);

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  originalFilename: text("original_filename").notNull(),
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  checksumSha256: text("checksum_sha256").notNull(),
  metadata: metadata(),
  ...timestamps,
}, (table) => [
  uniqueIndex("attachments_storage_key_unique").on(table.storageKey),
  index("attachments_owner_archived_idx").on(table.ownerUserId, table.archivedAt),
]);

// A link row has exactly one populated domain target. The repository validates
// that target ownership before insertion so attachment IDs never become an
// authorization boundary.
export const attachmentLinks = pgTable("attachment_links", {
  id: uuid("id").primaryKey(),
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  attachmentId: uuid("attachment_id").notNull().references(() => attachments.id, { onDelete: "cascade" }),
  contentId: uuid("content_id").references(() => contents.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }),
  deliverableId: uuid("deliverable_id").references(() => deliverables.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  sampleId: uuid("sample_id").references(() => samples.id, { onDelete: "cascade" }),
  brandDealId: uuid("brand_deal_id").references(() => brandDeals.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("attachment_links_attachment_idx").on(table.attachmentId),
  index("attachment_links_owner_idx").on(table.ownerUserId),
  index("attachment_links_content_idx").on(table.contentId),
  index("attachment_links_campaign_idx").on(table.campaignId),
  index("attachment_links_deliverable_idx").on(table.deliverableId),
  index("attachment_links_product_idx").on(table.productId),
  index("attachment_links_sample_idx").on(table.sampleId),
  index("attachment_links_brand_deal_idx").on(table.brandDealId),
]);

export const integrationStates = pgTable("integration_states", {
  id: uuid("id").primaryKey(), ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), platformAccountId: uuid("platform_account_id").references(() => platformAccounts.id, { onDelete: "set null" }),
  integration: text("integration").notNull(), status: text("status").default("not_configured").notNull(), lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }), lastSuccessAt: timestamp("last_success_at", { withTimezone: true }), lastError: text("last_error"), metadata: metadata(), ...timestamps,
}, (table) => [uniqueIndex("integration_states_owner_integration_account_unique").on(table.ownerUserId, table.integration, table.platformAccountId), index("integration_states_owner_status_idx").on(table.ownerUserId, table.status)]);

export const contentCampaigns = pgTable("content_campaigns", {
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: uuid("content_id").notNull().references(() => contents.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.contentId, table.campaignId] }), index("content_campaigns_owner_idx").on(table.ownerUserId)]);

export const contentProducts = pgTable("content_products", {
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: uuid("content_id").notNull().references(() => contents.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
}, (table) => [primaryKey({ columns: [table.contentId, table.productId] }), index("content_products_owner_idx").on(table.ownerUserId)]);

export const brandDealProducts = pgTable("brand_deal_products", { ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), brandDealId: uuid("brand_deal_id").notNull().references(() => brandDeals.id, { onDelete: "cascade" }), productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }) }, (table) => [primaryKey({ columns: [table.brandDealId, table.productId] }), index("brand_deal_products_owner_idx").on(table.ownerUserId)]);
export const brandDealSamples = pgTable("brand_deal_samples", { ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), brandDealId: uuid("brand_deal_id").notNull().references(() => brandDeals.id, { onDelete: "cascade" }), sampleId: uuid("sample_id").notNull().references(() => samples.id, { onDelete: "cascade" }) }, (table) => [primaryKey({ columns: [table.brandDealId, table.sampleId] }), index("brand_deal_samples_owner_idx").on(table.ownerUserId)]);

export const platformAccountsRelations = relations(platformAccounts, ({ many }) => ({ publications: many(publications), productListings: many(productPlatformListings) }));
export const contentsRelations = relations(contents, ({ many }) => ({ publications: many(publications), deliverables: many(deliverables), assets: many(assetReferences), campaignLinks: many(contentCampaigns), productLinks: many(contentProducts) }));
export const publicationsRelations = relations(publications, ({ one }) => ({ content: one(contents, { fields: [publications.contentId], references: [contents.id] }), platformAccount: one(platformAccounts, { fields: [publications.platformAccountId], references: [platformAccounts.id] }) }));
export const campaignsRelations = relations(campaigns, ({ one, many }) => ({ brand: one(brands, { fields: [campaigns.brandId], references: [brands.id] }), deliverables: many(deliverables), compensations: many(compensations), payments: many(payments) }));
export const deliverablesRelations = relations(deliverables, ({ one }) => ({ campaign: one(campaigns, { fields: [deliverables.campaignId], references: [campaigns.id] }), content: one(contents, { fields: [deliverables.contentId], references: [contents.id] }) }));
export const productsRelations = relations(products, ({ one, many }) => ({ brand: one(brands, { fields: [products.brandId], references: [brands.id] }), listings: many(productPlatformListings), samples: many(samples) }));
export const samplesRelations = relations(samples, ({ one }) => ({ product: one(products, { fields: [samples.productId], references: [products.id] }), content: one(contents, { fields: [samples.contentId], references: [contents.id] }), campaign: one(campaigns, { fields: [samples.campaignId], references: [campaigns.id] }) }));
export const productListingsRelations = relations(productPlatformListings, ({ one }) => ({ product: one(products, { fields: [productPlatformListings.productId], references: [products.id] }), platformAccount: one(platformAccounts, { fields: [productPlatformListings.platformAccountId], references: [platformAccounts.id] }) }));
export const compensationsRelations = relations(compensations, ({ one, many }) => ({ campaign: one(campaigns, { fields: [compensations.campaignId], references: [campaigns.id] }), payments: many(payments) }));
export const paymentsRelations = relations(payments, ({ one }) => ({ campaign: one(campaigns, { fields: [payments.campaignId], references: [campaigns.id] }), compensation: one(compensations, { fields: [payments.compensationId], references: [compensations.id] }) }));
export const attachmentsRelations = relations(attachments, ({ many }) => ({ links: many(attachmentLinks) }));
export const attachmentLinksRelations = relations(attachmentLinks, ({ one }) => ({ attachment: one(attachments, { fields: [attachmentLinks.attachmentId], references: [attachments.id] }) }));
