import { getSql } from "@/lib/db";
import type { IngestEventRow, IngestOutcome } from "./ingest-metrics";

function rid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
}

export async function recordIngestEvent(input: {
  userId: string;
  agentId?: string | null;
  outcome: IngestOutcome;
  statusCode: number;
  platform?: string | null;
  classification?: string | null;
  probeLatencyMs?: number | null;
  handleMs?: number | null;
  payloadBytes?: number | null;
  diagnosticId?: string | null;
  ipv4Ok?: boolean | null;
  ipv6Ok?: boolean | null;
  httpsOk?: boolean | null;
  udpOk?: boolean | null;
  tlsOk?: boolean | null;
  dnsOk?: boolean | null;
}) {
  try {
    const sql = await getSql();
    const id = rid("ing");
    await sql`
      insert into xf_ingest_events (
        id, user_id, agent_id, outcome, status_code, platform, classification,
        probe_latency_ms, handle_ms, payload_bytes, diagnostic_id,
        ipv4_ok, ipv6_ok, https_ok, udp_ok, tls_ok, dns_ok
      ) values (
        ${id}, ${input.userId}, ${input.agentId ?? null}, ${input.outcome}, ${input.statusCode},
        ${input.platform ?? null}, ${input.classification ?? null},
        ${input.probeLatencyMs ?? null}, ${input.handleMs ?? null}, ${input.payloadBytes ?? null},
        ${input.diagnosticId ?? null},
        ${input.ipv4Ok ?? null}, ${input.ipv6Ok ?? null}, ${input.httpsOk ?? null},
        ${input.udpOk ?? null}, ${input.tlsOk ?? null}, ${input.dnsOk ?? null}
      )
    `;
  } catch (err) {
    console.error("[ingest] metrics write failed", err);
  }
}

export async function loadIngestEvents(userId: string, limit = 200): Promise<IngestEventRow[]> {
  const sql = await getSql();
  return sql<IngestEventRow>`
    select
      e.id, e.user_id, e.agent_id, t.label as agent_label, e.outcome, e.status_code,
      e.platform, e.classification, e.probe_latency_ms, e.handle_ms, e.payload_bytes,
      e.diagnostic_id, e.ipv4_ok, e.ipv6_ok, e.https_ok, e.udp_ok, e.tls_ok, e.dns_ok, e.created_at
    from xf_ingest_events e
    left join xf_agent_tokens t on t.id = e.agent_id
    where e.user_id = ${userId}
    order by e.created_at desc
    limit ${limit}
  `;
}
