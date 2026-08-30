export const contentPriorities = ["high", "medium", "low"] as const;
export type ContentPriority = (typeof contentPriorities)[number];
export const priorityValue: Record<ContentPriority, number> = {
  high: 2,
  medium: 1,
  low: 0,
};
export const priorityLabel = (value: number) =>
  value >= 2
    ? "High priority"
    : value <= 0
      ? "Low priority"
      : "Medium priority";
export const parsePriority = (value: unknown): ContentPriority =>
  contentPriorities.includes(value as ContentPriority)
    ? (value as ContentPriority)
    : "medium";
