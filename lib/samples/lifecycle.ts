import type { SampleStatus } from "@/lib/domain/contracts";

export const sampleLifecycle: SampleStatus[] = ["requested", "pending", "approved", "shipped", "arrived", "content_needed", "completed"];
export const sampleStatusLabels: Record<SampleStatus,string> = { requested:"Requested",pending:"Pending",approved:"Approved",shipped:"Shipped",arrived:"Arrived",content_needed:"Needs content",completed:"Completed" };
export const sampleFilters = { pending:["requested","pending","approved"], in_transit:["shipped"], arrived:["arrived"], needs_content:["content_needed"], completed:["completed"] } as const;
export type SampleFilter = keyof typeof sampleFilters | "all";
export function nextSampleStatus(status:SampleStatus){return sampleLifecycle[sampleLifecycle.indexOf(status)+1]??null;}
export function previousSampleStatus(status:SampleStatus){return sampleLifecycle[sampleLifecycle.indexOf(status)-1]??null;}
export function canTransitionSample(from:SampleStatus,to:SampleStatus){return nextSampleStatus(from)===to||previousSampleStatus(from)===to;}
export function statusesForFilter(filter:SampleFilter):SampleStatus[]|null{return filter==="all"?null:[...sampleFilters[filter]];}
