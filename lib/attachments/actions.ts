"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/auth/server";
import { archiveAttachment, renameAttachment, restoreAttachment } from "./repository";
const input=z.object({attachmentId:z.string().uuid(),returnTo:z.string().startsWith("/")});
export async function renameAttachmentAction(f:FormData){const o=await requireOwner(),x=input.extend({name:z.string().min(1).max(240)}).parse({attachmentId:f.get("attachmentId"),returnTo:f.get("returnTo"),name:f.get("name")});await renameAttachment(o.id,x.attachmentId,x.name);revalidatePath(x.returnTo);}
export async function archiveAttachmentAction(f:FormData){const o=await requireOwner(),x=input.parse({attachmentId:f.get("attachmentId"),returnTo:f.get("returnTo")});await archiveAttachment(o.id,x.attachmentId);revalidatePath(x.returnTo);}
export async function restoreAttachmentAction(f:FormData){const o=await requireOwner(),x=input.parse({attachmentId:f.get("attachmentId"),returnTo:f.get("returnTo")});await restoreAttachment(o.id,x.attachmentId);revalidatePath(x.returnTo);}
