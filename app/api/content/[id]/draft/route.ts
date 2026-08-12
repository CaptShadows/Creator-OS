import { contentAutosaveSchema } from "@/lib/content/contracts";
import { autosaveContent } from "@/lib/content/repository";
import { getCurrentOwner } from "@/lib/auth/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = await getCurrentOwner(); if (!owner) return Response.json({ error: "unauthorized" }, { status: 401 });
  const parsed = contentAutosaveSchema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "invalid_draft", details: parsed.error.flatten() }, { status: 400 });
  const saved = await autosaveContent(owner.id, (await params).id, parsed.data); if (!saved) return Response.json({ error: "version_conflict" }, { status: 409 });
  return Response.json({ status: "saved", updatedAt: saved.updatedAt.toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
