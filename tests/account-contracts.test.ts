import { describe, expect, it } from "vitest";
import { changeEmailSchema, changePasswordSchema } from "@/lib/account/contracts";

describe("account settings contracts", () => {
  it("normalizes a changed login email", () => {
    expect(changeEmailSchema.parse({ email: " Tonya@Example.COM ", currentPassword: "current" }).email).toBe("tonya@example.com");
  });

  it("requires matching, distinct passwords of at least 12 characters", () => {
    expect(changePasswordSchema.safeParse({ currentPassword: "old-password", newPassword: "short", confirmPassword: "short" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: "same-password-123", newPassword: "same-password-123", confirmPassword: "same-password-123" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: "old-password", newPassword: "new-password-123", confirmPassword: "different-password" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: "old-password", newPassword: "new-password-123", confirmPassword: "new-password-123" }).success).toBe(true);
  });
});
