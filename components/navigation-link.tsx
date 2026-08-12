"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationLinkProps = {
  href: string;
  label: string;
  mobile?: boolean;
};

export function NavigationLink({ href, label, mobile = false }: NavigationLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === href : pathname.startsWith(href);

  const base = mobile
    ? "flex min-h-14 min-w-20 flex-1 items-center justify-center border-b-2 px-2 text-center text-xs font-semibold transition"
    : "flex min-h-12 items-center border-l-2 px-4 py-3 text-sm font-semibold transition";
  const state = active
    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
    : "border-transparent text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--accent-soft),transparent_48%)] hover:text-[var(--accent-strong)]";

  return <Link href={href} aria-current={active ? "page" : undefined} className={`${base} ${state}`}>{label}</Link>;
}
