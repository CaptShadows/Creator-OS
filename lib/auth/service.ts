import { randomUUID } from "node:crypto";
import { createOpaqueToken, hashToken } from "./tokens";

export type StoredSession = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type StoredTrustedDevice = StoredSession & { label: string };

export interface AuthStore {
  insertSession(session: StoredSession): Promise<void>;
  findSession(tokenHash: string): Promise<StoredSession | null>;
  revokeSession(id: string, revokedAt: Date): Promise<void>;
  insertTrustedDevice(device: StoredTrustedDevice): Promise<void>;
  findTrustedDevice(tokenHash: string): Promise<StoredTrustedDevice | null>;
  revokeTrustedDevice(id: string, revokedAt: Date): Promise<void>;
}

export async function issueSession(store: AuthStore, userId: string, now = new Date()): Promise<{ token: string; session: StoredSession }> {
  const token = createOpaqueToken();
  const session: StoredSession = { id: randomUUID(), userId, tokenHash: hashToken(token), expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14), revokedAt: null };
  await store.insertSession(session);
  return { token, session };
}

export async function validateSession(store: AuthStore, token: string, now = new Date()): Promise<StoredSession | null> {
  const session = await store.findSession(hashToken(token));
  if (!session || session.revokedAt || session.expiresAt <= now) return null;
  return session;
}

export async function revokeSession(store: AuthStore, token: string, now = new Date()): Promise<void> {
  const session = await store.findSession(hashToken(token));
  if (session && !session.revokedAt) await store.revokeSession(session.id, now);
}

export async function issueTrustedDevice(store: AuthStore, userId: string, label: string, now = new Date()): Promise<{ token: string; device: StoredTrustedDevice }> {
  const token = createOpaqueToken();
  const device: StoredTrustedDevice = { id: randomUUID(), userId, label, tokenHash: hashToken(token), expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 90), revokedAt: null };
  await store.insertTrustedDevice(device);
  return { token, device };
}

export async function validateTrustedDevice(store: AuthStore, token: string, now = new Date()): Promise<StoredTrustedDevice | null> {
  const device = await store.findTrustedDevice(hashToken(token));
  if (!device || device.revokedAt || device.expiresAt <= now) return null;
  return device;
}

export async function revokeTrustedDevice(store: AuthStore, token: string, now = new Date()): Promise<void> {
  const device = await store.findTrustedDevice(hashToken(token));
  if (device && !device.revokedAt) await store.revokeTrustedDevice(device.id, now);
}
