import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;
type DatabaseConnection = { client: Sql; db: Database };

let connection: DatabaseConnection | undefined;

export function getDatabase(): DatabaseConnection {
  if (connection) return connection;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");

  const client = postgres(databaseUrl, {
    max: Number(process.env.DATABASE_POOL_SIZE ?? 5),
    connect_timeout: 5,
    idle_timeout: 20,
    prepare: false,
  });
  connection = { client, db: drizzle(client, { schema }) };
  return connection;
}

export async function closeDatabase(): Promise<void> {
  if (!connection) return;
  await connection.client.end();
  connection = undefined;
}
