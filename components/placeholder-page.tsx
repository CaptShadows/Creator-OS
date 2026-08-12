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
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-heading mt-3 max-w-3xl text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{description}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {focus.map((item) => (
          <article key={item} className="luxury-card min-h-32 rounded-xl p-5">
            <div className="mb-4 h-px w-9 bg-[var(--metal-accent)]" />
            <h2 className="font-semibold">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">This workspace arrives in a later Creator OS phase.</p>
          </article>
        ))}
      </div>
      <Link href="/" className="primary-action mt-8 inline-flex min-h-12 items-center rounded-lg px-5 text-sm font-bold">Back to today</Link>
    </section>
  );
}
