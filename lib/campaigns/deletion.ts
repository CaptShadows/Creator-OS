export type CampaignDependencyState = {
  deliverables: boolean;
  compensations: boolean;
  payments: boolean;
  contentLinks: boolean;
  samples: boolean;
  attachments: boolean;
};

const labels: Record<keyof CampaignDependencyState, string> = {
  deliverables: "deliverables",
  compensations: "compensation records",
  payments: "payment history",
  contentLinks: "linked content",
  samples: "linked samples",
  attachments: "PDF attachments",
};

export function campaignDeletionBlockers(state: CampaignDependencyState) {
  return (Object.keys(labels) as (keyof CampaignDependencyState)[]).filter((key) => state[key]).map((key) => labels[key]);
}
