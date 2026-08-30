import { describe, expect, it } from "vitest";
import { contentAutosaveSchema, contentPriorityUpdateSchema, pendingDraftKey, quickIdeaSchema } from "@/lib/content/contracts";
import { canTransitionContent, nextContentStatus, previousContentStatus } from "@/lib/content/lifecycle";
import { contentPriorityLabels, priorityFromScore, priorityScore } from "@/lib/content/priority";

describe("Create content workflow", () => {
  it("captures an idea with a Medium default and accepts explicit priorities", () => {
    expect(quickIdeaSchema.parse({ idea: "Film a fall kitchen favorites reel" })).toEqual({ idea: "Film a fall kitchen favorites reel", priority: "medium" });
    expect(quickIdeaSchema.parse({ idea: "Urgent sponsored post", priority: "high" }).priority).toBe("high");
    expect(() => quickIdeaSchema.parse({ idea: "   " })).toThrow();
    expect(() => quickIdeaSchema.parse({ idea: "Test", priority: "urgent" })).toThrow();
  });

  it("maps typed priority values to deterministic stored scores", () => {
    expect(priorityScore("high")).toBe(3);
    expect(priorityScore("medium")).toBe(2);
    expect(priorityScore("low")).toBe(1);
    expect(priorityFromScore(0)).toBe("low");
    expect(priorityFromScore(2)).toBe("medium");
    expect(contentPriorityLabels.high).toBe("High priority");
    expect(contentPriorityUpdateSchema.parse({contentId:"00000000-0000-4000-8000-000000000001",priority:"low"}).priority).toBe("low");
  });

  it("permits only explicit adjacent lifecycle transitions", () => {
    expect(nextContentStatus("idea")).toBe("scripting");
    expect(previousContentStatus("ready_to_film")).toBe("scripting");
    expect(canTransitionContent("idea", "scripting")).toBe(true);
    expect(canTransitionContent("idea", "posted")).toBe(false);
    expect(nextContentStatus("posted")).toBeNull();
    expect(nextContentStatus("archived")).toBeNull();
  });

  it("validates the authoritative autosave boundary", () => {
    const valid = contentAutosaveSchema.parse({ title: "Fall favorites", concept: null, hook: "Start here", script: "Body", caption: null, notes: null, contentType: "reel", contentPillar: "lifestyle", baseUpdatedAt: "2026-08-12T00:00:00.000Z" });
    expect(valid.title).toBe("Fall favorites");
    expect(() => contentAutosaveSchema.parse({ ...valid, title: "" })).toThrow();
  });

  it("scopes pending browser buffers by owner and content", () => {
    expect(pendingDraftKey("owner-a", "content-1")).not.toBe(pendingDraftKey("owner-b", "content-1"));
    expect(pendingDraftKey("owner-a", "content-1")).not.toBe(pendingDraftKey("owner-a", "content-2"));
  });
});
