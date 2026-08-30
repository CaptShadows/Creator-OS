import Link from "next/link";
import { notFound } from "next/navigation";
import { AttachmentPanel } from "@/components/attachments/attachment-panel";
import { ProductVideoPanel } from "@/components/attachments/product-video-panel";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { requireOwner } from "@/lib/auth/server";
import { sampleStatusLabels } from "@/lib/samples/lifecycle";
import { getProductWorkspace } from "@/lib/samples/repository";
import { addListingAction, archiveProductAction, permanentlyDeleteProductAction, recoverProductAction, updateProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner(), data = await getProductWorkspace(owner.id, (await params).id);
  if (!data) notFound();
  const product = data.product, returnTo = `/products/${data.product.id}`;
  return <section className="space-y-8">
    <Link href="/products" className="text-sm font-bold text-[var(--accent-strong)]">← Products & samples</Link>
    <PageHeader eyebrow="Canonical product" title={product.name} />
    {product.archivedAt && <p role="status" className="border border-[var(--line)] bg-[var(--blush)] p-4 text-sm">Archived record · You can review everything here without restoring it.</p>}
    <SurfaceCard><h2 className="display-heading text-2xl">Product details</h2><form action={updateProductAction} className="mt-5 grid gap-4 md:grid-cols-2"><input type="hidden" name="productId" value={product.id} /><Input label="Name" name="name" required defaultValue={product.name} /><Input label="Category" name="category" defaultValue={product.category ?? ""} /><Select label="Priority" name="priority" defaultValue={product.priority>=2?"high":product.priority<=0?"low":"medium"} options={[{value:"high",label:"High priority"},{value:"medium",label:"Medium priority"},{value:"low",label:"Low priority"}]} /><Select label="Active" name="active" defaultValue={String(product.active)} options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} /><Input label="Notes" name="notes" defaultValue={product.notes ?? ""} /><Submit label="Save product" /></form></SurfaceCard>
    <SurfaceCard><h2 className="display-heading text-2xl">Platform listings</h2><p className="mt-2 text-sm text-[var(--muted)]">One product can have multiple channel listings without duplication.</p><div className="mt-5 grid gap-3">{data.listings.map(listing => <div key={listing.id} className="border border-[var(--line)] p-4"><strong>{listing.platform}</strong><p className="text-sm text-[var(--muted)]">{listing.externalProductId || listing.externalUrl || "Listing saved"}</p></div>)}</div><form action={addListingAction} className="mt-6 grid gap-4 md:grid-cols-2"><input type="hidden" name="productId" value={product.id} /><Input label="Platform" name="platform" required /><Input label="Product ID" name="externalProductId" /><Input label="Product URL" name="externalUrl" /><Input label="Affiliate URL" name="affiliateUrl" /><Submit label="Add listing" /></form></SurfaceCard>
    <SurfaceCard><h2 className="display-heading text-2xl">Samples</h2><div className="mt-5 grid gap-3">{data.samples.map(sample => <Link key={sample.id} href={`/products/samples/${sample.id}`} className="flex justify-between border border-[var(--line)] p-4"><span>{sample.sourcePlatform || "Unspecified source"}</span><StatusBadge>{sampleStatusLabels[sample.status]}</StatusBadge></Link>)}</div></SurfaceCard>
    <ProductVideoPanel ownerUserId={owner.id} productId={product.id} returnTo={returnTo} />
    <AttachmentPanel ownerUserId={owner.id} target={{ type: "product", id: product.id }} returnTo={returnTo} />
    <div className="flex justify-between border-t border-[var(--line)] pt-6"><form action={product.archivedAt ? recoverProductAction : archiveProductAction}><input type="hidden" name="productId" value={product.id} /><button className="min-h-12 text-sm font-bold text-[var(--accent-strong)]">{product.archivedAt ? "Restore product" : "Archive product"}</button></form><ConfirmDeleteDialog id={product.id} name={product.name} entity="product" inputName="productId" action={permanentlyDeleteProductAction} /></div>
  </section>;
}

function Input({ label, ...props }: { label: string; name: string; required?: boolean; defaultValue?: string }) { return <label className="grid gap-2 text-sm font-bold">{label}<input className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal" {...props} /></label>; }
function Select({ label, options, ...props }: { label: string; name: string; defaultValue?: string; options: { value: string; label: string }[] }) { return <label className="grid gap-2 text-sm font-bold">{label}<select className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal" {...props}>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
function Submit({ label }: { label: string }) { return <button className="primary-action min-h-12 px-5 text-sm font-bold md:col-span-2 md:justify-self-start">{label}</button>; }
