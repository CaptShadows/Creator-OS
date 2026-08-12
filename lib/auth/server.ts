import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { auditEvents, users } from "@/db/schema";
import { postgresAuthStore } from "./postgres-store";
import { issueSession, revokeSession, validateSession } from "./service";
import { verifyPassword } from "./password";

export const SESSION_COOKIE = "creator_os_session";

export async function authenticateOwner(email: string, password: string): Promise<boolean> {
  const [user] = await getDatabase().db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) return false;

  const { token, session } = await issueSession(postgresAuthStore, user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: session.expiresAt });
  await getDatabase().db.insert(auditEvents).values({ id: randomUUID(), actorUserId: user.id, eventType: "auth.login" });
  return true;
}

export async function getCurrentOwner(): Promise<{ id: string; email: string; displayName: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await validateSession(postgresAuthStore, token);
  if (!session) return null;
  const [user] = await getDatabase().db.select({ id: users.id, email: users.email, displayName: users.displayName }).from(users).where(eq(users.id, session.userId)).limit(1);
  return user ?? null;
}

export async function logoutOwner(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(postgresAuthStore, token);
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireOwner(): Promise<{ id: string; email: string; displayName: string }> {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/login");
  return owner;
}
