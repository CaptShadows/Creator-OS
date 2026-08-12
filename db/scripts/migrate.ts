import { migrate } from "drizzle-orm/postgres-js/migrator";
import { closeDatabase, getDatabase } from "../client";

try {
  await migrate(getDatabase().db, { migrationsFolder: "db/migrations" });
  console.log("Database migrations applied successfully.");
} finally {
  await closeDatabase();
}
