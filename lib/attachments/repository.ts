import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { attachmentLinks, attachments, campaigns, contents, deliverables, products, samples } from "@/db/schema";
import type { AttachmentStorage } from "./storage";
import { safeDisplayFilename, validatePdf } from "./validation";

export type AttachmentTarget = { type: "content"|"campaign"|"deliverable"|"product"|"sample"; id: string };
const targets = { content: contents, campaign: campaigns, deliverable: deliverables, product: products, sample: samples } as const;
const linkColumns = { content: "contentId", campaign: "campaignId", deliverable: "deliverableId", product: "productId", sample: "sampleId" } as const;

export async function assertOwnedTarget(ownerUserId: string, target: AttachmentTarget) {
  const table = targets[target.type];
  const [row] = await getDatabase().db.select({ id: table.id }).from(table).where(and(eq(table.id, target.id), eq(table.ownerUserId, ownerUserId))).limit(1);
  if (!row) throw new Error("Attachment target not found");
}

export async function createAttachment(ownerUserId:string,target:AttachmentTarget,file:{filename:string;mimeType:string;bytes:Uint8Array},storage:AttachmentStorage,maxBytes:number){
  await assertOwnedTarget(ownerUserId,target);
  const originalFilename=safeDisplayFilename(file.filename),checksumSha256=validatePdf(file,maxBytes),id=randomUUID(),storageKey=`${id}.pdf`;
  await storage.put(storageKey,file.bytes);
  try { await getDatabase().db.transaction(async tx=>{
    await tx.insert(attachments).values({id,ownerUserId,originalFilename,storageKey,mimeType:"application/pdf",sizeBytes:file.bytes.byteLength,checksumSha256});
    await tx.insert(attachmentLinks).values({id:randomUUID(),ownerUserId,attachmentId:id,[linkColumns[target.type]]:target.id});
  }); } catch(error){ await storage.remove(storageKey); throw error; }
  return id;
}

export async function listAttachments(ownerUserId:string,target:AttachmentTarget,archived=false){
  const column=attachmentLinks[linkColumns[target.type]];
  return getDatabase().db.select({attachment:attachments}).from(attachmentLinks).innerJoin(attachments,eq(attachments.id,attachmentLinks.attachmentId)).where(and(eq(attachmentLinks.ownerUserId,ownerUserId),eq(column,target.id),archived?isNotNull(attachments.archivedAt):isNull(attachments.archivedAt)));
}
export async function getAttachment(ownerUserId:string,id:string,includeArchived=false){const [row]=await getDatabase().db.select().from(attachments).where(and(eq(attachments.ownerUserId,ownerUserId),eq(attachments.id,id),includeArchived?undefined:isNull(attachments.archivedAt))).limit(1);return row??null;}
export async function renameAttachment(ownerUserId:string,id:string,name:string){await getDatabase().db.update(attachments).set({originalFilename:safeDisplayFilename(name),updatedAt:new Date()}).where(and(eq(attachments.ownerUserId,ownerUserId),eq(attachments.id,id)));}
export async function archiveAttachment(ownerUserId:string,id:string){await getDatabase().db.update(attachments).set({archivedAt:new Date(),updatedAt:new Date()}).where(and(eq(attachments.ownerUserId,ownerUserId),eq(attachments.id,id)));}
export async function restoreAttachment(ownerUserId:string,id:string){await getDatabase().db.update(attachments).set({archivedAt:null,updatedAt:new Date()}).where(and(eq(attachments.ownerUserId,ownerUserId),eq(attachments.id,id)));}
