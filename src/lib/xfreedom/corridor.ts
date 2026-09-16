import type { Evidence, RoutePick } from "./classify";

/** Cover names that look like ordinary HTTPS. Not TLS Tunnel configs. */
export const COVER_SNI = [
  "www.microsoft.com",
  "www.apple.com",
  "www.cloudflare.com",
  "update.googleapis.com",
] as const;

export type Hop = {
  role: "PRIMARY" | "FALLBACK_1" | "FALLBACK_2";
  nodeId: string;
  city: string;
  transport: string;
  sni: string;
  udp: boolean;
  ipv6: "prefer" | "off";
  tcpOnly: boolean;
  gamesOk: boolean;
  why: string;
};

export type CorridorRecipe = {
  measured: boolean;
  tunnel: false;
  nativeRequired: true;
  classification: string;
  fromLabel: string;
  toCity: string;
  toNodeId: string;
  sni: string;
  coverOk: boolean;
  ipv6: "prefer" | "off";
  udp: boolean;
  alwaysOn: true;
  killSwitch: true;
  battery: "foreground-service";
  hops: Hop[];
  headline: string;
  detail: string;
  webLimit: string;
};

export function pickSni(evidence: Evidence[] = []): { sni: string; coverOk: boolean } {
  const checks = evidence.filter((e) => e.check.startsWith("tls-sni:"));
  for (const cover of COVER_SNI) {
    if (checks.some((e) => e.check === `tls-sni:${cover}` && e.result === "ok")) {
      return { sni: cover, coverOk: true };
    }
  }
  const ok = checks.find((e) => e.result === "ok");
  if (ok) return { sni: ok.check.slice(8), coverOk: true };
  return { sni: "www.cloudflare.com", coverOk: checks.length === 0 };
}

function cityOf(nodeId: string, nodes?: { id: string; city: string }[]) {
  return nodes?.find((n) => n.id === nodeId)?.city ?? nodeId;
}

function formName(t: string) {
  if (t === "HYSTERIA2") return "быстрая";
  if (t === "VLESS_REALITY") return "тихая";
  if (t === "AMNEZIAWG") return "другая форма";
  if (t === "TLS13_SNI") return "как обычный сайт";
  if (t === "SSH_TCP") return "узкий запас";
  return t;
}

function usesUdp(transport: string) {
  return transport === "HYSTERIA2";
}

function tcpOnly(transport: string) {
  return transport === "SSH_TCP";
}

export function buildCorridor(input: {
  classification?: string | null;
  routes?: RoutePick[] | null;
  evidence?: Evidence[] | null;
  ipv6Ok?: boolean | null;
  fromLabel?: string | null;
  toCity?: string | null;
  nodes?: { id: string; city: string }[] | null;
}): CorridorRecipe {
  const classification = input.classification || "UNKNOWN";
  const routes = Array.isArray(input.routes) ? input.routes : [];
  const evidence = Array.isArray(input.evidence) ? input.evidence : [];
  const cover = pickSni(evidence);
  const ipv6: "prefer" | "off" = input.ipv6Ok === true ? "prefer" : "off";
  const udp =
    classification !== "UDP_UNAVAILABLE" &&
    classification !== "OFFLINE" &&
    classification !== "CAPTIVE_PORTAL_OR_PROXY";
  const hops: Hop[] = routes.slice(0, 3).map((r) => {
    const transport = r.transport;
    const noUdp = tcpOnly(transport) || !usesUdp(transport) || !udp;
    return {
      role: r.role,
      nodeId: r.nodeId,
      city: cityOf(r.nodeId, input.nodes ?? undefined),
      transport,
      sni: cover.sni,
      udp: !noUdp,
      ipv6,
      tcpOnly: tcpOnly(transport),
      gamesOk: !noUdp,
      why: r.why,
    };
  });
  const primary = hops[0];
  const toCity = input.toCity || primary?.city || "выход";
  const toNodeId = primary?.nodeId || "";
  const measured = Boolean(classification && classification !== "UNKNOWN") || hops.length > 0;

  let headline = "Рецепт для телефона";
  let detail = "Сайт коридор не поднимает. Телефон берёт эту главную дорогу и две запасных.";
  if (classification === "OFFLINE") {
    headline = "Интернета нет";
    detail = "Сначала обычная сеть.";
  } else if (classification === "UDP_UNAVAILABLE") {
    headline = "Быстрая дорога закрыта";
    detail = "UDP нет. Главная — тихая TCP. Игры через быструю не пойдут, пока не сменится сеть.";
  } else if (classification === "TLS_HANDSHAKE_INTERFERENCE") {
    headline = "Обычное шифрование ломают";
    detail = "Берём другую форму: QUIC или TLS 1.3 под чужим именем сайта.";
  } else if (classification === "TCP_PORT_FILTERING" || classification === "IP_UNREACHABLE") {
    headline = "Часть дверей закрыта";
    detail = "Последний запас — SSH только для страниц. UDP и игры на нём нет.";
  } else if (classification === "NO_BLOCK_DETECTED") {
    headline = "Дорога открыта";
    detail = "Можно быструю. Зелёная галочка — только когда коридор встанет на телефоне.";
  }

  return {
    measured,
    tunnel: false,
    nativeRequired: true,
    classification,
    fromLabel: input.fromLabel?.trim() || "это устройство",
    toCity,
    toNodeId,
    sni: cover.sni,
    coverOk: cover.coverOk,
    ipv6,
    udp,
    alwaysOn: true,
    killSwitch: true,
    battery: "foreground-service",
    hops,
    headline,
    detail,
    webLimit: "Always-On, Kill Switch и батарея — флаги для Android VpnService. Сайт их не включает.",
  };
}

export function formatCorridorText(recipe: CorridorRecipe) {
  const lines = [
    `${recipe.fromLabel} → ${recipe.toCity}`,
    recipe.headline,
    recipe.detail,
    `имя прикрытия · ${recipe.sni}${recipe.coverOk ? "" : " · слабое, фактов мало"}`,
    `IPv6 · ${recipe.ipv6 === "prefer" ? "брать" : "нет факта, не форсируем"}`,
    `UDP · ${recipe.udp ? "можно быструю" : "закрыт"}`,
  ];
  for (const hop of recipe.hops) {
    const tag = hop.role === "PRIMARY" ? "главная" : hop.role === "FALLBACK_1" ? "запас" : "ещё запас";
    const form = formName(hop.transport);
    const extra = hop.tcpOnly ? "только страницы, без игр" : hop.udp ? "UDP жив" : "TCP";
    lines.push(`${tag} · ${hop.city} · ${form} · ${extra}`);
  }
  if (recipe.hops.length === 0) lines.push("дорог пока нет — сначала замер");
  lines.push("Always-On · да, на телефоне");
  lines.push("Kill Switch · да, на телефоне");
  lines.push("батарея · свой процесс, не страница в браузере");
  lines.push("туннель не поднят");
  lines.push(recipe.webLimit);
  return lines.join("\n");
}
