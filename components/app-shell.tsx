import Link from "next/link";
import { NavigationLink } from "@/components/navigation-link";
import { navigation } from "@/lib/navigation";
import { logoutAction } from "@/app/auth-actions";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17.5rem_1fr]">
      <aside className="sidebar-panel hidden border-r border-[var(--line)] p-7 lg:flex lg:flex-col">
        <Brand />
        <div className="mt-8 h-px bg-gradient-to-r from-[var(--metal-accent)] to-transparent" />
        <nav aria-label="Primary" className="mt-10 grid gap-2">
          {navigation.map((item) => (
            <NavigationLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <div className="mt-auto border-t border-[var(--line)] pt-5">
          <p className="eyebrow text-[0.625rem]">Tonya Wellness</p>
          <p className="mt-2 max-w-44 text-xs leading-5 text-[var(--muted)]">A calmer way to run the creator business.</p>
          <form action={logoutAction}><button className="mt-4 min-h-11 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]" type="submit">Sign out</button></form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex min-h-16 items-center border-b border-[var(--line)] bg-[color:var(--surface)]/95 px-5 backdrop-blur lg:hidden">
          <Brand />
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-7 pb-28 sm:px-8 lg:px-12 lg:py-12 lg:pb-12">{children}</main>
      </div>

      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-20 flex gap-1 overflow-x-auto border-t border-[var(--line)] bg-[color:var(--surface)]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        {navigation.map((item) => <NavigationLink key={item.href} href={item.href} label={item.shortLabel} mobile />)}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="Creator OS overview">
      <span className="brand-monogram grid size-10 place-items-center rounded-lg border border-[color-mix(in_srgb,var(--metal-accent),var(--accent)_45%)] text-sm font-bold text-white">CO</span>
      <span><span className="display-heading block text-xl leading-none text-[var(--foreground)]">Creator OS</span><span className="mt-1 hidden text-[0.625rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)] lg:block">Daily command center</span></span>
    </Link>
  );
}
