import { z } from "zod";

export const changeEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  currentPassword: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12, "New password must be at least 12 characters"),
  confirmPassword: z.string().min(1),
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "New password must be different",
  path: ["newPassword"],
});
