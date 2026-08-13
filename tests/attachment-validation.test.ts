import { describe,expect,it } from "vitest";
import { AttachmentValidationError,safeDisplayFilename,validatePdf } from "@/lib/attachments/validation";

const pdf=new TextEncoder().encode("%PDF-1.7\n%%EOF");
describe("PDF attachment validation",()=>{
  it("accepts a signed PDF and returns a stable checksum",()=>{expect(validatePdf({filename:"brief.pdf",mimeType:"application/pdf",bytes:pdf},1024)).toMatch(/^[a-f0-9]{64}$/);});
  it("rejects invalid type, signature, and oversized uploads",()=>{
    expect(()=>validatePdf({filename:"brief.txt",mimeType:"text/plain",bytes:pdf},1024)).toThrow(AttachmentValidationError);
    expect(()=>validatePdf({filename:"brief.pdf",mimeType:"application/pdf",bytes:new TextEncoder().encode("not pdf")},1024)).toThrow("signature");
    expect(()=>validatePdf({filename:"brief.pdf",mimeType:"application/pdf",bytes:pdf},5)).toThrow("upload limit");
  });
  it("keeps a display name separate from a safe storage identity",()=>{expect(safeDisplayFilename("../ Brand Brief ")).toBe(".. Brand Brief.pdf");});
});
