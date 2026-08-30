import Link from "next/link";
import { notFound } from "next/navigation";
import { AttachmentPanel } from "@/components/attachments/attachment-panel";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { requireOwner } from "@/lib/auth/server";
import { nextSampleStatus, previousSampleStatus, sampleStatusLabels } from "@/lib/samples/lifecycle";
import { getSampleWorkspace } from "@/lib/samples/repository";
import { archiveSampleAction, permanentlyDeleteSampleAction, transitionSampleAction, updateSampleAction } from "../../actions";

export const dynamic = "force-dynamic";
const date = (value: Date | null) => value?.toISOString().slice(0, 10) ?? "";

export default async function SamplePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{attachmentError?:string;attachment?:string}> }) {
  const owner = await requireOwner();
  const query = await searchParams;
  const data = await getSampleWorkspace(owner.id, (await params).id);
  if (!data) notFound();
  const sample = data.sample, previous = previousSampleStatus(sample.status), next = nextSampleStatus(sample.status);
  return <section className="space-y-8">
    <Link href="/products" className="text-sm font-bold text-[var(--accent-strong)]">← Products & samples</Link>
    <PageHeader eyebrow="Sample" title={data.productName} action={<StatusBadge>{sampleStatusLabels[sample.status]}</StatusBadge>} />
    <p className="text-sm text-[var(--muted)]">Priority is shared with the product. <Link href={`/products/${sample.productId}`} className="font-bold text-[var(--accent-strong)]">Update product priority →</Link></p>
    <SurfaceCard><h2 className="display-heading text-2xl">Lifecycle</h2><div className="mt-4 flex flex-wrap gap-3">{previous && <Transition id={sample.id} to={previous} label={`Back to ${sampleStatusLabels[previous]}`} />} {next && <Transition id={sample.id} to={next} label={`Mark ${sampleStatusLabels[next]}`} />}</div><div className="mt-5 grid gap-2 text-sm text-[var(--muted)]"><p>Requested: {sample.requestedAt?.toLocaleDateString() || "Unknown"}</p><p>Approved: {sample.approvedAt?.toLocaleDateString() || "Not yet"}</p><p>Shipped: {sample.shippedAt?.toLocaleDateString() || "Not yet"}</p><p>Received: {sample.receivedAt?.toLocaleDateString() || "Not yet"}</p></div></SurfaceCard>
    <SurfaceCard><h2 className="display-heading text-2xl">Sample details</h2><form action={updateSampleAction} className="mt-5 grid gap-4 md:grid-cols-2"><input type="hidden" name="sampleId" value={sample.id} /><Input label="Source" name="sourcePlatform" defaultValue={sample.sourcePlatform ?? ""} /><Input label="Expected delivery" name="expectedDeliveryAt" type="date" defaultValue={date(sample.expectedDeliveryAt)} /><Input label="Tracking/reference" name="trackingReference" defaultValue={sample.trackingReference ?? ""} /><Select label="Content" name="contentId" defaultValue={sample.contentId ?? ""} empty="Link later" options={data.contentOptions} /><Select label="Campaign" name="campaignId" defaultValue={sample.campaignId ?? ""} empty="Link later" options={data.campaignOptions} /><Input label="Notes" name="notes" defaultValue={sample.notes ?? ""} /><button className="primary-action min-h-12 px-5 text-sm font-bold md:col-span-2 md:justify-self-start">Save sample</button></form></SurfaceCard>
    <AttachmentPanel ownerUserId={owner.id} target={{ type: "sample", id: sample.id }} returnTo={`/products/samples/${sample.id}`} error={query.attachmentError} uploaded={query.attachment==="uploaded"} />
    <div className="flex justify-between border-t border-[var(--line)] pt-6"><ConfirmActionDialog label="Archive sample" title="Archive this sample?" name={data.productName} description="It will leave the active sample list but remain available to recover later." action={archiveSampleAction} fields={{ sampleId: sample.id }} /><ConfirmDeleteDialog id={sample.id} name={data.productName} entity="sample request" inputName="sampleId" action={permanentlyDeleteSampleAction} warning="The canonical product is preserved. Remove PDF attachments first." /></div>
  </section>;
}

function Transition({ id, to, label }: { id: string; to: string; label: string }) { return <form action={transitionSampleAction}><input type="hidden" name="sampleId" value={id} /><input type="hidden" name="to" value={to} /><button className="min-h-11 border border-[var(--line)] px-4 text-sm font-bold">{label}</button></form>; }
function Input({ label, ...props }: { label: string; name: string; type?: string; defaultValue?: string }) { return <label className="grid gap-2 text-sm font-bold">{label}<input className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal" {...props} /></label>; }
function Select({ label, options, empty, ...props }: { label: string; name: string; defaultValue?: string; empty: string; options: { id: string; name: string }[] }) { return <label className="grid gap-2 text-sm font-bold">{label}<select className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal" {...props}><option value="">{empty}</option>{options.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>; }
