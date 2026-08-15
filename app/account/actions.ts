"use server";

import { redirect } from "next/navigation";
import { logoutOwner, requireOwner } from "@/lib/auth/server";
import { changeEmailSchema, changePasswordSchema } from "@/lib/account/contracts";
import { changeOwnerEmail, changeOwnerPassword } from "@/lib/account/server";

export async function changeEmailAction(form: FormData): Promise<void> {
  const owner = await requireOwner("/account");
  const parsed = changeEmailSchema.safeParse({ email: form.get("email"), currentPassword: form.get("currentPassword") });
  if (!parsed.success) redirect("/account?emailError=invalid");
  const result = await changeOwnerEmail(owner.id, parsed.data.email, parsed.data.currentPassword);
  if (result === "invalid-password") redirect("/account?emailError=password");
  if (result === "email-in-use") redirect("/account?emailError=in-use");
  if (result === "unchanged") redirect("/account?emailError=unchanged");
  redirect("/account?emailChanged=1");
}

export async function changePasswordAction(form: FormData): Promise<void> {
  const owner = await requireOwner("/account");
  const parsed = changePasswordSchema.safeParse({ currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword"), confirmPassword: form.get("confirmPassword") });
  if (!parsed.success) redirect("/account?passwordError=invalid");
  const result = await changeOwnerPassword(owner.id, parsed.data.currentPassword, parsed.data.newPassword);
  if (result === "invalid-password") redirect("/account?passwordError=current");
  await logoutOwner();
  redirect("/login?passwordChanged=1");
}
