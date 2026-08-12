import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/server";
import { getContentEditorData } from "@/lib/content/repository";
import { contentStatusLabels, nextContentStatus, previousContentStatus } from "@/lib/content/lifecycle";
import { ContentEditor } from "@/components/content-editor";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { archiveContentAction, saveAssociationsAction, transitionContentAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner(); const data = await getContentEditorData(owner.id, (await params).id); if (!data || data.content.archivedAt) notFound();
  const { content } = data; const previous = previousContentStatus(content.status); const next = nextContentStatus(content.status);
  return <section className="space-y-8"><Link href="/create" className="text-sm font-bold text-[var(--accent-strong)]">← Content workspace</Link>
    <PageHeader eyebrow="Content editor" title={content.title} action={<StatusBadge>{contentStatusLabels[content.status]}</StatusBadge>} />
    <SurfaceCard><div className="flex flex-wrap items-center gap-3"><span className="text-sm font-bold">Lifecycle</span>{previous && <TransitionButton id={content.id} to={previous} label={`Back to ${contentStatusLabels[previous]}`} />}{next && <TransitionButton id={content.id} to={next} label={`Move to ${contentStatusLabels[next]}`} />}</div></SurfaceCard>
    <SurfaceCard><ContentEditor ownerId={owner.id} contentId={content.id} updatedAt={content.updatedAt.toISOString()} initial={{ title: content.title, concept: content.concept ?? "", hook: content.hook ?? "", script: content.script ?? "", caption: content.caption ?? "", notes: content.notes ?? "", contentType: content.contentType ?? "", contentPillar: content.contentPillar ?? "" }} /></SurfaceCard>
    <SurfaceCard><h2 className="display-heading text-2xl">Connections</h2><p className="mt-2 text-sm text-[var(--muted)]">Optional. Add these only when they help organize the work.</p><form action={saveAssociationsAction} className="mt-5 grid gap-6 lg:grid-cols-3"><input type="hidden" name="contentId" value={content.id}/><Options name="campaignIds" label="Campaigns" options={data.campaignOptions.map((item)=>({id:item.id,label:item.name}))} selected={data.selectedCampaignIds}/><Options name="productIds" label="Products" options={data.productOptions.map((item)=>({id:item.id,label:item.name}))} selected={data.selectedProductIds}/><Options name="platformAccountIds" label="Target accounts" options={data.platformOptions.map((item)=>({id:item.id,label:`${item.platform} · ${item.displayName}`}))} selected={data.selectedPlatformAccountIds}/><button className="primary-action min-h-12 px-5 text-sm font-bold lg:col-span-3 lg:justify-self-start">Save connections</button></form></SurfaceCard>
    <form action={archiveContentAction} className="border-t border-[var(--line)] pt-6"><input type="hidden" name="contentId" value={content.id}/><button className="min-h-12 text-sm font-bold text-[var(--accent-strong)]">Archive content</button></form>
  </section>;
}

function TransitionButton({ id, to, label }: { id:string; to:string; label:string }) { return <form action={transitionContentAction}><input type="hidden" name="contentId" value={id}/><input type="hidden" name="to" value={to}/><button className="min-h-11 border border-[var(--line)] px-3 text-sm font-bold">{label}</button></form>; }
function Options({ name,label,options,selected }:{name:string;label:string;options:{id:string;label:string}[];selected:string[]}) { return <fieldset><legend className="text-sm font-bold">{label}</legend><div className="mt-3 grid gap-2">{options.length===0?<p className="text-sm text-[var(--muted)]">None available yet.</p>:options.map((option)=><label key={option.id} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name={name} value={option.id} defaultChecked={selected.includes(option.id)} className="size-5 accent-[var(--accent-strong)]"/>{option.label}</label>)}</div></fieldset>; }
