"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/server";
import { contentAssociationsSchema, contentTransitionSchema, quickIdeaSchema } from "@/lib/content/contracts";
import { archiveContent, createQuickIdea, recoverContent, replaceContentAssociations, transitionContent } from "@/lib/content/repository";

export async function createIdeaAction(formData: FormData): Promise<void> {
  const owner = await requireOwner(); const { idea } = quickIdeaSchema.parse({ idea: formData.get("idea") }); const id = await createQuickIdea(owner.id, idea); redirect(`/create/${id}`);
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
export async function saveAssociationsAction(formData: FormData): Promise<void> {
  const owner = await requireOwner(); const input = contentAssociationsSchema.parse({ contentId: formData.get("contentId"), campaignIds: formData.getAll("campaignIds"), productIds: formData.getAll("productIds"), platformAccountIds: formData.getAll("platformAccountIds") }); await replaceContentAssociations(owner.id, input.contentId, input.campaignIds, input.productIds, input.platformAccountIds); revalidatePath(`/create/${input.contentId}`);
}
