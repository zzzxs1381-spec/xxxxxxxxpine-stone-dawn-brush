import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { f as startTrial } from "./server-BdIVESeH.mjs";
import { l as classify, r as adviceFrom, t as EDGE_NODES, x as scoreRoutes } from "./ingest-metrics-BuxZ01cb.mjs";
import { i as serviceEvidence, n as pickTransport, r as runBrowserDiagnostics, t as measureServices } from "./browser-diag-DiQ02GhR.mjs";
import { t as runCabinetProbe } from "./run-probe-DtgjUC9_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cw4gOECh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function bestPublishedRoute() {
	try {
		const ctrl = new AbortController();
		const timer = window.setTimeout(() => ctrl.abort(), 2600);
		const res = await fetch("/api/public/routes", {
			cache: "no-store",
			signal: ctrl.signal,
			headers: { Accept: "application/json" }
		});
		window.clearTimeout(timer);
		if (!res.ok) return null;
		const body = await res.json();
		const routes = Array.isArray(body.routes) ? body.routes : [];
		return routes.find((r) => /healthy|ok|published|up/i.test(String(r.health || ""))) || routes[0] || null;
	} catch {
		return null;
	}
}
function channelText(transport, sni, vector, route, extra) {
	return `вектор готов · ${transport}\n${vector} · SNI ${sni}${route ? `\nbackend · ${route.name || route.id || "route"} · ${route.protocol || transport}${route.transport ? `/${route.transport}` : ""}` : ""}${extra ? `\n${extra}` : ""}\nмаршрут выдаётся действующим XFreedom backend`;
}
function pointName(point, fallback) {
	return point ? point.label : fallback;
}
function GxApp() {
	const { user } = useCurrentUserState();
	const [tab, setTab] = (0, import_react.useState)("home");
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [status, setStatus] = (0, import_react.useState)("Нажми «Подключить»");
	const [results, setResults] = (0, import_react.useState)([]);
	const [advice, setAdvice] = (0, import_react.useState)("");
	const [lastOrder, setLastOrder] = (0, import_react.useState)(null);
	const [plan, setPlan] = (0, import_react.useState)("start");
	const [months, setMonths] = (0, import_react.useState)(1);
	const [from, setFrom] = (0, import_react.useState)(null);
	const [to, setTo] = (0, import_react.useState)(null);
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
		const onStep = (s) => setStatus(`${s} · ${routeText}`);
		const [rows, route, engine] = await Promise.all([
			Promise.race([measureServices(), new Promise((resolve) => window.setTimeout(() => resolve([]), 4200))]),
			bestPublishedRoute(),
			(async () => {
				try {
					if (user) {
						const { result } = await runCabinetProbe({
							label: "это устройство",
							onStep
						});
						return result;
					}
					const measured = await runBrowserDiagnostics(onStep);
					const merged = [...measured.evidence];
					const routesNow = scoreRoutes(measured.classification, EDGE_NODES);
					return {
						ok: true,
						classification: measured.classification,
						routes: routesNow,
						advice: adviceFrom(measured.classification, routesNow),
						evidence: merged,
						latencyMs: measured.latencyMs
					};
				} catch {
					return {
						ok: false,
						routes: [],
						advice: null
					};
				}
			})()
		]);
		const path = pickTransport(rows);
		const extraEvidence = serviceEvidence(rows);
		let headline = engine.advice?.headline;
		let prefer = engine.advice?.preferTransport;
		if (extraEvidence.length > 0 && engine.ok) {
			const local = classify([...engine.evidence ?? [], ...extraEvidence]);
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
			"это замер и совет, не системный туннель"
		].filter(Boolean).join("\n");
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "gx-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gx-stars" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "gx-main",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "gx-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/",
							className: "gx-brand-kicker",
							children: "xservis"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "gx-title",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "gx-title-x",
								children: "X"
							}), "Freedom"]
						})] }), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							className: "gx-guest",
							children: guestLabel
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "gx-guest",
							children: "гость"
						})]
					}),
					tab === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "gx-home",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivingPlanet, {
							phase,
							status,
							onConnect: () => void connect(),
							from,
							to,
							onFrom: setFrom,
							onTo: setTo
						}), results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "gx-results",
							children: results.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "gx-result",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "gx-result-meta",
									children: [
										r.note,
										" · ",
										r.ms ?? "—",
										" мс"
									]
								})]
							}, r.id))
						})]
					}),
					tab === "pay" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "gx-panel",
						children: [
							[
								[
									"trial",
									"Сутки",
									"0 ₽"
								],
								[
									"start",
									"Старт",
									"600 ₽ / мес"
								],
								[
									"plus",
									"Плюс",
									"1 200 ₽ / мес"
								],
								[
									"max",
									"Максимум",
									"2 800 ₽ / 3 мес"
								]
							].map(([id, title, priceLabel]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPlan(id),
								className: `gx-plan ${plan === id ? "active" : ""}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "gx-plan-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "gx-mono",
										children: priceLabel
									})]
								})
							}, id)),
							plan !== "trial" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "gx-months",
								children: [
									1,
									2,
									3
								].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setMonths(m),
									className: `gx-month ${months === m ? "active" : ""}`,
									children: [m, " мес"]
								}, m))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "gx-pay",
								onClick: () => void pay(),
								children: price === 0 ? "Включить сутки" : `Оплатить ${price.toLocaleString("ru-RU")} ₽`
							}),
							lastOrder === "no-pay" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "gx-order",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Касса не подключена" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Оплата здесь не проводится. Счёт не создаём. Живой Xservis и кабинет — отдельно." })]
							}) : lastOrder === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "gx-order",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Нужен вход" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/login",
									children: "Войди в кабинет"
								}), ", чтобы взять 7 дней. Карту не спрашиваем."] })]
							}) : lastOrder === "trial-already" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "gx-ok",
								children: "Пробный уже есть"
							}) : lastOrder === "trial-fail" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "gx-order",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Не получилось включить пробный" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Попробуй ещё раз из кабинета." })]
							}) : lastOrder === "trial" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "gx-ok",
								children: "7 дней включены"
							}) : null
						]
					}),
					tab === "lane" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "gx-channel",
						children: advice || "Сначала «Подключить» — здесь будет выбранный маршрут."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "gx-nav",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gx-nav-inner",
					children: [
						["home", "Главная"],
						["pay", "Тариф"],
						["lane", "Канал"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: `gx-tab ${tab === id ? "active" : ""}`,
						children: label
					}, id))
				})
			})
		]
	});
}
var MIN = 1;
var MAX = 16;
var HANDOFF = 5;
var arcgisLoader = null;
function ensureArcGIS() {
	if (window.$arcgis) return Promise.resolve();
	if (arcgisLoader) return arcgisLoader;
	arcgisLoader = new Promise((resolve, reject) => {
		if (!document.querySelector("link[data-xf-arcgis]")) {
			const css = document.createElement("link");
			css.rel = "stylesheet";
			css.href = "https://js.arcgis.com/5.1/esri/themes/dark/main.css";
			css.dataset.xfArcgis = "1";
			document.head.appendChild(css);
		}
		const existing = document.querySelector("script[data-xf-arcgis]");
		const ready = () => {
			let tries = 0;
			const poll = () => {
				if (window.$arcgis) {
					resolve();
					return;
				}
				if (tries++ > 100) {
					reject(/* @__PURE__ */ new Error("ArcGIS runtime did not initialize"));
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
		script.onerror = () => reject(/* @__PURE__ */ new Error("ArcGIS runtime failed to load"));
		document.head.appendChild(script);
	});
	return arcgisLoader;
}
function coordsLabel(lat, lng) {
	const ns = lat >= 0 ? "N" : "S";
	const ew = lng >= 0 ? "E" : "W";
	return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lng).toFixed(3)}°${ew}`;
}
function ArcGISScene({ active, pickMode, onPick, from, to, onReady, zoomLevel, terrain3d }) {
	const host = (0, import_react.useRef)(null);
	const runtime = (0, import_react.useRef)(null);
	const pickModeRef = (0, import_react.useRef)(pickMode);
	const onPickRef = (0, import_react.useRef)(onPick);
	const onReadyRef = (0, import_react.useRef)(onReady);
	(0, import_react.useEffect)(() => {
		pickModeRef.current = pickMode;
	}, [pickMode]);
	(0, import_react.useEffect)(() => {
		onPickRef.current = onPick;
	}, [onPick]);
	(0, import_react.useEffect)(() => {
		onReadyRef.current = onReady;
	}, [onReady]);
	(0, import_react.useEffect)(() => {
		if (!active || !host.current || runtime.current) return;
		let cancelled = false;
		let clickHandle = null;
		(async () => {
			await ensureArcGIS();
			if (cancelled || !host.current || !window.$arcgis) return;
			const [Map, SceneView, TileLayer, Graphic] = await window.$arcgis.import([
				"@arcgis/core/Map.js",
				"@arcgis/core/views/SceneView.js",
				"@arcgis/core/layers/TileLayer.js",
				"@arcgis/core/Graphic.js"
			]);
			if (cancelled || !host.current) return;
			const map = new Map({
				layers: [new TileLayer({
					url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
					title: "Esri World Imagery"
				})],
				ground: "world-elevation"
			});
			const memory = navigator.deviceMemory || 4;
			const view = new SceneView({
				container: host.current,
				map,
				viewingMode: "global",
				qualityProfile: memory >= 8 ? "high" : "medium",
				popupEnabled: false,
				environment: {
					background: {
						type: "color",
						color: [
							0,
							0,
							0,
							1
						]
					},
					starsEnabled: true,
					atmosphereEnabled: true
				},
				camera: {
					position: {
						longitude: 22,
						latitude: 20,
						z: 17e6
					},
					heading: 0,
					tilt: 0
				}
			});
			await view.when();
			if (cancelled) {
				view.destroy();
				return;
			}
			view.ui.components = ["attribution"];
			runtime.current = {
				view,
				Graphic
			};
			onReadyRef.current(view);
			clickHandle = view.on("click", (event) => {
				const mode = pickModeRef.current;
				if (!mode || !event?.mapPoint) return;
				const lat = Number(event.mapPoint.latitude ?? event.mapPoint.y);
				const lng = Number(event.mapPoint.longitude ?? event.mapPoint.x);
				if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
				onPickRef.current(mode, {
					lat,
					lng,
					label: coordsLabel(lat, lng)
				});
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
	(0, import_react.useEffect)(() => {
		const rt = runtime.current;
		if (!rt) return;
		rt.view.graphics.removeAll();
		const addPoint = (point, color) => {
			rt.view.graphics.add(new rt.Graphic({
				geometry: {
					type: "point",
					longitude: point.lng,
					latitude: point.lat
				},
				symbol: {
					type: "simple-marker",
					size: 8,
					color,
					outline: {
						color: [
							255,
							255,
							255,
							.78
						],
						width: 1
					}
				}
			}));
		};
		if (from) addPoint(from, [
			69,
			168,
			255,
			.95
		]);
		if (to) addPoint(to, [
			255,
			183,
			77,
			.95
		]);
	}, [
		from,
		to,
		active
	]);
	(0, import_react.useEffect)(() => {
		const view = runtime.current?.view;
		if (!view || !active) return;
		const targetZoom = Math.min(17, Math.max(2, 2.1 + (zoomLevel - HANDOFF) * 1.18));
		view.goTo({
			zoom: targetZoom,
			tilt: terrain3d ? 62 : 0
		}, {
			duration: 360,
			easing: "ease-in-out"
		}).catch(() => {});
	}, [
		zoomLevel,
		terrain3d,
		active
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: host,
		className: `gx-scene-layer ${active ? "is-active" : ""}`,
		"aria-label": "Интерактивная 3D карта Земли"
	});
}
function LivingPlanet({ phase, status, onConnect, from, to, onFrom, onTo }) {
	const [zoom, setZoom] = (0, import_react.useState)(MIN);
	const [pickMode, setPickMode] = (0, import_react.useState)(null);
	const [terrain3d, setTerrain3d] = (0, import_react.useState)(true);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const zoomRef = (0, import_react.useRef)(MIN);
	const yaw = (0, import_react.useRef)(0);
	const auto = (0, import_react.useRef)(true);
	const drag = (0, import_react.useRef)(null);
	const pinch = (0, import_react.useRef)(null);
	const anim = (0, import_react.useRef)(null);
	const spin = (0, import_react.useRef)(null);
	const sceneView = (0, import_react.useRef)(null);
	const busy = phase === "flying";
	const on = phase === "on";
	const mapMode = zoom >= 4.88;
	const globeOp = zoom >= 5.45 ? 0 : 1;
	const mapOp = mapMode ? Math.min(1, (zoom - 4.88) / .65) : 0;
	const scale = 1 + Math.min(zoom - 1, 4) * .28;
	(0, import_react.useEffect)(() => {
		let id = 0;
		const tick = () => {
			if (auto.current && zoomRef.current < 3 && !busy && !on) yaw.current = (yaw.current + .025) % 360;
			if (spin.current) spin.current.style.transform = `rotate(${yaw.current}deg)`;
			id = requestAnimationFrame(tick);
		};
		id = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(id);
	}, [busy, on]);
	function go(next) {
		const target = Math.min(MAX, Math.max(MIN, next));
		const start = zoomRef.current;
		const t0 = performance.now();
		if (anim.current) cancelAnimationFrame(anim.current);
		const step = (now) => {
			const t = Math.min(1, (now - t0) / 560);
			const e = 1 - (1 - t) ** 3;
			const v = start + (target - start) * e;
			zoomRef.current = v;
			setZoom(v);
			if (t < 1) anim.current = requestAnimationFrame(step);
		};
		anim.current = requestAnimationFrame(step);
	}
	function startPicking(mode) {
		setPickMode(mode);
		if (!mapMode) go(5.7);
	}
	function picked(mode, point) {
		if (mode === "from") onFrom(point);
		else onTo(point);
		setPickMode(null);
	}
	function pointerDown(e) {
		if (mapMode || e.button !== 0) return;
		auto.current = false;
		drag.current = {
			x: e.clientX,
			yaw: yaw.current
		};
		setDragging(true);
		e.currentTarget.setPointerCapture(e.pointerId);
	}
	function pointerMove(e) {
		if (mapMode || !drag.current) return;
		yaw.current = drag.current.yaw + (e.clientX - drag.current.x) * .36;
	}
	function pointerUp(e) {
		if (mapMode) return;
		drag.current = null;
		setDragging(false);
		auto.current = true;
		if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `gx-earth-stage ${mapMode ? "is-map" : ""} ${dragging ? "is-dragging" : ""}`,
			onPointerDown: pointerDown,
			onPointerMove: pointerMove,
			onPointerUp: pointerUp,
			onPointerCancel: pointerUp,
			onTouchStart: (e) => {
				if (mapMode) return;
				if (e.touches.length === 2) {
					drag.current = null;
					pinch.current = {
						d: gap(e.touches),
						z: zoomRef.current
					};
					return;
				}
				auto.current = false;
				drag.current = {
					x: e.touches[0].clientX,
					yaw: yaw.current
				};
			},
			onTouchMove: (e) => {
				if (mapMode) return;
				if (pinch.current && e.touches.length === 2) {
					go(pinch.current.z * (gap(e.touches) / pinch.current.d));
					return;
				}
				if (!drag.current || e.touches.length !== 1) return;
				yaw.current = drag.current.yaw + (e.touches[0].clientX - drag.current.x) * .32;
			},
			onTouchEnd: () => {
				if (mapMode) return;
				pinch.current = null;
				drag.current = null;
				auto.current = true;
			},
			onWheel: (e) => {
				if (mapMode) return;
				e.preventDefault();
				go(zoomRef.current + (e.deltaY > 0 ? -.7 : .7));
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gx-planet-stage",
				style: { opacity: globeOp },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gx-planet-wrap",
					style: { transform: `scale(${scale})` },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gx-planet-spin",
						ref: spin,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gx-planet-img" })
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gx-scene-shell",
				style: {
					opacity: mapOp,
					pointerEvents: mapMode ? "auto" : "none"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArcGISScene, {
					active: mapMode,
					pickMode,
					onPick: picked,
					from,
					to,
					onReady: (view) => {
						sceneView.current = view;
					},
					zoomLevel: zoom,
					terrain3d
				}), pickMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gx-pick-hint",
					children: ["Кликни по любой точке Земли · ", pickMode === "from" ? "откуда" : "куда"]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "gx-point-tools",
			"aria-label": "Точки маршрута",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `gx-point-btn ${pickMode === "from" ? "active" : ""}`,
					onClick: () => startPicking("from"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Откуда" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: from?.label || "выбрать" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `gx-point-btn ${pickMode === "to" ? "active" : ""}`,
					onClick: () => startPicking("to"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Куда" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: to?.label || "выбрать" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `gx-mode-btn ${mapMode && terrain3d ? "active" : ""}`,
					onClick: () => {
						if (!mapMode) go(5.7);
						else setTerrain3d((v) => !v);
					},
					children: mapMode ? terrain3d ? "3D" : "Сверху" : "3D карта"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "gx-controls",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "gx-zoom",
					"aria-label": "Уменьшить",
					onClick: () => go(zoom - (mapMode ? 1.5 : 1.2)),
					children: "−"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `gx-connect ${on || busy ? "is-on" : ""}`,
					disabled: busy,
					onClick: () => {
						if (on) go(MIN);
						onConnect();
					},
					children: on ? "Отключить" : busy ? "Проверяю" : "Подключить"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "gx-zoom",
					"aria-label": "Увеличить",
					onClick: () => go(mapMode ? zoom + 1.4 : Math.max(zoom + 1.6, HANDOFF)),
					children: "+"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "gx-status",
			children: status
		}),
		(from || to) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "gx-route",
			children: [
				pointName(from, "авто"),
				" → ",
				pointName(to, "лучший выход")
			]
		})
	] });
}
function gap(touches) {
	const a = touches[0];
	const b = touches[1];
	return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}
var SplitComponent = GxApp;
//#endregion
export { SplitComponent as component };
