import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { z } from "zod";
import { persistDiagnostic, hashToken } from "./persist";
import { asAdvice, asEvidence, asRoutes, type ClientAdvice, type Evidence, type RoutePick } from "./classify";
import { loadIngestEvents } from "./ingest-store";
import { summarizeIngest, summarizeLive } from "./ingest-metrics";

function rid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
}

async function ensureProfileRow(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  await sql`
    insert into xf_profiles (user_id)
    values (${userId})
    on conflict (user_id) do nothing
  `;
}

export const getAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfileRow(sql, context.userId);
    const [profile] = await sql<{
      user_id: string;
      display_name: string | null;
      plan_code: string;
      subscription_status: string;
      trial_started_at: string | null;
      trial_ends_at: string | null;
      telemetry_consent: boolean;
    }>`select user_id, display_name, plan_code, subscription_status, trial_started_at, trial_ends_at, telemetry_consent from xf_profiles where user_id = ${context.userId}`;
    const devices = await sql<{
      id: string;
      label: string;
      platform: string;
      status: string;
      last_seen_at: string | null;
      created_at: string;
    }>`select id, label, platform, status, last_seen_at, created_at from xf_devices where user_id = ${context.userId} order by created_at desc`;
    const diagnostics = await sql<{
      id: string;
      network_type: string | null;
      online: boolean | null;
      latency_ms: number | null;
      classification: string;
      source: string | null;
      platform: string | null;
      https_ok: boolean | null;
      route_json: RoutePick[] | string;
      advice_json: ClientAdvice | string;
      created_at: string;
    }>`select id, network_type, online, latency_ms, classification, source, platform, https_ok, route_json, advice_json, created_at from xf_diagnostics where user_id = ${context.userId} order by created_at desc limit 20`;
    const tickets = await sql<{
      id: string;
      subject: string;
      status: string;
      created_at: string;
    }>`select id, subject, status, created_at from xf_tickets where user_id = ${context.userId} order by created_at desc limit 8`;
    const notes = await sql<{
      id: string;
      summary: string;
      created_at: string;
    }>`select id, summary, created_at from xf_aima_notes where user_id = ${context.userId} order by created_at desc limit 6`;
    const agents = await sql<{
      id: string;
      token_prefix: string;
      label: string;
      status: string;
      last_seen_at: string | null;
      created_at: string;
    }>`select id, token_prefix, label, status, last_seen_at, created_at from xf_agent_tokens where user_id = ${context.userId} order by created_at desc`;
    const ingest24 = await sql<{ outcome: string; c: number }>`
      select outcome, count(*)::int as c
      from xf_ingest_events
      where user_id = ${context.userId} and created_at > now() - interval '24 hours'
      group by outcome
    `;
    const [lastIngest] = await sql<{
      outcome: string;
      created_at: string;
      classification: string | null;
    }>`
      select outcome, created_at, classification
      from xf_ingest_events
      where user_id = ${context.userId}
      order by created_at desc
      limit 1
    `;
    const ingestOk = ingest24.find((r) => r.outcome === "OK")?.c ?? 0;
    const ingestFail = ingest24.reduce((a, r) => a + (r.outcome === "OK" ? 0 : r.c), 0);
    return {
      profile,
      devices,
      diagnostics: diagnostics.map((d) => ({
        ...d,
        route_json: asRoutes(d.route_json),
        advice_json: asAdvice(d.advice_json),
      })),
      tickets,
      notes,
      agents,
      ingest: {
        ok24: ingestOk,
        fail24: ingestFail,
        lastAt: lastIngest?.created_at ?? null,
        lastOutcome: lastIngest?.outcome ?? null,
        lastClassification: lastIngest?.classification ?? null,
      },
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      displayName: z.string().trim().max(80).optional(),
      telemetryConsent: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfileRow(sql, context.userId);
    if (data.displayName !== undefined) {
      await sql`update xf_profiles set display_name = ${data.displayName}, updated_at = now() where user_id = ${context.userId}`;
    }
    if (data.telemetryConsent !== undefined) {
      await sql`update xf_profiles set telemetry_consent = ${data.telemetryConsent}, updated_at = now() where user_id = ${context.userId}`;
    }
    return { ok: true as const };
  });

export const startTrial = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfileRow(sql, context.userId);
    const [row] = await sql<{ subscription_status: string }>`
      select subscription_status from xf_profiles where user_id = ${context.userId}
    `;
    if (row?.subscription_status === "ACTIVE" || row?.subscription_status === "TRIAL") {
      return { ok: true as const, already: true as const };
    }
    await sql`
      update xf_profiles
      set plan_code = 'trial',
          subscription_status = 'TRIAL',
          trial_started_at = now(),
          trial_ends_at = now() + interval '7 days',
          updated_at = now()
      where user_id = ${context.userId}
    `;
    return { ok: true as const, already: false as const };
  });

export const addDevice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      label: z.string().trim().min(2).max(40),
      platform: z.enum(["ANDROID", "IOS", "DESKTOP"]),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ c: number }>`select count(*)::int as c from xf_devices where user_id = ${context.userId} and status <> 'REVOKED'`;
    if ((existing[0]?.c ?? 0) >= 8) {
      return { ok: false as const, error: "Достигнут лимит устройств" };
    }
    const id = rid("dev");
    await sql`
      insert into xf_devices (id, user_id, label, platform, status, last_seen_at)
      values (${id}, ${context.userId}, ${data.label}, ${data.platform}, 'REGISTERED', now())
    `;
    return { ok: true as const, id };
  });

export const revokeDevice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(3) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update xf_devices set status = 'REVOKED' where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const saveDiagnostic = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      networkType: z.string().max(40).optional(),
      online: z.boolean(),
      ipv4Ok: z.boolean().optional(),
      ipv6Ok: z.boolean().optional(),
      httpsOk: z.boolean(),
      udpHint: z.string().max(20).optional(),
      latencyMs: z.number().int().min(0).max(60000).optional(),
      classification: z.string().min(3).max(48).optional(),
      evidence: z.array(
        z.object({
          check: z.string(),
          result: z.string(),
          detail: z.string().optional(),
          ms: z.number().optional(),
        }),
      ),
      fingerprintBucket: z.string().max(64).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const saved = await persistDiagnostic({
      userId: context.userId,
      source: "BROWSER",
      networkType: data.networkType,
      online: data.online,
      ipv4Ok: data.ipv4Ok,
      ipv6Ok: data.ipv6Ok,
      httpsOk: data.httpsOk,
      udpHint: data.udpHint,
      latencyMs: data.latencyMs,
      evidence: data.evidence,
      fingerprintBucket: data.fingerprintBucket,
    });
    return { ok: true as const, id: saved.id, classification: saved.classification, routes: saved.routes, advice: saved.advice };
  });

export const issueAgentToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ label: z.string().trim().min(2).max(40).default("probe") }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const live = await sql<{ c: number }>`select count(*)::int as c from xf_agent_tokens where user_id = ${context.userId} and status = 'ACTIVE'`;
    if ((live[0]?.c ?? 0) >= 4) {
      await sql`
        update xf_agent_tokens
        set status = 'REVOKED'
        where id = (
          select id from xf_agent_tokens
          where user_id = ${context.userId} and status = 'ACTIVE'
          order by (label = ${data.label}) desc, created_at asc
          limit 1
        )
        and user_id = ${context.userId}
      `;
    }
    const raw = `xfprobe_${crypto.randomUUID().replaceAll("-", "")}`;
    const tokenHash = await hashToken(raw);
    const id = rid("agt");
    await sql`
      insert into xf_agent_tokens (id, user_id, token_hash, token_prefix, label, status)
      values (${id}, ${context.userId}, ${tokenHash}, ${raw.slice(0, 16)}, ${data.label}, 'ACTIVE')
    `;
    return { ok: true as const, id, token: raw };
  });

export const revokeAgentToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(3) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update xf_agent_tokens set status = 'REVOKED' where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      subject: z.string().trim().min(4).max(80),
      body: z.string().trim().min(8).max(2000),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = rid("tkt");
    await sql`
      insert into xf_tickets (id, user_id, subject, body)
      values (${id}, ${context.userId}, ${data.subject}, ${data.body})
    `;
    return { ok: true as const, id };
  });

export const getDiagnostic = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().min(3).max(40) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [row] = await sql<{
      id: string;
      network_type: string | null;
      online: boolean | null;
      ipv4_ok: boolean | null;
      ipv6_ok: boolean | null;
      https_ok: boolean | null;
      udp_hint: string | null;
      latency_ms: number | null;
      classification: string;
      evidence: Evidence[] | string;
      fingerprint_bucket: string | null;
      source: string | null;
      platform: string | null;
      route_json: RoutePick[] | string;
      advice_json: ClientAdvice | string;
      created_at: string;
    }>`select id, network_type, online, ipv4_ok, ipv6_ok, https_ok, udp_hint, latency_ms, classification, evidence, fingerprint_bucket, source, platform, route_json, advice_json, created_at from xf_diagnostics where id = ${data.id} and user_id = ${context.userId} limit 1`;
    if (!row) return null;
    return {
      ...row,
      evidence: asEvidence(row.evidence),
      route_json: asRoutes(row.route_json),
      advice_json: asAdvice(row.advice_json),
    };
  });

export const askAima = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      classification: z.string().max(48),
      evidenceText: z.string().max(2500),
      diagnosticId: z.string().max(40).optional(),
      source: z.string().max(20).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AIMA сейчас недоступна в этой среде" };
    }
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 420,
        messages: [
          {
            role: "system",
            content:
              "Ты AIMA — советник XFreedom. Объясняй по-русски просто, как школьнику. Без протоколов в первом абзаце. 1) что видно по замерам 2) чего сайт не знает, потому что он не телефон 3) какую дорогу взять телефону (главная и запасные). Не обещай «подключено». Не обещай связь 24/7 по всей России. Не выдумывай факты.",
          },
          {
            role: "user",
            content: `Источник: ${data.source ?? "unknown"}\nКласс: ${data.classification}\nEvidence:\n${data.evidenceText}`,
          },
        ],
      }),
    });
    if (!res.ok) {
      return { ok: false as const, error: `AIMA недоступна (${res.status})` };
    }
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() || "Нет ответа.";
    const sql = await getSql();
    const id = rid("aima");
    await sql`
      insert into xf_aima_notes (id, user_id, source_diagnostic_id, summary)
      values (${id}, ${context.userId}, ${data.diagnosticId ?? null}, ${text})
    `;
    return { ok: true as const, text };
  });

export const getIngestMetrics = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const events = await loadIngestEvents(context.userId, 200);
    return summarizeIngest(events);
  });

export const getLiveTape = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const events = await loadIngestEvents(context.userId, 80);
    return summarizeLive(events);
  });
