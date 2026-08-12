import "server-only";

import { eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { sessions, trustedDevices } from "@/db/schema";
import type { AuthStore, StoredSession, StoredTrustedDevice } from "./service";

export const postgresAuthStore: AuthStore = {
  async insertSession(session) { await getDatabase().db.insert(sessions).values(session); },
  async findSession(tokenHash) {
    const [row] = await getDatabase().db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash)).limit(1);
    return row ? toSession(row) : null;
  },
  async revokeSession(id, revokedAt) { await getDatabase().db.update(sessions).set({ revokedAt }).where(eq(sessions.id, id)); },
  async insertTrustedDevice(device) { await getDatabase().db.insert(trustedDevices).values(device); },
  async findTrustedDevice(tokenHash) {
    const [row] = await getDatabase().db.select().from(trustedDevices).where(eq(trustedDevices.tokenHash, tokenHash)).limit(1);
    return row ? { ...toSession(row), label: row.label } : null;
  },
  async revokeTrustedDevice(id, revokedAt) { await getDatabase().db.update(trustedDevices).set({ revokedAt }).where(eq(trustedDevices.id, id)); },
};

function toSession(row: { id: string; userId: string; tokenHash: string; expiresAt: Date; revokedAt: Date | null }): StoredSession {
  return { id: row.id, userId: row.userId, tokenHash: row.tokenHash, expiresAt: row.expiresAt, revokedAt: row.revokedAt };
}

export type { StoredTrustedDevice };
