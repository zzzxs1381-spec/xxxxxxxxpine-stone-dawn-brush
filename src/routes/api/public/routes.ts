import { createFileRoute } from "@tanstack/react-router";
import { getPublicRoutes } from "@/lib/xfreedom/live-public";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Cache-Control": "no-store",
};

export const Route = createFileRoute("/api/public/routes")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const data = await getPublicRoutes();
        return Response.json(
          {
            source: data.live ? "xservis.app" : "catalog",
            credentialsExposed: false,
            routes: data.routes,
            count: data.count || data.routes.length,
          },
          { headers: cors },
        );
      },
    },
  },
});
