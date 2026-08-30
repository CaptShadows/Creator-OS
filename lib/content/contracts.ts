import { z } from "zod";
import { contentStatusSchema } from "@/lib/domain/contracts";
import { contentPriorityValues } from "./priority";

const optionalText = (max: number) => z.string().max(max).nullable();
export const contentPrioritySchema = z.enum(contentPriorityValues);

export const quickIdeaSchema = z.object({ idea: z.string().trim().min(1, "Write the idea first.").max(10_000), priority: contentPrioritySchema.default("medium") });
export const contentAutosaveSchema = z.object({
  title: z.string().trim().min(1).max(200), concept: optionalText(10_000), hook: optionalText(10_000), script: optionalText(50_000), caption: optionalText(20_000), notes: optionalText(20_000), contentType: optionalText(100), contentPillar: optionalText(100), priority: contentPrioritySchema,
  baseUpdatedAt: z.string().datetime(),
});
export const contentTransitionSchema = z.object({ contentId: z.string().uuid(), to: contentStatusSchema });
export const contentAssociationsSchema = z.object({ contentId: z.string().uuid(), campaignIds: z.array(z.string().uuid()), productIds: z.array(z.string().uuid()), platformAccountIds: z.array(z.string().uuid()) });

export type ContentAutosaveInput = z.infer<typeof contentAutosaveSchema>;

export function pendingDraftKey(ownerId: string, contentId: string): string { return `creator-os:draft:${ownerId}:${contentId}`; }
