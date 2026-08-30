import { describe, expect, it } from "vitest";
import {
  canTransitionSample,
  nextSampleStatus,
  statusesForFilter,
} from "@/lib/samples/lifecycle";
import { productEditSchema, quickSampleSchema } from "@/lib/samples/contracts";
describe("sample workflow", () => {
  it("moves through adjacent explicit states", () => {
    expect(nextSampleStatus("arrived")).toBe("content_needed");
    expect(canTransitionSample("arrived", "content_needed")).toBe(true);
    expect(canTransitionSample("requested", "shipped")).toBe(false);
  });
  it("maps action filters", () => {
    expect(statusesForFilter("pending")).toEqual([
      "requested",
      "pending",
      "approved",
    ]);
    expect(statusesForFilter("needs_content")).toEqual(["content_needed"]);
  });
  it("supports quick capture for a new or existing product", () => {
    expect(
      quickSampleSchema.safeParse({
        newProductName: "Serum",
        sourcePlatform: "TikTok",
        productId: "",
      }).success,
    ).toBe(true);
    expect(
      quickSampleSchema.safeParse({ newProductName: "", productId: "" })
        .success,
    ).toBe(false);
  });
  it("requires a product priority when editing", () => {
    const result = productEditSchema.parse({ productId:"00000000-0000-4000-8000-000000000001", name:"Serum", category:"", notes:"", priority:"high", active:"true" });
    expect(result.priority).toBe("high");
  });
});
