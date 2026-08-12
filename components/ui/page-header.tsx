export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <header className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">{eyebrow}</p><h1 className="display-heading mt-2 text-4xl sm:text-5xl">{title}</h1>{description && <p className="profile-density-secondary mt-3 max-w-2xl leading-7 text-[var(--muted)]">{description}</p>}</div>{action}</header>;
}
