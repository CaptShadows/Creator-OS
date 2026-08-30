import Link from "next/link";
import { requireOwner } from "@/lib/auth/server";
import {
  listBrandDeals,
  listCampaignMigrationCandidates,
} from "@/lib/brand-deals/repository";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { DuplicateWarning } from "@/components/duplicate-warning";
import {
  createBrandDealAction,
  migrateCampaignToBrandDealAction,
  restoreBrandDealAction,
} from "./actions";
export const dynamic = "force-dynamic";
const views = [
  ["active", "Active"],
  ["due_soon", "Due soon"],
  ["revisions", "Revisions"],
  ["awaiting_payment", "Awaiting payment"],
  ["completed", "Paid / completed"],
  ["archived", "Archived"],
] as const;
const money = (n: number | null) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    (n ?? 0) / 100,
  );
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const o = await requireOwner(),
    q = await searchParams,
    view = q.view ?? "active",
    [rows, migrationCandidates] = await Promise.all([
      listBrandDeals(o.id, view),
      listCampaignMigrationCandidates(o.id),
    ]);
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Brand Deals"
        title="Partnerships, terms, and payments."
        description="Keep the commercial deal separate from the campaigns and content used to fulfill it."
      />
      <details className="luxury-card rounded-xl p-5" open={q.migrate === "1"}>
        <summary className="cursor-pointer font-bold">
          Import an existing campaign as a Brand Deal
        </summary>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Preview and choose campaigns one at a time. Creator OS creates a
          distinct deal and links the original campaign, preserving its
          deliverables, payments, attachments, dates, notes, and relationships
          without deleting or duplicating the campaign.
        </p>
        <div className="mt-4 grid gap-3">
          {migrationCandidates.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Every active campaign is already linked to a Brand Deal.
            </p>
          ) : (
            migrationCandidates.map(({ campaign, brandName }) => (
              <article
                key={campaign.id}
                className="flex flex-wrap items-center justify-between gap-4 border border-[var(--line)] bg-white p-4"
              >
                <div>
                  <strong>
                    {brandName ?? "No brand"} · {campaign.name}
                  </strong>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {campaign.status}
                    {campaign.dueAt
                      ? ` · Due ${campaign.dueAt.toLocaleDateString()}`
                      : ""}
                    {campaign.briefReference ? " · Brief saved" : ""}
                  </p>
                </div>
                <form action={migrateCampaignToBrandDealAction}>
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <button className="primary-action min-h-11 px-4 text-sm font-bold">
                    Create linked deal
                  </button>
                </form>
              </article>
            ))
          )}
        </div>
      </details>
      <DuplicateWarning matches={q.duplicateMatches} cancelHref="/brand-deals">
        <form action={createBrandDealAction}>
          {["brandName", "title", "source", "dealType", "duplicateToken"].map(
            (k) => (
              <input key={k} type="hidden" name={k} value={q[k]} />
            ),
          )}
          <button className="primary-action min-h-12 px-5 font-bold">
            Create anyway
          </button>
        </form>
      </DuplicateWarning>
      {view !== "archived" && (
        <form
          action={createBrandDealAction}
          className="luxury-card grid gap-4 rounded-xl p-5 md:grid-cols-2 lg:grid-cols-5"
        >
          <Field name="brandName" label="Brand" />
          <Field name="title" label="Deal title" />
          <Select
            name="source"
            label="Source"
            values={[
              "direct_email",
              "amazon_creator_connections",
              "tiktok_shop",
              "shopmy",
              "tribe",
              "agency",
              "other",
            ]}
          />
          <Select
            name="dealType"
            label="Type"
            values={[
              "paid",
              "gifted",
              "affiliate",
              "commission_only",
              "hybrid",
              "ambassador",
              "other",
            ]}
          />
          <button className="primary-action min-h-12 self-end px-5 font-bold">
            Create deal
          </button>
        </form>
      )}
      <nav className="flex flex-wrap gap-2">
        {views.map(([id, label]) => (
          <Link
            key={id}
            href={`/brand-deals?view=${id}`}
            className={`min-h-11 border px-4 py-3 text-sm font-bold ${view === id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)]"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {!rows.length ? (
        <EmptyState
          title="No deals in this view"
          description="Create a brand deal when a partnership begins, before or after a campaign exists."
        />
      ) : (
        <div className="grid gap-3">
          {rows.map(({ deal: d, brandName, progress, outstandingCents }) => (
            <article
              key={d.id}
              className="luxury-card flex flex-wrap items-center justify-between gap-4 rounded-xl p-5"
            >
              <div>
                <p className="eyebrow text-[var(--accent-strong)]">
                  {brandName}
                </p>
                <h2 className="mt-1 text-lg font-bold">{d.title}</h2>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                  <StatusBadge>{d.status}</StatusBadge>
                  <span>
                    {progress.completed}/{progress.total} deliverables
                  </span>
                  {d.dueAt && <span>Due {d.dueAt.toLocaleDateString()}</span>}
                  <span>{money(d.fixedCompensationCents)} agreed</span>
                  {outstandingCents > 0 && (
                    <span>{money(outstandingCents)} outstanding</span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/brand-deals/${d.id}`}
                  className="primary-action inline-flex min-h-11 items-center px-4 font-bold"
                >
                  Open
                </Link>
                {view === "archived" && (
                  <form action={restoreBrandDealAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button className="min-h-11 px-3 font-bold">Restore</button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function Field({ name, label }: { name: string; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        required
        name={name}
        className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal"
      />
    </label>
  );
}
function Select({
  name,
  label,
  values,
}: {
  name: string;
  label: string;
  values: string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <select
        name={name}
        className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal"
      >
        {values.map((x) => (
          <option key={x} value={x}>
            {x.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
