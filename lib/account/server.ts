import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, isNull, ne } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { auditEvents, sessions, users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type AccountChangeResult = "changed" | "invalid-password" | "email-in-use" | "unchanged";

export async function changeOwnerEmail(userId: string, email: string, currentPassword: string): Promise<AccountChangeResult> {
  const database = getDatabase().db;
  const [owner] = await database.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!owner || !(await verifyPassword(currentPassword, owner.passwordHash))) return "invalid-password";
  if (owner.email === email) return "unchanged";
  const [duplicate] = await database.select({ id: users.id }).from(users).where(and(eq(users.email, email), ne(users.id, userId))).limit(1);
  if (duplicate) return "email-in-use";

  await database.transaction(async (tx) => {
    await tx.update(users).set({ email, updatedAt: new Date() }).where(eq(users.id, userId));
    await tx.insert(auditEvents).values({ id: randomUUID(), actorUserId: userId, eventType: "auth.email_changed" });
  });
  return "changed";
}

export async function changeOwnerPassword(userId: string, currentPassword: string, newPassword: string): Promise<AccountChangeResult> {
  const database = getDatabase().db;
  const [owner] = await database.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!owner || !(await verifyPassword(currentPassword, owner.passwordHash))) return "invalid-password";
  const now = new Date();
  const passwordHash = await hashPassword(newPassword);
  await database.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, userId));
    await tx.update(sessions).set({ revokedAt: now }).where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
    await tx.insert(auditEvents).values({ id: randomUUID(), actorUserId: userId, eventType: "auth.password_changed" });
  });
  return "changed";
}
