import { z } from "zod";

const optionalText = z.string().trim().max(10000).optional().transform((value) => value || null);
const optionalDate = z.string().optional().transform((value) => value ? new Date(`${value}T12:00:00.000Z`) : null);
const money = z.string().trim().optional().transform((value, ctx) => {
  if (!value) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) { ctx.addIssue({ code: "custom", message: "Enter a valid amount" }); return z.NEVER; }
  return Math.round(amount * 100);
});

export const createCampaignSchema = z.object({ brandName: z.string().trim().min(1).max(200), name: z.string().trim().min(1).max(300) });
export const campaignEditSchema = z.object({ campaignId: z.uuid(), name: z.string().trim().min(1).max(300), status: z.enum(["planned", "active", "complete", "cancelled"]), startAt: optionalDate, dueAt: optionalDate, briefReference: optionalText, notes: optionalText });
export const deliverableSchema = z.object({ campaignId: z.uuid(), title: z.string().trim().min(1).max(300), status: z.enum(["not_started", "in_progress", "submitted", "completed"]), dueAt: optionalDate, requiredPlatform: optionalText, contentId: z.string().optional().transform((value) => value || null).pipe(z.uuid().nullable()), newContentIdea: optionalText, notes: optionalText }).refine((value)=>!(value.contentId&&value.newContentIdea),{message:"Choose existing content or create a new idea, not both"});
export const deliverableUpdateSchema = z.object({ campaignId:z.uuid(),deliverableId:z.uuid(),status:z.enum(["not_started","in_progress","submitted","completed"]),contentId:z.string().optional().transform((value)=>value||null).pipe(z.uuid().nullable()) });
export const compensationSchema = z.object({ campaignId: z.uuid(), type: z.enum(["fixed_fee", "gifted_product", "commission", "bonus"]), amountCents: money, commissionPercent: z.string().trim().optional().transform((value, ctx) => { if (!value) return null; const n=Number(value); if (!Number.isFinite(n)||n<0||n>100){ctx.addIssue({code:"custom",message:"Enter a percentage from 0 to 100"});return z.NEVER;} return Math.round(n*100); }), expectedPaymentAt: optionalDate, notes: optionalText });
export const paymentSchema = z.object({ campaignId: z.uuid(), compensationId: z.string().optional().transform((value)=>value||null).pipe(z.uuid().nullable()), status: z.enum(["expected", "received"]), amountCents: money.pipe(z.number().int().nonnegative()), dueAt: optionalDate, receivedAt: optionalDate, paymentReference: optionalText, notes: optionalText });
