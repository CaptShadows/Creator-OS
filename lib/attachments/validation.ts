import { createHash } from "node:crypto";

export class AttachmentValidationError extends Error {}

export function validatePdf(input: { filename: string; mimeType: string; bytes: Uint8Array }, maxBytes: number) {
  if (!input.filename.toLowerCase().endsWith(".pdf")) throw new AttachmentValidationError("Only .pdf files are supported.");
  if (input.mimeType !== "application/pdf") throw new AttachmentValidationError("The uploaded file must have the application/pdf content type.");
  if (!input.bytes.length) throw new AttachmentValidationError("The PDF is empty.");
  if (input.bytes.byteLength > maxBytes) throw new AttachmentValidationError(`The PDF exceeds the ${maxBytes}-byte upload limit.`);
  if (new TextDecoder().decode(input.bytes.subarray(0, 5)) !== "%PDF-") throw new AttachmentValidationError("The file does not contain a valid PDF signature.");
  return createHash("sha256").update(input.bytes).digest("hex");
}

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

export function safeDisplayFilename(value: string) {
  const name = value.replace(/[\\/\0\r\n]/g, " ").replace(/\s+/g, " ").trim();
  if (!name || name.length > 240) throw new AttachmentValidationError("Filename must be between 1 and 240 characters.");
  return name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
}

export function safeVideoFilename(value: string, mimeType: string) {
  const name = value.replace(/[\\/\0\r\n]/g, " ").replace(/\s+/g, " ").trim();
  if (!name || name.length > 240) throw new AttachmentValidationError("Filename must be between 1 and 240 characters.");
  const extension = mimeType === "video/mp4" ? ".mp4" : mimeType === "video/quicktime" ? ".mov" : mimeType === "video/webm" ? ".webm" : null;
  if (!extension) throw new AttachmentValidationError("Unsupported video type.");
  return name.toLowerCase().endsWith(extension) ? name : `${name.replace(/\.(mp4|mov|webm)$/i, "")}${extension}`;
}
