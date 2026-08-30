import { createHash } from "node:crypto";

export class AttachmentValidationError extends Error {}

const attachmentTypes = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
} as const;

function attachmentExtension(filename: string) {
  const lower = filename.toLowerCase();
  return Object.keys(attachmentTypes).find((ext) => lower.endsWith(ext)) as keyof typeof attachmentTypes | undefined;
}

export function validateAttachmentFile(input: { filename: string; mimeType: string; bytes: Uint8Array }, maxBytes: number) {
  const extension = attachmentExtension(input.filename);
  if (!extension) throw new AttachmentValidationError("Only PDF, PNG, JPG, and JPEG files are supported.");
  if (input.mimeType !== attachmentTypes[extension]) throw new AttachmentValidationError("The uploaded file type does not match its filename.");
  if (!input.bytes.length) throw new AttachmentValidationError("The attachment is empty.");
  if (input.bytes.byteLength > maxBytes) throw new AttachmentValidationError(`The attachment exceeds the ${maxBytes}-byte upload limit.`);

  const isPdf = new TextDecoder().decode(input.bytes.subarray(0, 5)) === "%PDF-";
  const isPng = input.bytes.length >= 8 &&
    input.bytes[0] === 0x89 && input.bytes[1] === 0x50 && input.bytes[2] === 0x4e && input.bytes[3] === 0x47 &&
    input.bytes[4] === 0x0d && input.bytes[5] === 0x0a && input.bytes[6] === 0x1a && input.bytes[7] === 0x0a;
  const isJpeg = input.bytes.length >= 3 && input.bytes[0] === 0xff && input.bytes[1] === 0xd8 && input.bytes[2] === 0xff;

  const signatureValid = extension === ".pdf" ? isPdf : extension === ".png" ? isPng : isJpeg;
  if (!signatureValid) throw new AttachmentValidationError("The file does not contain a valid signature for its declared type.");

  return createHash("sha256").update(input.bytes).digest("hex");
}

// Backward-compatible export for existing callers/tests while attachments transition
// from PDF-only support to the shared document/image policy.
export const validatePdf = validateAttachmentFile;

const videoTypes = { ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm" } as const;

export function validateVideo(input: { filename: string; mimeType: string; bytes: Uint8Array }, maxBytes: number) {
  const extension = Object.keys(videoTypes).find(ext => input.filename.toLowerCase().endsWith(ext)) as keyof typeof videoTypes | undefined;
  if (!extension) throw new AttachmentValidationError("Only .mp4, .mov, and .webm video files are supported.");
  if (input.mimeType !== videoTypes[extension]) throw new AttachmentValidationError("The video file type does not match its filename.");
  if (!input.bytes.length) throw new AttachmentValidationError("The video is empty.");
  if (input.bytes.byteLength > maxBytes) throw new AttachmentValidationError(`The video exceeds the ${maxBytes}-byte upload limit.`);
  const mp4Signature = new TextDecoder().decode(input.bytes.subarray(4, 8)) === "ftyp";
  const webmSignature = input.bytes[0] === 0x1a && input.bytes[1] === 0x45 && input.bytes[2] === 0xdf && input.bytes[3] === 0xa3;
  if (extension === ".webm" ? !webmSignature : !mp4Signature) throw new AttachmentValidationError("The file does not contain a valid video signature.");
  return createHash("sha256").update(input.bytes).digest("hex");
}

export function safeDisplayFilename(value: string, mimeType = "application/pdf") {
  const name = value.replace(/[\\/\0\r\n]/g, " ").replace(/\s+/g, " ").trim();
  if (!name || name.length > 240) throw new AttachmentValidationError("Filename must be between 1 and 240 characters.");
  const extension = mimeType === "application/pdf" ? ".pdf" : mimeType === "image/png" ? ".png" : mimeType === "image/jpeg" ? (name.toLowerCase().endsWith(".jpeg") ? ".jpeg" : ".jpg") : null;
  if (!extension) throw new AttachmentValidationError("Unsupported attachment type.");
  return name.toLowerCase().endsWith(extension) ? name : `${name.replace(/\.(pdf|png|jpe?g)$/i, "")}${extension}`;
}

export function safeVideoFilename(value: string, mimeType: string) {
  const name = value.replace(/[\\/\0\r\n]/g, " ").replace(/\s+/g, " ").trim();
  if (!name || name.length > 240) throw new AttachmentValidationError("Filename must be between 1 and 240 characters.");
  const extension = mimeType === "video/mp4" ? ".mp4" : mimeType === "video/quicktime" ? ".mov" : mimeType === "video/webm" ? ".webm" : null;
  if (!extension) throw new AttachmentValidationError("Unsupported video type.");
  return name.toLowerCase().endsWith(extension) ? name : `${name.replace(/\.(mp4|mov|webm)$/i, "")}${extension}`;
}
