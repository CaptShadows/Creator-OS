import type { Metadata } from "next";
import { formatOperationalDate } from "@/lib/format-date";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

const priorities = ["Film Today", "Due and overdue", "Ready to post"];

export default function OverviewPage() {
  return (
    <section>
      <p className="eyebrow">{formatOperationalDate()}</p>
      <h1 className="display-heading mt-3 text-4xl sm:text-5xl">Here&apos;s what matters today.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">The foundation is ready. Creator workflow data will be connected in upcoming phases.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {priorities.map((priority, index) => (
          <article key={priority} className="luxury-card rounded-xl p-5">
            <p className="text-sm font-bold text-[var(--accent-strong)]">0{index + 1}</p>
            <h2 className="mt-8 text-lg font-bold">{priority}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Nothing needs attention yet.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
