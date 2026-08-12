import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/auth-actions";
import { getCurrentOwner } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentOwner()) redirect("/");
  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-md py-12 lg:py-20">
      <p className="eyebrow">Private workspace</p>
      <h1 className="display-heading mt-3 text-4xl">Welcome back.</h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">Sign in to open Creator OS.</p>
      {error && <p role="alert" className="mt-6 border border-[var(--line)] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-strong)]">{error === "invalid" ? "That email or password did not match." : "Creator OS cannot reach its database. Check service health and try again."}</p>}
      <form action={loginAction} className="luxury-card mt-7 grid gap-5 rounded-xl p-6">
        <label className="grid gap-2 text-sm font-bold">Email<input name="email" type="email" autoComplete="username" required className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal outline-none focus:border-[var(--accent-strong)]" /></label>
        <label className="grid gap-2 text-sm font-bold">Password<input name="password" type="password" autoComplete="current-password" required minLength={12} className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal outline-none focus:border-[var(--accent-strong)]" /></label>
        <button type="submit" className="primary-action min-h-12 px-5 text-sm font-bold">Sign in</button>
      </form>
    </section>
  );
}
