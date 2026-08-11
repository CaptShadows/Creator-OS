import Link from "next/link";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  focus: readonly string[];
};

export function PlaceholderPage({ eyebrow, title, description, focus }: PlaceholderPageProps) {
  return (
    <section>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{description}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {focus.map((item) => (
          <article key={item} className="min-h-32 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="mb-4 size-2 rounded-full bg-[var(--accent)]" />
            <h2 className="font-semibold">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">This workspace arrives in a later Creator OS phase.</p>
          </article>
        ))}
      </div>
      <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-bold text-white">Back to today</Link>
    </section>
  );
}
