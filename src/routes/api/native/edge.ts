import { createFileRoute } from "@tanstack/react-router";
import { edgeReport, nativeCors } from "@/lib/xfreedom/native";

const cors = nativeCors();

export const Route = createFileRoute("/api/native/edge")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const body = await edgeReport();
        return Response.json(body, { headers: cors });
      },
    },
  },
});
