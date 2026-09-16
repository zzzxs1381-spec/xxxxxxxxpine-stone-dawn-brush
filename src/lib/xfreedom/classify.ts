export type Evidence = {
  check: string;
  result: string;
  detail?: string;
  ms?: number;
};

export type Classification =
  | "NO_BLOCK_DETECTED"
  | "DNS_FAILURE"
  | "IP_UNREACHABLE"
  | "TCP_PORT_FILTERING"
  | "UDP_UNAVAILABLE"
  | "TLS_HANDSHAKE_INTERFERENCE"
  | "HIGH_LATENCY"
  | "CAPTIVE_PORTAL_OR_PROXY"
  | "OFFLINE"
  | "UNKNOWN";

export function classify(evidence: Evidence[]): Classification {
  const by = (name: string) => evidence.find((e) => e.check === name);

  if (by("online")?.result === "offline") return "OFFLINE";
  if (by("https")?.result === "captive") return "CAPTIVE_PORTAL_OR_PROXY";
  if (by("dns")?.result === "fail") return "DNS_FAILURE";

  const tcp = evidence.filter((e) => e.check.startsWith("tcp:"));
  const tcpFail = tcp.length > 0 && tcp.every((e) => e.result === "fail");
  const tcpOk = tcp.some((e) => e.result === "ok");
  if (tcpFail) return "IP_UNREACHABLE";

  const tls = by("tls");
  if (tls?.result === "fail" && tcpOk) return "TLS_HANDSHAKE_INTERFERENCE";
  const sniFail = evidence.some((e) => e.check.startsWith("tls-sni:") && e.result === "fail");
  if (sniFail && (tcpOk || by("https")?.result === "ok" || by("origin-rtt")?.result === "ok")) {
    return "TLS_HANDSHAKE_INTERFERENCE";
  }
  if (by("https")?.result === "fail" && (by("same-origin")?.result === "ok" || tcpOk)) {
    return "TLS_HANDSHAKE_INTERFERENCE";
  }
  if (by("https")?.result === "fail" && tcp.length === 0 && by("origin-rtt")?.result === "fail") {
    return "IP_UNREACHABLE";
  }
  if (tcp.length >= 2 && tcp.some((e) => e.result === "fail") && tcpOk) return "TCP_PORT_FILTERING";

  const udpDns = by("udp-dns");
  if (udpDns?.result === "fail") return "UDP_UNAVAILABLE";
  const udpHint = by("udp-hint");
  if (udpHint?.result === "fail") return "UDP_UNAVAILABLE";

  const latencies = evidence
    .filter(
      (e) =>
        (e.check === "https" || e.check === "tls" || e.check === "origin-rtt") &&
        e.result === "ok" &&
        typeof e.ms === "number",
    )
    .map((e) => e.ms as number);
  if (latencies.length > 0 && Math.min(...latencies) > 1200) return "HIGH_LATENCY";

  if (evidence.some((e) => e.result === "fail" && e.check !== "ipv6" && e.check !== "udp-hint")) {
    return "UNKNOWN";
  }
  return "NO_BLOCK_DETECTED";
}

export function classificationLabel(c: Classification | string): string {
  const map: Record<Classification, string> = {
    NO_BLOCK_DETECTED: "Дорога открыта",
    DNS_FAILURE: "Сайты не находятся по имени",
    IP_UNREACHABLE: "Сеть не отвечает",
    TCP_PORT_FILTERING: "Часть дверей закрыта",
    UDP_UNAVAILABLE: "Быстрая дорога закрыта",
    TLS_HANDSHAKE_INTERFERENCE: "Шифрование ломают",
    HIGH_LATENCY: "Дорога очень медленная",
    CAPTIVE_PORTAL_OR_PROXY: "Сначала вход в Wi‑Fi",
    OFFLINE: "Интернета нет",
    UNKNOWN: "Мало фактов",
  };
  return map[c as Classification] ?? c;
}

export type RoutePick = {
  role: "PRIMARY" | "FALLBACK_1" | "FALLBACK_2";
  nodeId: string;
  transport: string;
  score: number;
  why: string;
};

export function roleLabel(role: string): string {
  if (role === "PRIMARY") return "Главная";
  if (role === "FALLBACK_1") return "Запасная";
  if (role === "FALLBACK_2") return "Ещё запасная";
  return role;
}

export function transportLabel(t: string): string {
  if (t === "HYSTERIA2") return "быстрая";
  if (t === "VLESS_REALITY") return "тихая";
  if (t === "AMNEZIAWG") return "другая форма";
  if (t === "TLS13_SNI") return "как обычный сайт";
  if (t === "SSH_TCP") return "узкий запас";
  return t;
}

export function scoreRoutes(
  classification: Classification | string,
  nodes: { id: string; health: string; load: number; transports: string[]; region: string }[],
): RoutePick[] {
  const udpBlocked = classification === "UDP_UNAVAILABLE";
  const tlsTrouble = classification === "TLS_HANDSHAKE_INTERFERENCE";
  const scored = nodes
    .filter((n) => n.health !== "FAILED")
    .map((n) => {
      let score = 0.72;
      if (n.health === "HEALTHY") score += 0.14;
      if (n.health === "DEGRADED") score -= 0.18;
      if (n.health === "DRAINING") score -= 0.22;
      score -= n.load * 0.2;
      if (n.region.startsWith("EU") || n.region === "TR" || n.region === "CAU") score += 0.08;
      let transport = n.transports.includes("HYSTERIA2") ? "HYSTERIA2" : n.transports[0];
      let why = "Этот город живой и не слишком загружен";
      if (udpBlocked && n.transports.includes("VLESS_REALITY")) {
        transport = "VLESS_REALITY";
        score += 0.1;
        why = "Быстрая дорога закрыта — берём тихую";
      } else if (udpBlocked && n.transports.includes("TLS13_SNI")) {
        transport = "TLS13_SNI";
        score += 0.08;
        why = "UDP нет — дорога выглядит как обычный HTTPS";
      }
      if (tlsTrouble && n.transports.includes("HYSTERIA2") && !udpBlocked) {
        transport = "HYSTERIA2";
        score += 0.06;
        why = "Шифрование ломают — пробуем другую форму дороги";
      }
      if (tlsTrouble && udpBlocked && n.transports.includes("TLS13_SNI")) {
        transport = "TLS13_SNI";
        score += 0.12;
        why = "И быстрая, и обычный TLS ломают — прикрываемся чужим именем";
      }
      if (classification === "HIGH_LATENCY" && (n.region.startsWith("EU") || n.region === "TR" || n.region === "CAU")) {
        score += 0.05;
        why = "Дорога медленная — берём ближайший живой город";
      }
      return {
        nodeId: n.id,
        transport,
        score: Math.round(Math.max(0.05, Math.min(0.99, score)) * 100) / 100,
        why,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const roles: RoutePick["role"][] = ["PRIMARY", "FALLBACK_1", "FALLBACK_2"];
  const picked = scored.map((s, i) => ({ role: roles[i]!, ...s }));
  if (
    (classification === "TCP_PORT_FILTERING" || classification === "IP_UNREACHABLE") &&
    picked.length > 0
  ) {
    const ssh = nodes.find((n) => n.health === "HEALTHY" && n.transports.includes("SSH_TCP"));
    if (ssh) {
      const hop: RoutePick = {
        role: picked.length >= 3 ? "FALLBACK_2" : picked.length === 2 ? "FALLBACK_1" : "PRIMARY",
        nodeId: ssh.id,
        transport: "SSH_TCP",
        score: 0.4,
        why: "Двери режут — узкий запас только для страниц, без игр",
      };
      if (picked.length >= 3) picked[2] = hop;
      else picked.push(hop);
    }
  }
  return picked;
}

export type TruthStage = {
  id: string;
  label: string;
  state: "ok" | "no" | "web-limit";
};

export function truthFromReport(input: {
  source?: string | null;
  online?: boolean | null;
  httpsOk?: boolean | null;
  classification?: string | null;
}): TruthStage[] {
  const measured = Boolean(input.classification);
  const online = input.online === true;
  const https = input.httpsOk === true || input.classification === "NO_BLOCK_DETECTED";
  return [
    { id: "CONFIG_RECEIVED", label: "Совет выбран", state: measured ? "ok" : "no" },
    { id: "TRANSPORT_STARTED", label: "Коридор начался", state: "web-limit" },
    { id: "HANDSHAKE_OK", label: "Договорились с дорогой", state: "web-limit" },
    { id: "TUNNEL_INTERFACE_UP", label: "Коридор стоит", state: "web-limit" },
    { id: "DNS_OK", label: "Имена сайтов находятся", state: !measured ? "no" : input.classification === "DNS_FAILURE" ? "no" : online ? "ok" : "no" },
    { id: "INTERNET_OK", label: "Интернет есть", state: !measured ? "no" : https ? "ok" : "no" },
    { id: "SERVICE_TESTS_OK", label: "Telegram и YouTube проверены", state: "web-limit" },
  ];
}

export type ClientAdvice = {
  action: "OFFLINE" | "CAPTIVE" | "MEASURE" | "PREFER_TCP" | "PREFER_QUIC" | "NATIVE" | "OK";
  headline: string;
  detail: string;
  preferTransport: string;
  avoidUdp: boolean;
};

export function adviceFrom(classification: Classification | string, routes: RoutePick[]): ClientAdvice {
  const preferTransport = routes[0]?.transport ?? "HYSTERIA2";
  switch (classification) {
    case "OFFLINE":
      return {
        action: "OFFLINE",
        headline: "Интернета нет",
        detail: "Сначала обычная сеть. Коридор тут ни при чём — как зонтик в комнате без дождя.",
        preferTransport,
        avoidUdp: false,
      };
    case "CAPTIVE_PORTAL_OR_PROXY":
      return {
        action: "CAPTIVE",
        headline: "Сначала вход в Wi‑Fi",
        detail: "Кафе или отель просит нажать «войти в сеть». Сделай это в браузере, потом проверь ещё раз.",
        preferTransport,
        avoidUdp: true,
      };
    case "UDP_UNAVAILABLE":
      return {
        action: "PREFER_TCP",
        headline: "Быстрая дорога закрыта",
        detail: "Телефону брать тихую или HTTPS-прикрытие, не быструю. Сайт коридор не строит.",
        preferTransport: "VLESS_REALITY",
        avoidUdp: true,
      };
    case "TLS_HANDSHAKE_INTERFERENCE":
      return {
        action: "PREFER_QUIC",
        headline: "Шифрование ломают",
        detail: "Кто-то мешает закрытому разговору. Телефону — QUIC или TLS 1.3 под чужим именем. Instagram с этого сайта не откроется.",
        preferTransport: "HYSTERIA2",
        avoidUdp: false,
      };
    case "TCP_PORT_FILTERING":
      return {
        action: "PREFER_TCP",
        headline: "Часть дверей закрыта",
        detail: "Не все входы работают. Последний запас — узкий SSH только для страниц.",
        preferTransport: preferTransport === "HYSTERIA2" ? "TLS13_SNI" : preferTransport,
        avoidUdp: false,
      };
    case "DNS_FAILURE":
      return {
        action: "NATIVE",
        headline: "Сайты не находятся по имени",
        detail: "Как записная книжка с вырванными адресами. Когда коридор встанет на телефоне — внутри будет своя книжка.",
        preferTransport,
        avoidUdp: false,
      };
    case "IP_UNREACHABLE":
      return {
        action: "MEASURE",
        headline: "Сеть не отвечает",
        detail: "Снаружи тишина. Проверь обычный интернет. Если это только браузер — запусти программу-градусник на компьютере.",
        preferTransport,
        avoidUdp: false,
      };
    case "HIGH_LATENCY":
      return {
        action: "NATIVE",
        headline: "Дорога очень медленная",
        detail: "Сайт быстрее не сделает. Телефон возьмёт ближайший живой город.",
        preferTransport,
        avoidUdp: false,
      };
    case "NO_BLOCK_DETECTED":
      return {
        action: "OK",
        headline: "Дорога открыта",
        detail: "Затормозов не видно. Зелёная галочка «подключено» будет только на телефоне, когда коридор реально встанет.",
        preferTransport,
        avoidUdp: false,
      };
    default:
      return {
        action: "MEASURE",
        headline: "Мало фактов",
        detail: "Браузер видит мало. Запусти проверку ещё раз или программу-градусник на компьютере.",
        preferTransport,
        avoidUdp: false,
      };
  }
}

export function checkKid(check: string): string {
  if (check === "online") return "есть ли интернет";
  if (check === "network-info") return "какая сеть";
  if (check === "origin-rtt") return "кабинет отвечает";
  if (check === "same-origin") return "этот сайт открывается";
  if (check === "https") return "обычный интернет";
  if (check === "udp-hint") return "быстрая дорога";
  if (check === "udp-dns") return "имена по быстрой дороге";
  if (check === "tls") return "шифрование";
  if (check === "dns") return "имена сайтов";
  if (check === "ipv6") return "IPv6";
  if (check === "ip-version") return "версия адреса";
  if (check.startsWith("tls-sni:")) return `шифрование ${check.slice(8)}`;
  if (check.startsWith("tcp:")) return `дверь ${check.slice(4)}`;
  return check;
}

export function asRoutes(v: unknown): RoutePick[] {
  return Array.isArray(v) ? (v as RoutePick[]) : [];
}

export function asAdvice(v: unknown): ClientAdvice | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Partial<ClientAdvice>;
  if (!o.action || !o.headline) return null;
  return {
    action: o.action,
    headline: o.headline,
    detail: o.detail ?? "",
    preferTransport: o.preferTransport ?? "HYSTERIA2",
    avoidUdp: Boolean(o.avoidUdp),
  };
}

export function asEvidence(v: unknown): Evidence[] {
  return Array.isArray(v) ? (v as Evidence[]) : [];
}
