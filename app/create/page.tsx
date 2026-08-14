import Link from "next/link";
import { createIdeaAction, recoverContentAction } from "./actions";
import { requireOwner } from "@/lib/auth/server";
import { listOwnerContent } from "@/lib/content/repository";
import { contentStatusLabels } from "@/lib/content/lifecycle";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DuplicateWarning } from "@/components/duplicate-warning";

export const dynamic = "force-dynamic";

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ archived?: string;duplicateMatches?:string;duplicateToken?:string;idea?:string }> }) {
  const owner = await requireOwner(); const query=await searchParams,showArchived = query.archived === "1"; const items = await listOwnerContent(owner.id, showArchived);
  return <section className="space-y-8">
    <PageHeader eyebrow="Create" title="Capture first. Shape it later." description="One thought is enough to start. Hooks, scripts, captions, products, and platforms can wait until they help." />
    <DuplicateWarning matches={query.duplicateMatches} cancelHref="/create"><form action={createIdeaAction}><input type="hidden" name="idea" value={query.idea}/><input type="hidden" name="duplicateToken" value={query.duplicateToken}/><button className="primary-action min-h-12 px-5 text-sm font-bold">Create anyway</button></form></DuplicateWarning>
    {!showArchived && <form id="quick-idea" action={createIdeaAction} className="luxury-card grid gap-4 rounded-xl p-5 sm:grid-cols-[1fr_auto] sm:items-end">
      <label className="grid gap-2 text-sm font-bold">What&apos;s the idea?<textarea name="idea" required autoFocus rows={2} maxLength={10000} placeholder="Drop the thought here…" className="min-h-24 resize-y border border-[var(--line)] bg-white p-3 font-normal leading-6 outline-none focus:border-[var(--accent-strong)] sm:min-h-16" /></label>
      <button className="primary-action min-h-12 px-6 text-sm font-bold" type="submit">Save idea</button>
    </form>}
    <div className="flex items-center justify-between"><h2 className="display-heading text-3xl">{showArchived ? "Archived content" : "Content workspace"}</h2><Link className="text-sm font-bold text-[var(--accent-strong)]" href={showArchived ? "/create" : "/archive?category=content"}>{showArchived ? "Back to active" : "View archive"}</Link></div>
    {items.length === 0 ? <EmptyState title={showArchived ? "Archive is empty" : "No ideas yet"} description={showArchived ? "Archived work will remain recoverable here." : "Use the one-field capture above. Nothing else is required."} /> : <div className="grid gap-3">{items.map((item) => <article key={item.id} className="luxury-card flex flex-wrap items-center justify-between gap-4 rounded-xl p-5"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h3 className="truncate font-bold">{item.title}</h3><StatusBadge>{contentStatusLabels[item.status]}</StatusBadge></div>{item.concept && <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{item.concept}</p>}</div>{showArchived ? <div className="flex items-center gap-3"><Link className="inline-flex min-h-11 items-center border border-[var(--line)] px-4 text-sm font-bold" href={`/create/${item.id}`}>Open</Link><form action={recoverContentAction}><input type="hidden" name="contentId" value={item.id}/><button className="min-h-11 px-3 text-sm font-bold text-[var(--accent-strong)]">Restore</button></form></div> : <Link className="primary-action inline-flex min-h-11 items-center px-4 text-sm font-bold" href={`/create/${item.id}`}>Open</Link>}</article>)}</div>}
  </section>;
}
