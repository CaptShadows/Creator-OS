import Link from "next/link";
import { navigation } from "@/lib/navigation";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-[var(--line)] bg-[var(--surface)] p-6 lg:flex lg:flex-col">
        <Brand />
        <nav aria-label="Primary" className="mt-10 grid gap-2">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="min-h-12 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto text-xs leading-5 text-[var(--muted)]">Creator operations, without the app scavenger hunt.</p>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex min-h-16 items-center border-b border-[var(--line)] bg-[color:var(--surface)]/95 px-5 backdrop-blur lg:hidden">
          <Brand compact />
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-7 pb-28 sm:px-8 lg:px-10 lg:py-10 lg:pb-10">{children}</main>
      </div>

      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 flex gap-1 overflow-x-auto border-t border-[var(--line)] bg-[color:var(--surface)]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        {navigation.map((item) => <MobileLink key={item.href} {...item} />)}
      </nav>
    </div>
  );
}

function MobileLink({ href, shortLabel }: { href: string; shortLabel: string }) {
  return <Link href={href} className="flex min-h-14 min-w-20 flex-1 items-center justify-center rounded-xl px-2 text-center text-xs font-semibold text-[var(--muted)]">{shortLabel}</Link>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="Creator OS overview">
      <span className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white">CO</span>
      <span className={compact ? "font-bold" : "text-lg font-bold tracking-tight"}>Creator OS</span>
    </Link>
  );
}
