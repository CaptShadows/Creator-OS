import type { Metadata } from "next";
import { formatOperationalDate } from "@/lib/format-date";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

const priorities = ["Film Today", "Due and overdue", "Ready to post"];

export default function OverviewPage() {
  return (
    <section>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{formatOperationalDate()}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Here&apos;s what matters today.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">The foundation is ready. Creator workflow data will be connected in upcoming phases.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {priorities.map((priority, index) => (
          <article key={priority} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-sm font-bold text-[var(--accent)]">0{index + 1}</p>
            <h2 className="mt-8 text-lg font-bold">{priority}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Nothing needs attention yet.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
