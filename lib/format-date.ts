const CREATOR_TIME_ZONE = "America/Chicago";

export function formatOperationalDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: CREATOR_TIME_ZONE,
  }).format(date);
}
