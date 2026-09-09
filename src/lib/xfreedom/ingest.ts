import { getSql } from "@/lib/db";
import { asAdvice, asEvidence, asRoutes, classify, truthFromReport, type Evidence } from "./classify";
import { flagsFromEvidence } from "./ingest-metrics";
import { recordIngestEvent } from "./ingest-store";
import { hashToken, mapPlatform, persistDiagnostic, touchDevice } from "./persist";

export type AgentPayload = {
  token?: string;
  platform?: string;
  networkType?: string;
  online?: boolean;
  ipv4Ok?: boolean;
  ipv6Ok?: boolean;
  httpsOk?: boolean;
  udpHint?: string;
  latencyMs?: number;
  classification?: string;
  evidence?: Evidence[];
  fingerprintBucket?: string;
  payloadBytes?: number;
};

type AgentRow = {
  id: string;
  user_id: string;
  status: string;
  label: string;
  last_seen_at: string | null;
};

async function resolveAgent(token: string) {
  if (!token.startsWith("xfprobe_") || token.length < 20) return { kind: "bad" as const };
  const sql = await getSql();
  const tokenHash = await hashToken(token);
  const [agent] = await sql<AgentRow>`
    select id, user_id, status, label, last_seen_at
    from xf_agent_tokens
    where token_hash = ${tokenHash}
    limit 1
  `;
  if (!agent) return { kind: "unknown" as const };
  if (agent.status !== "ACTIVE") return { kind: "revoked" as const, agent };
  return { kind: "ok" as const, agent };
}

export async function ingestAgentReport(payload: AgentPayload) {
  const started = Date.now();
  const token = payload.token?.trim() ?? "";
  const resolved = await resolveAgent(token);
  const handle = () => Date.now() - started;
  const bytes = typeof payload.payloadBytes === "number" ? payload.payloadBytes : null;
  const platform = payload.platform?.slice(0, 24) ?? null;
  const probeLatency = typeof payload.latencyMs === "number" ? Math.round(payload.latencyMs) : null;

  if (resolved.kind === "bad" || resolved.kind === "unknown") {
    return { ok: false as const, status: 401, error: "unknown token" };
  }

  if (resolved.kind === "revoked") {
    await recordIngestEvent({
      userId: resolved.agent.user_id,
      agentId: resolved.agent.id,
      outcome: "REVOKED",
      statusCode: 401,
      platform,
      probeLatencyMs: probeLatency,
      handleMs: handle(),
      payloadBytes: bytes,
    });
    return { ok: false as const, status: 401, error: "unknown token" };
  }

  const agent = resolved.agent;
  if (agent.last_seen_at) {
    const last = Date.parse(agent.last_seen_at);
    if (!Number.isNaN(last) && Date.now() - last < 8000) {
      await recordIngestEvent({
        userId: agent.user_id,
        agentId: agent.id,
        outcome: "RATE_LIMIT",
        statusCode: 429,
        platform,
        probeLatencyMs: probeLatency,
        handleMs: handle(),
        payloadBytes: bytes,
      });
      return { ok: false as const, status: 429, error: "rate limited" };
    }
  }

  const evidence = Array.isArray(payload.evidence) ? payload.evidence.slice(0, 40) : [];
  const flags = flagsFromEvidence(evidence);

  try {
    const deviceId = await touchDevice({
      userId: agent.user_id,
      label: agent.label,
      platform: mapPlatform(platform),
    });
    const saved = await persistDiagnostic({
      userId: agent.user_id,
      source: "AGENT",
      agentId: agent.id,
      deviceId,
      platform: platform ?? undefined,
      networkType: payload.networkType?.slice(0, 40),
      online: payload.online !== false,
      ipv4Ok: payload.ipv4Ok,
      ipv6Ok: payload.ipv6Ok,
      httpsOk: payload.httpsOk !== false,
      udpHint: payload.udpHint?.slice(0, 20),
      latencyMs: probeLatency ?? undefined,
      evidence,
      fingerprintBucket: payload.fingerprintBucket?.slice(0, 64),
    });
    const sql = await getSql();
    await sql`update xf_agent_tokens set last_seen_at = now(), device_id = ${deviceId ?? null} where id = ${agent.id}`;
    await recordIngestEvent({
      userId: agent.user_id,
      agentId: agent.id,
      outcome: "OK",
      statusCode: 200,
      platform,
      classification: saved.classification,
      probeLatencyMs: probeLatency,
      handleMs: handle(),
      payloadBytes: bytes,
      diagnosticId: saved.id,
      ipv4Ok: flags.ipv4Ok,
      ipv6Ok: flags.ipv6Ok,
      httpsOk: flags.httpsOk,
      udpOk: flags.udpOk,
      tlsOk: flags.tlsOk,
      dnsOk: flags.dnsOk,
    });
    const truth = truthFromReport({
      source: "AGENT",
      online: payload.online !== false,
      httpsOk: payload.httpsOk !== false,
      classification: saved.classification,
    });
    return {
      ok: true as const,
      status: 200,
      id: saved.id,
      classification: saved.classification,
      routes: saved.routes,
      advice: saved.advice,
      truth,
    };
  } catch (err) {
    console.error("[ingest] persist failed", err);
    await recordIngestEvent({
      userId: agent.user_id,
      agentId: agent.id,
      outcome: "ERROR",
      statusCode: 500,
      platform,
      probeLatencyMs: probeLatency,
      handleMs: handle(),
      payloadBytes: bytes,
      ipv4Ok: flags.ipv4Ok,
      ipv6Ok: flags.ipv6Ok,
      httpsOk: flags.httpsOk,
      udpOk: flags.udpOk,
      tlsOk: flags.tlsOk,
      dnsOk: flags.dnsOk,
    });
    return { ok: false as const, status: 500, error: "ingest failed" };
  }
}

export async function adviceForToken(token: string) {
  const resolved = await resolveAgent(token);
  if (resolved.kind !== "ok") return { ok: false as const, status: 401, error: "unknown token" };
  const agent = resolved.agent;
  const sql = await getSql();
  const [row] = await sql<{
    id: string;
    classification: string;
    source: string | null;
    online: boolean | null;
    https_ok: boolean | null;
    latency_ms: number | null;
    route_json: unknown;
    advice_json: unknown;
    evidence: unknown;
    created_at: string;
  }>`
    select id, classification, source, online, https_ok, latency_ms, route_json, advice_json, evidence, created_at
    from xf_diagnostics
    where user_id = ${agent.user_id}
    order by created_at desc
    limit 1
  `;
  if (!row) {
    return { ok: true as const, status: 200, diagnosticId: null, classification: "UNKNOWN", routes: [], advice: null };
  }
  const classification = row.classification || classify(asEvidence(row.evidence));
  return {
    ok: true as const,
    status: 200,
    diagnosticId: row.id,
    classification,
    routes: asRoutes(row.route_json),
    advice: asAdvice(row.advice_json),
    latencyMs: row.latency_ms,
    createdAt: row.created_at,
    truth: truthFromReport({
      source: row.source,
      online: row.online,
      httpsOk: row.https_ok,
      classification,
    }),
  };
}
