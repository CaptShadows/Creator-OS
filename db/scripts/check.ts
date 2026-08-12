import { sql } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../client";

try {
  await getDatabase().db.execute(sql`select 1`);
  console.log("Database connection is healthy.");
} finally {
  await closeDatabase();
}
