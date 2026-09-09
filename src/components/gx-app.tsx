import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import "@/target-grok.css";
import { EDGE_NODES } from "@/lib/xfreedom/catalog";
import {
  adviceFrom,
  classify,
  scoreRoutes,
  type ClientAdvice,
  type Evidence,
} from "@/lib/xfreedom/classify";
import { runBrowserDiagnostics } from "@/lib/xfreedom/browser-diag";
import { runCabinetProbe } from "@/lib/xfreedom/run-probe";
import { measureServices, pickTransport, serviceEvidence, type ServiceProbe } from "@/lib/xfreedom/service-probe";
import { startTrial } from "@/lib/xfreedom/server";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type Probe = ServiceProbe;
type Tab = "home" | "pay" | "lane";
type Phase = "idle" | "flying" | "on";
type PickMode = "from" | "to" | null;
type GeoPoint = { lat: number; lng: number; label: string };
type TouchCoordinates = { [index: number]: { clientX: number; clientY: number } };
type RouteMeta = { id?: string; name?: string; protocol?: string; transport?: string | null; health?: string };

declare global {
  interface Window {
    $arcgis?: { import: (modules: string | string[]) => Promise<any> };
  }
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
    return (
      routes.find((r) => /healthy|ok|published|up/i.test(String(r.health || ""))) || routes[0] || null
    );
  } catch {
    return null;
  }
}

function channelText(
  transport: string,
  sni: string,
  vector: string,
  route?: RouteMeta | null,
  extra?: string,
) {
  const live = route
    ? `\nbackend · ${route.name || route.id || "route"} · ${route.protocol || transport}${route.transport ? `/${route.transport}` : ""}`
    : "";
  const more = extra ? `\n${extra}` : "";
  return `вектор готов · ${transport}\n${vector} · SNI ${sni}${live}${more}\nмаршрут выдаётся действующим XFreedom backend`;
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
  const price = plan === "plus" ? 1200 * months : plan === "max" ? 2800 : plan === "trial" ? 0 : 600 * months;
  const guestLabel = user?.displayName || user?.primaryEmail || (user ? "кабинет" : "гость");

  async function connect() {
    if (phase === "on") {
      setPhase("idle");
      setStatus("Отключено");
      return;
    }
    if (phase === "flying") return;
    setPhase("flying");
    const routeText = `${pointName(from, "авто")} → ${pointName(to, "лучший выход")}`;
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
    const path = pickTransport(rows);
    const extraEvidence = serviceEvidence(rows);
    let headline = engine.advice?.headline;
    let prefer = engine.advice?.preferTransport;
    if (extraEvidence.length > 0 && engine.ok) {
      const local = classify([...(engine.evidence ?? []), ...extraEvidence]);
      const routesNow = scoreRoutes(local, EDGE_NODES);
      const localAdvice = adviceFrom(local, routesNow);
      headline = localAdvice.headline;
      prefer = localAdvice.preferTransport;
    }
    setResults(rows);
    const extra = [
      headline ? `совет · ${headline}` : null,
      prefer ? `движок · ${prefer}` : null,
      engine.latencyMs != null ? `rtt · ${engine.latencyMs} мс` : null,
      "это замер и совет, не системный туннель",
    ]
      .filter(Boolean)
      .join("\n");
    setAdvice(channelText(path.transport, path.sni, path.vector, route, extra));
    setPhase("on");
    const liveRoute = route?.protocol ? ` · ${route.protocol}` : ` · ${path.transport}`;
    setStatus(`${routeText}${liveRoute}`);
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

  return (
    <div className="gx-root">
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

        {tab === "home" && (
          <section className="gx-home">
            <LivingPlanet
              phase={phase}
              status={status}
              onConnect={() => void connect()}
              from={from}
              to={to}
              onFrom={setFrom}
              onTo={setTo}
            />
            {results.length > 0 && (
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
        )}

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
                onClick={() => setPlan(id)}
                className={`gx-plan ${plan === id ? "active" : ""}`}
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
          <pre className="gx-channel">{advice || "Сначала «Подключить» — здесь будет выбранный маршрут."}</pre>
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

const MIN = 1;
const MAX = 16;
const HANDOFF = 5;

let arcgisLoader: Promise<void> | null = null;
function ensureArcGIS() {
  if (window.$arcgis) return Promise.resolve();
  if (arcgisLoader) return arcgisLoader;
  arcgisLoader = new Promise<void>((resolve, reject) => {
    if (!document.querySelector("link[data-xf-arcgis]")) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://js.arcgis.com/5.1/esri/themes/dark/main.css";
      css.dataset.xfArcgis = "1";
      document.head.appendChild(css);
    }
    const existing = document.querySelector("script[data-xf-arcgis]") as HTMLScriptElement | null;
    const ready = () => {
      let tries = 0;
      const poll = () => {
        if (window.$arcgis) {
          resolve();
          return;
        }
        if (tries++ > 100) {
          reject(new Error("ArcGIS runtime did not initialize"));
          return;
        }
        window.setTimeout(poll, 50);
      };
      poll();
    };
    if (existing) {
      ready();
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://js.arcgis.com/5.1/";
    script.dataset.xfArcgis = "1";
    script.onload = ready;
    script.onerror = () => reject(new Error("ArcGIS runtime failed to load"));
    document.head.appendChild(script);
  });
  return arcgisLoader;
}

function coordsLabel(lat: number, lng: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lng).toFixed(3)}°${ew}`;
}

function ArcGISScene({
  active,
  pickMode,
  onPick,
  from,
  to,
  onReady,
  zoomLevel,
  terrain3d,
}: {
  active: boolean;
  pickMode: PickMode;
  onPick: (mode: Exclude<PickMode, null>, point: GeoPoint) => void;
  from: GeoPoint | null;
  to: GeoPoint | null;
  onReady: (view: any | null) => void;
  zoomLevel: number;
  terrain3d: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const runtime = useRef<{ view: any; Graphic: any } | null>(null);
  const pickModeRef = useRef<PickMode>(pickMode);
  const onPickRef = useRef(onPick);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    pickModeRef.current = pickMode;
  }, [pickMode]);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (!active || !host.current || runtime.current) return;
    let cancelled = false;
    let clickHandle: { remove?: () => void } | null = null;
    void (async () => {
      await ensureArcGIS();
      if (cancelled || !host.current || !window.$arcgis) return;
      const [Map, SceneView, TileLayer, Graphic] = await window.$arcgis.import([
        "@arcgis/core/Map.js",
        "@arcgis/core/views/SceneView.js",
        "@arcgis/core/layers/TileLayer.js",
        "@arcgis/core/Graphic.js",
      ]);
      if (cancelled || !host.current) return;
      const imagery = new TileLayer({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
        title: "Esri World Imagery",
      });
      const map = new Map({
        layers: [imagery],
        ground: "world-elevation",
      });
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
      const view = new SceneView({
        container: host.current,
        map,
        viewingMode: "global",
        qualityProfile: memory >= 8 ? "high" : "medium",
        popupEnabled: false,
        environment: {
          background: { type: "color", color: [0, 0, 0, 1] },
          starsEnabled: true,
          atmosphereEnabled: true,
        },
        camera: {
          position: { longitude: 22, latitude: 20, z: 17_000_000 },
          heading: 0,
          tilt: 0,
        },
      });
      await view.when();
      if (cancelled) {
        view.destroy();
        return;
      }
      view.ui.components = ["attribution"];
      runtime.current = { view, Graphic };
      onReadyRef.current(view);
      clickHandle = view.on("click", (event: any) => {
        const mode = pickModeRef.current;
        if (!mode || !event?.mapPoint) return;
        const lat = Number(event.mapPoint.latitude ?? event.mapPoint.y);
        const lng = Number(event.mapPoint.longitude ?? event.mapPoint.x);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        onPickRef.current(mode, { lat, lng, label: coordsLabel(lat, lng) });
      });
    })().catch(() => {
      onReadyRef.current(null);
    });
    return () => {
      cancelled = true;
      clickHandle?.remove?.();
      if (runtime.current) {
        runtime.current.view.destroy();
        runtime.current = null;
      }
      onReadyRef.current(null);
    };
  }, [active]);

  useEffect(() => {
    const rt = runtime.current;
    if (!rt) return;
    rt.view.graphics.removeAll();
    const addPoint = (point: GeoPoint, color: number[]) => {
      rt.view.graphics.add(
        new rt.Graphic({
          geometry: { type: "point", longitude: point.lng, latitude: point.lat },
          symbol: {
            type: "simple-marker",
            size: 8,
            color,
            outline: { color: [255, 255, 255, 0.78], width: 1 },
          },
        }),
      );
    };
    if (from) addPoint(from, [69, 168, 255, 0.95]);
    if (to) addPoint(to, [255, 183, 77, 0.95]);
  }, [from, to, active]);

  useEffect(() => {
    const view = runtime.current?.view;
    if (!view || !active) return;
    const targetZoom = Math.min(17, Math.max(2, 2.1 + (zoomLevel - HANDOFF) * 1.18));
    void view.goTo({ zoom: targetZoom, tilt: terrain3d ? 62 : 0 }, { duration: 360, easing: "ease-in-out" }).catch(() => {});
  }, [zoomLevel, terrain3d, active]);

  return <div ref={host} className={`gx-scene-layer ${active ? "is-active" : ""}`} aria-label="Интерактивная 3D карта Земли" />;
}

function LivingPlanet({
  phase,
  status,
  onConnect,
  from,
  to,
  onFrom,
  onTo,
}: {
  phase: Phase;
  status: string;
  onConnect: () => void;
  from: GeoPoint | null;
  to: GeoPoint | null;
  onFrom: (point: GeoPoint) => void;
  onTo: (point: GeoPoint) => void;
}) {
  const [zoom, setZoom] = useState(MIN);
  const [pickMode, setPickMode] = useState<PickMode>(null);
  const [terrain3d, setTerrain3d] = useState(true);
  const [dragging, setDragging] = useState(false);
  const zoomRef = useRef(MIN);
  const yaw = useRef(0);
  const auto = useRef(true);
  const drag = useRef<{ x: number; yaw: number } | null>(null);
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const anim = useRef<number | null>(null);
  const spin = useRef<HTMLDivElement>(null);
  const sceneView = useRef<unknown | null>(null);
  const busy = phase === "flying";
  const on = phase === "on";
  const mapMode = zoom >= HANDOFF - 0.12;
  const globeOp = zoom >= HANDOFF + 0.45 ? 0 : 1;
  const mapOp = mapMode ? Math.min(1, (zoom - (HANDOFF - 0.12)) / 0.65) : 0;
  const scale = 1 + Math.min(zoom - 1, HANDOFF - 1) * 0.28;

  useEffect(() => {
    let id = 0;
    const tick = () => {
      if (auto.current && zoomRef.current < 3 && !busy && !on) yaw.current = (yaw.current + 0.025) % 360;
      if (spin.current) spin.current.style.transform = `rotate(${yaw.current}deg)`;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [busy, on]);

  function go(next: number) {
    const target = Math.min(MAX, Math.max(MIN, next));
    const start = zoomRef.current;
    const t0 = performance.now();
    if (anim.current) cancelAnimationFrame(anim.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 560);
      const e = 1 - (1 - t) ** 3;
      const v = start + (target - start) * e;
      zoomRef.current = v;
      setZoom(v);
      if (t < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }

  function startPicking(mode: Exclude<PickMode, null>) {
    setPickMode(mode);
    if (!mapMode) go(HANDOFF + 0.7);
  }

  function picked(mode: Exclude<PickMode, null>, point: GeoPoint) {
    if (mode === "from") onFrom(point);
    else onTo(point);
    setPickMode(null);
  }

  function pointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (mapMode || e.button !== 0) return;
    auto.current = false;
    drag.current = { x: e.clientX, yaw: yaw.current };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function pointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (mapMode || !drag.current) return;
    yaw.current = drag.current.yaw + (e.clientX - drag.current.x) * 0.36;
  }

  function pointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (mapMode) return;
    drag.current = null;
    setDragging(false);
    auto.current = true;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <>
      <div
        className={`gx-earth-stage ${mapMode ? "is-map" : ""} ${dragging ? "is-dragging" : ""}`}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onTouchStart={(e) => {
          if (mapMode) return;
          if (e.touches.length === 2) {
            drag.current = null;
            pinch.current = { d: gap(e.touches), z: zoomRef.current };
            return;
          }
          auto.current = false;
          drag.current = { x: e.touches[0].clientX, yaw: yaw.current };
        }}
        onTouchMove={(e) => {
          if (mapMode) return;
          if (pinch.current && e.touches.length === 2) {
            go(pinch.current.z * (gap(e.touches) / pinch.current.d));
            return;
          }
          if (!drag.current || e.touches.length !== 1) return;
          yaw.current = drag.current.yaw + (e.touches[0].clientX - drag.current.x) * 0.32;
        }}
        onTouchEnd={() => {
          if (mapMode) return;
          pinch.current = null;
          drag.current = null;
          auto.current = true;
        }}
        onWheel={(e) => {
          if (mapMode) return;
          e.preventDefault();
          go(zoomRef.current + (e.deltaY > 0 ? -0.7 : 0.7));
        }}
      >
        <div className="gx-planet-stage" style={{ opacity: globeOp }}>
          <div className="gx-planet-wrap" style={{ transform: `scale(${scale})` }}>
            <div className="gx-planet-spin" ref={spin}>
              <div className="gx-planet-img" />
            </div>
          </div>
        </div>

        <div className="gx-scene-shell" style={{ opacity: mapOp, pointerEvents: mapMode ? "auto" : "none" }}>
          <ArcGISScene
            active={mapMode}
            pickMode={pickMode}
            onPick={picked}
            from={from}
            to={to}
            onReady={(view) => {
              sceneView.current = view;
            }}
            zoomLevel={zoom}
            terrain3d={terrain3d}
          />
          {pickMode && (
            <div className="gx-pick-hint">Кликни по любой точке Земли · {pickMode === "from" ? "откуда" : "куда"}</div>
          )}
        </div>
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
          className={`gx-mode-btn ${mapMode && terrain3d ? "active" : ""}`}
          onClick={() => {
            if (!mapMode) go(HANDOFF + 0.7);
            else setTerrain3d((v) => !v);
          }}
        >
          {mapMode ? (terrain3d ? "3D" : "Сверху") : "3D карта"}
        </button>
      </div>

      <div className="gx-controls">
        <button type="button" className="gx-zoom" aria-label="Уменьшить" onClick={() => go(zoom - (mapMode ? 1.5 : 1.2))}>
          −
        </button>
        <button
          type="button"
          className={`gx-connect ${on || busy ? "is-on" : ""}`}
          disabled={busy}
          onClick={() => {
            if (on) go(MIN);
            onConnect();
          }}
        >
          {on ? "Отключить" : busy ? "Проверяю" : "Подключить"}
        </button>
        <button
          type="button"
          className="gx-zoom"
          aria-label="Увеличить"
          onClick={() => go(mapMode ? zoom + 1.4 : Math.max(zoom + 1.6, HANDOFF))}
        >
          +
        </button>
      </div>
      <p className="gx-status">{status}</p>
      {(from || to) && (
        <p className="gx-route">
          {pointName(from, "авто")} → {pointName(to, "лучший выход")}
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
