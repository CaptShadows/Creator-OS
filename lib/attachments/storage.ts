import "server-only";

import { mkdir, open, readFile, rename, rm } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { isValidAttachmentStorageKey } from "./validation";

export interface AttachmentStorage {
  put(key: string, bytes: Uint8Array): Promise<void>;
  read(key: string): Promise<Uint8Array>;
  remove(key: string): Promise<void>;
}

export type AttachmentConfig = { storagePath: string; maxBytes: number; maxVideoBytes: number };

export function getAttachmentConfig(env = process.env): AttachmentConfig {
  const rawPath = env.ATTACHMENT_STORAGE_PATH?.trim();
  if (!rawPath) throw new Error("Attachment storage is unavailable: ATTACHMENT_STORAGE_PATH is not configured.");
  const storagePath = resolve(rawPath);
  if (!isAbsolute(rawPath)) throw new Error("ATTACHMENT_STORAGE_PATH must be an absolute host path.");
  const fromRepo = relative(resolve(/* turbopackIgnore: true */ process.cwd()), storagePath);
  if (fromRepo === "" || (!fromRepo.startsWith("..") && !isAbsolute(fromRepo))) throw new Error("ATTACHMENT_STORAGE_PATH must be outside the Creator OS repository.");
  const maxBytes = Number(env.ATTACHMENT_MAX_BYTES ?? 10 * 1024 * 1024);
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1024) throw new Error("ATTACHMENT_MAX_BYTES must be an integer of at least 1024 bytes.");
  const maxVideoBytes = Number(env.ATTACHMENT_MAX_VIDEO_BYTES ?? 250 * 1024 * 1024);
  if (!Number.isSafeInteger(maxVideoBytes) || maxVideoBytes < 1024) throw new Error("ATTACHMENT_MAX_VIDEO_BYTES must be an integer of at least 1024 bytes.");
  return { storagePath, maxBytes, maxVideoBytes };
}

export class FileSystemAttachmentStorage implements AttachmentStorage {
  constructor(private readonly root: string) {}
  private path(key: string) {
    if (!isValidAttachmentStorageKey(key)) throw new Error("Invalid attachment storage key");
    return resolve(this.root, key);
  }
  async put(key: string, bytes: Uint8Array) {
    const finalPath = this.path(key); const tempPath = `${finalPath}.tmp-${crypto.randomUUID()}`;
    await mkdir(dirname(finalPath), { recursive: true });
    const handle = await open(tempPath, "wx", 0o600);
    try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
    try { await rename(tempPath, finalPath); } catch (error) { await rm(tempPath, { force: true }); throw error; }
  }
  read(key: string) { return readFile(this.path(key)); }
  async remove(key: string) { await rm(this.path(key), { force: true }); }
}

export function configuredAttachmentStorage() {
  const config = getAttachmentConfig();
  return { config, storage: new FileSystemAttachmentStorage(config.storagePath) };
}
