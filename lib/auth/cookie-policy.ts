export function shouldUseSecureSessionCookie(publicUrl: string | undefined): boolean {
  if (!publicUrl) return false;
  try {
    return new URL(publicUrl).protocol === "https:";
  } catch {
    return false;
  }
}
