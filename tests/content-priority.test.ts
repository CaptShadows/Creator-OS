import { describe, expect, it } from "vitest";
import {
  parsePriority,
  priorityLabel,
  priorityValue,
} from "@/lib/content/priority";
import {
  effectiveSamplePriority,
  rankSampleActions,
} from "@/lib/overview/sample-priorities";
describe("content priority", () => {
  it("defaults unknown values to medium", () =>
    expect(parsePriority(undefined)).toBe("medium"));
  it("maps accessible labels to stable stored values", () => {
    expect(priorityValue).toEqual({ high: 2, medium: 1, low: 0 });
    expect(priorityLabel(2)).toBe("High priority");
    expect(priorityLabel(1)).toBe("Medium priority");
    expect(priorityLabel(0)).toBe("Low priority");
  });
  it("derives the highest linked priority and defaults unlinked samples to medium", () => {
    expect(effectiveSamplePriority([0, 2, 1])).toBe(2);
    expect(effectiveSamplePriority([])).toBe(1);
  });
  it("orders samples by priority, action date, then recent update", () => {
    const rows = rankSampleActions([
      {
        id: "low",
        effectivePriority: 0,
        actionDate: null,
        updatedAt: new Date("2026-01-03"),
      },
      {
        id: "high-later",
        effectivePriority: 2,
        actionDate: new Date("2026-02-01"),
        updatedAt: new Date("2026-01-01"),
      },
      {
        id: "high-sooner",
        effectivePriority: 2,
        actionDate: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
      {
        id: "medium",
        effectivePriority: 1,
        actionDate: null,
        updatedAt: new Date("2026-01-04"),
      },
    ]);
    expect(rows.map((x) => x.id)).toEqual([
      "high-sooner",
      "high-later",
      "medium",
      "low",
    ]);
  });
});
