import { getServerEnvironment } from "@/lib/server/env";
import { checkDatabaseHealth } from "@/db/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const { nodeEnv } = getServerEnvironment();
  const database = await checkDatabaseHealth();
  const healthy = database.status === "healthy";

  return Response.json(
    { status: healthy ? "healthy" : "unhealthy", service: "creator-os", environment: nodeEnv, database, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
