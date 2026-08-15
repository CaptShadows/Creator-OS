import { describe, expect, it } from "vitest";
import { shouldUseSecureSessionCookie } from "@/lib/auth/cookie-policy";

describe("session cookie policy", () => {
  it("allows LAN and Tailscale HTTP installations to retain their session", () => {
    expect(shouldUseSecureSessionCookie("http://localhost:3000")).toBe(false);
    expect(shouldUseSecureSessionCookie("http://100.83.67.85:3000")).toBe(false);
  });

  it("enables Secure cookies when Creator OS is served over HTTPS", () => {
    expect(shouldUseSecureSessionCookie("https://creator-os.example.com")).toBe(true);
  });
});
