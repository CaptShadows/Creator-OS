import { describe, expect, it } from "vitest";
import { formatOperationalDate } from "@/lib/format-date";

describe("formatOperationalDate", () => {
  it("formats the current operational date in Tonya's Central timezone", () => {
    const justAfterMidnightUtc = new Date("2026-08-12T00:30:00.000Z");

    expect(formatOperationalDate(justAfterMidnightUtc)).toBe("Tuesday, August 11");
  });
});
