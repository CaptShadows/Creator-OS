import { describe,expect,it } from "vitest";
import { AttachmentValidationError,safeDisplayFilename,safeVideoFilename,validateAttachmentFile,validatePdf,validateVideo } from "@/lib/attachments/validation";

const pdf=new TextEncoder().encode("%PDF-1.7\n%%EOF");
const png=new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]);
const jpeg=new Uint8Array([0xff,0xd8,0xff,0xe0,0,0,0,0]);

describe("document and image attachment validation",()=>{
  it("accepts PDF, PNG, JPG, and JPEG files",()=>{
    expect(validatePdf({filename:"brief.PDF",mimeType:"application/pdf",bytes:pdf},1024)).toMatch(/^[a-f0-9]{64}$/);
    expect(validateAttachmentFile({filename:"reference.PNG",mimeType:"image/png",bytes:png},1024)).toMatch(/^[a-f0-9]{64}$/);
    expect(validateAttachmentFile({filename:"photo.JPG",mimeType:"image/jpeg",bytes:jpeg},1024)).toMatch(/^[a-f0-9]{64}$/);
    expect(validateAttachmentFile({filename:"photo.JPEG",mimeType:"image/jpeg",bytes:jpeg},1024)).toMatch(/^[a-f0-9]{64}$/);
  });
  it("rejects unsupported, mismatched, unsigned, empty, and oversized uploads",()=>{
    expect(()=>validateAttachmentFile({filename:"brief.txt",mimeType:"text/plain",bytes:pdf},1024)).toThrow(AttachmentValidationError);
    expect(()=>validateAttachmentFile({filename:"photo.jpg",mimeType:"image/png",bytes:jpeg},1024)).toThrow("does not match");
    expect(()=>validateAttachmentFile({filename:"brief.pdf",mimeType:"application/pdf",bytes:new TextEncoder().encode("not pdf")},1024)).toThrow("signature");
    expect(()=>validateAttachmentFile({filename:"image.png",mimeType:"image/png",bytes:new Uint8Array()},1024)).toThrow("empty");
    expect(()=>validateAttachmentFile({filename:"brief.pdf",mimeType:"application/pdf",bytes:pdf},5)).toThrow("upload limit");
  });
  it("normalizes display names without changing the declared file type",()=>{
    expect(safeDisplayFilename("../ Brand Brief ")).toBe(".. Brand Brief.pdf");
    expect(safeDisplayFilename("../ Reference Image ","image/png")).toBe(".. Reference Image.png");
    expect(safeDisplayFilename("Photo.JPEG","image/jpeg")).toBe("Photo.JPEG");
    expect(safeDisplayFilename("Photo.png","image/jpeg")).toBe("Photo.jpg");
  });
});

describe("video attachment validation",()=>{
  const mp4=new Uint8Array([0,0,0,20,...new TextEncoder().encode("ftyp"),0,0,0,0]);
  it("accepts signed MP4 videos and preserves a safe extension",()=>{
    expect(validateVideo({filename:"demo.mp4",mimeType:"video/mp4",bytes:mp4},1024)).toMatch(/^[a-f0-9]{64}$/);
    expect(safeVideoFilename("../ Product Demo","video/mp4")).toBe(".. Product Demo.mp4");
  });
  it("rejects mismatched and unsigned videos",()=>{
    expect(()=>validateVideo({filename:"demo.mov",mimeType:"video/mp4",bytes:mp4},1024)).toThrow("does not match");
    expect(()=>validateVideo({filename:"demo.mp4",mimeType:"video/mp4",bytes:new Uint8Array([1,2,3,4,5,6,7,8])},1024)).toThrow("signature");
  });
});
