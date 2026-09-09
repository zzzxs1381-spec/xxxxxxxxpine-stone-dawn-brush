import { createFileRoute } from "@tanstack/react-router";
import { getPublicStatus } from "@/lib/xfreedom/live-public";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Cache-Control": "no-store",
};

export const Route = createFileRoute("/api/public/status")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const data = await getPublicStatus();
        return Response.json(data, { headers: cors });
      },
    },
  },
});
