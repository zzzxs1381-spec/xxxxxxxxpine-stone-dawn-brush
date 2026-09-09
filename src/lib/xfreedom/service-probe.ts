import type { Evidence } from "./classify";

export type BlockType = "none" | "dns" | "tcp" | "http";
export type ServiceProbe = {
  id: string;
  label: string;
  host: string;
  ms: number | null;
  block: BlockType;
  note: string;
};

export const SERVICE_APPS = [
  { id: "telegram", label: "Telegram", host: "telegram.org", url: "https://telegram.org/favicon.ico" },
  { id: "whatsapp", label: "WhatsApp", host: "web.whatsapp.com", url: "https://web.whatsapp.com/favicon.ico" },
  { id: "instagram", label: "Instagram", host: "instagram.com", url: "https://www.instagram.com/favicon.ico" },
  { id: "youtube", label: "YouTube", host: "youtube.com", url: "https://www.youtube.com/favicon.ico" },
] as const;

const NOTE: Record<BlockType, string> = {
  none: "ok · consistent",
  dns: "dns.failure",
  tcp: "tcp_ip.failure",
  http: "http.failure",
};

function load(url: string, ms: number): Promise<{ ok: boolean; ms: number }> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const img = new Image();
    let doneOnce = false;
    const done = (ok: boolean) => {
      if (doneOnce) return;
      doneOnce = true;
      img.onload = null;
      img.onerror = null;
      resolve({ ok, ms: Math.round(performance.now() - t0) });
    };
    const t = window.setTimeout(() => done(false), ms);
    img.onload = () => {
      window.clearTimeout(t);
      done(true);
    };
    img.onerror = () => {
      window.clearTimeout(t);
      done(false);
    };
    img.src = `${url}?t=${Date.now()}`;
  });
}

async function doh(host: string) {
  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 1600);
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${host}&type=A`, {
      headers: { Accept: "application/dns-json" },
      signal: ctrl.signal,
    });
    window.clearTimeout(t);
    const body = (await res.json()) as { Answer?: { type?: number }[] };
    return Boolean(body.Answer?.some((a) => a.type === 1));
  } catch {
    return false;
  }
}

function klass(ok: boolean, ms: number, dohOk: boolean): BlockType {
  if (ok) return "none";
  if (dohOk && ms < 200) return "dns";
  if (ms >= 1300) return "tcp";
  return "http";
}

export async function measureServices(): Promise<ServiceProbe[]> {
  return Promise.all(
    SERVICE_APPS.map(async (a) => {
      const [hit, dns] = await Promise.all([load(a.url, 1400), doh(a.host)]);
      const block = klass(hit.ok, hit.ms, dns);
      return { id: a.id, label: a.label, host: a.host, ms: hit.ms, block, note: NOTE[block] };
    }),
  );
}

export function pickTransport(rows: ServiceProbe[]) {
  const blocks = rows.map((r) => r.block);
  if (blocks.length === 0) return { transport: "hysteria2", vector: "unknown", sni: "www.cloudflare.com" };
  if (blocks.every((b) => b === "none")) return { transport: "hysteria2", vector: "clean", sni: "www.cloudflare.com" };
  if (blocks.includes("dns")) return { transport: "hysteria2", vector: "dns-poison", sni: "www.microsoft.com" };
  if (blocks.includes("tcp")) return { transport: "amneziawg", vector: "ip-blackhole", sni: "www.cloudflare.com" };
  return { transport: "vless-reality", vector: "sni-filter", sni: "www.microsoft.com" };
}

export function serviceEvidence(rows: ServiceProbe[]): Evidence[] {
  return rows.map((r) => ({
    check: `tls-sni:${r.host}`,
    result: r.block === "none" ? "ok" : "fail",
    ms: r.ms ?? undefined,
    detail: r.note,
  }));
}
