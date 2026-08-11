export const navigation = [
  { href: "/", label: "Overview", shortLabel: "Today" },
  { href: "/calendar", label: "Calendar", shortLabel: "Calendar" },
  { href: "/create", label: "Create", shortLabel: "Create" },
  { href: "/campaigns", label: "Campaigns", shortLabel: "Campaigns" },
  { href: "/products", label: "Products", shortLabel: "Products" },
  { href: "/analytics", label: "Analytics", shortLabel: "Analytics" },
  { href: "/platforms", label: "Platforms", shortLabel: "Platforms" },
] as const;

export type NavigationItem = (typeof navigation)[number];
