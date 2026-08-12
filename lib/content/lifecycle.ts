import { contentStatuses, type ContentStatus } from "@/lib/domain/contracts";

const activeStatuses = contentStatuses.filter((status) => status !== "archived") as Exclude<ContentStatus, "archived">[];

export function nextContentStatus(status: ContentStatus): ContentStatus | null {
  if (status === "archived" || status === "posted") return null;
  return activeStatuses[activeStatuses.indexOf(status) + 1] ?? null;
}

export function previousContentStatus(status: ContentStatus): ContentStatus | null {
  if (status === "archived" || status === "idea") return null;
  return activeStatuses[activeStatuses.indexOf(status) - 1] ?? null;
}

export function canTransitionContent(from: ContentStatus, to: ContentStatus): boolean {
  return to === nextContentStatus(from) || to === previousContentStatus(from);
}

export const contentStatusLabels: Record<ContentStatus, string> = {
  idea: "Idea", scripting: "Scripting", ready_to_film: "Ready to Film", filmed: "Filmed", edited: "Edited", ready_to_post: "Ready to Post", posted: "Posted", archived: "Archived",
};
