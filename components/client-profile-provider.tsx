"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ClientProfile = "mobile" | "tablet" | "desktop" | "wall";
export type ProfilePreference = "auto" | ClientProfile;

const STORAGE_KEY = "creator-os-client-profile";

type ProfileContextValue = { profile: ClientProfile; preference: ProfilePreference; setPreference: (preference: ProfilePreference) => void };
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function resolveAutomaticProfile(width: number): ClientProfile {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  if (width >= 1920) return "wall";
  return "desktop";
}

export function ClientProfileProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ProfilePreference>("auto");
  const [automaticProfile, setAutomaticProfile] = useState<ClientProfile>("desktop");

  useEffect(() => {
    const update = () => setAutomaticProfile(resolveAutomaticProfile(window.innerWidth));
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isPreference(stored)) setPreferenceState(stored);
      update();
    });
    window.addEventListener("resize", update);
    return () => { active = false; window.removeEventListener("resize", update); };
  }, []);

  const profile = preference === "auto" ? automaticProfile : preference;
  useEffect(() => { document.documentElement.dataset.clientProfile = profile; }, [profile]);

  const setPreference = (next: ProfilePreference) => {
    setPreferenceState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ profile, preference, setPreference }), [profile, preference]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useClientProfile(): ProfileContextValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error("useClientProfile must be used within ClientProfileProvider");
  return value;
}

function isPreference(value: string | null): value is ProfilePreference {
  return value === "auto" || value === "mobile" || value === "tablet" || value === "desktop" || value === "wall";
}
