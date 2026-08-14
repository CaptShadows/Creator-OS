import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/server";
import { getCampaignWorkspace } from "@/lib/campaigns/repository";
import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { addCompensationAction, addDeliverableAction, addPaymentAction, archiveCampaignAction, permanentlyDeleteCampaignAction, recoverCampaignAction, updateCampaignAction, updateDeliverableAction } from "../actions";
import { AttachmentPanel } from "@/components/attachments/attachment-panel";
import { CampaignDeleteDialog } from "@/components/campaign-delete-dialog";
export const dynamic = "force-dynamic";
const money = (c: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100);
const date = (d: Date | null) => d?.toISOString().slice(0, 10) ?? "";
export default async function CampaignPage({ params, searchParams }: {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        deleteError?: string;
    }>;
}) {
    const owner = await requireOwner();
    const data = await getCampaignWorkspace(owner.id, (await params).id);
    if (!data)
        notFound();
    const c = data.campaign, error = (await searchParams).deleteError;
    return <section className="space-y-8"><Link href="/campaigns" className="text-sm font-bold text-[var(--accent-strong)]">← Campaign workspace</Link><PageHeader eyebrow={data.brandName ?? "Campaign"} title={c.name} action={<StatusBadge>{c.status}</StatusBadge>}/>{c.archivedAt && <p role="status" className="border border-[var(--line)] bg-[var(--blush)] p-4 text-sm">Archived record · You can review everything here without restoring it.</p>}{error && <div role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-900">{error}</div>}<div className="grid gap-4 sm:grid-cols-3"><Metric label="Deliverables" value={`${data.progress.completed}/${data.progress.total} completed`}/><Metric label="Outstanding fixed compensation" value={money(data.outstandingCents)}/><Metric label="Deadline" value={c.dueAt ? c.dueAt.toLocaleDateString() : "Not set"}/></div>
    <SurfaceCard><Heading title="Campaign details" help="Add details progressively; only the name is required."/><form action={updateCampaignAction} className="mt-5 grid gap-4 md:grid-cols-2"><input type="hidden" name="campaignId" value={c.id}/><Input label="Campaign name" name="name" required defaultValue={c.name}/><Select label="Status" name="status" defaultValue={c.status} options={["planned", "active", "complete", "cancelled"]}/><Input label="Start date" name="startAt" type="date" defaultValue={date(c.startAt)}/><Input label="Due date" name="dueAt" type="date" defaultValue={date(c.dueAt)}/><Input label="Brief link or reference" name="briefReference" defaultValue={c.briefReference ?? ""}/><Input label="Notes" name="notes" defaultValue={c.notes ?? ""}/><Submit label="Save campaign"/></form></SurfaceCard>
    <SurfaceCard><Heading title="Deliverables" help="Completion is derived here; linked content keeps its own lifecycle."/><div className="mt-5 grid gap-3">{data.deliverables.map(d => <div key={d.id} className="border border-[var(--line)] p-4"><div className="flex flex-wrap justify-between gap-2"><strong>{d.title}</strong><StatusBadge>{d.overdue ? "Overdue" : d.status.replaceAll("_", " ")}</StatusBadge></div><p className="mt-2 text-sm text-[var(--muted)]">{d.requiredPlatform || "Any platform"}{d.dueAt ? ` · Due ${d.dueAt.toLocaleDateString()}` : ""}</p><form action={updateDeliverableAction} className="mt-3 flex flex-wrap items-end gap-3"><input type="hidden" name="campaignId" value={c.id}/><input type="hidden" name="deliverableId" value={d.id}/><Select label="Status" name="status" defaultValue={d.status} options={["not_started", "in_progress", "submitted", "completed"]}/><Select label="Linked content" name="contentId" defaultValue={d.contentId ?? ""} options={data.contentOptions.map(o => ({ value: o.id, label: o.title }))} empty="Not linked"/><button className="min-h-12 border border-[var(--line)] px-4 text-sm font-bold">Update</button></form><AttachmentPanel embedded ownerUserId={owner.id} target={{ type: "deliverable", id: d.id }} returnTo={`/campaigns/${c.id}`}/></div>)}</div><form action={addDeliverableAction} className="mt-6 grid gap-4 md:grid-cols-2"><input type="hidden" name="campaignId" value={c.id}/><Input label="Deliverable" name="title" required/><Select label="Status" name="status" options={["not_started", "in_progress", "submitted", "completed"]}/><Input label="Due date" name="dueAt" type="date"/><Input label="Required platform" name="requiredPlatform"/><Select label="Linked content" name="contentId" options={data.contentOptions.map(o => ({ value: o.id, label: o.title }))} empty="Link later"/><Input label="Or create a new content idea" name="newContentIdea"/><Input label="Notes" name="notes"/><Submit label="Add deliverable"/></form></SurfaceCard>
    <SurfaceCard><Heading title="Compensation" help="Add multiple components for combinations such as fixed fee plus commission."/><div className="mt-5 grid gap-3">{data.compensations.map(x => <div key={x.id} className="border border-[var(--line)] p-4 text-sm"><strong>{x.type.replaceAll("_", " ")}</strong><span className="ml-3 text-[var(--muted)]">{x.agreedAmountCents != null ? money(x.agreedAmountCents) : ""}{x.commissionBasisPoints != null ? `${x.commissionBasisPoints / 100}%` : ""}</span></div>)}</div><form action={addCompensationAction} className="mt-6 grid gap-4 md:grid-cols-2"><input type="hidden" name="campaignId" value={c.id}/><Select label="Type" name="type" options={["fixed_fee", "gifted_product", "commission", "bonus"]}/><Input label="Agreed amount ($)" name="amount" inputMode="decimal"/><Input label="Commission (%)" name="commissionPercent" inputMode="decimal"/><Input label="Expected payment date" name="expectedPaymentAt" type="date"/><Input label="Notes" name="notes"/><Submit label="Add compensation"/></form></SurfaceCard>
    <SurfaceCard><Heading title="Payments" help="Record expected payments and each partial or final receipt separately."/><div className="mt-5 grid gap-3">{data.payments.map(p => <div key={p.id} className="flex flex-wrap justify-between gap-2 border border-[var(--line)] p-4"><div><strong>{money(p.amountCents)}</strong><p className="text-sm text-[var(--muted)]">{p.status}{p.receivedAt ? ` · ${p.receivedAt.toLocaleDateString()}` : ""}</p></div><StatusBadge>{p.overdue ? "Overdue / unpaid" : p.status}</StatusBadge></div>)}</div><form action={addPaymentAction} className="mt-6 grid gap-4 md:grid-cols-2"><input type="hidden" name="campaignId" value={c.id}/><Select label="Compensation component" name="compensationId" options={data.compensations.map(x => ({ value: x.id, label: x.type.replaceAll("_", " ") }))} empty="Unallocated"/><Select label="Status" name="status" options={["expected", "received"]}/><Input label="Amount ($)" name="amount" required inputMode="decimal"/><Input label="Expected date" name="dueAt" type="date"/><Input label="Received date" name="receivedAt" type="date"/><Input label="Reference" name="paymentReference"/><Input label="Notes" name="notes"/><Submit label="Add payment"/></form></SurfaceCard><AttachmentPanel ownerUserId={owner.id} target={{ type: "campaign", id: c.id }} returnTo={`/campaigns/${c.id}`}/><div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6"><form action={c.archivedAt ? recoverCampaignAction : archiveCampaignAction}><input type="hidden" name="campaignId" value={c.id}/><button className="min-h-12 text-sm font-bold text-[var(--accent-strong)]">{c.archivedAt ? "Restore campaign" : "Archive campaign"}</button></form><CampaignDeleteDialog campaignId={c.id} campaignName={c.name} action={permanentlyDeleteCampaignAction}/></div></section>;
}
function Heading({ title, help }: {
    title: string;
    help: string;
}) { return <><h2 className="display-heading text-2xl">{title}</h2><p className="mt-2 text-sm text-[var(--muted)]">{help}</p></>; }
;
function Metric({ label, value }: {
    label: string;
    value: string;
}) { return <div className="luxury-card rounded-xl p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--accent-strong)]">{label}</p><p className="mt-2 font-bold">{value}</p></div>; }
;
function Input({ label, ...props }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    defaultValue?: string;
    inputMode?: "decimal";
}) { return <label className="grid gap-2 text-sm font-bold">{label}<input className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal outline-none focus:border-[var(--accent-strong)]" {...props}/></label>; }
;
function Select({ label, options, empty, ...props }: {
    label: string;
    name: string;
    defaultValue?: string;
    options: (string | {
        value: string;
        label: string;
    })[];
    empty?: string;
}) { return <label className="grid gap-2 text-sm font-bold">{label}<select className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal" {...props}>{empty && <option value="">{empty}</option>}{options.map(o => typeof o === "string" ? <option key={o} value={o}>{o.replaceAll("_", " ")}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>; }
;
function Submit({ label }: {
    label: string;
}) { return <button className="primary-action min-h-12 px-5 text-sm font-bold md:col-span-2 md:justify-self-start">{label}</button>; }
