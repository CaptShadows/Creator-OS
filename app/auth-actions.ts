"use server";

import { redirect } from "next/navigation";
import { authenticateOwner, logoutOwner } from "@/lib/auth/server";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let authenticated = false;
  try {
    authenticated = await authenticateOwner(email, password);
  } catch {
    redirect("/login?error=unavailable");
  }
  if (!authenticated) redirect("/login?error=invalid");
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await logoutOwner();
  redirect("/login");
}
