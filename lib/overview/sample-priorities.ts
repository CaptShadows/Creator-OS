export function effectiveSamplePriority(contentPriorities: number[]) {
  return contentPriorities.length ? Math.max(...contentPriorities) : 1;
}
export function rankSampleActions<
  T extends {
    effectivePriority: number;
    actionDate: Date | null;
    updatedAt: Date;
  },
>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      b.effectivePriority - a.effectivePriority ||
      (a.actionDate?.getTime() ?? Number.MAX_SAFE_INTEGER) -
        (b.actionDate?.getTime() ?? Number.MAX_SAFE_INTEGER) ||
      b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}
