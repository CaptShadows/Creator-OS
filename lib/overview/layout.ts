export const overviewWidgetIds = [
  "summary-film",
  "summary-due",
  "summary-ready",
  "film",
  "due",
  "samples",
  "ready",
  "deadlines",
  "payments",
  "brand-deals",
  "brand-deal-due",
  "brand-deal-payments",
  "brand-deal-revenue",
  "health",
  "revenue",
] as const;
export type OverviewWidgetId = (typeof overviewWidgetIds)[number];
export type OverviewSize = "small" | "medium" | "large";
export type OverviewLayoutItem = {
  id: OverviewWidgetId;
  size: OverviewSize;
  visible: boolean;
};
export type OverviewProfile = "mobile" | "tablet" | "desktop" | "wall";
export const overviewProfiles: OverviewProfile[] = [
  "mobile",
  "tablet",
  "desktop",
  "wall",
];
const optional = new Set<OverviewWidgetId>([
  "brand-deals",
  "brand-deal-due",
  "brand-deal-payments",
  "brand-deal-revenue",
]);
const defaults: Record<OverviewProfile, OverviewLayoutItem[]> =
  Object.fromEntries(
    overviewProfiles.map((profile) => [
      profile,
      overviewWidgetIds.map((id, index) => ({
        id,
        size: profile === "mobile" ? "large" : index < 3 ? "small" : "medium",
        visible: !optional.has(id),
      })),
    ]),
  ) as Record<OverviewProfile, OverviewLayoutItem[]>;
export function defaultOverviewLayout(profile: OverviewProfile) {
  return defaults[profile].map((x) => ({ ...x }));
}
export function sanitizeOverviewLayout(
  value: unknown,
  profile: OverviewProfile,
) {
  if (!Array.isArray(value)) return defaultOverviewLayout(profile);
  const seen = new Set<string>();
  const valid = value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    if (
      !overviewWidgetIds.includes(item.id as OverviewWidgetId) ||
      seen.has(String(item.id))
    )
      return [];
    seen.add(String(item.id));
    const size: OverviewSize =
      profile === "mobile"
        ? "large"
        : item.size === "small" ||
            item.size === "medium" ||
            item.size === "large"
          ? item.size
          : "medium";
    return [
      {
        id: item.id as OverviewWidgetId,
        size,
        visible: item.visible !== false,
      },
    ];
  });
  for (const item of defaultOverviewLayout(profile))
    if (!seen.has(item.id)) valid.push({ ...item, visible: false });
  return valid;
}
export function moveVisibleWidget(
  layout: OverviewLayoutItem[],
  id: OverviewWidgetId,
  delta: number,
) {
  const visible = layout.filter((x) => x.visible),
    from = visible.findIndex((x) => x.id === id),
    to = Math.max(0, Math.min(visible.length - 1, from + delta));
  if (from < 0 || from === to) return layout;
  const target = visible[to].id,
    next = [...layout],
    fromIndex = next.findIndex((x) => x.id === id),
    targetIndex = next.findIndex((x) => x.id === target),
    item = next.splice(fromIndex, 1)[0];
  next.splice(targetIndex, 0, item);
  return next;
}
