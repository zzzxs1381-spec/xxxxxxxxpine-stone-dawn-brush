import { classify, type Evidence } from "./classify";
import { measureServices, serviceEvidence } from "./service-probe";

type Conn = {
  effectiveType?: string;
  type?: string;
  downlink?: number;
  rtt?: number;
};

function connection(): Conn | null {
  const n = navigator as Navigator & { connection?: Conn; mozConnection?: Conn; webkitConnection?: Conn };
  return n.connection ?? n.mozConnection ?? n.webkitConnection ?? null;
}

async function timedFetch(url: string, timeoutMs = 5000): Promise<{ ok: boolean; ms: number; status?: number; text?: string }> {
  const started = performance.now();
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store", mode: "cors" });
    const ms = Math.round(performance.now() - started);
    const text = await res.text().catch(() => "");
    return { ok: res.ok, ms, status: res.status, text: text.slice(0, 240) };
  } catch {
    return { ok: false, ms: Math.round(performance.now() - started) };
  } finally {
    window.clearTimeout(t);
  }
}

function probeUdp(): Promise<{ hint: "host" | "srflx" | "relay" | "none"; detail: string }> {
  return new Promise((resolve) => {
    const RTC = window.RTCPeerConnection;
    if (!RTC) {
      resolve({ hint: "none", detail: "WebRTC недоступен" });
      return;
    }
    const pc = new RTC({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    const types = new Set<string>();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      pc.close();
      if (types.has("relay")) resolve({ hint: "relay", detail: "есть relay ICE" });
      else if (types.has("srflx")) resolve({ hint: "srflx", detail: "есть srflx — UDP, вероятно, проходит" });
      else if (types.has("host")) resolve({ hint: "host", detail: "только host-кандидаты — STUN не подтверждён" });
      else resolve({ hint: "none", detail: "ICE-кандидаты не собраны — это не доказательство блока UDP" });
    };
    const timer = window.setTimeout(finish, 2800);
    pc.onicecandidate = (ev) => {
      const c = ev.candidate?.candidate ?? "";
      if (c.includes(" typ srflx")) types.add("srflx");
      else if (c.includes(" typ relay")) types.add("relay");
      else if (c.includes(" typ host")) types.add("host");
      if (!ev.candidate) {
        window.clearTimeout(timer);
        finish();
      }
    };
    pc.createDataChannel("xf");
    void pc.createOffer().then((o) => pc.setLocalDescription(o));
  });
}

export async function runBrowserDiagnostics(onStep?: (label: string) => void) {
  const evidence: Evidence[] = [];
  onStep?.("есть ли интернет");
  const online = navigator.onLine;
  evidence.push({ check: "online", result: online ? "online" : "offline" });

  const conn = connection();
  const networkType = conn?.effectiveType ?? conn?.type ?? "unknown";
  evidence.push({
    check: "network-info",
    result: networkType,
    detail: conn ? `downlink=${conn.downlink ?? "?"} rtt=${conn.rtt ?? "?"}` : "Network Information API нет",
  });

  onStep?.("мерю кабинет");
  const origin = await timedFetch("/api/agent/health", 4000);
  evidence.push({
    check: "origin-rtt",
    result: origin.ok ? "ok" : "fail",
    ms: origin.ms,
    detail: `health ${origin.status ?? "n/a"}`,
  });

  onStep?.("открывается ли этот сайт");
  const local = await timedFetch("/", 4000);
  evidence.push({ check: "same-origin", result: local.ok ? "ok" : "fail", ms: local.ms, detail: `HTTP ${local.status ?? "n/a"}` });

  onStep?.("открывается ли обычный интернет");
  const remote = await timedFetch("https://cloudflare.com/cdn-cgi/trace", 5000);
  let httpsOk = remote.ok;
  let captive = false;
  if (remote.ok && remote.text && !remote.text.includes("fl=") && remote.text.includes("<html")) {
    captive = true;
    httpsOk = false;
  }
  evidence.push({
    check: "https",
    result: captive ? "captive" : remote.ok ? "ok" : "fail",
    ms: remote.ms,
    detail: remote.ok ? "cloudflare trace" : "запрос не прошёл или CORS/сеть",
  });

  onStep?.("быстрая дорога");
  const udp = await probeUdp();
  evidence.push({ check: "udp-hint", result: udp.hint, detail: udp.detail });

  evidence.push({
    check: "ip-version",
    result: "browser-limited",
    detail: "Браузер не отдаёт raw IP. Версия протокола — только в пробе или нативном клиенте.",
  });

  onStep?.("telegram youtube instagram");
  const services = await measureServices();
  evidence.push(...serviceEvidence(services));

  const classification = classify(evidence);
  const latencyMs = [remote.ok ? remote.ms : undefined, origin.ok ? origin.ms : undefined, local.ms].filter(
    (n): n is number => typeof n === "number",
  );
  const bestMs = latencyMs.length ? Math.min(...latencyMs) : local.ms;
  const fingerprintBucket = [
    networkType,
    online ? "on" : "off",
    httpsOk ? "https" : "nohttps",
    udp.hint,
    bestMs < 200 ? "lat-low" : bestMs < 800 ? "lat-mid" : "lat-high",
  ].join(":");

  return {
    online,
    networkType,
    httpsOk,
    ipv4Ok: httpsOk || origin.ok,
    ipv6Ok: undefined as boolean | undefined,
    udpHint: udp.hint,
    latencyMs: bestMs,
    classification,
    evidence,
    fingerprintBucket,
  };
}
