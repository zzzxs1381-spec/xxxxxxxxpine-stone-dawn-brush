import { createFileRoute } from "@tanstack/react-router";
import { bearer, nativeConfig, nativeCors } from "@/lib/xfreedom/native";

const cors = nativeCors();

export const Route = createFileRoute("/api/native/config")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const body = await nativeConfig(bearer(request));
        return Response.json(body, { headers: cors });
      },
    },
  },
});
