import { createHash } from "node:crypto";

export class AttachmentValidationError extends Error {}

export function validatePdf(input: { filename: string; mimeType: string; bytes: Uint8Array }, maxBytes: number) {
  const lower=input.filename.toLowerCase(),pdf=lower.endsWith(".pdf")&&input.mimeType==="application/pdf",png=lower.endsWith(".png")&&input.mimeType==="image/png",jpeg=(lower.endsWith(".jpg")||lower.endsWith(".jpeg"))&&input.mimeType==="image/jpeg";
  if(!pdf&&!png&&!jpeg)throw new AttachmentValidationError("Only PDF, PNG, JPG, and JPEG files are supported.");
  if (!input.bytes.length) throw new AttachmentValidationError("The file is empty.");
  if (input.bytes.byteLength > maxBytes) throw new AttachmentValidationError(`The file exceeds the ${maxBytes}-byte upload limit.`);
  const valid=pdf?new TextDecoder().decode(input.bytes.subarray(0,5))==="%PDF-":png?input.bytes.slice(0,8).every((b,i)=>b===[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a][i]):input.bytes[0]===0xff&&input.bytes[1]===0xd8&&input.bytes[2]===0xff;
  if(!valid)throw new AttachmentValidationError("The file signature does not match its type.");
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
  if(/\.(pdf|png|jpe?g)$/i.test(name))return name;
  return `${name}.pdf`;
}

export function safeVideoFilename(value: string, mimeType: string) {
  const name = value.replace(/[\\/\0\r\n]/g, " ").replace(/\s+/g, " ").trim();
  if (!name || name.length > 240) throw new AttachmentValidationError("Filename must be between 1 and 240 characters.");
  const extension = mimeType === "video/mp4" ? ".mp4" : mimeType === "video/quicktime" ? ".mov" : mimeType === "video/webm" ? ".webm" : null;
  if (!extension) throw new AttachmentValidationError("Unsupported video type.");
  return name.toLowerCase().endsWith(extension) ? name : `${name.replace(/\.(mp4|mov|webm)$/i, "")}${extension}`;
}
