import { runBrowserDiagnostics } from "./browser-diag";
import { asAdvice, asRoutes, type ClientAdvice, type Evidence, type RoutePick } from "./classify";
import { buildCorridor, type CorridorRecipe } from "./corridor";
import { issueAgentToken } from "./server";

const TOKEN_KEY = "xf-probe-token";

export type ProbeRun = {
  ok: boolean;
  error?: string;
  id?: string;
  classification?: string;
  routes: RoutePick[];
  advice: ClientAdvice | null;
  corridor?: CorridorRecipe;
  evidence?: Evidence[];
  latencyMs?: number;
};

type IngestBody = {
  ok?: boolean;
  id?: string;
  classification?: string;
  error?: string;
  routes?: RoutePick[];
  advice?: ClientAdvice;
  corridor?: CorridorRecipe;
};

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode / quota */
  }
}

export function friendlyIngestError(error?: string): string {
  if (error === "rate limited") return "Система только что смотрела. Подожди несколько секунд.";
  if (error === "unknown token") return "Ключ не подошёл. Нажми ещё раз — выдадим новый.";
  if (!error || error === "ingest failed") return "Не получилось отправить замер.";
  return error;
}

async function issueToken(label: string, onStep?: (s: string) => void) {
  onStep?.("выдаю ключ пробы");
  try {
    const issued = await issueAgentToken({ data: { label } });
    writeStoredToken(issued.token);
    return { ok: true as const, token: issued.token };
  } catch {
    return { ok: false as const, error: "Не получилось выдать ключ пробы" };
  }
}

async function postIngest(token: string, measured: Awaited<ReturnType<typeof runBrowserDiagnostics>>): Promise<IngestBody> {
  const res = await fetch("/api/agent/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      platform: "web-session",
      networkType: measured.networkType,
      online: measured.online,
      ipv4Ok: measured.ipv4Ok,
      ipv6Ok: measured.ipv6Ok,
      httpsOk: measured.httpsOk,
      udpHint: measured.udpHint,
      latencyMs: measured.latencyMs,
      evidence: measured.evidence,
      fingerprintBucket: measured.fingerprintBucket,
    }),
  });
  return (await res.json()) as IngestBody;
}

export async function runCabinetProbe(opts: {
  token?: string | null;
  label?: string;
  onStep?: (s: string) => void;
}): Promise<{ token: string | null; result: ProbeRun }> {
  const label = opts.label ?? "это устройство";
  let token = opts.token ?? readStoredToken();
  if (!token) {
    const issued = await issueToken(label, opts.onStep);
    if (!issued.ok) {
      return { token: null, result: { ok: false, error: issued.error, routes: [], advice: null } };
    }
    token = issued.token;
  } else {
    writeStoredToken(token);
  }

  const measured = await runBrowserDiagnostics(opts.onStep);
  opts.onStep?.("отправляю замер");
  let body = await postIngest(token, measured);

  if (!body.ok && body.error === "unknown token") {
    writeStoredToken(null);
    const issued = await issueToken(label, opts.onStep);
    if (!issued.ok) {
      return { token: null, result: { ok: false, error: issued.error, routes: [], advice: null } };
    }
    token = issued.token;
    opts.onStep?.("отправляю замер");
    body = await postIngest(token, measured);
  }

  if (!body.ok) {
    return {
      token,
      result: {
        ok: false,
        error: friendlyIngestError(body.error),
        routes: [],
        advice: null,
        evidence: measured.evidence,
        latencyMs: measured.latencyMs,
      },
    };
  }

  return {
    token,
    result: {
      ok: true,
      id: body.id,
      classification: body.classification,
      routes: asRoutes(body.routes),
      advice: asAdvice(body.advice),
      corridor:
        body.corridor ??
        buildCorridor({
          classification: body.classification,
          routes: asRoutes(body.routes),
          evidence: measured.evidence,
        }),
      evidence: measured.evidence,
      latencyMs: measured.latencyMs,
    },
  };
}
