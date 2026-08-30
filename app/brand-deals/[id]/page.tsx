import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/server";
import { getBrandDeal } from "@/lib/brand-deals/repository";
import { dealStatuses } from "@/lib/brand-deals/contracts";
import { AttachmentPanel } from "@/components/attachments/attachment-panel";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { SurfaceCard } from "@/components/ui/surface-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  addDealDeliverableAction,
  archiveBrandDealAction,
  deleteBrandDealAction,
  linkDealEntityAction,
  updateBrandDealAction,
} from "../actions";
export const dynamic = "force-dynamic";
const iso = (d: Date | null) => d?.toISOString().slice(0, 10) ?? "";
const money = (n: number | null) => (n == null ? "" : (n / 100).toFixed(2));
const sources = [
    "direct_email",
    "amazon_creator_connections",
    "tiktok_shop",
    "shopmy",
    "tribe",
    "agency",
    "other",
  ],
  types = [
    "paid",
    "gifted",
    "affiliate",
    "commission_only",
    "hybrid",
    "ambassador",
    "other",
  ];
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleteError?: string }>;
}) {
  const o = await requireOwner(),
    { id } = await params,
    q = await searchParams,
    w = await getBrandDeal(o.id, id);
  if (!w) notFound();
  const d = w.deal;
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[var(--accent-strong)]">
            {w.brandName} · Brand deal
          </p>
          <h1 className="display-heading mt-2 text-4xl">{d.title}</h1>
          <div className="mt-3 flex gap-3">
            <StatusBadge>{d.status}</StatusBadge>
            <span className="text-sm text-[var(--muted)]">
              {w.progress.completed}/{w.progress.total} deliverables ·{" "}
              {w.progress.percent}%
            </span>
          </div>
        </div>
      </header>
      {q.deleteError && (
        <p className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {q.deleteError}
        </p>
      )}
      <form action={updateBrandDealAction} className="grid gap-6">
        <input type="hidden" name="id" value={id} />
        <SurfaceCard>
          <h2 className="display-heading text-2xl">Partnership</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <F n="title" l="Deal title" v={d.title} />
            <F n="contactName" l="Contact" v={d.contactName} />
            <F
              n="contactEmail"
              l="Contact email"
              type="email"
              v={d.contactEmail}
            />
            <S n="source" l="Source" v={d.source} a={sources} />
            <S n="dealType" l="Deal type" v={d.dealType} a={types} />
            <S n="status" l="Status" v={d.status} a={[...dealStatuses]} />
            <S
              n="priority"
              l="Priority"
              v={String(d.priority)}
              a={["0", "1", "2"]}
            />
            <F n="startAt" l="Start date" type="date" v={iso(d.startAt)} />
            <F n="dueAt" l="Final due date" type="date" v={iso(d.dueAt)} />
            <TA n="notes" l="Notes" v={d.notes} />
          </div>
        </SurfaceCard>
        <SurfaceCard>
          <h2 className="display-heading text-2xl">Compensation & payment</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <F
              n="fixedCompensationCents"
              l="Fixed compensation ($)"
              type="number"
              v={money(d.fixedCompensationCents)}
            />
            <F
              n="giftedValueCents"
              l="Gifted value ($)"
              type="number"
              v={money(d.giftedValueCents)}
            />
            <F n="currency" l="Currency" v={d.currency} />
            <TA
              n="commissionTerms"
              l="Commission / affiliate terms"
              v={d.commissionTerms}
            />
            <TA n="paymentTerms" l="Payment terms" v={d.paymentTerms} />
            <C n="invoiceRequired" l="Invoice required" v={d.invoiceRequired} />
            <F n="invoiceNumber" l="Invoice number" v={d.invoiceNumber} />
            <F
              n="invoiceDate"
              l="Invoice date"
              type="date"
              v={iso(d.invoiceDate)}
            />
            <F
              n="paymentDueAt"
              l="Payment due"
              type="date"
              v={iso(d.paymentDueAt)}
            />
            <S
              n="paymentStatus"
              l="Payment status"
              v={d.paymentStatus}
              a={["not_due", "expected", "overdue", "partial", "paid"]}
            />
            <F
              n="amountReceivedCents"
              l="Amount received ($)"
              type="number"
              v={money(d.amountReceivedCents)}
            />
            <F
              n="receivedAt"
              l="Received date"
              type="date"
              v={iso(d.receivedAt)}
            />
            <p className="self-end pb-3 font-bold">
              Outstanding: ${(w.outstandingCents / 100).toFixed(2)}
            </p>
          </div>
        </SurfaceCard>
        <SurfaceCard>
          <h2 className="display-heading text-2xl">Contract & rights</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <C n="contractSigned" l="Contract signed" v={d.contractSigned} />
            <F
              n="contractSignedAt"
              l="Signed date"
              type="date"
              v={iso(d.contractSignedAt)}
            />
            <TA n="usageRights" l="Usage-rights period" v={d.usageRights} />
            <C n="organicRights" l="Organic usage" v={d.organicRights} />
            <C n="paidUsage" l="Paid usage / whitelisting" v={d.paidUsage} />
            <F
              n="exclusivityCategory"
              l="Exclusivity category"
              v={d.exclusivityCategory}
            />
            <F
              n="exclusivityStartAt"
              l="Exclusivity starts"
              type="date"
              v={iso(d.exclusivityStartAt)}
            />
            <F
              n="exclusivityEndAt"
              l="Exclusivity ends"
              type="date"
              v={iso(d.exclusivityEndAt)}
            />
            <F
              n="revisionRounds"
              l="Revision rounds"
              type="number"
              v={d.revisionRounds?.toString()}
            />
            <TA n="ownershipNotes" l="Content ownership" v={d.ownershipNotes} />
            <TA n="disclosures" l="Required disclosures" v={d.disclosures} />
            <TA
              n="referenceLinks"
              l="Contract / brief links"
              v={d.referenceLinks}
            />
          </div>
        </SurfaceCard>
        <button className="primary-action min-h-12 px-6 font-bold">
          Save deal
        </button>
      </form>
      <SurfaceCard>
        <h2 className="display-heading text-2xl">Deliverables</h2>
        <form
          action={addDealDeliverableAction}
          className="mt-5 grid gap-3 md:grid-cols-4"
        >
          <input type="hidden" name="brandDealId" value={id} />
          <F n="title" l="Title" />
          <F n="deliverableType" l="Type" />
          <F n="platform" l="Platform / account" />
          <F n="quantity" l="Quantity" type="number" v="1" />
          <F n="dueAt" l="Due" type="date" />
          <S
            n="status"
            l="Status"
            v="not_started"
            a={[
              "not_started",
              "in_progress",
              "submitted",
              "revisions_requested",
              "approved",
              "posted",
              "completed",
            ]}
          />
          <S
            n="approvalStatus"
            l="Approval"
            v="not_submitted"
            a={["not_submitted", "pending", "changes_requested", "approved"]}
          />
          <label className="grid gap-2 text-sm font-bold">
            Linked content
            <select name="contentId" className="min-h-12 border px-3">
              <option value="">None</option>
              {w.options.content.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <F n="postedAt" l="Posted date" type="date" />
          <F n="liveUrl" l="Live URL" />
          <TA n="notes" l="Notes" />
          <button className="primary-action min-h-12 self-end px-5 font-bold">
            Add deliverable
          </button>
        </form>
        <div className="mt-5 grid gap-2">
          {w.deliverables.map((x) => (
            <div
              key={x.id}
              className="flex flex-wrap justify-between gap-3 border border-[var(--line)] p-4"
            >
              <div>
                <b>
                  {x.quantity}× {x.title}
                </b>
                <p className="text-sm text-[var(--muted)]">
                  {x.platform || "No platform"}
                  {x.dueAt ? ` · due ${x.dueAt.toLocaleDateString()}` : ""}
                </p>
              </div>
              <StatusBadge>{x.status}</StatusBadge>
            </div>
          ))}
        </div>
      </SurfaceCard>
      <SurfaceCard>
        <h2 className="display-heading text-2xl">Linked work</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {(
            [
              { type: "campaign", label: "Campaigns" },
              { type: "product", label: "Products / Samples" },
              { type: "content", label: "Content" },
            ] as const
          ).map(({ type, label }) => {
            const linkedNames = [
              ...w[`${type}s`].map((x) => x.name),
              ...(type === "product" ? w.samples.map((x) => x.name) : []),
            ];
            const linkedSummary = [...new Set(linkedNames)].join(", ");
            return (
              <div key={type} className="min-w-0">
                <h3 className="font-bold">{label}</h3>
                <p className="my-2 truncate text-sm text-[var(--muted)]">
                  {linkedSummary || "None linked"}
                </p>
                <form
                  action={linkDealEntityAction}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2"
                >
                  <input type="hidden" name="brandDealId" value={id} />
                  <input type="hidden" name="entityType" value={type} />
                  <select
                    required
                    name="entityId"
                    className="min-h-11 w-full min-w-0 border px-3"
                  >
                    <option value="">Choose…</option>
                    {w.options[type].map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                  <button className="min-h-11 shrink-0 border px-3 font-bold">
                    Link
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </SurfaceCard>
      <AttachmentPanel
        ownerUserId={o.id}
        target={{ type: "brandDeal", id }}
        returnTo={`/brand-deals/${id}`}
      />
      <SurfaceCard>
        <h2 className="font-bold">Record controls</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <form action={archiveBrandDealAction}>
            <input type="hidden" name="id" value={id} />
            <button className="min-h-11 border px-4 font-bold">
              Archive deal
            </button>
          </form>
          <ConfirmDeleteDialog
            id={id}
            name={d.title}
            entity="brand deal"
            inputName="id"
            action={deleteBrandDealAction}
            warning="Linked campaigns, products, samples, and content are preserved. Remove deal deliverables and attachments first."
          />
        </div>
      </SurfaceCard>
    </section>
  );
}
function F({
  n,
  l,
  v,
  type = "text",
}: {
  n: string;
  l: string;
  v?: string | null;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {l}
      <input
        name={n}
        type={type}
        defaultValue={v ?? ""}
        step={type === "number" ? "0.01" : undefined}
        className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal"
      />
    </label>
  );
}
function S({
  n,
  l,
  v,
  a,
}: {
  n: string;
  l: string;
  v: string;
  a: readonly string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {l}
      <select
        name={n}
        defaultValue={v}
        className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal"
      >
        {a.map((x) => (
          <option key={x} value={x}>
            {x.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
function TA({ n, l, v }: { n: string; l: string; v?: string | null }) {
  return (
    <label className="grid gap-2 text-sm font-bold md:col-span-2">
      {l}
      <textarea
        name={n}
        defaultValue={v ?? ""}
        rows={3}
        className="border border-[var(--line)] bg-white p-3 font-normal"
      />
    </label>
  );
}
function C({ n, l, v }: { n: string; l: string; v: boolean }) {
  return (
    <label className="flex min-h-12 items-center gap-3 self-end text-sm font-bold">
      <input name={n} type="checkbox" defaultChecked={v} />
      {l}
    </label>
  );
}
