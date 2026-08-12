"use client";

import { useEffect, useState } from "react";
import { pendingDraftKey } from "@/lib/content/contracts";

type Draft = { title: string; concept: string; hook: string; script: string; caption: string; notes: string; contentType: string; contentPillar: string };
type Props = { ownerId: string; contentId: string; updatedAt: string; initial: Draft };

export function ContentEditor({ ownerId, contentId, updatedAt, initial }: Props) {
  const storageKey = pendingDraftKey(ownerId, contentId);
  const [draft, setDraft] = useState(initial); const [baseUpdatedAt, setBaseUpdatedAt] = useState(updatedAt); const [dirty, setDirty] = useState(false); const [saveState, setSaveState] = useState<"saved"|"saving"|"offline"|"conflict">("saved");

  useEffect(() => { queueMicrotask(() => { const pending = window.localStorage.getItem(storageKey); if (!pending) return; try { const restored = JSON.parse(pending) as { draft: Draft; baseUpdatedAt: string }; setDraft(restored.draft); setBaseUpdatedAt(restored.baseUpdatedAt); setDirty(true); setSaveState("offline"); } catch { window.localStorage.removeItem(storageKey); } }); }, [storageKey]);
  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        const response = await fetch(`/api/content/${contentId}/draft`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...nullableDraft(draft), baseUpdatedAt }) });
        if (response.status === 409) { setSaveState("conflict"); return; }
        if (!response.ok) throw new Error("save failed");
        const result = await response.json() as { updatedAt: string }; setBaseUpdatedAt(result.updatedAt); setDirty(false); setSaveState("saved"); window.localStorage.removeItem(storageKey);
      } catch { setSaveState("offline"); }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [baseUpdatedAt, contentId, dirty, draft, storageKey]);

  const update = (field: keyof Draft, value: string) => { const next = { ...draft, [field]: value }; setDraft(next); setDirty(true); setSaveState("offline"); window.localStorage.setItem(storageKey, JSON.stringify({ draft: next, baseUpdatedAt })); };
  const statusText = saveState === "saved" ? "Saved" : saveState === "saving" ? "Saving…" : saveState === "conflict" ? "Newer server version found — copy your draft before refreshing" : "Changes kept on this device until the server is available";

  return <section className="space-y-5"><div role="status" className={`text-sm font-bold ${saveState === "conflict" ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"}`}>{statusText}</div>
    <div className="grid gap-5 lg:grid-cols-2"><Field label="Title" value={draft.title} onChange={(value) => update("title", value)} /><Field label="Concept" value={draft.concept} onChange={(value) => update("concept", value)} multiline /></div>
    <Field label="Hook" value={draft.hook} onChange={(value) => update("hook", value)} multiline />
    <Field label="Script" value={draft.script} onChange={(value) => update("script", value)} multiline long />
    <Field label="Caption" value={draft.caption} onChange={(value) => update("caption", value)} multiline />
    <div className="grid gap-5 lg:grid-cols-2"><Field label="Content type" value={draft.contentType} onChange={(value) => update("contentType", value)} /><Field label="Content pillar" value={draft.contentPillar} onChange={(value) => update("contentPillar", value)} /></div>
    <Field label="Notes" value={draft.notes} onChange={(value) => update("notes", value)} multiline />
  </section>;
}

function Field({ label, value, onChange, multiline = false, long = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; long?: boolean }) { const classes="w-full border border-[var(--line)] bg-white p-3 font-normal leading-6 outline-none focus:border-[var(--accent-strong)]"; return <label className="grid gap-2 text-sm font-bold">{label}{multiline ? <textarea rows={long ? 12 : 4} value={value} onChange={(event) => onChange(event.target.value)} className={`${classes} resize-y`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={`min-h-12 ${classes}`} />}</label>; }
function nullableDraft(draft: Draft) { return Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim() || null])); }
