import { getCurrentOwner } from "@/lib/auth/server";
import {
  createAttachment,
  type AttachmentKind,
  type AttachmentTarget,
} from "@/lib/attachments/repository";
import { configuredAttachmentStorage } from "@/lib/attachments/storage";
import { AttachmentValidationError } from "@/lib/attachments/validation";
import { attachmentRedirect } from "@/lib/attachments/redirect";

const targetTypes = new Set([
  "content",
  "campaign",
  "deliverable",
  "product",
  "sample",
  "brandDeal",
]);

export async function POST(request: Request) {
  const owner = await getCurrentOwner();
  if (!owner) return Response.json({ error: "unauthorized" }, { status: 401 });
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "invalid_form" }, { status: 400 });
  }
  const file = form.get("file"),
    targetType = String(form.get("targetType")),
    targetId = String(form.get("targetId")),
    kind = String(form.get("attachmentKind") || "pdf") as AttachmentKind;
  if (
    !(file instanceof File) ||
    !targetTypes.has(targetType) ||
    !targetId ||
    !new Set(["pdf", "video"]).has(kind)
  )
    return Response.json({ error: "invalid_upload" }, { status: 400 });
  try {
    const { config, storage } = configuredAttachmentStorage(),
      maxBytes = kind === "video" ? config.maxVideoBytes : config.maxBytes;
    if (file.size > maxBytes)
      throw new AttachmentValidationError(
        `The ${kind} exceeds the ${maxBytes}-byte upload limit.`,
      );
    await createAttachment(
      owner.id,
      { type: targetType as AttachmentTarget["type"], id: targetId },
      {
        filename: file.name,
        mimeType: file.type,
        bytes: new Uint8Array(await file.arrayBuffer()),
      },
      storage,
      maxBytes,
      kind,
    );
    return attachmentRedirect(form.get("returnTo"), "attachment", "uploaded");
  } catch (error) {
    const message =
      error instanceof AttachmentValidationError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Upload failed";
    return attachmentRedirect(form.get("returnTo"), "attachmentError", message);
  }
}
