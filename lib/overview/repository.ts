import "server-only";
import { and, asc, eq, inArray, isNull, lte, ne } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import {
  campaigns,
  compensations,
  contentProducts,
  contents,
  deliverables,
  payments,
  products,
  samples,
} from "@/db/schema";
import { calculateOutstandingByCompensation } from "@/lib/campaigns/calculations";
import { priorityLabel } from "@/lib/content/priority";
import { rankFilmToday } from "./priorities";
import {
  effectiveSamplePriority,
  rankSampleActions,
} from "./sample-priorities";
export async function getOverview(owner: string, now = new Date()) {
  const db = getDatabase().db,
    todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);
  const soon = new Date(todayEnd);
  soon.setUTCDate(soon.getUTCDate() + 7);
  const [content, ds, cs, ss, comps, pays, productContentLinks] =
    await Promise.all([
      db
        .select()
        .from(contents)
        .where(
          and(eq(contents.ownerUserId, owner), isNull(contents.archivedAt)),
        ),
      db
        .select()
        .from(deliverables)
        .where(
          and(
            eq(deliverables.ownerUserId, owner),
            ne(deliverables.status, "completed"),
            lte(deliverables.dueAt, soon),
          ),
        )
        .orderBy(asc(deliverables.dueAt)),
      db
        .select()
        .from(campaigns)
        .where(
          and(
            eq(campaigns.ownerUserId, owner),
            isNull(campaigns.archivedAt),
            lte(campaigns.dueAt, soon),
          ),
        )
        .orderBy(asc(campaigns.dueAt)),
      db
        .select({ sample: samples, productName: products.name })
        .from(samples)
        .innerJoin(products, eq(samples.productId, products.id))
        .where(
          and(
            eq(samples.ownerUserId, owner),
            isNull(samples.archivedAt),
            inArray(samples.status, ["arrived", "content_needed"]),
          ),
        )
        .orderBy(asc(samples.updatedAt)),
      db
        .select()
        .from(compensations)
        .where(eq(compensations.ownerUserId, owner)),
      db.select().from(payments).where(eq(payments.ownerUserId, owner)),
      db
        .select()
        .from(contentProducts)
        .where(eq(contentProducts.ownerUserId, owner)),
    ]);
  const byId = new Map(content.map((c) => [c.id, c]));
  const byProduct = new Map<string, typeof content>();
  for (const link of productContentLinks) {
    const linkedContent = byId.get(link.contentId);
    if (!linkedContent) continue;
    const rows = byProduct.get(link.productId) ?? [];
    rows.push(linkedContent);
    byProduct.set(link.productId, rows);
  }
  const prioritizedSamples = rankSampleActions(
    ss.map((row) => {
      const directContent = row.sample.contentId
        ? byId.get(row.sample.contentId)
        : null;
      const linked = [
        ...(byProduct.get(row.sample.productId) ?? []),
        ...(directContent ? [directContent] : []),
      ];
      const effectivePriority = effectiveSamplePriority(
        linked.map((item) => item.priority),
      );
      const actionDate =
        [
          row.sample.expectedDeliveryAt,
          ...linked.map((item) => item.plannedFilmAt),
        ]
          .filter((date): date is Date => Boolean(date))
          .sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
      return {
        ...row,
        effectivePriority,
        priorityLabel: priorityLabel(effectivePriority),
        actionDate,
        updatedAt: row.sample.updatedAt,
      };
    }),
  );
  const candidates = content.map((c) => ({
    id: c.id,
    title: c.title,
    href: `/create/${c.id}`,
    plannedPastOrToday: Boolean(c.plannedFilmAt && c.plannedFilmAt <= todayEnd),
    priority: c.priority,
    readyToFilm: c.status === "ready_to_film",
  }));
  for (const d of ds) {
    if (!d.contentId) continue;
    const c = byId.get(d.contentId);
    if (!c) continue;
    const item = candidates.find((x) => x.id === c.id)!;
    Object.assign(
      item,
      d.dueAt && d.dueAt < now ? { overdue: true } : { dueSoon: true },
    );
  }
  for (const { sample } of ss) {
    if (sample.contentId) {
      const item = candidates.find((x) => x.id === sample.contentId);
      if (item) Object.assign(item, { sampleNeedsContent: true });
    }
  }
  return {
    filmToday: rankFilmToday(candidates).slice(0, 8),
    due: ds.map((d) => ({
      id: d.id,
      title: d.title,
      href: `/campaigns/${d.campaignId}`,
      date: d.dueAt,
      overdue: Boolean(d.dueAt && d.dueAt < now),
    })),
    campaigns: cs,
    samples: prioritizedSamples,
    ready: content.filter((c) => c.status === "ready_to_post"),
    outstandingCents: calculateOutstandingByCompensation(comps, pays),
    upcoming: [
      ...cs.map((c) => ({
        title: c.name,
        href: `/campaigns/${c.id}`,
        date: c.dueAt,
      })),
      ...ds.map((d) => ({
        title: d.title,
        href: `/campaigns/${d.campaignId}`,
        date: d.dueAt,
      })),
    ]
      .filter((x) => x.date)
      .sort((a, b) => a.date!.getTime() - b.date!.getTime())
      .slice(0, 8),
  };
}
