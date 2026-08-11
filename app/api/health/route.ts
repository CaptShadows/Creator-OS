import { getServerEnvironment } from "@/lib/server/env";

export const dynamic = "force-dynamic";

export function GET() {
  const { nodeEnv } = getServerEnvironment();

  return Response.json(
    { status: "healthy", service: "creator-os", environment: nodeEnv, timestamp: new Date().toISOString() },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
