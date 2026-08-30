import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, isNotNull, isNull, like, notLike } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { attachmentLinks, attachments, auditEvents, campaigns, contents, deliverables, products, samples } from "@/db/schema";
import type { AttachmentStorage } from "./storage";
import { safeDisplayFilename, safeVideoFilename, validateAttachmentFile, validateVideo } from "./validation";

export type AttachmentTarget = { type: "content"|"campaign"|"deliverable"|"product"|"sample"; id: string };
export type AttachmentKind = "pdf" | "video";
const targets = { content: contents, campaign: campaigns, deliverable: deliverables, product: products, sample: samples } as const;
const linkColumns = { content: "contentId", campaign: "campaignId", deliverable: "deliverableId", product: "productId", sample: "sampleId" } as const;

export async function assertOwnedTarget(ownerUserId: string, target: AttachmentTarget) {
  const table = targets[target.type];
  const [row] = await getDatabase().db.select({ id: table.id }).from(table).where(and(eq(table.id, target.id), eq(table.ownerUserId, ownerUserId))).limit(1);
  if (!row) throw new Error("Attachment target not found");
}

export async function createAttachment(ownerUserId:string,target:AttachmentTarget,file:{filename:string;mimeType:string;bytes:Uint8Array},storage:AttachmentStorage,maxBytes:number,kind:AttachmentKind="pdf"){
  await assertOwnedTarget(ownerUserId,target);
  const originalFilename=kind==="video"?safeVideoFilename(file.filename,file.mimeType):safeDisplayFilename(file.filename,file.mimeType),checksumSha256=kind==="video"?validateVideo(file,maxBytes):validateAttachmentFile(file,maxBytes),id=randomUUID(),extension=kind==="video"?(file.mimeType==="video/mp4"?"mp4":file.mimeType==="video/quicktime"?"mov":"webm"):(file.mimeType==="application/pdf"?"pdf":file.mimeType==="image/png"?"png":file.filename.toLowerCase().endsWith(".jpeg")?"jpeg":"jpg"),storageKey=`${id}.${extension}`;
  await storage.put(storageKey,file.bytes);
  try { await getDatabase().db.transaction(async tx=>{
    await tx.insert(attachments).values({id,ownerUserId,originalFilename,storageKey,mimeType:file.mimeType,sizeBytes:file.bytes.byteLength,checksumSha256});
    await tx.insert(attachmentLinks).values({id:randomUUID(),ownerUserId,attachmentId:id,[linkColumns[target.type]]:target.id});
  }); } catch(error){ await storage.remove(storageKey); throw error; }
  return id;
}

export async function listAttachments(ownerUserId:string,target:AttachmentTarget,archived=false,kind:AttachmentKind="pdf"){
  const column=attachmentLinks[linkColumns[target.type]];
  return getDatabase().db.select({attachment:attachments}).from(attachmentLinks).innerJoin(attachments,eq(attachments.id,attachmentLinks.attachmentId)).where(and(eq(attachmentLinks.ownerUserId,ownerUserId),eq(column,target.id),archived?isNotNull(attachments.archivedAt):isNull(attachments.archivedAt),kind==="video"?like(attachments.mimeType,"video/%"):notLike(attachments.mimeType,"video/%")));
}
export async function getAttachment(ownerUserId:string,id:string,includeArchived=false){const [row]=await getDatabase().db.select().from(attachments).where(and(eq(attachments.ownerUserId,ownerUserId),eq(attachments.id,id),includeArchived?undefined:isNull(attachments.archivedAt))).limit(1);return row??null;}
export async function renameAttachment(ownerUserId:string,id:string,name:string){const row=await getAttachment(ownerUserId,id,true);if(!row)return;const originalFilename=row.mimeType.startsWith("video/")?safeVideoFilename(name,row.mimeType):safeDisplayFilename(name,row.mimeType);await getDatabase().db.update(attachments).set({originalFilename,updatedAt:new Date()}).where(and(eq(attachments.ownerUserId,ownerUserId),eq(attachments.id,id)));}
export async function archiveAttachment(ownerUserId:string,id:string){await getDatabase().db.update(attachments).set({archivedAt:new Date(),updatedAt:new Date()}).where(and(eq(attachments.ownerUserId,ownerUserId),eq(attachments.id,id)));}
export async function restoreAttachment(ownerUserId:string,id:string){await getDatabase().db.update(attachments).set({archivedAt:null,updatedAt:new Date()}).where(and(eq(attachments.ownerUserId,ownerUserId),eq(attachments.id,id)));}
export async function permanentlyDeleteAttachment(ownerUserId:string,id:string,storage:AttachmentStorage){const row=await getAttachment(ownerUserId,id,true);if(!row)return false;const bytes=await storage.read(row.storageKey);await storage.remove(row.storageKey);try{await getDatabase().db.transaction(async tx=>{const deleted=await tx.delete(attachments).where(and(eq(attachments.ownerUserId,ownerUserId),eq(attachments.id,id))).returning({id:attachments.id});if(!deleted.length)throw new Error("Attachment not found");await tx.insert(auditEvents).values({id:randomUUID(),actorUserId:ownerUserId,eventType:"attachment.permanently_deleted",entityType:"attachment",entityId:id,metadata:{confirmation:"two_step",filename:row.originalFilename}})});return true}catch(error){await storage.put(row.storageKey,bytes);throw error;}}
