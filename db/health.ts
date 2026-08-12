import "server-only";

import { sql } from "drizzle-orm";
import { getDatabase } from "./client";

export type DatabaseHealth =
  | { status: "healthy" }
  | { status: "unavailable"; reason: "configuration_missing" | "connection_failed" };

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  if (!process.env.DATABASE_URL) return { status: "unavailable", reason: "configuration_missing" };

  try {
    await getDatabase().db.execute(sql`select 1`);
    return { status: "healthy" };
  } catch {
    return { status: "unavailable", reason: "connection_failed" };
  }
}
