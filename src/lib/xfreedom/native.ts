import { getSql } from "@/lib/db";
import { EDGE_NODES } from "./catalog";
import { asEvidence, asRoutes, classify } from "./classify";
import { buildCorridor } from "./corridor";
import { hashToken } from "./persist";
import { ensureTlsEdge, runTlsSelftest, type SelftestResult } from "./tls-edge";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
};

export function nativeCors() {
  return cors;
}

function rid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
}

export function bearer(request: Request) {
  const h = request.headers.get("authorization") ?? "";
  if (h.toLowerCase().startsWith("bearer ")) return h.slice(7).trim();
  const url = new URL(request.url);
  return url.searchParams.get("token")?.trim() ?? "";
}

const STAGES = [
  "CONFIG_RECEIVED",
  "TRANSPORT_STARTED",
  "HANDSHAKE_OK",
  "TUNNEL_INTERFACE_UP",
  "DNS_OK",
  "INTERNET_OK",
  "SERVICE_TESTS_OK",
  "STOPPED",
  "ERROR",
] as const;

type Stage = (typeof STAGES)[number];

function asStage(v: unknown): Stage | null {
  return STAGES.includes(v as Stage) ? (v as Stage) : null;
}

async function resolveToken(token: string) {
  if (!token.startsWith("xfprobe_") || token.length < 20) return null;
  const sql = await getSql();
  const tokenHash = await hashToken(token);
  const [row] = await sql<{ id: string; user_id: string; status: string }>`
    select id, user_id, status from xf_agent_tokens where token_hash = ${tokenHash} limit 1
  `;
  if (!row || row.status !== "ACTIVE") return null;
  return row;
}

let cachedSelf: { at: number; value: SelftestResult } | null = null;

export async function edgeReport() {
  const status = await ensureTlsEdge();
  const now = Date.now();
  if (!cachedSelf || now - cachedSelf.at > 15_000) {
    cachedSelf = { at: now, value: await runTlsSelftest() };
  }
  return {
    ok: cachedSelf.value.ok,
    protocol: "xf-tls1",
    listen: status.listen,
    sni: status.sni,
    alpn: status.alpn,
    pinSha256: status.pinSha256,
    tlsVersion: cachedSelf.value.tlsVersion ?? "TLSv1.3",
    handshakeMs: cachedSelf.value.handshakeMs,
    echoMs: cachedSelf.value.echoMs,
    bytes: cachedSelf.value.bytes,
    handshakes: status.handshakes,
    tunnel: false,
    nativeRequired: true,
    error: cachedSelf.value.error ?? null,
    note: "Edge доказан selftest на этой машине. Телефон с другой сети сюда не подключится, пока нет публичного узла.",
  };
}

export async function nativeConfig(token: string) {
  const edge = await edgeReport();
  const agent = token ? await resolveToken(token) : null;
  let corridor = buildCorridor({ classification: "UNKNOWN", nodes: EDGE_NODES });
  if (agent) {
    const sql = await getSql();
    const [row] = await sql<{ classification: string; route_json: unknown; evidence: unknown; ipv6_ok: boolean | null }>`
      select classification, route_json, evidence, ipv6_ok from xf_diagnostics
      where user_id = ${agent.user_id} order by created_at desc limit 1
    `;
    if (row) {
      corridor = buildCorridor({
        classification: row.classification || classify(asEvidence(row.evidence)),
        routes: asRoutes(row.route_json),
        evidence: asEvidence(row.evidence),
        ipv6Ok: row.ipv6_ok,
        nodes: EDGE_NODES,
      });
    }
  }
  return {
    ok: true,
    protocol: "xf-tls1",
    endpoint: "127.0.0.1",
    port: 8444,
    sni: edge.sni,
    alpn: edge.alpn,
    pinSha256: edge.pinSha256,
    minTls: "TLSv1.3",
    corridor,
    edgeOk: edge.ok,
    handshakeMs: edge.handshakeMs,
    alwaysOn: true,
    killSwitch: true,
    tunnel: false,
    reachableFromPhone: false,
    note: agent
      ? "Конфиг для Android VpnService. Edge в этом контуре локальный."
      : "Без ключа — только публичный selftest. Для туннеля нужен ключ пробы.",
  };
}

export async function nativeStage(token: string, body: Record<string, unknown>) {
  const agent = await resolveToken(token);
  if (!agent) return { ok: false as const, status: 401, error: "unknown token" };
  const stage = asStage(body.stage);
  if (!stage) return { ok: false as const, status: 400, error: "bad stage" };
  const sql = await getSql();
  const id = typeof body.sessionId === "string" && body.sessionId.startsWith("tun_") ? body.sessionId : rid("tun");
  const handshakeMs = typeof body.handshakeMs === "number" ? Math.round(body.handshakeMs) : null;
  const rx = typeof body.rxBytes === "number" ? Math.max(0, Math.round(body.rxBytes)) : 0;
  const tx = typeof body.txBytes === "number" ? Math.max(0, Math.round(body.txBytes)) : 0;
  const transport = typeof body.transport === "string" ? body.transport.slice(0, 32) : null;
  const sni = typeof body.sni === "string" ? body.sni.slice(0, 120) : null;
  const endpoint = typeof body.endpoint === "string" ? body.endpoint.slice(0, 180) : null;
  const lastError = typeof body.lastError === "string" ? body.lastError.slice(0, 300) : null;
  const internetOk = body.internetOk === true;
  await sql`
    insert into xf_tunnel_sessions (
      id, user_id, stage, transport, sni, endpoint, handshake_ms, rx_bytes, tx_bytes, last_error, internet_ok, updated_at
    ) values (
      ${id}, ${agent.user_id}, ${stage}, ${transport}, ${sni}, ${endpoint}, ${handshakeMs}, ${rx}, ${tx}, ${lastError}, ${internetOk}, now()
    )
    on conflict (id) do update set
      stage = excluded.stage,
      transport = excluded.transport,
      sni = excluded.sni,
      endpoint = excluded.endpoint,
      handshake_ms = excluded.handshake_ms,
      rx_bytes = excluded.rx_bytes,
      tx_bytes = excluded.tx_bytes,
      last_error = excluded.last_error,
      internet_ok = excluded.internet_ok,
      updated_at = now()
  `;
  const connected = stage === "SERVICE_TESTS_OK" || (stage === "INTERNET_OK" && internetOk);
  return {
    ok: true as const,
    status: 200,
    sessionId: id,
    stage,
    connected,
    note: connected
      ? "CONNECTED можно ставить на телефоне — туннель и интернет подтверждены."
      : "CONNECTED ещё нельзя.",
  };
}
