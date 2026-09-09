import { createFileRoute } from "@tanstack/react-router";
import { ingestAgentReport, type AgentPayload } from "@/lib/xfreedom/ingest";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
};

export const Route = createFileRoute("/api/agent/ingest")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const raw = await request.text();
        if (raw.length > 16_000) {
          return Response.json({ ok: false, error: "payload too large" }, { status: 413, headers: cors });
        }
        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "invalid json" }, { status: 400, headers: cors });
        }
        const header = request.headers.get("authorization") ?? "";
        if (!payload.token && header.toLowerCase().startsWith("bearer ")) {
          payload.token = header.slice(7).trim();
        }
        const result = await ingestAgentReport({ ...(payload as AgentPayload), payloadBytes: raw.length });
        return Response.json(result, { status: result.status, headers: cors });
      },
    },
  },
});
