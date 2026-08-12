import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { campaigns, contentCampaigns, contentProducts, contents, platformAccounts, products, publications } from "@/db/schema";
import { canTransitionContent } from "./lifecycle";
import type { ContentStatus } from "@/lib/domain/contracts";
import type { ContentAutosaveInput } from "./contracts";

export async function createQuickIdea(ownerUserId: string, idea: string): Promise<string> {
  const id = randomUUID();
  const title = idea.split(/\r?\n/)[0].trim().slice(0, 200) || "Untitled idea";
  await getDatabase().db.insert(contents).values({ id, ownerUserId, title, concept: idea, status: "idea" });
  return id;
}

export async function listOwnerContent(ownerUserId: string, archived: boolean) {
  return getDatabase().db.select().from(contents).where(and(eq(contents.ownerUserId, ownerUserId), archived ? isNotNull(contents.archivedAt) : isNull(contents.archivedAt))).orderBy(desc(contents.updatedAt));
}

export async function getOwnerContent(ownerUserId: string, id: string) {
  const [content] = await getDatabase().db.select().from(contents).where(and(eq(contents.id, id), eq(contents.ownerUserId, ownerUserId))).limit(1);
  return content ?? null;
}

export async function getContentEditorData(ownerUserId: string, id: string) {
  const content = await getOwnerContent(ownerUserId, id);
  if (!content) return null;
  const db = getDatabase().db;
  const [campaignOptions, productOptions, platformOptions, campaignLinks, productLinks, publicationLinks] = await Promise.all([
    db.select({ id: campaigns.id, name: campaigns.name }).from(campaigns).where(and(eq(campaigns.ownerUserId, ownerUserId), isNull(campaigns.archivedAt))).orderBy(campaigns.name),
    db.select({ id: products.id, name: products.name }).from(products).where(and(eq(products.ownerUserId, ownerUserId), isNull(products.archivedAt))).orderBy(products.name),
    db.select({ id: platformAccounts.id, displayName: platformAccounts.displayName, platform: platformAccounts.platform }).from(platformAccounts).where(and(eq(platformAccounts.ownerUserId, ownerUserId), isNull(platformAccounts.archivedAt))).orderBy(platformAccounts.platform),
    db.select({ id: contentCampaigns.campaignId }).from(contentCampaigns).where(and(eq(contentCampaigns.ownerUserId, ownerUserId), eq(contentCampaigns.contentId, id))),
    db.select({ id: contentProducts.productId }).from(contentProducts).where(and(eq(contentProducts.ownerUserId, ownerUserId), eq(contentProducts.contentId, id))),
    db.select({ id: publications.platformAccountId }).from(publications).where(and(eq(publications.ownerUserId, ownerUserId), eq(publications.contentId, id), eq(publications.status, "draft"))),
  ]);
  return { content, campaignOptions, productOptions, platformOptions, selectedCampaignIds: campaignLinks.map((item) => item.id), selectedProductIds: productLinks.map((item) => item.id), selectedPlatformAccountIds: publicationLinks.map((item) => item.id) };
}

export async function autosaveContent(ownerUserId: string, id: string, input: ContentAutosaveInput): Promise<{ updatedAt: Date } | null> {
  const [updated] = await getDatabase().db.update(contents).set({ title: input.title, concept: input.concept, hook: input.hook, script: input.script, caption: input.caption, notes: input.notes, contentType: input.contentType, contentPillar: input.contentPillar, updatedAt: new Date() }).where(and(eq(contents.id, id), eq(contents.ownerUserId, ownerUserId), eq(contents.updatedAt, new Date(input.baseUpdatedAt)), isNull(contents.archivedAt))).returning({ updatedAt: contents.updatedAt });
  return updated ?? null;
}

export async function transitionContent(ownerUserId: string, id: string, to: ContentStatus): Promise<boolean> {
  const content = await getOwnerContent(ownerUserId, id);
  if (!content || content.archivedAt || !canTransitionContent(content.status, to)) return false;
  await getDatabase().db.update(contents).set({ status: to, updatedAt: new Date() }).where(and(eq(contents.id, id), eq(contents.ownerUserId, ownerUserId)));
  return true;
}

export async function archiveContent(ownerUserId: string, id: string): Promise<void> {
  const content = await getOwnerContent(ownerUserId, id);
  if (!content || content.archivedAt) return;
  await getDatabase().db.update(contents).set({ statusBeforeArchive: content.status, status: "archived", archivedAt: new Date(), updatedAt: new Date() }).where(and(eq(contents.id, id), eq(contents.ownerUserId, ownerUserId)));
}

export async function recoverContent(ownerUserId: string, id: string): Promise<void> {
  const content = await getOwnerContent(ownerUserId, id);
  if (!content?.archivedAt) return;
  await getDatabase().db.update(contents).set({ status: content.statusBeforeArchive ?? "idea", statusBeforeArchive: null, archivedAt: null, updatedAt: new Date() }).where(and(eq(contents.id, id), eq(contents.ownerUserId, ownerUserId)));
}

export async function replaceContentAssociations(ownerUserId: string, contentId: string, campaignIds: string[], productIds: string[], platformAccountIds: string[]): Promise<void> {
  if (!(await getOwnerContent(ownerUserId, contentId))) throw new Error("Content does not belong to owner");
  const db = getDatabase().db;
  const [validCampaigns, validProducts, validPlatforms] = await Promise.all([
    campaignIds.length ? db.select({ id: campaigns.id }).from(campaigns).where(and(eq(campaigns.ownerUserId, ownerUserId), inArray(campaigns.id, campaignIds))) : [],
    productIds.length ? db.select({ id: products.id }).from(products).where(and(eq(products.ownerUserId, ownerUserId), inArray(products.id, productIds))) : [],
    platformAccountIds.length ? db.select({ id: platformAccounts.id }).from(platformAccounts).where(and(eq(platformAccounts.ownerUserId, ownerUserId), inArray(platformAccounts.id, platformAccountIds))) : [],
  ]);
  if (validCampaigns.length !== campaignIds.length || validProducts.length !== productIds.length || validPlatforms.length !== platformAccountIds.length) throw new Error("Association does not belong to owner");

  await db.transaction(async (tx) => {
    await tx.delete(contentCampaigns).where(and(eq(contentCampaigns.ownerUserId, ownerUserId), eq(contentCampaigns.contentId, contentId)));
    await tx.delete(contentProducts).where(and(eq(contentProducts.ownerUserId, ownerUserId), eq(contentProducts.contentId, contentId)));
    await tx.delete(publications).where(and(eq(publications.ownerUserId, ownerUserId), eq(publications.contentId, contentId), eq(publications.status, "draft")));
    if (campaignIds.length) await tx.insert(contentCampaigns).values(campaignIds.map((campaignId) => ({ ownerUserId, contentId, campaignId })));
    if (productIds.length) await tx.insert(contentProducts).values(productIds.map((productId) => ({ ownerUserId, contentId, productId })));
    if (platformAccountIds.length) await tx.insert(publications).values(platformAccountIds.map((platformAccountId) => ({ id: randomUUID(), ownerUserId, contentId, platformAccountId, status: "draft" })));
  });
}
