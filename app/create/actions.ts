"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/server";
import { contentAssociationsSchema, contentTransitionSchema, quickIdeaSchema } from "@/lib/content/contracts";
import { archiveContent, createQuickIdea, permanentlyDeleteContent, recoverContent, replaceContentAssociations, transitionContent } from "@/lib/content/repository";
import { duplicateToken,duplicateWarningUrl,findDuplicates,validDuplicateToken } from "@/lib/duplicates/server";

export async function createIdeaAction(formData: FormData): Promise<void> {
  const owner = await requireOwner(); const { idea, priority } = quickIdeaSchema.parse({ idea: formData.get("idea"), priority: formData.get("priority") || "medium" });const title=idea.split(/\r?\n/)[0].trim().slice(0,200)||"Untitled idea",matches=await findDuplicates(owner.id,"content",title);if(matches.length&&!validDuplicateToken(String(formData.get("duplicateToken")||""),owner.id,"content",title))redirect(duplicateWarningUrl("/create",{idea,priority},duplicateToken(owner.id,"content",title),matches)); const id = await createQuickIdea(owner.id, idea, priority); redirect(`/create/${id}`);
}
export async function transitionContentAction(formData: FormData): Promise<void> {
  const owner = await requireOwner(); const input = contentTransitionSchema.parse({ contentId: formData.get("contentId"), to: formData.get("to") }); if (!(await transitionContent(owner.id, input.contentId, input.to))) throw new Error("Invalid content lifecycle transition"); revalidatePath(`/create/${input.contentId}`); revalidatePath("/create");
}
export async function archiveContentAction(formData: FormData): Promise<void> {
  const owner = await requireOwner(); const id = String(formData.get("contentId")); await archiveContent(owner.id, id); revalidatePath("/create"); redirect("/create");
}
export async function recoverContentAction(formData: FormData): Promise<void> {
  const owner = await requireOwner(); const id = String(formData.get("contentId")); await recoverContent(owner.id, id); revalidatePath("/create");
}
export async function permanentlyDeleteContentAction(formData:FormData){const owner=await requireOwner(),id=String(formData.get("contentId"));if(!await permanentlyDeleteContent(owner.id,id))redirect(`/create/${id}?deleteError=Remove%20publications%2C%20deliverable%2Fsample%20links%2C%20and%20attachments%20before%20deleting.`);revalidatePath("/create");redirect("/create?deleted=1");}
export async function saveAssociationsAction(formData: FormData): Promise<void> {
  const owner = await requireOwner(); const input = contentAssociationsSchema.parse({ contentId: formData.get("contentId"), campaignIds: formData.getAll("campaignIds"), productIds: formData.getAll("productIds"), platformAccountIds: formData.getAll("platformAccountIds") }); await replaceContentAssociations(owner.id, input.contentId, input.campaignIds, input.productIds, input.platformAccountIds); revalidatePath(`/create/${input.contentId}`);
}
