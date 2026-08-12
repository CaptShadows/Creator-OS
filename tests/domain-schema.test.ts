import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { campaigns, contents, deliverables, payments, platformAccounts, productPlatformListings, products, publications } from "@/db/schema";
import { domainFixture } from "@/db/fixtures/domain";
import { contentInputSchema, contentStatuses, platformAccountInputSchema, sampleStatuses } from "@/lib/domain/contracts";

describe("creator domain invariants", () => {
  it("keeps lifecycle values explicit and validates extension inputs", () => {
    expect(contentStatuses).toEqual(["idea", "scripting", "ready_to_film", "filmed", "edited", "ready_to_post", "posted", "archived"]);
    expect(sampleStatuses).toContain("content_needed");
    expect(contentInputSchema.parse({ title: "New idea" })).toMatchObject({ status: "idea", priority: 0 });
    expect(() => platformAccountInputSchema.parse({ platform: "viral_vue", displayName: "Nope" })).toThrow();
  });

  it("supports multiple accounts for the same platform", () => {
    expect(domainFixture.platformAccounts.filter((account) => account.platform === "tiktok")).toHaveLength(2);
    const uniqueIndexes = getTableConfig(platformAccounts).indexes.filter((index) => index.config.unique);
    expect(uniqueIndexes).toHaveLength(1);
    expect(platformAccountInputSchema.parse(domainFixture.platformAccounts[0]).platform).toBe("tiktok");
  });

  it("requires publications to reference content and a platform account", () => {
    const foreignTables = getTableConfig(publications).foreignKeys.map((key) => key.reference().foreignTable);
    expect(foreignTables).toEqual(expect.arrayContaining([contents, platformAccounts]));
    expect(publications.contentId.notNull).toBe(true);
    expect(publications.platformAccountId.notNull).toBe(true);
  });

  it("models one campaign with many deliverables and one product with many listings", () => {
    expect(domainFixture.deliverables).toHaveLength(2);
    expect(domainFixture.productListings).toHaveLength(2);
    expect(deliverables.campaignId.notNull).toBe(true);
    expect(productPlatformListings.productId.notNull).toBe(true);
    expect(getTableConfig(campaigns).name).toBe("campaigns");
    expect(getTableConfig(products).name).toBe("products");
  });

  it("represents partial and final receipts as independent payment rows", () => {
    expect(payments.amountCents.notNull).toBe(true);
    expect(payments.compensationId.notNull).toBe(false);
    expect(getTableConfig(payments).uniqueConstraints).toHaveLength(0);
  });

  it("preserves user-created records for archive/recovery queries", () => {
    expect(contents.archivedAt).toBeDefined();
    expect(campaigns.archivedAt).toBeDefined();
    expect(products.archivedAt).toBeDefined();
  });
});
