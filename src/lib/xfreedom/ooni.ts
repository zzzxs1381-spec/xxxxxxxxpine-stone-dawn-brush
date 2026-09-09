/** Public OONI web_connectivity pack. Not XFreedom's tunnel. Not this screen's network. */

export type ServiceShot = {
  uid: string;
  name: string;
  host: string;
  at: string;
  dns: "ok" | "fail";
  tcp: "ok" | "mixed" | "fail";
  tls: "ok" | "rst" | "timeout" | "fail";
  http: "ok" | "rst" | "timeout" | "legal" | "fail";
  ipv6: "ok" | "unreachable" | "skip";
  accessible: boolean;
  blocking: string | false;
  kid: string;
  tone: "ok" | "warn" | "bad";
};

export type ServicePack = {
  title: string;
  whenLabel: string;
  cc: string;
  asn: string;
  network: string;
  software: string;
  note: string;
  telegram: string;
  advice: { headline: string; detail: string; preferTransport: string };
  shots: ServiceShot[];
};

export const OONI_PACK: ServicePack = {
  title: "Что режут сегодня",
  whenLabel: "9 сентября 2026, около 16:00 МСК",
  cc: "RU",
  asn: "AS205236",
  network: "Gipercom",
  software: "OONI Probe на iPhone",
  note: "Это не замер XFreedom и не этот экран. Это публичный градусник OONI с одного телефона в одной российской сети. Другой город, другой оператор — картина будет другой. Сайт коридор по этим ссылкам не строит.",
  telegram: "В этой пачке Telegram не мерили. Мы не дорисовываем «его тоже закрыли». В других сетях России в тот же день telegram.org часто не достучаться уже на двери TCP.",
  advice: {
    headline: "Имена находят, дверь 443 открывают, разговор ломают",
    detail:
      "Это не «интернета нет». Книжка адресов работает. Дальше на шифровании рвут или глушат. Телефону прятать имя дороги: быстрая форма или тихая. TikTok отвечает сам и вешает табличку «вам нельзя» — это другая история, не сломанный замок.",
    preferTransport: "HYSTERIA2",
  },
  shots: [
    {
      uid: "20260909125726.399993_RU_webconnectivity_c940f1a71e0b3630",
      name: "Twitter",
      host: "twitter.com",
      at: "2026-09-09T12:57:25Z",
      dns: "ok",
      tcp: "ok",
      tls: "rst",
      http: "rst",
      ipv6: "skip",
      accessible: false,
      blocking: "http-failure",
      kid: "Имя нашли, дверь открыли, шифрование сразу оборвали.",
      tone: "bad",
    },
    {
      uid: "20260909125726.932754_RU_webconnectivity_8e1331bac677c25e",
      name: "Facebook",
      host: "www.facebook.com",
      at: "2026-09-09T12:57:25Z",
      dns: "ok",
      tcp: "ok",
      tls: "rst",
      http: "rst",
      ipv6: "unreachable",
      accessible: false,
      blocking: "http-failure",
      kid: "То же. Короткая дорога IPv6 не идёт, ходят через обычную.",
      tone: "bad",
    },
    {
      uid: "20260909125727.461655_RU_webconnectivity_b855852f2e2f21d2",
      name: "Instagram",
      host: "www.instagram.com",
      at: "2026-09-09T12:57:26Z",
      dns: "ok",
      tcp: "ok",
      tls: "rst",
      http: "rst",
      ipv6: "unreachable",
      accessible: false,
      blocking: "http-failure",
      kid: "Как Facebook: дверь есть, замок ломают.",
      tone: "bad",
    },
    {
      uid: "20260909125807.560633_RU_webconnectivity_1174e9dfd6268e83",
      name: "YouTube",
      host: "www.youtube.com",
      at: "2026-09-09T12:57:26Z",
      dns: "ok",
      tcp: "ok",
      tls: "timeout",
      http: "timeout",
      ipv6: "unreachable",
      accessible: false,
      blocking: "http-failure",
      kid: "Дверь открывается, а закрытый разговор не начинается — тишина 10–30 секунд.",
      tone: "bad",
    },
    {
      uid: "20260909125908.943031_RU_webconnectivity_973c9946d206e16f",
      name: "X",
      host: "x.com",
      at: "2026-09-09T12:58:08Z",
      dns: "ok",
      tcp: "ok",
      tls: "ok",
      http: "timeout",
      ipv6: "skip",
      accessible: false,
      blocking: "http-failure",
      kid: "Шифрование даже договорилось, а страница так и не пришла.",
      tone: "bad",
    },
    {
      uid: "20260909125939.805970_RU_webconnectivity_89e35a690c61daf9",
      name: "Discord",
      host: "discord.com",
      at: "2026-09-09T12:59:08Z",
      dns: "ok",
      tcp: "mixed",
      tls: "timeout",
      http: "timeout",
      ipv6: "skip",
      accessible: false,
      blocking: "http-failure",
      kid: "Часть дверей тормозит, шифрование не успевает.",
      tone: "bad",
    },
    {
      uid: "20260909125808.950928_RU_webconnectivity_e6064a59e7f79cf2",
      name: "TikTok",
      host: "www.tiktok.com",
      at: "2026-09-09T12:58:07Z",
      dns: "ok",
      tcp: "ok",
      tls: "ok",
      http: "legal",
      ipv6: "skip",
      accessible: true,
      blocking: false,
      kid: "Сайт отвечает и вешает табличку «вам нельзя». Это не сломанный замок.",
      tone: "warn",
    },
  ],
};

export function ooniHref(uid: string) {
  return `https://explorer.ooni.org/m/${uid}`;
}

export function tlsWord(tls: ServiceShot["tls"]) {
  if (tls === "ok") return "шифрованию дали";
  if (tls === "rst") return "шифровку оборвали";
  if (tls === "timeout") return "шифрование молчит";
  return "шифрование не вышло";
}

export function httpWord(http: ServiceShot["http"]) {
  if (http === "ok") return "страница пришла";
  if (http === "rst") return "страницу оборвали";
  if (http === "timeout") return "страница не пришла";
  if (http === "legal") return "табличка «нельзя»";
  return "страницы нет";
}
