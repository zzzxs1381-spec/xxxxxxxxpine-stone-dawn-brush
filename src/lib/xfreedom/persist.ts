import { getSql } from "@/lib/db";
import { EDGE_NODES } from "./catalog";
import { adviceFrom, classify, scoreRoutes, type ClientAdvice, type Evidence, type RoutePick } from "./classify";
import { buildCorridor, type CorridorRecipe } from "./corridor";

function rid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
}

export async function hashToken(raw: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function mapPlatform(raw?: string | null): "ANDROID" | "IOS" | "DESKTOP" {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("android")) return "ANDROID";
  if (s.includes("iphone") || s.includes("ipad") || s === "ios") return "IOS";
  return "DESKTOP";
}

export async function touchDevice(input: {
  userId: string;
  label: string;
  platform: "ANDROID" | "IOS" | "DESKTOP";
}): Promise<string | undefined> {
  const sql = await getSql();
  const [existing] = await sql<{ id: string }>`
    select id from xf_devices
    where user_id = ${input.userId} and label = ${input.label} and status <> 'REVOKED'
    order by created_at desc
    limit 1
  `;
  if (existing) {
    await sql`update xf_devices set last_seen_at = now(), platform = ${input.platform} where id = ${existing.id}`;
    return existing.id;
  }
  const live = await sql<{ c: number }>`select count(*)::int as c from xf_devices where user_id = ${input.userId} and status <> 'REVOKED'`;
  if ((live[0]?.c ?? 0) >= 8) return undefined;
  const id = rid("dev");
  await sql`
    insert into xf_devices (id, user_id, label, platform, status, last_seen_at)
    values (${id}, ${input.userId}, ${input.label}, ${input.platform}, 'REGISTERED', now())
  `;
  return id;
}

export async function persistDiagnostic(input: {
  userId: string;
  source: "BROWSER" | "AGENT";
  agentId?: string;
  deviceId?: string;
  platform?: string;
  networkType?: string;
  online: boolean;
  ipv4Ok?: boolean;
  ipv6Ok?: boolean;
  httpsOk: boolean;
  udpHint?: string;
  latencyMs?: number;
  evidence: Evidence[];
  fingerprintBucket?: string;
}): Promise<{ id: string; classification: string; routes: RoutePick[]; advice: ClientAdvice; corridor: CorridorRecipe }> {
  const sql = await getSql();
  const id = rid("diag");
  const classification = classify(input.evidence);
  const routes = scoreRoutes(classification, EDGE_NODES);
  const advice = adviceFrom(classification, routes);
  const corridor = buildCorridor({
    classification,
    routes,
    evidence: input.evidence,
    ipv6Ok: input.ipv6Ok,
    nodes: EDGE_NODES,
  });
  const evidence = JSON.stringify(input.evidence);
  const routeJson = JSON.stringify(routes);
  const adviceJson = JSON.stringify(advice);
  await sql`
    insert into xf_diagnostics (
      id, user_id, network_type, online, ipv4_ok, ipv6_ok, https_ok, udp_hint,
      latency_ms, classification, evidence, fingerprint_bucket, source, agent_id, platform, route_json, device_id, advice_json
    ) values (
      ${id}, ${input.userId}, ${input.networkType ?? null}, ${input.online},
      ${input.ipv4Ok ?? null}, ${input.ipv6Ok ?? null}, ${input.httpsOk},
      ${input.udpHint ?? null}, ${input.latencyMs ?? null}, ${classification},
      ${evidence}::jsonb, ${input.fingerprintBucket ?? null}, ${input.source},
      ${input.agentId ?? null}, ${input.platform ?? null}, ${routeJson}::jsonb,
      ${input.deviceId ?? null}, ${adviceJson}::jsonb
    )
  `;
  return { id, classification, routes, advice, corridor };
}
