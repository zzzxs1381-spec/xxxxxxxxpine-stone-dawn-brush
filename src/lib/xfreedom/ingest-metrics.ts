import type { Evidence } from "./classify";

export type IngestOutcome = "OK" | "RATE_LIMIT" | "REVOKED" | "ERROR";

export type IngestEventRow = {
  id: string;
  user_id: string;
  agent_id: string | null;
  agent_label: string | null;
  outcome: IngestOutcome;
  status_code: number;
  platform: string | null;
  classification: string | null;
  probe_latency_ms: number | null;
  handle_ms: number | null;
  payload_bytes: number | null;
  diagnostic_id: string | null;
  ipv4_ok: boolean | null;
  ipv6_ok: boolean | null;
  https_ok: boolean | null;
  udp_ok: boolean | null;
  tls_ok: boolean | null;
  dns_ok: boolean | null;
  created_at: string;
};

export function flagsFromEvidence(evidence: Evidence[]) {
  const by = (name: string) => evidence.find((e) => e.check === name);
  const tcpOk = evidence.some((e) => e.check.startsWith("tcp:") && e.result === "ok");
  const udpDns = by("udp-dns");
  const udpHint = by("udp-hint");
  const udpMeasured = Boolean(udpDns || udpHint);
  const udpOk = udpMeasured
    ? udpDns?.result === "ok" || udpHint?.result === "srflx" || udpHint?.result === "relay" || udpHint?.result === "ok"
    : null;
  const ipv6 = by("ipv6");
  const tls = by("tls");
  const https = by("https");
  const dns = by("dns");
  return {
    ipv4Ok: tcpOk || https?.result === "ok" || by("origin-rtt")?.result === "ok",
    ipv6Ok: ipv6 ? ipv6.result === "ok" : null,
    httpsOk: https?.result === "ok",
    udpOk,
    tlsOk: tls ? tls.result === "ok" : https ? https.result === "ok" : null,
    dnsOk: dns ? dns.result === "ok" : by("online") ? by("online")?.result !== "offline" : null,
  };
}

function pct(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const idx = Math.min(s.length - 1, Math.max(0, Math.ceil(p * s.length) - 1));
  return s[idx] ?? null;
}

function rate(ok: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((ok / total) * 100);
}

export type IngestAlert = { tone: "ok" | "warn" | "bad" | "muted"; text: string };

export type AgentIngestStat = {
  agentId: string;
  label: string;
  total: number;
  ok: number;
  rateLimited: number;
  lastAt: string | null;
  lastOutcome: IngestOutcome | null;
};

export type IngestSummary = {
  windowHours: number;
  total: number;
  ok: number;
  rateLimited: number;
  revoked: number;
  error: number;
  successRate: number | null;
  lastAt: string | null;
  lastOutcome: IngestOutcome | null;
  lastClassification: string | null;
  p50ProbeMs: number | null;
  p95ProbeMs: number | null;
  p50HandleMs: number | null;
  p95HandleMs: number | null;
  evidence: { k: string; ok: number; n: number; pct: number | null }[];
  byClass: { k: string; n: number }[];
  hourly: { start: number; ok: number; fail: number }[];
  agents: AgentIngestStat[];
  alerts: IngestAlert[];
  events: IngestEventRow[];
};

export function summarizeIngest(events: IngestEventRow[], now = Date.now()): IngestSummary {
  const h24 = now - 24 * 3600_000;
  const window = events.filter((e) => {
    const t = Date.parse(e.created_at);
    return !Number.isNaN(t) && t >= h24;
  });
  const okN = window.filter((e) => e.outcome === "OK").length;
  const rateLimited = window.filter((e) => e.outcome === "RATE_LIMIT").length;
  const revoked = window.filter((e) => e.outcome === "REVOKED").length;
  const error = window.filter((e) => e.outcome === "ERROR").length;
  const last = events[0] ?? null;
  const probe = window.map((e) => e.probe_latency_ms).filter((n): n is number => typeof n === "number");
  const handle = window.map((e) => e.handle_ms).filter((n): n is number => typeof n === "number");
  const okEvents = window.filter((e) => e.outcome === "OK");

  const flag = (key: keyof IngestEventRow, label: string) => {
    const sample = okEvents.filter((e) => e[key] === true || e[key] === false);
    const ok = sample.filter((e) => e[key] === true).length;
    return { k: label, ok, n: sample.length, pct: rate(ok, sample.length) };
  };

  const byClassMap = new Map<string, number>();
  for (const e of okEvents) {
    if (!e.classification) continue;
    byClassMap.set(e.classification, (byClassMap.get(e.classification) ?? 0) + 1);
  }

  const hourly: { start: number; ok: number; fail: number }[] = [];
  for (let i = 23; i >= 0; i -= 1) {
    const hour = Math.floor((now - i * 3600_000) / 3600_000);
    hourly.push({
      start: hour * 3600_000,
      ok: 0,
      fail: 0,
    });
  }
  for (const e of window) {
    const ts = Date.parse(e.created_at);
    if (Number.isNaN(ts)) continue;
    const idx = 23 - Math.floor((now - ts) / 3600_000);
    if (idx < 0 || idx > 23) continue;
    if (e.outcome === "OK") hourly[idx]!.ok += 1;
    else hourly[idx]!.fail += 1;
  }

  const byAgent = new Map<string, AgentIngestStat>();
  for (const e of events) {
    if (!e.agent_id) continue;
    const cur = byAgent.get(e.agent_id) ?? {
      agentId: e.agent_id,
      label: e.agent_label ?? e.agent_id,
      total: 0,
      ok: 0,
      rateLimited: 0,
      lastAt: null,
      lastOutcome: null,
    };
    cur.total += 1;
    if (e.outcome === "OK") cur.ok += 1;
    if (e.outcome === "RATE_LIMIT") cur.rateLimited += 1;
    if (!cur.lastAt) {
      cur.lastAt = e.created_at;
      cur.lastOutcome = e.outcome;
    }
    if (e.agent_label) cur.label = e.agent_label;
    byAgent.set(e.agent_id, cur);
  }

  const alerts: IngestAlert[] = [];
  if (events.length === 0) {
    alerts.push({ tone: "muted", text: "Проверок ещё не было. Нажми кнопку на Главной — система сама замерит." });
  } else {
    if (window.length === 0) {
      alerts.push({ tone: "warn", text: "За сутки проверок не было." });
    }
    const sr = rate(okN, window.length);
    if (sr != null && sr < 80 && window.length >= 3) {
      alerts.push({ tone: "bad", text: `Успех за сутки: ${sr}%. Часто это «подожди секунду» или выключенный ключ.` });
    }
    if (rateLimited >= 3) {
      alerts.push({ tone: "warn", text: `${rateLimited} раз система просила подождать: проверка чаще чем раз в 8 секунд.` });
    }
    if (error > 0) {
      alerts.push({ tone: "bad", text: `${error} внутренних сбоев записи за сутки.` });
    }
    if (sr != null && sr >= 95 && window.length >= 1) {
      alerts.push({ tone: "ok", text: "Проверки доходят. Класс ставится только по фактам, не по желанию." });
    }
  }

  return {
    windowHours: 24,
    total: window.length,
    ok: okN,
    rateLimited,
    revoked,
    error,
    successRate: rate(okN, window.length),
    lastAt: last?.created_at ?? null,
    lastOutcome: last?.outcome ?? null,
    lastClassification: last?.classification ?? null,
    p50ProbeMs: pct(probe, 0.5),
    p95ProbeMs: pct(probe, 0.95),
    p50HandleMs: pct(handle, 0.5),
    p95HandleMs: pct(handle, 0.95),
    evidence: [
      flag("https_ok", "HTTPS"),
      flag("udp_ok", "UDP"),
      flag("tls_ok", "TLS"),
      flag("dns_ok", "DNS"),
      flag("ipv4_ok", "IPv4"),
      flag("ipv6_ok", "IPv6"),
    ],
    byClass: [...byClassMap.entries()].map(([k, n]) => ({ k, n })),
    hourly,
    agents: [...byAgent.values()],
    alerts,
    events: events.slice(0, 40),
  };
}

export function outcomeLabel(o: string): string {
  if (o === "OK") return "принято";
  if (o === "RATE_LIMIT") return "подожди";
  if (o === "REVOKED") return "ключ выключен";
  if (o === "ERROR") return "сбой";
  return o;
}

export type LiveLayer = { k: string; kid: string; ok: boolean | null };

export type LiveMinute = { start: number; ok: number; fail: number };

export type LiveTape = {
  now: number;
  ok15: number;
  fail15: number;
  total15: number;
  lastAt: string | null;
  lastOutcome: IngestOutcome | null;
  lastClassification: string | null;
  lastLatencyMs: number | null;
  lastAgentLabel: string | null;
  lastPlatform: string | null;
  silenceSec: number | null;
  agents15: number;
  minutes: LiveMinute[];
  layers: LiveLayer[];
  events: IngestEventRow[];
};

function emptyLayers(): LiveLayer[] {
  return [
    { k: "имена", kid: "находятся ли сайты", ok: null },
    { k: "дверь", kid: "открывается ли вход", ok: null },
    { k: "шифрование", kid: "дают ли закрытый разговор", ok: null },
    { k: "страница", kid: "пришла ли страница", ok: null },
    { k: "быстрая", kid: "идёт ли быстрая дорога", ok: null },
    { k: "IPv6", kid: "есть ли второй вход", ok: null },
  ];
}

export function summarizeLive(events: IngestEventRow[], now = Date.now()): LiveTape {
  const m15 = now - 15 * 60_000;
  const window = events.filter((e) => {
    const t = Date.parse(e.created_at);
    return !Number.isNaN(t) && t >= m15;
  });
  const ok15 = window.filter((e) => e.outcome === "OK").length;
  const fail15 = window.length - ok15;
  const last = events[0] ?? null;
  const lastTs = last ? Date.parse(last.created_at) : NaN;
  const minutes: LiveMinute[] = [];
  for (let i = 14; i >= 0; i -= 1) {
    const start = Math.floor((now - i * 60_000) / 60_000) * 60_000;
    minutes.push({ start, ok: 0, fail: 0 });
  }
  for (const e of window) {
    const ts = Date.parse(e.created_at);
    if (Number.isNaN(ts)) continue;
    const idx = 14 - Math.floor((now - ts) / 60_000);
    if (idx < 0 || idx > 14) continue;
    if (e.outcome === "OK") minutes[idx]!.ok += 1;
    else minutes[idx]!.fail += 1;
  }
  const lastOk = events.find((e) => e.outcome === "OK") ?? null;
  const layer = (ok: boolean | null, k: string, kid: string): LiveLayer => ({ k, kid, ok });
  const agents15 = new Set(window.map((e) => e.agent_id).filter((id): id is string => Boolean(id))).size;
  return {
    now,
    ok15,
    fail15,
    total15: window.length,
    lastAt: last?.created_at ?? null,
    lastOutcome: last?.outcome ?? null,
    lastClassification: last?.classification ?? null,
    lastLatencyMs: lastOk?.probe_latency_ms ?? last?.probe_latency_ms ?? null,
    lastAgentLabel: last?.agent_label ?? null,
    lastPlatform: last?.platform ?? null,
    silenceSec: Number.isNaN(lastTs) ? null : Math.max(0, Math.round((now - lastTs) / 1000)),
    agents15,
    minutes,
    layers: lastOk
      ? [
          layer(lastOk.dns_ok, "имена", "находятся ли сайты"),
          layer(lastOk.ipv4_ok, "дверь", "открывается ли вход"),
          layer(lastOk.tls_ok, "шифрование", "дают ли закрытый разговор"),
          layer(lastOk.https_ok, "страница", "пришла ли страница"),
          layer(lastOk.udp_ok, "быстрая", "идёт ли быстрая дорога"),
          layer(lastOk.ipv6_ok, "IPv6", "есть ли второй вход"),
        ]
      : emptyLayers(),
    events: events.slice(0, 24),
  };
}

