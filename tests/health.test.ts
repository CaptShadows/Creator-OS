import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("health endpoint", () => {
  it("returns a clear healthy response", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "healthy", service: "creator-os" });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
