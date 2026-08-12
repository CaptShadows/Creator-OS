import { z } from "zod";

export const contentStatuses = ["idea", "scripting", "ready_to_film", "filmed", "edited", "ready_to_post", "posted", "archived"] as const;
export const sampleStatuses = ["requested", "pending", "approved", "shipped", "arrived", "content_needed", "completed"] as const;
export const supportedPlatforms = ["instagram", "facebook", "tiktok", "youtube", "amazon", "shopmy", "tribe"] as const;

export const contentStatusSchema = z.enum(contentStatuses);
export const sampleStatusSchema = z.enum(sampleStatuses);
export const platformSchema = z.enum(supportedPlatforms);
export const extensionMetadataSchema = z.record(z.string(), z.unknown());

export const contentInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  concept: z.string().trim().max(10_000).optional(),
  status: contentStatusSchema.default("idea"),
  priority: z.number().int().min(0).max(100).default(0),
});

export const platformAccountInputSchema = z.object({
  platform: platformSchema,
  displayName: z.string().trim().min(1).max(200),
  handle: z.string().trim().max(200).optional(),
  externalAccountId: z.string().trim().max(500).optional(),
  metadata: extensionMetadataSchema.default({}),
});

export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type SampleStatus = z.infer<typeof sampleStatusSchema>;
export type SupportedPlatform = z.infer<typeof platformSchema>;
