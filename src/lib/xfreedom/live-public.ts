import { EDGE_NODES } from "./catalog";

const LIVE_ORIGIN = "https://xservis.app";
const ROUTES_TTL_MS = 20_000;
const STATUS_TTL_MS = 15_000;

export type PublicRouteMeta = {
  id?: string;
  name?: string;
  protocol?: string;
  transport?: string | null;
  health?: string;
};

type Cache<T> = { at: number; value: T };

let routesCache: Cache<{ routes: PublicRouteMeta[]; live: boolean; count: number }> | null = null;
let statusCache: Cache<Record<string, unknown>> | null = null;

function asStr(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s ? s.slice(0, 120) : undefined;
}

export function sanitizePublicRoute(raw: unknown): PublicRouteMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = asStr(o.id);
  const name = asStr(o.name);
  if (!id && !name) return null;
  return {
    id,
    name,
    protocol: asStr(o.protocol),
    transport: o.transport == null ? null : (asStr(o.transport) ?? null),
    health: asStr(o.health) ?? asStr(o.status),
  };
}

function catalogFallback(): PublicRouteMeta[] {
  return EDGE_NODES.filter((n) => n.health !== "FAILED").map((n) => ({
    id: n.id,
    name: n.city,
    protocol: n.transports[0]?.toLowerCase().replace("_", "-"),
    transport: n.transports[0] === "HYSTERIA2" ? "udp" : "tcp",
    health: n.health === "HEALTHY" ? "up" : n.health.toLowerCase(),
  }));
}

async function getJson(path: string, ms: number): Promise<unknown> {
  const res = await fetch(`${LIVE_ORIGIN}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(ms),
  });
  if (!res.ok) throw new Error(`live ${path} ${res.status}`);
  return res.json();
}

export async function getPublicRoutes() {
  const now = Date.now();
  if (routesCache && now - routesCache.at < ROUTES_TTL_MS) return routesCache.value;
  try {
    const body = (await getJson("/api/public/routes", 2600)) as { routes?: unknown[] };
    const routes = Array.isArray(body.routes)
      ? body.routes.map(sanitizePublicRoute).filter((r): r is PublicRouteMeta => Boolean(r))
      : [];
    const value = {
      routes: routes.length > 0 ? routes : catalogFallback(),
      live: routes.length > 0,
      count: routes.length,
    };
    routesCache = { at: now, value };
    return value;
  } catch {
    const value = { routes: catalogFallback(), live: false, count: 0 };
    routesCache = { at: now, value };
    return value;
  }
}

export async function getPublicStatus() {
  const now = Date.now();
  if (statusCache && now - statusCache.at < STATUS_TTL_MS) return statusCache.value;
  try {
    const raw = (await getJson("/api/public/status", 2600)) as Record<string, unknown>;
    const value = {
      service: asStr(raw.service) ?? "XFreedom",
      version: asStr(raw.version) ?? "unknown",
      domain: asStr(raw.domain) ?? "xservis.app",
      botUsername: asStr(raw.botUsername) ?? "xfreedommBot",
      telegramEnabled: Boolean(raw.telegramEnabled),
      publishedRoutes: typeof raw.publishedRoutes === "number" ? raw.publishedRoutes : null,
      routeTypes: Array.isArray(raw.routeTypes) ? raw.routeTypes.filter((t) => typeof t === "string") : [],
      upstreamError: raw.upstreamError == null ? null : asStr(raw.upstreamError) ?? String(raw.upstreamError),
      serverTime: asStr(raw.serverTime) ?? new Date().toISOString(),
      live: true,
    };
    statusCache = { at: now, value };
    return value;
  } catch {
    const value = {
      service: "XFreedom",
      version: "sandbox",
      domain: "local",
      botUsername: "xfreedommBot",
      telegramEnabled: false,
      publishedRoutes: EDGE_NODES.length,
      routeTypes: ["hysteria2", "vless"],
      upstreamError: "live status unreachable",
      serverTime: new Date().toISOString(),
      live: false,
    };
    statusCache = { at: now, value };
    return value;
  }
}
