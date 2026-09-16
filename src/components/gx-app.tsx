import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import "@/target-grok.css";
import { EDGE_NODES } from "@/lib/xfreedom/catalog";
import {
  adviceFrom,
  classify,
  scoreRoutes,
  transportLabel,
  type ClientAdvice,
  type Evidence,
} from "@/lib/xfreedom/classify";
import { runBrowserDiagnostics } from "@/lib/xfreedom/browser-diag";
import { runCabinetProbe } from "@/lib/xfreedom/run-probe";
import { measureServices, serviceEvidence, type ServiceProbe } from "@/lib/xfreedom/service-probe";
import { buildCorridor, formatCorridorText } from "@/lib/xfreedom/corridor";
import { startTrial } from "@/lib/xfreedom/server";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { EarthMap } from "@/components/earth-map";

type Probe = ServiceProbe;
type Tab = "home" | "pay" | "lane";
type Phase = "idle" | "flying" | "on";
type PickMode = "from" | "to" | null;
type GeoPoint = { lat: number; lng: number; label: string };
type TouchCoordinates = { [index: number]: { clientX: number; clientY: number } };
type RouteMeta = { id?: string; name?: string; protocol?: string; transport?: string | null; health?: string };
type Pin = { id: string; city: string; lat: number; lng: number; x: number; y: number; real: boolean };
type RitualStep = "idle" | "locate" | "found" | "scan" | "lock" | "beam";
type Ritual = {
  step: RitualStep;
  you: GeoPoint | null;
  how: "geo" | "tz" | null;
  count: number;
  lit: string[];
  near: Pin[];
  nearest: Pin | null;
  beam: boolean;
};

const SCAN_COUNTS = [10, 12, 20, 30] as const;

const VIZ_PINS: Pin[] = [
  { id: "lon", city: "London", lat: 51.51, lng: -0.13, x: 47.4, y: 37.6, real: false },
  { id: "par", city: "Paris", lat: 48.86, lng: 2.35, x: 48.6, y: 39.6, real: false },
  { id: "mad", city: "Madrid", lat: 40.42, lng: -3.7, x: 46.4, y: 43.2, real: false },
  { id: "sto", city: "Stockholm", lat: 59.33, lng: 18.07, x: 53.2, y: 33.0, real: false },
  { id: "hel", city: "Helsinki", lat: 60.17, lng: 24.94, x: 55.0, y: 32.2, real: false },
  { id: "vie", city: "Vienna", lat: 48.21, lng: 16.37, x: 52.8, y: 40.2, real: false },
  { id: "iev", city: "Kyiv", lat: 50.45, lng: 30.52, x: 56.6, y: 38.0, real: false },
  { id: "mow", city: "Moscow", lat: 55.76, lng: 37.62, x: 58.8, y: 34.4, real: false },
  { id: "cai", city: "Cairo", lat: 30.04, lng: 31.24, x: 56.8, y: 48.8, real: false },
  { id: "ruh", city: "Riyadh", lat: 24.71, lng: 46.67, x: 62.0, y: 52.8, real: false },
  { id: "bom", city: "Mumbai", lat: 19.08, lng: 72.88, x: 70.6, y: 55.4, real: false },
  { id: "hkg", city: "Hong Kong", lat: 22.32, lng: 114.17, x: 81.2, y: 52.8, real: false },
  { id: "sel", city: "Seoul", lat: 37.57, lng: 126.98, x: 84.4, y: 44.6, real: false },
  { id: "syd", city: "Sydney", lat: -33.87, lng: 151.21, x: 88.6, y: 76.8, real: false },
  { id: "gru", city: "São Paulo", lat: -23.55, lng: -46.63, x: 32.0, y: 72.0, real: false },
  { id: "yyz", city: "Toronto", lat: 43.65, lng: -79.38, x: 23.4, y: 41.2, real: false },
  { id: "mex", city: "Mexico City", lat: 19.43, lng: -99.13, x: 18.8, y: 53.6, real: false },
  { id: "jnb", city: "Johannesburg", lat: -26.2, lng: 28.05, x: 54.8, y: 73.6, real: false },
  { id: "nbo", city: "Nairobi", lat: -1.29, lng: 36.82, x: 58.4, y: 61.8, real: false },
  { id: "bkk", city: "Bangkok", lat: 13.76, lng: 100.5, x: 76.4, y: 57.6, real: false },
  { id: "jkt", city: "Jakarta", lat: -6.21, lng: 106.85, x: 79.6, y: 65.4, real: false },
  { id: "los", city: "Lagos", lat: 6.52, lng: 3.38, x: 48.6, y: 58.4, real: false },
];

const REAL_PINS: Pin[] = EDGE_NODES.map((n) => ({
  id: n.id,
  city: n.city,
  lat: n.lat,
  lng: n.lng,
  x: n.x,
  y: n.y,
  real: true,
}));

const ALL_PINS: Pin[] = [...REAL_PINS, ...VIZ_PINS];

const EMPTY_RITUAL: Ritual = {
  step: "idle",
  you: null,
  how: null,
  count: 0,
  lit: [],
  near: [],
  nearest: null,
  beam: false,
};

const TZ_HINT: Record<string, GeoPoint> = {
  "Africa/Cairo": { lat: 30.0444, lng: 31.2357, label: "Cairo" },
  "Africa/Johannesburg": { lat: -26.2041, lng: 28.0473, label: "Johannesburg" },
  "Africa/Lagos": { lat: 6.5244, lng: 3.3792, label: "Lagos" },
  "Africa/Nairobi": { lat: -1.2921, lng: 36.8219, label: "Nairobi" },
  "Europe/Moscow": { lat: 55.7558, lng: 37.6173, label: "Moscow" },
  "Europe/Minsk": { lat: 53.9045, lng: 27.5615, label: "Minsk" },
  "Europe/Kyiv": { lat: 50.4501, lng: 30.5234, label: "Kyiv" },
  "Europe/Kiev": { lat: 50.4501, lng: 30.5234, label: "Kyiv" },
  "Europe/Berlin": { lat: 52.52, lng: 13.405, label: "Berlin" },
  "Europe/Warsaw": { lat: 52.2297, lng: 21.0122, label: "Warsaw" },
  "Europe/Istanbul": { lat: 41.0082, lng: 28.9784, label: "Istanbul" },
  "Europe/London": { lat: 51.5074, lng: -0.1278, label: "London" },
  "Europe/Paris": { lat: 48.8566, lng: 2.3522, label: "Paris" },
  "Europe/Madrid": { lat: 40.4168, lng: -3.7038, label: "Madrid" },
  "Europe/Rome": { lat: 41.9028, lng: 12.4964, label: "Rome" },
  "Europe/Amsterdam": { lat: 52.3676, lng: 4.9041, label: "Amsterdam" },
  "Asia/Dubai": { lat: 25.2048, lng: 55.2708, label: "Dubai" },
  "Asia/Tbilisi": { lat: 41.7151, lng: 44.8271, label: "Tbilisi" },
  "Asia/Yerevan": { lat: 40.1792, lng: 44.4991, label: "Yerevan" },
  "Asia/Baku": { lat: 40.4093, lng: 49.8671, label: "Baku" },
  "Asia/Almaty": { lat: 43.222, lng: 76.8512, label: "Almaty" },
  "Asia/Tashkent": { lat: 41.2995, lng: 69.2401, label: "Tashkent" },
  "Asia/Yekaterinburg": { lat: 56.8389, lng: 60.6057, label: "Yekaterinburg" },
  "Asia/Novosibirsk": { lat: 55.0084, lng: 82.9357, label: "Novosibirsk" },
  "Asia/Vladivostok": { lat: 43.1155, lng: 131.8855, label: "Vladivostok" },
  "Asia/Tokyo": { lat: 35.6762, lng: 139.6503, label: "Tokyo" },
  "Asia/Singapore": { lat: 1.3521, lng: 103.8198, label: "Singapore" },
  "Asia/Seoul": { lat: 37.5665, lng: 126.978, label: "Seoul" },
  "Asia/Hong_Kong": { lat: 22.3193, lng: 114.1694, label: "Hong Kong" },
  "Asia/Bangkok": { lat: 13.7563, lng: 100.5018, label: "Bangkok" },
  "Asia/Jakarta": { lat: -6.2088, lng: 106.8456, label: "Jakarta" },
  "Asia/Kolkata": { lat: 19.076, lng: 72.8777, label: "Mumbai" },
  "America/New_York": { lat: 40.7128, lng: -74.006, label: "New York" },
  "America/Los_Angeles": { lat: 34.0522, lng: -118.2437, label: "Los Angeles" },
  "America/Toronto": { lat: 43.6532, lng: -79.3832, label: "Toronto" },
  "America/Sao_Paulo": { lat: -23.5558, lng: -46.6396, label: "São Paulo" },
  "Australia/Sydney": { lat: -33.8688, lng: 151.2093, label: "Sydney" },
};

function coordsLabel(lat: number, lng: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lng).toFixed(3)}°${ew}`;
}

function tzGuess(): GeoPoint {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (TZ_HINT[tz]) return TZ_HINT[tz];
  const off = -new Date().getTimezoneOffset() / 60;
  return { lat: 35, lng: Math.max(-150, Math.min(170, off * 15)), label: tz || "локально" };
}

function locateYou(): Promise<{ point: GeoPoint; how: "geo" | "tz" }> {
  return new Promise((resolve) => {
    const fallback = () => resolve({ point: tzGuess(), how: "tz" });
    if (!navigator.geolocation) return fallback();
    const timer = window.setTimeout(fallback, 1500);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(timer);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const named = Object.values(TZ_HINT).find((p) => haversine(lat, lng, p.lat, p.lng) < 180);
        resolve({
          point: { lat, lng, label: named?.label || coordsLabel(lat, lng) },
          how: "geo",
        });
      },
      () => {
        window.clearTimeout(timer);
        fallback();
      },
      { enableHighAccuracy: false, timeout: 1300, maximumAge: 300000 },
    );
  });
}

function haversine(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function nearestReal(from: GeoPoint, n = 3): Pin[] {
  return [...REAL_PINS]
    .sort((a, b) => haversine(from.lat, from.lng, a.lat, a.lng) - haversine(from.lat, from.lng, b.lat, b.lng))
    .slice(0, n);
}

function diskXY(point: GeoPoint) {
  const match = ALL_PINS.find((p) => haversine(point.lat, point.lng, p.lat, p.lng) < 220);
  if (match) return { x: match.x, y: match.y };
  const lon0 = 15;
  const lat0 = 12;
  const φ = (point.lat * Math.PI) / 180;
  const λ = (point.lng * Math.PI) / 180;
  const φ0 = (lat0 * Math.PI) / 180;
  const λ0 = (lon0 * Math.PI) / 180;
  const x = Math.cos(φ) * Math.sin(λ - λ0);
  const y = Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ - λ0);
  return { x: 50 + x * 46, y: 50 - y * 46 };
}

function diskToGeo(clientX: number, clientY: number, el: HTMLElement): GeoPoint | null {
  const r = el.getBoundingClientRect();
  if (r.width < 8 || r.height < 8) return null;
  const dx = clientX - (r.left + r.width / 2);
  const dy = clientY - (r.top + r.height / 2);
  let angle = 0;
  const tr = getComputedStyle(el).transform;
  if (tr && tr !== "none") {
    const m = new DOMMatrix(tr);
    angle = Math.atan2(m.b, m.a);
  }
  const c = Math.cos(-angle);
  const s = Math.sin(-angle);
  const lx = dx * c - dy * s;
  const ly = dx * s + dy * c;
  const x = lx / (r.width * 0.46);
  const y = -ly / (r.height * 0.46);
  const rho2 = x * x + y * y;
  if (rho2 > 1.02) return null;
  const z = Math.sqrt(Math.max(0, 1 - Math.min(1, rho2)));
  const φ0 = (12 * Math.PI) / 180;
  const λ0 = (15 * Math.PI) / 180;
  const sinφ0 = Math.sin(φ0);
  const cosφ0 = Math.cos(φ0);
  const φ = Math.asin(Math.max(-1, Math.min(1, z * sinφ0 + y * cosφ0)));
  const λ = λ0 + Math.atan2(x, z * cosφ0 - y * sinφ0);
  const lat = (φ * 180) / Math.PI;
  const lng = ((((λ * 180) / Math.PI + 540) % 360) - 180);
  const named = ALL_PINS.find((p) => haversine(lat, lng, p.lat, p.lng) < 280);
  return { lat, lng, label: named?.city || coordsLabel(lat, lng) };
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms: number) {
  if (reducedMotion()) return Promise.resolve();
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

async function bestPublishedRoute(): Promise<RouteMeta | null> {
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 2600);
    const res = await fetch("/api/public/routes", {
      cache: "no-store",
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    const body = (await res.json()) as { routes?: RouteMeta[] };
    const routes = Array.isArray(body.routes) ? body.routes : [];
    return routes.find((r) => /healthy|ok|published|up/i.test(String(r.health || ""))) || routes[0] || null;
  } catch {
    return null;
  }
}

function pointName(point: GeoPoint | null, fallback: string) {
  return point ? point.label : fallback;
}

export function GxApp() {
  const { user } = useCurrentUserState();
  const [tab, setTab] = useState<Tab>("home");
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("Нажми «Подключить»");
  const [results, setResults] = useState<Probe[]>([]);
  const [advice, setAdvice] = useState("");
  const [lastOrder, setLastOrder] = useState<string | null>(null);
  const [plan, setPlan] = useState("start");
  const [months, setMonths] = useState(1);
  const [from, setFrom] = useState<GeoPoint | null>(null);
  const [to, setTo] = useState<GeoPoint | null>(null);
  const [ritual, setRitual] = useState<Ritual>(EMPTY_RITUAL);
  const ritualGen = useRef(0);
  const price = plan === "plus" ? 1200 * months : plan === "max" ? 2800 : plan === "trial" ? 0 : 600 * months;
  const guestLabel = user?.displayName || user?.primaryEmail || (user ? "кабинет" : "гость");

  async function playRitual(kind: "connect" | "plan", planTitle?: string) {
    const id = ++ritualGen.current;
    const live = () => ritualGen.current === id;
    const patch = (next: Partial<Ritual>) => {
      if (!live()) return;
      setRitual((prev) => ({ ...prev, ...next }));
    };

    patch({ ...EMPTY_RITUAL, step: "locate" });
    setStatus(kind === "plan" ? "Тариф · ищу тебя" : "Ищу тебя на карте");
    const found = await locateYou();
    const near = nearestReal(found.point);
    const nearest = near[0] ?? null;
    const result = { ...found, near, nearest };
    if (!live()) return result;
    setFrom((prev) => prev ?? found.point);
    if (nearest) setTo((prev) => prev ?? { lat: nearest.lat, lng: nearest.lng, label: nearest.city });
    patch({ step: "found", you: found.point, how: found.how, near, nearest });
    const via = found.how === "geo" ? "гео браузера" : "по поясу";
    setStatus(`Нашли · ${found.point.label} · ${via}`);
    await wait(220);
    if (!live()) return result;

    patch({ step: "scan", count: 0, lit: [] });
    const order = [...ALL_PINS];
    for (const count of SCAN_COUNTS) {
      if (!live()) return result;
      patch({ count, lit: order.slice(0, count).map((p) => p.id), step: "scan" });
      setStatus(`Считаю точки · ${count} по миру · каталог, не живой control plane`);
      await wait(140);
    }
    if (!live()) return result;

    patch({ step: "lock", near, nearest, lit: near.map((p) => p.id) });
    setStatus(`Ближайшие · ${near.map((p) => p.city).join(", ")}`);
    await wait(180);
    if (!live()) return result;

    patch({ step: "beam", beam: true });
    const title = planTitle ? `«${planTitle}» · ` : "";
    setStatus(`${title}${found.point.label} → ${nearest?.city ?? "выход"} · это показ маршрута, не туннель`);
    await wait(kind === "plan" ? 260 : 160);
    if (!live()) return result;
    if (kind === "plan") patch({ step: "lock", beam: true });
    return result;
  }

  async function connect() {
    if (phase === "on") {
      ritualGen.current += 1;
      setRitual(EMPTY_RITUAL);
      setPhase("idle");
      setStatus("Отключено");
      return;
    }
    if (phase === "flying") return;
    setPhase("flying");
    const found = await playRitual("connect");
    const routeText = `${pointName(from ?? found.point, "авто")} → ${pointName(to, found.nearest?.city ?? "лучший выход")}`;
    setStatus(`Проверяю сеть · ${routeText}`);
    const onStep = (s: string) => setStatus(`${s} · ${routeText}`);
    const [rows, route, engine] = await Promise.all([
      Promise.race([
        measureServices(),
        new Promise<Probe[]>((resolve) => window.setTimeout(() => resolve([]), 4200)),
      ]),
      bestPublishedRoute(),
      (async () => {
        try {
          if (user) {
            const { result } = await runCabinetProbe({ label: "это устройство", onStep });
            return result;
          }
          const measured = await runBrowserDiagnostics(onStep);
          const merged: Evidence[] = [...measured.evidence];
          const routesNow = scoreRoutes(measured.classification, EDGE_NODES);
          return {
            ok: true as const,
            classification: measured.classification,
            routes: routesNow,
            advice: adviceFrom(measured.classification, routesNow),
            evidence: merged,
            latencyMs: measured.latencyMs,
          };
        } catch {
          return { ok: false as const, routes: [], advice: null as ClientAdvice | null };
        }
      })(),
    ]);
    const extraEvidence = serviceEvidence(rows);
    let classNow = engine.ok ? engine.classification : undefined;
    let routesNow = engine.ok ? engine.routes : [];
    const mergedEvidence = [...(engine.ok ? (engine.evidence ?? []) : []), ...extraEvidence];
    if (extraEvidence.length > 0 && engine.ok) {
      const local = classify(mergedEvidence);
      routesNow = scoreRoutes(local, EDGE_NODES);
      classNow = local;
    }
    setResults(rows);
    const ipv6Ok = mergedEvidence.find((e) => e.check === "ipv6")?.result === "ok";
    const recipe =
      engine.ok && "corridor" in engine && engine.corridor && extraEvidence.length === 0
        ? engine.corridor
        : buildCorridor({
            classification: classNow,
            routes: routesNow,
            evidence: mergedEvidence,
            ipv6Ok,
            fromLabel: pointName(from ?? found.point, "это устройство"),
            toCity: pointName(to, found.nearest?.city ?? "выход"),
            nodes: EDGE_NODES,
          });
    setAdvice(formatCorridorText(recipe));
    setPhase("on");
    const liveRoute = recipe.hops[0]
      ? ` · ${transportLabel(recipe.hops[0].transport)}`
      : route?.protocol
        ? ` · ${route.protocol}`
        : "";
    setStatus(`${recipe.fromLabel} → ${recipe.toCity}${liveRoute} · замер, не туннель`);
  }

  async function pay() {
    if (price === 0) {
      if (!user) {
        setLastOrder("login");
        return;
      }
      try {
        const res = await startTrial();
        setLastOrder(res.already ? "trial-already" : "trial");
      } catch {
        setLastOrder("trial-fail");
      }
      return;
    }
    setLastOrder("no-pay");
  }

  function choosePlan(id: string, title: string) {
    setPlan(id);
    setTab("pay");
    void playRitual("plan", title);
  }

  return (
    <div className={`gx-root is-${tab} ${ritual.step !== "idle" ? `is-ritual is-${ritual.step}` : ""}`}>
      <div className="gx-stars" />
      <main className="gx-main">
        <header className="gx-header">
          <div>
            <a href="/" className="gx-brand-kicker">
              xservis
            </a>
            <h1 className="gx-title">
              <span className="gx-title-x">X</span>Freedom
            </h1>
          </div>
          {user ? (
            <Link to="/app" className="gx-guest">
              {guestLabel}
            </Link>
          ) : (
            <Link to="/login" className="gx-guest">
              гость
            </Link>
          )}
        </header>

        <section className="gx-home">
          <LivingPlanet
            phase={phase}
            status={status}
            onConnect={() => void connect()}
            from={from}
            to={to}
            onFrom={setFrom}
            onTo={setTo}
            ritual={ritual}
          />
          {tab === "home" && results.length > 0 && (
            <ul className="gx-results">
              {results.map((r) => (
                <li key={r.id} className="gx-result">
                  <span>{r.label}</span>
                  <span className="gx-result-meta">
                    {r.note} · {r.ms ?? "—"} мс
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {tab === "pay" && (
          <section className="gx-panel">
            {(
              [
                ["trial", "Сутки", "0 ₽"],
                ["start", "Старт", "600 ₽ / мес"],
                ["plus", "Плюс", "1 200 ₽ / мес"],
                ["max", "Максимум", "2 800 ₽ / 3 мес"],
              ] as const
            ).map(([id, title, priceLabel]) => (
              <button
                key={id}
                type="button"
                onClick={() => choosePlan(id, title)}
                className={`gx-plan ${plan === id ? "active" : ""}`}
                data-plan={id}
              >
                <span className="gx-plan-row">
                  <span>{title}</span>
                  <span className="gx-mono">{priceLabel}</span>
                </span>
              </button>
            ))}
            {plan !== "trial" && (
              <div className="gx-months">
                {[1, 2, 3].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`gx-month ${months === m ? "active" : ""}`}
                  >
                    {m} мес
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="gx-pay" onClick={() => void pay()}>
              {price === 0 ? "Включить сутки" : `Оплатить ${price.toLocaleString("ru-RU")} ₽`}
            </button>
            {lastOrder === "no-pay" ? (
              <div className="gx-order">
                <p>Касса не подключена</p>
                <small>Оплата здесь не проводится. Счёт не создаём. Живой Xservis и кабинет — отдельно.</small>
              </div>
            ) : lastOrder === "login" ? (
              <div className="gx-order">
                <p>Нужен вход</p>
                <small>
                  <Link to="/login">Войди в кабинет</Link>, чтобы взять 7 дней. Карту не спрашиваем.
                </small>
              </div>
            ) : lastOrder === "trial-already" ? (
              <p className="gx-ok">Пробный уже есть</p>
            ) : lastOrder === "trial-fail" ? (
              <div className="gx-order">
                <p>Не получилось включить пробный</p>
                <small>Попробуй ещё раз из кабинета.</small>
              </div>
            ) : lastOrder === "trial" ? (
              <p className="gx-ok">7 дней включены</p>
            ) : null}
          </section>
        )}

        {tab === "lane" && (
          <pre className="gx-channel">
            {advice || "Сначала «Подключить» — откуда, куда и какой коридор для телефона."}
          </pre>
        )}
      </main>

      <nav className="gx-nav">
        <div className="gx-nav-inner">
          {([["home", "Главная"], ["pay", "Тариф"], ["lane", "Канал"]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`gx-tab ${tab === id ? "active" : ""}`}>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function LivingPlanet({
  phase,
  status,
  onConnect,
  from,
  to,
  onFrom,
  onTo,
  ritual,
}: {
  phase: Phase;
  status: string;
  onConnect: () => void;
  from: GeoPoint | null;
  to: GeoPoint | null;
  onFrom: (point: GeoPoint) => void;
  onTo: (point: GeoPoint) => void;
  ritual: Ritual;
}) {
  const [zoom, setZoom] = useState(1);
  const [pickMode, setPickMode] = useState<PickMode>(null);
  const [terrain3d, setTerrain3d] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [mapMode, setMapMode] = useState(false);
  const [mapLive, setMapLive] = useState(false);
  const [focus, setFocus] = useState<GeoPoint | null>(null);
  const [zoomSignal, setZoomSignal] = useState(0);
  const [zoomDir, setZoomDir] = useState<1 | -1>(1);
  const zoomRef = useRef(1);
  const mapModeRef = useRef(false);
  const mapZoomRef = useRef(3);
  const hoverTimer = useRef<number | null>(null);
  const dragYaw = useRef(0);
  const drag = useRef<{ x: number; yaw: number } | null>(null);
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spin = useRef<HTMLDivElement>(null);
  const busy = phase === "flying";
  const on = phase === "on";
  const youXY = ritual.you ? diskXY(ritual.you) : null;
  const nearXY = ritual.nearest ? { x: ritual.nearest.x, y: ritual.nearest.y } : null;
  const scale = mapMode ? 2.05 : ritual.step === "found" || ritual.step === "locate" ? Math.max(zoom, 1.55) : zoom;

  function go(next: number) {
    const target = Math.min(2.15, Math.max(1, next));
    zoomRef.current = target;
    setZoom(target);
  }

  function diveTo(point: GeoPoint) {
    setFocus(point);
    setMapLive(true);
    setMapMode(true);
    mapModeRef.current = true;
    go(2.05);
  }

  function leaveMap() {
    setMapMode(false);
    mapModeRef.current = false;
    go(1.15);
  }

  useEffect(() => {
    wrap.current?.style.setProperty("--gx-scale", String(scale));
  }, [scale]);

  useEffect(() => {
    void import("leaflet");
    void import("leaflet/dist/leaflet.css");
  }, []);

  useEffect(() => {
    if (ritual.step !== "beam" || !ritual.nearest) return;
    const id = window.setTimeout(() => {
      diveTo({ lat: ritual.nearest!.lat, lng: ritual.nearest!.lng, label: ritual.nearest!.city });
    }, 160);
    return () => window.clearTimeout(id);
  }, [ritual.step, ritual.nearest]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (mapModeRef.current) return;
      e.preventDefault();
      const next = zoomRef.current + (e.deltaY > 0 ? -0.22 : 0.22);
      if (e.deltaY < 0 && next >= 1.72) {
        const point = to ?? from ?? ritual.you ?? { lat: 52.23, lng: 21.01, label: "Warsaw" };
        diveTo(point);
        return;
      }
      go(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [from, to, ritual.you]);

  function applyDrag() {
    wrap.current?.style.setProperty("--gx-drag", `${dragYaw.current}deg`);
  }

  function startPicking(mode: Exclude<PickMode, null>) {
    setPickMode(mode);
    if (!mapMode && zoom < 1.25) go(1.3);
  }

  function picked(mode: Exclude<PickMode, null>, point: GeoPoint) {
    if (mode === "from") onFrom(point);
    else onTo(point);
    setPickMode(null);
    diveTo(point);
  }

  function anywhere(point: GeoPoint) {
    if (pickMode) {
      picked(pickMode, point);
      return;
    }
    onTo(point);
    diveTo(point);
  }

  function hitPin(clientX: number, clientY: number) {
    const root = stage.current;
    if (!root) return null;
    const pins = [...root.querySelectorAll<HTMLElement>("[data-pin]")];
    let best: { pin: HTMLElement; d: number } | null = null;
    for (const el of pins) {
      const r = el.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - clientX, r.top + r.height / 2 - clientY);
      if (!best || d < best.d) best = { pin: el, d };
    }
    if (!best || best.d > 56) return null;
    return ALL_PINS.find((p) => p.id === best.pin.dataset.pin) ?? null;
  }

  function pointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (mapMode || e.button !== 0) return;
    drag.current = { x: e.clientX, yaw: dragYaw.current };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function pointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (mapMode || !drag.current) return;
    dragYaw.current = drag.current.yaw + (e.clientX - drag.current.x) * 0.28;
    applyDrag();
  }

  function pointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (mapMode) return;
    const start = drag.current;
    drag.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!start) return;
    if (Math.abs(e.clientX - start.x) > 10) return;
    const pin = hitPin(e.clientX, e.clientY);
    const point = pin
      ? { lat: pin.lat, lng: pin.lng, label: pin.city }
      : spin.current
        ? diskToGeo(e.clientX, e.clientY, spin.current)
        : null;
    if (!point) return;
    if (pickMode) picked(pickMode, point);
    else diveTo(point);
  }

  function hoverPin(pin: Pin) {
    if (mapModeRef.current || drag.current) return;
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      diveTo({ lat: pin.lat, lng: pin.lng, label: pin.city });
    }, 160);
  }

  function zoomMinus() {
    if (mapMode) {
      if (mapZoomRef.current <= 3) leaveMap();
      else {
        setZoomDir(-1);
        setZoomSignal((n) => n + 1);
      }
      return;
    }
    go(zoom - 0.28);
  }

  function zoomPlus() {
    if (mapMode) {
      setZoomDir(1);
      setZoomSignal((n) => n + 1);
      return;
    }
    if (zoom >= 1.55) {
      const point = to ?? from ?? ritual.you ?? { lat: 52.23, lng: 21.01, label: "Warsaw" };
      diveTo(point);
      return;
    }
    go(zoom + 0.32);
  }

  const lit = new Set(ritual.lit);
  const nearIds = new Set(ritual.near.map((p) => p.id));

  return (
    <>
      <div
        ref={stage}
        className={`gx-earth-stage ${terrain3d ? "is-3d" : "is-top"} ${dragging ? "is-dragging" : ""} ${mapMode ? "is-map" : ""} ${ritual.step !== "idle" ? `is-${ritual.step}` : ""}`}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onTouchStart={(e) => {
          if (mapMode) return;
          if (e.touches.length === 2) {
            drag.current = null;
            pinch.current = { d: gap(e.touches), z: zoomRef.current };
          }
        }}
        onTouchMove={(e) => {
          if (mapMode) return;
          if (pinch.current && e.touches.length === 2) {
            const next = pinch.current.z * (gap(e.touches) / pinch.current.d);
            if (next >= 1.75) {
              const point = to ?? from ?? ritual.you ?? { lat: 52.23, lng: 21.01, label: "Warsaw" };
              diveTo(point);
              return;
            }
            go(next);
          }
        }}
        onTouchEnd={() => {
          pinch.current = null;
        }}
      >
        <div className="gx-planet-stage">
          <div
            className="gx-planet-wrap"
            ref={wrap}
            style={{ ["--gx-scale" as string]: scale, ["--gx-tilt" as string]: terrain3d && !mapMode ? "14deg" : "0deg" }}
          >
            <div className="gx-planet-spin" ref={spin}>
              <div className="gx-planet-img" />
              {ritual.beam && youXY && nearXY && (
                <svg className="gx-beams" viewBox="0 0 100 100" aria-hidden>
                  <path
                    className="gx-beam"
                    d={`M ${youXY.x} ${youXY.y} Q ${(youXY.x + nearXY.x) / 2} ${Math.min(youXY.y, nearXY.y) - 14} ${nearXY.x} ${nearXY.y}`}
                  />
                </svg>
              )}
              {ALL_PINS.map((pin) => {
                const cls = [
                  "gx-pin",
                  pin.real ? "is-real" : "is-viz",
                  lit.has(pin.id) ? "is-lit" : "",
                  nearIds.has(pin.id) ? "is-near" : "",
                  ritual.nearest?.id === pin.id && ritual.beam ? "is-lock" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={pin.id}
                    type="button"
                    data-pin={pin.id}
                    className={cls}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    aria-label={pin.city}
                    title={pin.city}
                    aria-hidden={false}
                    tabIndex={0}
                    onMouseEnter={() => hoverPin(pin)}
                    onMouseLeave={() => {
                      if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
                    }}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      const point = { lat: pin.lat, lng: pin.lng, label: pin.city };
                      if (pickMode) picked(pickMode, point);
                      else diveTo(point);
                    }}
                  />
                );
              })}
              {youXY && ritual.you && (
                <span className="gx-pin is-you" style={{ left: `${youXY.x}%`, top: `${youXY.y}%` }} aria-label={ritual.you.label} />
              )}
            </div>
            <div className="gx-planet-shade" />
          </div>
        </div>
        <div className="gx-map-shell">
          {mapLive && (
            <EarthMap
              active={mapMode}
              focus={focus}
              pins={ALL_PINS}
              you={ritual.you}
              pickMode={pickMode}
              onPick={picked}
              onAnywhere={anywhere}
              zoomSignal={zoomSignal}
              zoomDir={zoomDir}
              onZoom={(z) => {
                mapZoomRef.current = z;
              }}
            />
          )}
        </div>
        {ritual.count > 0 && ritual.step === "scan" && !mapMode && <div className="gx-scan-count">{ritual.count}</div>}
        {pickMode && (
          <div className="gx-pick-hint">
            {mapMode ? "Кликни точку на карте" : "Кликни точку на планете"} · {pickMode === "from" ? "откуда" : "куда"}
          </div>
        )}
        {mapMode && focus && !pickMode && (
          <div className="gx-pick-hint">{focus.label} · клик — любая точка</div>
        )}
      </div>

      <div className="gx-point-tools" aria-label="Точки маршрута">
        <button type="button" className={`gx-point-btn ${pickMode === "from" ? "active" : ""}`} onClick={() => startPicking("from")}>
          <span>Откуда</span>
          <small>{from?.label || "выбрать"}</small>
        </button>
        <button type="button" className={`gx-point-btn ${pickMode === "to" ? "active" : ""}`} onClick={() => startPicking("to")}>
          <span>Куда</span>
          <small>{to?.label || "выбрать"}</small>
        </button>
        <button
          type="button"
          className={`gx-mode-btn ${!mapMode && terrain3d ? "active" : ""}`}
          onClick={() => {
            if (mapMode) leaveMap();
            else setTerrain3d((v) => !v);
          }}
        >
          {mapMode ? "Планета" : terrain3d ? "3D" : "Сверху"}
        </button>
      </div>

      <div className="gx-controls">
        <button type="button" className="gx-zoom" aria-label="Уменьшить" onClick={zoomMinus}>
          −
        </button>
        <button type="button" className={`gx-connect ${on || busy ? "is-on" : ""}`} disabled={busy} onClick={onConnect}>
          {on ? "Отключить" : busy ? "Проверяю" : "Подключить"}
        </button>
        <button type="button" className="gx-zoom" aria-label="Увеличить" onClick={zoomPlus}>
          +
        </button>
      </div>
      <p className="gx-status">{status}</p>
      {(from || to) && (
        <p className="gx-route">
          {pointName(from, "авто")} → {pointName(to, "точка")}
        </p>
      )}
    </>
  );
}

function gap(touches: TouchCoordinates | React.TouchList) {
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}
