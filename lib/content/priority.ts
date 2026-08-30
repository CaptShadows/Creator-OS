export const contentPriorityValues = ["high", "medium", "low"] as const;
export type ContentPriority = (typeof contentPriorityValues)[number];

export const contentPriorityLabels: Record<ContentPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

export const contentPriorityScores: Record<ContentPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function priorityFromScore(score: number | null | undefined): ContentPriority {
  if ((score ?? 2) >= 3) return "high";
  if ((score ?? 2) <= 1) return "low";
  return "medium";
}

export function priorityScore(value: ContentPriority): number {
  return contentPriorityScores[value];
}
