import { describe, expect, it } from "vitest";
import {
  AttachmentValidationError,
  isValidAttachmentStorageKey,
  normalizeAttachmentMime,
  safeDisplayFilename,
  safeVideoFilename,
  validatePdf,
  validateVideo,
} from "@/lib/attachments/validation";
import { attachmentRedirect } from "@/lib/attachments/redirect";

const pdf = new TextEncoder().encode("%PDF-1.7\n%%EOF");
describe("PDF attachment validation", () => {
  it("accepts a signed PDF and returns a stable checksum", () => {
    expect(
      validatePdf(
        { filename: "brief.pdf", mimeType: "application/pdf", bytes: pdf },
        1024,
      ),
    ).toMatch(/^[a-f0-9]{64}$/);
  });
  it("rejects invalid type, signature, and oversized uploads", () => {
    expect(() =>
      validatePdf(
        { filename: "brief.txt", mimeType: "text/plain", bytes: pdf },
        1024,
      ),
    ).toThrow(AttachmentValidationError);
    expect(() =>
      validatePdf(
        {
          filename: "brief.pdf",
          mimeType: "application/pdf",
          bytes: new TextEncoder().encode("not pdf"),
        },
        1024,
      ),
    ).toThrow("signature");
    expect(() =>
      validatePdf(
        { filename: "brief.pdf", mimeType: "application/pdf", bytes: pdf },
        5,
      ),
    ).toThrow("upload limit");
  });
  it("keeps a display name separate from a safe storage identity", () => {
    expect(safeDisplayFilename("../ Brand Brief ")).toBe(".. Brand Brief.pdf");
  });
  it("accepts signed PNG and JPEG images", () => {
    const png = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1,
      ]),
      jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 0xff, 0xd9, 0, 0]);
    expect(
      validatePdf(
        { filename: "reference.PNG", mimeType: "image/png", bytes: png },
        1024,
      ),
    ).toMatch(/^[a-f0-9]{64}$/);
    expect(
      validatePdf(
        { filename: "reference.JPEG", mimeType: "image/jpeg", bytes: jpg },
        1024,
      ),
    ).toMatch(/^[a-f0-9]{64}$/);
  });
  it("normalizes common browser JPG MIME variants before validation", () => {
    expect(normalizeAttachmentMime("photo.jpg", "image/jpg")).toBe("image/jpeg");
    expect(normalizeAttachmentMime("photo.jpeg", "image/pjpeg")).toBe("image/jpeg");
    expect(normalizeAttachmentMime("photo.jpg", "application/octet-stream")).toBe("image/jpeg");
    expect(normalizeAttachmentMime("photo.jpg", "")).toBe("image/jpeg");
  });
  it("allows supported image extensions in safe storage keys", () => {
    expect(isValidAttachmentStorageKey("550e8400-e29b-41d4-a716-446655440000.jpg")).toBe(true);
    expect(isValidAttachmentStorageKey("550e8400-e29b-41d4-a716-446655440000.png")).toBe(true);
    expect(isValidAttachmentStorageKey("../unsafe.jpg")).toBe(false);
  });
  it("uses a relative redirect and never exposes the bind address", () => {
    const response = attachmentRedirect(
      "/products/123?tab=files",
      "attachment",
      "uploaded",
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/products/123?tab=files&attachment=uploaded",
    );
    expect(response.headers.get("location")).not.toContain("0.0.0.0");
  });
});

describe("video attachment validation", () => {
  const mp4 = new Uint8Array([
    0,
    0,
    0,
    20,
    ...new TextEncoder().encode("ftyp"),
    0,
    0,
    0,
    0,
  ]);
  it("accepts signed MP4 videos and preserves a safe extension", () => {
    expect(
      validateVideo(
        { filename: "demo.mp4", mimeType: "video/mp4", bytes: mp4 },
        1024,
      ),
    ).toMatch(/^[a-f0-9]{64}$/);
    expect(safeVideoFilename("../ Product Demo", "video/mp4")).toBe(
      ".. Product Demo.mp4",
    );
  });
  it("rejects mismatched and unsigned videos", () => {
    expect(() =>
      validateVideo(
        { filename: "demo.mov", mimeType: "video/mp4", bytes: mp4 },
        1024,
      ),
    ).toThrow("does not match");
    expect(() =>
      validateVideo(
        {
          filename: "demo.mp4",
          mimeType: "video/mp4",
          bytes: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
        },
        1024,
      ),
    ).toThrow("signature");
  });
});
