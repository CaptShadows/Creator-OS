"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationLink } from "@/components/navigation-link";
import { ProfileControl } from "@/components/profile-control";
import { navigation } from "@/lib/navigation";
import { logoutAction } from "@/app/auth-actions";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname === "/login") return <div className="min-h-dvh"><header className="border-b border-[var(--line)] bg-[var(--surface)] px-6 py-4"><Brand /></header><main className="px-5">{children}</main></div>;

  return (
    <div className="app-shell min-h-dvh">
      <aside className="app-sidebar sidebar-panel border-r border-[var(--line)] p-7">
        <Brand />
        <div className="mt-8 h-px bg-gradient-to-r from-[var(--metal-accent)] to-transparent" />
        <nav aria-label="Primary" className="mt-10 grid gap-2">
          {navigation.map((item) => (
            <NavigationLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <Link href="/create#quick-idea" className="primary-action mt-5 inline-flex min-h-12 items-center justify-center px-4 text-sm font-bold">+ Idea</Link>
        <div className="mt-auto border-t border-[var(--line)] pb-14 pt-5">
          <p className="eyebrow text-[0.625rem]">Tonya Wellness</p>
          <p className="mt-2 max-w-44 text-xs leading-5 text-[var(--muted)]">A calmer way to run the creator business.</p>
          <div className="mt-4"><ProfileControl /></div>
          <form action={logoutAction}><button className="mt-4 min-h-11 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]" type="submit">Sign out</button></form>
        </div>
      </aside>

      <div className="app-content min-w-0">
        <header className="app-mobile-header sticky top-0 z-10 min-h-16 items-center justify-between border-b border-[var(--line)] bg-[color:var(--surface)]/95 px-5 backdrop-blur">
          <Brand />
          <div className="flex items-center gap-3"><ProfileControl compact /><SignOutButton compact /></div>
        </header>
        <header className="wall-header flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--surface)] px-10 py-5"><Brand /><nav aria-label="Wall primary" className="flex flex-wrap gap-2">{navigation.map((item) => <NavigationLink key={item.href} href={item.href} label={item.shortLabel} />)}</nav><div className="flex items-center gap-3"><ProfileControl compact/><SignOutButton compact/></div></header>
        <main className="app-main mx-auto w-full max-w-7xl">{children}</main>
      </div>

      <nav aria-label="Primary" className="app-bottom-nav fixed inset-x-0 bottom-0 z-20 gap-1 overflow-x-auto border-t border-[var(--line)] bg-[color:var(--surface)]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        {navigation.map((item) => <NavigationLink key={item.href} href={item.href} label={item.shortLabel} mobile />)}
      </nav>
    </div>
  );
}

function SignOutButton({compact=false}:{compact?:boolean}){return <form action={logoutAction}><button className={compact?"min-h-11 px-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--accent-strong)]":"min-h-11 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-strong)]"} type="submit">Sign out</button></form>}

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="Creator OS overview">
      <span className="brand-monogram grid size-10 place-items-center rounded-lg border border-[color-mix(in_srgb,var(--metal-accent),var(--accent)_45%)] text-sm font-bold text-white">CO</span>
      <span><span className="display-heading block text-xl leading-none text-[var(--foreground)]">Creator OS</span><span className="mt-1 hidden text-[0.625rem] font-bold uppercase tracking-[0.18em] text-[var(--muted)] lg:block">Daily command center</span></span>
    </Link>
  );
}
