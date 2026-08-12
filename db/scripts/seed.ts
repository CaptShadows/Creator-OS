import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../client";
import { campaigns, contents, deliverables, platformAccounts, productPlatformListings, products, users } from "../schema";
import { domainFixture } from "../fixtures/domain";

if (process.env.NODE_ENV === "production") throw new Error("Development fixtures cannot be loaded in production");
const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
if (!ownerEmail) throw new Error("OWNER_EMAIL must identify the existing local owner");

try {
  const [owner] = await getDatabase().db.select({ id: users.id }).from(users).where(eq(users.email, ownerEmail)).limit(1);
  if (!owner) throw new Error("Bootstrap the local owner before loading fixtures");

  await getDatabase().db.transaction(async (tx) => {
    await tx.insert(platformAccounts).values(domainFixture.platformAccounts.map((account) => ({ ...account, ownerUserId: owner.id }))).onConflictDoNothing();
    await tx.insert(contents).values({ ...domainFixture.content, ownerUserId: owner.id }).onConflictDoNothing();
    await tx.insert(campaigns).values({ ...domainFixture.campaign, ownerUserId: owner.id }).onConflictDoNothing();
    await tx.insert(deliverables).values(domainFixture.deliverables.map((deliverable) => ({ ...deliverable, ownerUserId: owner.id, campaignId: domainFixture.campaign.id }))).onConflictDoNothing();
    await tx.insert(products).values({ ...domainFixture.product, ownerUserId: owner.id }).onConflictDoNothing();
    await tx.insert(productPlatformListings).values(domainFixture.productListings.map((listing) => ({ ...listing, ownerUserId: owner.id, productId: domainFixture.product.id }))).onConflictDoNothing();
  });
  console.log("Development domain fixture loaded.");
} finally {
  await closeDatabase();
}
