import { createFileRoute } from "@tanstack/react-router";
import { bearer, nativeCors, nativeStage } from "@/lib/xfreedom/native";

const cors = nativeCors();

export const Route = createFileRoute("/api/native/stage")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const token = bearer(request);
        let json: Record<string, unknown> = {};
        try {
          json = (await request.json()) as Record<string, unknown>;
        } catch {
          json = {};
        }
        const result = await nativeStage(token, json);
        return Response.json(result, { status: result.status, headers: cors });
      },
    },
  },
});
