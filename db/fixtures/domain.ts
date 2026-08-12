export const domainFixture = {
  ownerId: "00000000-0000-4000-8000-000000000001",
  platformAccounts: [
    { id: "00000000-0000-4000-8000-000000000101", platform: "tiktok", displayName: "Tonya TikTok Main" },
    { id: "00000000-0000-4000-8000-000000000102", platform: "tiktok", displayName: "Tonya TikTok Shop" },
  ],
  content: { id: "00000000-0000-4000-8000-000000000201", title: "Fixture content", status: "idea" },
  campaign: { id: "00000000-0000-4000-8000-000000000301", name: "Fixture campaign" },
  deliverables: [
    { id: "00000000-0000-4000-8000-000000000311", title: "Video one" },
    { id: "00000000-0000-4000-8000-000000000312", title: "Video two" },
  ],
  product: { id: "00000000-0000-4000-8000-000000000401", name: "Fixture product" },
  productListings: [
    { id: "00000000-0000-4000-8000-000000000411", platform: "amazon" },
    { id: "00000000-0000-4000-8000-000000000412", platform: "tiktok" },
  ],
} as const;
