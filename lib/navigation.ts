export const navigation = [
  { href: "/", label: "Overview", shortLabel: "Today" },
  { href: "/calendar", label: "Calendar", shortLabel: "Calendar" },
  { href: "/create", label: "Create", shortLabel: "Create" },
  { href: "/campaigns", label: "Campaigns", shortLabel: "Campaigns" },
  { href: "/brand-deals", label: "Brand Deals", shortLabel: "Deals" },
  { href: "/products", label: "Products", shortLabel: "Products" },
  { href: "/archive", label: "Archive", shortLabel: "Archive" },
  { href: "/analytics", label: "Analytics", shortLabel: "Analytics" },
  { href: "/platforms", label: "Platforms", shortLabel: "Platforms" },
] as const;

export type NavigationItem = (typeof navigation)[number];
