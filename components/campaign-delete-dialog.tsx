"use client";

import { useEffect, useRef, useState } from "react";

export function CampaignDeleteDialog({ campaignId, campaignName, action }: { campaignId: string; campaignName: string; action: (formData: FormData) => void | Promise<void> }) {
  const [open,setOpen]=useState(false);const trigger=useRef<HTMLButtonElement>(null);const confirm=useRef<HTMLButtonElement>(null);
  const close=()=>{setOpen(false);queueMicrotask(()=>trigger.current?.focus());};
  useEffect(()=>{if(!open)return;confirm.current?.focus();const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")close();};document.addEventListener("keydown",escape);return()=>document.removeEventListener("keydown",escape);},[open]);
  return <>
    <button ref={trigger} type="button" className="min-h-12 text-sm font-bold text-red-800 underline decoration-red-300 underline-offset-4" onClick={() => setOpen(true)}>Delete permanently</button>
    {open&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={(event)=>{if(event.target===event.currentTarget)close();}}>
      <div role="dialog" aria-modal="true" aria-labelledby="delete-campaign-title" className="w-full max-w-lg border border-[var(--line)] bg-white p-6 text-[var(--foreground)] shadow-2xl sm:p-8">
        <p className="eyebrow">Permanent action</p>
        <h2 id="delete-campaign-title" className="display-heading mt-3 text-3xl">Delete this campaign?</h2>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]"><strong>{campaignName}</strong> will be permanently removed. This cannot be undone. Campaigns containing operational, financial, linked, or attachment records will be protected and must be archived instead.</p>
        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button type="button" className="min-h-12 border border-[var(--line)] px-5 text-sm font-bold" onClick={close}>Cancel</button>
          <form action={action}>
            <input type="hidden" name="campaignId" value={campaignId}/>
            <button ref={confirm} className="min-h-12 bg-red-800 px-5 text-sm font-bold text-white">Confirm permanent deletion</button>
          </form>
        </div>
      </div>
    </div>}
  </>;
}
