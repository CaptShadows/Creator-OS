import type { Metadata } from "next";
import { formatOperationalDate } from "@/lib/format-date";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

const priorities = [
  { title: "Film Today", description: "Your prioritized filming queue will appear here.", tone: "rose" },
  { title: "Due and overdue", description: "Campaign deadlines and follow-ups will stay visible.", tone: "champagne" },
  { title: "Ready to post", description: "Finished content waiting for distribution will land here.", tone: "blue" },
] as const;

export default function OverviewPage() {
  return (
    <section className="space-y-8">
      <header className="overview-hero rounded-2xl px-6 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
        <div className="relative z-[1] max-w-3xl">
          <p className="eyebrow">{formatOperationalDate()}</p>
          <h1 className="display-heading mt-4 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">Here&apos;s what matters today.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">One calm view for filming priorities, campaign obligations, and content that is ready to move.</p>
          <div className="mt-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
            <span className="h-px w-10 bg-[var(--metal-accent)]" /> Creator operations, simplified
          </div>
        </div>
      </header>

      <div>
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">Command center</p><h2 className="display-heading mt-2 text-3xl">Today at a glance</h2></div>
          <p className="hidden text-sm text-[var(--muted)] sm:block">Nothing urgent right now</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
        {priorities.map((priority, index) => (
          <article key={priority.title} data-tone={priority.tone} className="luxury-card priority-card min-h-52 rounded-xl p-6">
            <p className="priority-number rounded-full text-sm">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-8 text-lg font-bold">{priority.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{priority.description}</p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]">No action needed</p>
          </article>
        ))}
        </div>
      </div>
    </section>
  );
}
