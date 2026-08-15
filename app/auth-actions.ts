"use server";

import { redirect } from "next/navigation";
import { authenticateOwner, logoutOwner } from "@/lib/auth/server";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const requestedPath = String(formData.get("next") ?? "");
  const nextPath = requestedPath.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/";

  let authenticated = false;
  try {
    authenticated = await authenticateOwner(email, password);
  } catch {
    redirect(`/login?error=unavailable&next=${encodeURIComponent(nextPath)}`);
  }
  if (!authenticated) redirect(`/login?error=invalid&next=${encodeURIComponent(nextPath)}`);
  redirect(nextPath);
}

export async function logoutAction(): Promise<void> {
  await logoutOwner();
  redirect("/login");
}
