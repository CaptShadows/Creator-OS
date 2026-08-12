import Link from "next/link";
export function TouchButton({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="touch-target primary-action inline-flex min-h-12 items-center justify-center px-5 text-sm font-bold">{children}</Link>; }
