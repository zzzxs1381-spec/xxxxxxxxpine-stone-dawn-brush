import { createFileRoute } from "@tanstack/react-router";
import { adviceForToken } from "@/lib/xfreedom/ingest";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
};

function bearer(request: Request) {
  const h = request.headers.get("authorization") ?? "";
  if (h.toLowerCase().startsWith("bearer ")) return h.slice(7).trim();
  return "";
}

export const Route = createFileRoute("/api/agent/advice")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const result = await adviceForToken(bearer(request));
        return Response.json(result, { status: result.status, headers: cors });
      },
    },
  },
});
