import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { brands, campaigns, compensations, contents, deliverables, payments } from "@/db/schema";
import { calculateDeliverableProgress, calculateOutstandingByCompensation, isOverdue } from "./calculations";
import type { z } from "zod";
import type { campaignEditSchema, compensationSchema, createCampaignSchema, deliverableSchema, deliverableUpdateSchema, paymentSchema } from "./contracts";

type Input<T extends z.ZodType> = z.infer<T>;

export async function createCampaign(ownerUserId: string, input: Input<typeof createCampaignSchema>) {
  const db=getDatabase().db; const id=randomUUID();
  const [existing]=await db.select({id:brands.id}).from(brands).where(and(eq(brands.ownerUserId,ownerUserId),eq(brands.name,input.brandName))).limit(1);
  const brandId=existing?.id??randomUUID();
  await db.transaction(async(tx)=>{ if(!existing) await tx.insert(brands).values({id:brandId,ownerUserId,name:input.brandName}); await tx.insert(campaigns).values({id,ownerUserId,brandId,name:input.name}); });
  return id;
}

export async function listCampaigns(ownerUserId:string, archived:boolean){
  const rows=await getDatabase().db.select({campaign:campaigns,brandName:brands.name}).from(campaigns).leftJoin(brands,eq(campaigns.brandId,brands.id)).where(and(eq(campaigns.ownerUserId,ownerUserId),archived?isNotNull(campaigns.archivedAt):isNull(campaigns.archivedAt))).orderBy(desc(campaigns.updatedAt));
  if(!rows.length)return [];
  const ds=await getDatabase().db.select({campaignId:deliverables.campaignId,status:deliverables.status}).from(deliverables).where(and(eq(deliverables.ownerUserId,ownerUserId),inArray(deliverables.campaignId,rows.map(r=>r.campaign.id))));
  return rows.map(row=>({...row,progress:calculateDeliverableProgress(ds.filter(d=>d.campaignId===row.campaign.id).map(d=>d.status))}));
}

export async function getCampaignWorkspace(ownerUserId:string,id:string){
  const db=getDatabase().db; const [row]=await db.select({campaign:campaigns,brandName:brands.name}).from(campaigns).leftJoin(brands,eq(campaigns.brandId,brands.id)).where(and(eq(campaigns.ownerUserId,ownerUserId),eq(campaigns.id,id))).limit(1); if(!row)return null;
  const [deliveryRows,compensationRows,paymentRows,contentOptions]=await Promise.all([
    db.select().from(deliverables).where(and(eq(deliverables.ownerUserId,ownerUserId),eq(deliverables.campaignId,id))).orderBy(asc(deliverables.dueAt)),
    db.select().from(compensations).where(and(eq(compensations.ownerUserId,ownerUserId),eq(compensations.campaignId,id))).orderBy(asc(compensations.createdAt)),
    db.select().from(payments).where(and(eq(payments.ownerUserId,ownerUserId),eq(payments.campaignId,id))).orderBy(desc(payments.createdAt)),
    db.select({id:contents.id,title:contents.title}).from(contents).where(and(eq(contents.ownerUserId,ownerUserId),isNull(contents.archivedAt))).orderBy(asc(contents.title)),
  ]);
  return {...row,deliverables:deliveryRows.map(d=>({...d,overdue:isOverdue(d.dueAt,d.status==="completed")})),compensations:compensationRows,payments:paymentRows.map(p=>({...p,overdue:isOverdue(p.dueAt,p.status==="received")})),contentOptions,progress:calculateDeliverableProgress(deliveryRows.map(d=>d.status)),outstandingCents:calculateOutstandingByCompensation(compensationRows,paymentRows)};
}

async function ownsCampaign(ownerUserId:string,id:string){const [row]=await getDatabase().db.select({id:campaigns.id}).from(campaigns).where(and(eq(campaigns.ownerUserId,ownerUserId),eq(campaigns.id,id))).limit(1);return Boolean(row);}
export async function updateCampaign(ownerUserId:string,input:Input<typeof campaignEditSchema>){if(!await ownsCampaign(ownerUserId,input.campaignId))throw new Error("Campaign not found");await getDatabase().db.update(campaigns).set({name:input.name,status:input.status,startAt:input.startAt,dueAt:input.dueAt,briefReference:input.briefReference,notes:input.notes,updatedAt:new Date()}).where(and(eq(campaigns.ownerUserId,ownerUserId),eq(campaigns.id,input.campaignId)));}
export async function addDeliverable(ownerUserId:string,input:Input<typeof deliverableSchema>){if(!await ownsCampaign(ownerUserId,input.campaignId))throw new Error("Campaign not found");if(input.contentId){const [c]=await getDatabase().db.select({id:contents.id}).from(contents).where(and(eq(contents.ownerUserId,ownerUserId),eq(contents.id,input.contentId))).limit(1);if(!c)throw new Error("Content not found");}const db=getDatabase().db;await db.transaction(async(tx)=>{let contentId=input.contentId;if(input.newContentIdea){contentId=randomUUID();await tx.insert(contents).values({id:contentId,ownerUserId,title:input.newContentIdea.split(/\r?\n/)[0].slice(0,200),concept:input.newContentIdea,status:"idea"});}await tx.insert(deliverables).values({id:randomUUID(),ownerUserId,campaignId:input.campaignId,title:input.title,status:input.status,dueAt:input.dueAt,requiredPlatform:input.requiredPlatform,contentId,notes:input.notes});});}
export async function updateDeliverable(ownerUserId:string,input:Input<typeof deliverableUpdateSchema>){if(input.contentId){const [c]=await getDatabase().db.select({id:contents.id}).from(contents).where(and(eq(contents.ownerUserId,ownerUserId),eq(contents.id,input.contentId))).limit(1);if(!c)throw new Error("Content not found");}await getDatabase().db.update(deliverables).set({status:input.status,contentId:input.contentId,updatedAt:new Date()}).where(and(eq(deliverables.ownerUserId,ownerUserId),eq(deliverables.campaignId,input.campaignId),eq(deliverables.id,input.deliverableId)));}
export async function addCompensation(ownerUserId:string,input:Input<typeof compensationSchema>){if(!await ownsCampaign(ownerUserId,input.campaignId))throw new Error("Campaign not found");await getDatabase().db.insert(compensations).values({id:randomUUID(),ownerUserId,campaignId:input.campaignId,type:input.type,agreedAmountCents:input.amountCents,commissionBasisPoints:input.commissionPercent,expectedPaymentAt:input.expectedPaymentAt,notes:input.notes});}
export async function addPayment(ownerUserId:string,input:Input<typeof paymentSchema>){if(!await ownsCampaign(ownerUserId,input.campaignId))throw new Error("Campaign not found");if(input.compensationId){const [c]=await getDatabase().db.select({id:compensations.id}).from(compensations).where(and(eq(compensations.ownerUserId,ownerUserId),eq(compensations.campaignId,input.campaignId),eq(compensations.id,input.compensationId))).limit(1);if(!c)throw new Error("Compensation not found");}await getDatabase().db.insert(payments).values({id:randomUUID(),ownerUserId,campaignId:input.campaignId,compensationId:input.compensationId,status:input.status,amountCents:input.amountCents,dueAt:input.dueAt,receivedAt:input.status==="received"?(input.receivedAt??new Date()):null,paymentReference:input.paymentReference,notes:input.notes});}
export async function archiveCampaign(ownerUserId:string,id:string){await getDatabase().db.update(campaigns).set({archivedAt:new Date(),updatedAt:new Date()}).where(and(eq(campaigns.ownerUserId,ownerUserId),eq(campaigns.id,id)));}
export async function recoverCampaign(ownerUserId:string,id:string){await getDatabase().db.update(campaigns).set({archivedAt:null,updatedAt:new Date()}).where(and(eq(campaigns.ownerUserId,ownerUserId),eq(campaigns.id,id)));}
