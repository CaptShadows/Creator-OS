"use client";

import { useClientProfile, type ProfilePreference } from "@/components/client-profile-provider";

export function ProfileControl({ compact = false }: { compact?: boolean }) {
  const { profile, preference, setPreference } = useClientProfile();
  return (
    <label className="grid gap-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
      <span className={compact ? "sr-only" : ""}>Display profile</span>
      <select aria-label="Display profile" value={preference} onChange={(event) => setPreference(event.target.value as ProfilePreference)} className="min-h-11 border border-[var(--line)] bg-[var(--surface)] px-2 text-xs font-semibold normal-case tracking-normal text-[var(--foreground)]">
        <option value="auto">Auto ({profile})</option><option value="mobile">Mobile</option><option value="tablet">Tablet</option><option value="desktop">Desktop</option><option value="wall">Wall</option>
      </select>
    </label>
  );
}
