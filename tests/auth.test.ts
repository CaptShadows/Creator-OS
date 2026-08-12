import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { issueSession, issueTrustedDevice, revokeSession, revokeTrustedDevice, validateSession, validateTrustedDevice, type AuthStore, type StoredSession, type StoredTrustedDevice } from "@/lib/auth/service";

class MemoryAuthStore implements AuthStore {
  sessions: StoredSession[] = [];
  devices: StoredTrustedDevice[] = [];
  async insertSession(session: StoredSession) { this.sessions.push(session); }
  async findSession(tokenHash: string) { return this.sessions.find((item) => item.tokenHash === tokenHash) ?? null; }
  async revokeSession(id: string, revokedAt: Date) { const item = this.sessions.find((session) => session.id === id); if (item) item.revokedAt = revokedAt; }
  async insertTrustedDevice(device: StoredTrustedDevice) { this.devices.push(device); }
  async findTrustedDevice(tokenHash: string) { return this.devices.find((item) => item.tokenHash === tokenHash) ?? null; }
  async revokeTrustedDevice(id: string, revokedAt: Date) { const item = this.devices.find((device) => device.id === id); if (item) item.revokedAt = revokedAt; }
}

describe("authentication primitives", () => {
  it("hashes passwords with a random salt and verifies without retaining plaintext", async () => {
    const first = await hashPassword("correct horse battery staple");
    const second = await hashPassword("correct horse battery staple");
    expect(first).not.toBe(second);
    await expect(verifyPassword("correct horse battery staple", first)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", first)).resolves.toBe(false);
    expect(first).not.toContain("correct horse battery staple");
  });

  it("rejects a revoked session", async () => {
    const store = new MemoryAuthStore();
    const { token } = await issueSession(store, "owner-id");
    expect(await validateSession(store, token)).not.toBeNull();
    await revokeSession(store, token);
    expect(await validateSession(store, token)).toBeNull();
    expect(store.sessions[0].tokenHash).not.toBe(token);
  });

  it("rejects expired sessions", async () => {
    const store = new MemoryAuthStore();
    const now = new Date("2026-08-12T00:00:00Z");
    const { token } = await issueSession(store, "owner-id", now);
    expect(await validateSession(store, token, new Date("2026-08-27T00:00:00Z"))).toBeNull();
  });

  it("issues, validates, and revokes trusted-device tokens", async () => {
    const store = new MemoryAuthStore();
    const { token } = await issueTrustedDevice(store, "owner-id", "Tonya laptop");
    expect((await validateTrustedDevice(store, token))?.label).toBe("Tonya laptop");
    await revokeTrustedDevice(store, token);
    expect(await validateTrustedDevice(store, token)).toBeNull();
    expect(store.devices[0].tokenHash).not.toBe(token);
  });
});
