import { PageHeader } from "@/components/ui/page-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import { requireOwner } from "@/lib/auth/server";
import { changeEmailAction, changePasswordAction } from "./actions";

export const dynamic = "force-dynamic";

type Query = { emailChanged?: string; emailError?: string; passwordError?: string };

export default async function AccountPage({ searchParams }: { searchParams: Promise<Query> }) {
  const owner = await requireOwner();
  const query = await searchParams;
  const emailError = query.emailError === "password" ? "Current password is incorrect." : query.emailError === "in-use" ? "That email is already in use." : query.emailError === "unchanged" ? "Enter a different email address." : query.emailError ? "Enter a valid email and current password." : null;
  const passwordError = query.passwordError === "current" ? "Current password is incorrect." : query.passwordError ? "Use a different password of at least 12 characters and enter it the same way twice." : null;

  return <section className="space-y-8">
    <PageHeader eyebrow="Account" title="Login & security" description="Update the email used to sign in or replace the account password." />
    {query.emailChanged && <p role="status" className="border border-green-300 bg-green-50 p-4 text-sm text-green-900">Login email updated. Use the new email the next time you sign in.</p>}
    <div className="grid gap-6 lg:grid-cols-2">
      <SurfaceCard>
        <h2 className="display-heading text-2xl">Change login email</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Current email: {owner.email}</p>
        {emailError && <p role="alert" className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-900">{emailError}</p>}
        <form action={changeEmailAction} className="mt-5 grid gap-4">
          <Field label="New email" name="email" type="email" autoComplete="email" />
          <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" minLength={12} />
          <button className="primary-action min-h-12 px-5 text-sm font-bold justify-self-start">Update email</button>
        </form>
      </SurfaceCard>
      <SurfaceCard>
        <h2 className="display-heading text-2xl">Change password</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Changing the password signs out existing sessions and requires the new password on the next login.</p>
        {passwordError && <p role="alert" className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-900">{passwordError}</p>}
        <form action={changePasswordAction} className="mt-5 grid gap-4">
          <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" minLength={12} />
          <Field label="New password" name="newPassword" type="password" autoComplete="new-password" minLength={12} />
          <Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} />
          <button className="primary-action min-h-12 px-5 text-sm font-bold justify-self-start">Change password</button>
        </form>
      </SurfaceCard>
    </div>
  </section>;
}

function Field({ label, name, type, autoComplete, minLength }: { label: string; name: string; type: "email" | "password"; autoComplete: string; minLength?: number }) {
  return <label className="grid gap-2 text-sm font-bold">{label}<input className="min-h-12 border border-[var(--line)] bg-white px-3 font-normal outline-none focus:border-[var(--accent-strong)]" name={name} type={type} autoComplete={autoComplete} minLength={minLength} required /></label>;
}
