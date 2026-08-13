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

export function safeDisplayFilename(value: string) {
  const name = value.replace(/[\\/\0\r\n]/g, " ").replace(/\s+/g, " ").trim();
  if (!name || name.length > 240) throw new AttachmentValidationError("Filename must be between 1 and 240 characters.");
  return name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
}
