export type NodeHealth = "HEALTHY" | "DEGRADED" | "DRAINING" | "FAILED" | "RECOVERING";

export type Transport = "HYSTERIA2" | "VLESS_REALITY" | "AMNEZIAWG" | "TLS13_SNI" | "SSH_TCP";

export type EdgeNode = {
  id: string;
  city: string;
  country: string;
  region: string;
  provider: string;
  asn: string;
  health: NodeHealth;
  transports: Transport[];
  load: number;
  x: number;
  y: number;
  lat: number;
  lng: number;
};

/** Visualization catalog only — not a live VPN control plane. */
export const EDGE_NODES: EdgeNode[] = [
  { id: "ams-1", city: "Amsterdam", country: "NL", region: "EU-W", provider: "Leaseweb", asn: "AS60781", health: "HEALTHY", transports: ["HYSTERIA2", "VLESS_REALITY", "TLS13_SNI", "SSH_TCP"], load: 0.31, x: 49.2, y: 38.4, lat: 52.367, lng: 4.904 },
  { id: "fra-1", city: "Frankfurt", country: "DE", region: "EU-C", provider: "Hetzner", asn: "AS24940", health: "HEALTHY", transports: ["HYSTERIA2", "VLESS_REALITY", "AMNEZIAWG", "TLS13_SNI", "SSH_TCP"], load: 0.44, x: 51.4, y: 39.8, lat: 50.11, lng: 8.682 },
  { id: "waw-1", city: "Warsaw", country: "PL", region: "EU-E", provider: "OVH", asn: "AS16276", health: "HEALTHY", transports: ["HYSTERIA2", "VLESS_REALITY", "TLS13_SNI", "SSH_TCP"], load: 0.22, x: 54.8, y: 37.6, lat: 52.229, lng: 21.012 },
  { id: "ist-1", city: "Istanbul", country: "TR", region: "TR", provider: "Local", asn: "AS9121", health: "DEGRADED", transports: ["HYSTERIA2", "AMNEZIAWG", "TLS13_SNI", "SSH_TCP"], load: 0.71, x: 58.6, y: 44.2, lat: 41.008, lng: 28.978 },
  { id: "tbs-1", city: "Tbilisi", country: "GE", region: "CAU", provider: "Local", asn: "AS16010", health: "HEALTHY", transports: ["HYSTERIA2", "VLESS_REALITY", "TLS13_SNI", "SSH_TCP"], load: 0.18, x: 62.4, y: 43.1, lat: 41.715, lng: 44.783 },
  { id: "dxb-1", city: "Dubai", country: "AE", region: "ME", provider: "Equinix", asn: "AS8966", health: "HEALTHY", transports: ["HYSTERIA2", "VLESS_REALITY", "TLS13_SNI", "SSH_TCP"], load: 0.36, x: 64.8, y: 51.4, lat: 25.204, lng: 55.27 },
  { id: "sgp-1", city: "Singapore", country: "SG", region: "APAC", provider: "Equinix", asn: "AS7473", health: "HEALTHY", transports: ["HYSTERIA2", "VLESS_REALITY", "AMNEZIAWG", "TLS13_SNI", "SSH_TCP"], load: 0.52, x: 78.2, y: 62.8, lat: 1.352, lng: 103.82 },
  { id: "nrt-1", city: "Tokyo", country: "JP", region: "APAC", provider: "Sakura", asn: "AS9370", health: "RECOVERING", transports: ["HYSTERIA2", "VLESS_REALITY", "TLS13_SNI", "SSH_TCP"], load: 0.41, x: 86.4, y: 43.6, lat: 35.676, lng: 139.65 },
  { id: "iad-1", city: "Ashburn", country: "US", region: "NA-E", provider: "Equinix", asn: "AS174", health: "HEALTHY", transports: ["HYSTERIA2", "VLESS_REALITY", "TLS13_SNI", "SSH_TCP"], load: 0.29, x: 24.8, y: 44.2, lat: 39.043, lng: -77.487 },
  { id: "sjc-1", city: "San Jose", country: "US", region: "NA-W", provider: "Hurricane", asn: "AS6939", health: "DRAINING", transports: ["VLESS_REALITY", "TLS13_SNI", "SSH_TCP"], load: 0.63, x: 16.2, y: 45.8, lat: 37.338, lng: -121.886 },
];

export const PLANS = [
  {
    code: "trial",
    name: "Пробный",
    price: "0 ₽",
    period: "7 дней",
    features: ["1 устройство", "Система сама выбирает дорогу", "Проверка с экрана", "Без карты"],
  },
  {
    code: "month",
    name: "Месяц",
    price: "—",
    period: "когда появится оплата",
    features: ["До 5 устройств", "Главная и запасные дороги", "История проверок", "Помощь"],
  },
  {
    code: "year",
    name: "Год",
    price: "—",
    period: "когда появится оплата",
    features: ["До 8 устройств", "Все формы коридора", "Приоритетная помощь", "Телеметрия только с согласия"],
  },
] as const;

export const CONNECTION_STAGES = [
  "CONFIG_RECEIVED",
  "TRANSPORT_STARTED",
  "HANDSHAKE_OK",
  "TUNNEL_INTERFACE_UP",
  "DNS_OK",
  "INTERNET_OK",
  "SERVICE_TESTS_OK",
] as const;

export const WEB_LIMITS = [
  "Браузер не поднимает системный VPN-туннель.",
  "CONNECTED в нативном клиенте ставится только после TUNNEL_UP и проверки интернета.",
  "Карта — визуализация, не движок маршрутов.",
  "AIMA советует; детерминированный движок маршрутов принимает решение.",
  "Платёжный провайдер не подключён, пока нет юридической и API-проверки.",
];
