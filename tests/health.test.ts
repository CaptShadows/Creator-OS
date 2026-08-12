import { describe, expect, it, vi } from "vitest";
import { checkDatabaseHealth } from "@/db/health";

vi.mock("server-only", () => ({}));
vi.mock("@/db/health", () => ({ checkDatabaseHealth: vi.fn(async () => ({ status: "healthy" })) }));

describe("health endpoint", () => {
  it("returns a clear healthy response", async () => {
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "healthy", service: "creator-os" });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns an explicit unavailable state without leaking a connection string", async () => {
    vi.mocked(checkDatabaseHealth).mockResolvedValueOnce({ status: "unavailable", reason: "connection_failed" });
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toMatchObject({ status: "unhealthy", database: { status: "unavailable", reason: "connection_failed" } });
    expect(JSON.stringify(body)).not.toContain("postgresql://");
  });
});
