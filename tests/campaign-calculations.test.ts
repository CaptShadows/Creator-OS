import { describe, expect, it } from "vitest";
import { calculateDeliverableProgress, calculateOutstandingByCompensation, isOverdue } from "@/lib/campaigns/calculations";

describe("campaign calculations",()=>{
  it("derives independent deliverable completion",()=>{expect(calculateDeliverableProgress(["completed","submitted","completed","not_started"])).toEqual({completed:2,total:4});});
  it("subtracts only received payments once per compensation",()=>{expect(calculateOutstandingByCompensation([{id:"fixed",agreedAmountCents:100000},{id:"bonus",agreedAmountCents:25000}],[{compensationId:"fixed",amountCents:30000,status:"received"},{compensationId:"fixed",amountCents:20000,status:"received"},{compensationId:"fixed",amountCents:50000,status:"expected"},{compensationId:null,amountCents:999,status:"received"}])).toBe(75000);});
  it("never reports a negative outstanding balance",()=>{expect(calculateOutstandingByCompensation([{id:"fee",agreedAmountCents:1000}],[{compensationId:"fee",amountCents:1200,status:"received"}])).toBe(0);});
  it("flags incomplete past-due records",()=>{const now=new Date("2026-08-12T12:00:00Z");expect(isOverdue(new Date("2026-08-11T12:00:00Z"),false,now)).toBe(true);expect(isOverdue(new Date("2026-08-11T12:00:00Z"),true,now)).toBe(false);});
});
