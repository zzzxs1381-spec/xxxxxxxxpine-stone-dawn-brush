import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { f as startTrial } from "./server-C48RRHDO.mjs";
import { l as classify, r as adviceFrom, t as EDGE_NODES, x as scoreRoutes } from "./ingest-metrics-CttQDW8G.mjs";
import { i as serviceEvidence, n as pickTransport, r as runBrowserDiagnostics, t as measureServices } from "./browser-diag-C7YTqD18.mjs";
import { t as runCabinetProbe } from "./run-probe-CrzcJZ0w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BrILLXJC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
var LABELS = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
var TEAL = "#6fb8b3";
var TEAL_FILL = "#4f8f8b";
function labelOf(lat, lng) {
	const ns = lat >= 0 ? "N" : "S";
	const ew = lng >= 0 ? "E" : "W";
	return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lng).toFixed(3)}°${ew}`;
}
function EarthMap({ active, focus, pins, you, pickMode, onPick, onAnywhere, zoomSignal, zoomDir, onZoom }) {
	const host = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const layerRef = (0, import_react.useRef)(null);
	const pickRef = (0, import_react.useRef)(pickMode);
	const onPickRef = (0, import_react.useRef)(onPick);
	const onAnyRef = (0, import_react.useRef)(onAnywhere);
	const onZoomRef = (0, import_react.useRef)(onZoom);
	const leafletRef = (0, import_react.useRef)(null);
	const focusRef = (0, import_react.useRef)(focus);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		pickRef.current = pickMode;
	}, [pickMode]);
	(0, import_react.useEffect)(() => {
		onPickRef.current = onPick;
	}, [onPick]);
	(0, import_react.useEffect)(() => {
		onAnyRef.current = onAnywhere;
	}, [onAnywhere]);
	(0, import_react.useEffect)(() => {
		onZoomRef.current = onZoom;
	}, [onZoom]);
	(0, import_react.useEffect)(() => {
		focusRef.current = focus;
	}, [focus]);
	(0, import_react.useEffect)(() => {
		if (!active || !host.current || mapRef.current) return;
		let cancelled = false;
		(async () => {
			const mod = await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			await Promise.resolve({});
			if (cancelled || !host.current || mapRef.current) return;
			const L = mod.default ?? mod;
			leafletRef.current = L;
			const start = focusRef.current;
			const map = L.map(host.current, {
				zoomControl: false,
				attributionControl: true,
				preferCanvas: true,
				fadeAnimation: false,
				zoomAnimation: true,
				markerZoomAnimation: false,
				inertia: true,
				worldCopyJump: true
			});
			map.setView(start ? [start.lat, start.lng] : [20, 20], start ? 8 : 3, { animate: false });
			L.tileLayer(TILE, {
				maxZoom: 17,
				maxNativeZoom: 17,
				minZoom: 2,
				keepBuffer: 2,
				updateWhenIdle: false,
				updateWhenZooming: false,
				attribution: "© Esri"
			}).addTo(map);
			map.createPane("labels");
			const labelPane = map.getPane("labels");
			if (labelPane) {
				labelPane.style.zIndex = "450";
				labelPane.style.pointerEvents = "none";
			}
			L.tileLayer(LABELS, {
				maxZoom: 17,
				maxNativeZoom: 17,
				minZoom: 3,
				pane: "labels",
				attribution: ""
			}).addTo(map);
			const group = L.layerGroup().addTo(map);
			layerRef.current = group;
			map.on("click", (e) => {
				const point = {
					lat: e.latlng.lat,
					lng: e.latlng.lng,
					label: labelOf(e.latlng.lat, e.latlng.lng)
				};
				const mode = pickRef.current;
				if (mode) onPickRef.current(mode, point);
				else onAnyRef.current(point);
			});
			map.on("zoomend", () => onZoomRef.current(map.getZoom()));
			mapRef.current = map;
			setReady(true);
			requestAnimationFrame(() => map.invalidateSize());
		})();
		return () => {
			cancelled = true;
		};
	}, [active]);
	(0, import_react.useEffect)(() => {
		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
			layerRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!map || !active) return;
		requestAnimationFrame(() => map.invalidateSize());
	}, [active]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!map || !active || !focus) return;
		const z = map.getZoom();
		map.flyTo([focus.lat, focus.lng], z < 6 ? 8 : Math.min(12, z), {
			duration: .32,
			easeLinearity: .4
		});
	}, [focus, active]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!map || !active || zoomSignal === 0) return;
		if (zoomDir > 0) map.zoomIn(1);
		else map.zoomOut(1);
	}, [
		zoomSignal,
		zoomDir,
		active
	]);
	(0, import_react.useEffect)(() => {
		const group = layerRef.current;
		const L = leafletRef.current;
		if (!group || !L) return;
		group.clearLayers();
		for (const pin of pins) {
			const isFocus = !!focus && Math.abs(pin.lat - focus.lat) < .02 && Math.abs(pin.lng - focus.lng) < .02;
			const mark = L.circleMarker([pin.lat, pin.lng], {
				radius: isFocus ? 7 : pin.real ? 6 : 4,
				color: TEAL,
				weight: isFocus ? 2 : 1,
				fillColor: pin.real ? TEAL : TEAL_FILL,
				fillOpacity: pin.real ? .9 : .55,
				opacity: .9
			});
			mark.bindTooltip(pin.city, {
				direction: "top",
				opacity: .9,
				className: "gx-map-tip",
				permanent: isFocus
			});
			mark.on("click", (ev) => {
				L.DomEvent.stopPropagation(ev);
				const point = {
					lat: pin.lat,
					lng: pin.lng,
					label: pin.city
				};
				const mode = pickRef.current;
				if (mode) onPickRef.current(mode, point);
				else onAnyRef.current(point);
			});
			mark.addTo(group);
		}
		if (you) L.circleMarker([you.lat, you.lng], {
			radius: 8,
			color: TEAL,
			weight: 2,
			fillColor: "#d5ecea",
			fillOpacity: .95
		}).bindTooltip(you.label, {
			direction: "top",
			opacity: .9,
			className: "gx-map-tip"
		}).addTo(group);
		if (focus) L.circleMarker([focus.lat, focus.lng], {
			radius: 14,
			color: TEAL,
			weight: 1,
			fillColor: TEAL,
			fillOpacity: .12,
			opacity: .7
		}).addTo(group);
	}, [
		pins,
		you,
		active,
		ready,
		focus
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: host,
		className: "gx-map-host",
		"aria-label": "Спутниковая карта Земли"
	});
}
var SCAN_COUNTS = [
	10,
	12,
	20,
	30
];
var VIZ_PINS = [
	{
		id: "lon",
		city: "London",
		lat: 51.51,
		lng: -.13,
		x: 47.4,
		y: 37.6,
		real: false
	},
	{
		id: "par",
		city: "Paris",
		lat: 48.86,
		lng: 2.35,
		x: 48.6,
		y: 39.6,
		real: false
	},
	{
		id: "mad",
		city: "Madrid",
		lat: 40.42,
		lng: -3.7,
		x: 46.4,
		y: 43.2,
		real: false
	},
	{
		id: "sto",
		city: "Stockholm",
		lat: 59.33,
		lng: 18.07,
		x: 53.2,
		y: 33,
		real: false
	},
	{
		id: "hel",
		city: "Helsinki",
		lat: 60.17,
		lng: 24.94,
		x: 55,
		y: 32.2,
		real: false
	},
	{
		id: "vie",
		city: "Vienna",
		lat: 48.21,
		lng: 16.37,
		x: 52.8,
		y: 40.2,
		real: false
	},
	{
		id: "iev",
		city: "Kyiv",
		lat: 50.45,
		lng: 30.52,
		x: 56.6,
		y: 38,
		real: false
	},
	{
		id: "mow",
		city: "Moscow",
		lat: 55.76,
		lng: 37.62,
		x: 58.8,
		y: 34.4,
		real: false
	},
	{
		id: "cai",
		city: "Cairo",
		lat: 30.04,
		lng: 31.24,
		x: 56.8,
		y: 48.8,
		real: false
	},
	{
		id: "ruh",
		city: "Riyadh",
		lat: 24.71,
		lng: 46.67,
		x: 62,
		y: 52.8,
		real: false
	},
	{
		id: "bom",
		city: "Mumbai",
		lat: 19.08,
		lng: 72.88,
		x: 70.6,
		y: 55.4,
		real: false
	},
	{
		id: "hkg",
		city: "Hong Kong",
		lat: 22.32,
		lng: 114.17,
		x: 81.2,
		y: 52.8,
		real: false
	},
	{
		id: "sel",
		city: "Seoul",
		lat: 37.57,
		lng: 126.98,
		x: 84.4,
		y: 44.6,
		real: false
	},
	{
		id: "syd",
		city: "Sydney",
		lat: -33.87,
		lng: 151.21,
		x: 88.6,
		y: 76.8,
		real: false
	},
	{
		id: "gru",
		city: "São Paulo",
		lat: -23.55,
		lng: -46.63,
		x: 32,
		y: 72,
		real: false
	},
	{
		id: "yyz",
		city: "Toronto",
		lat: 43.65,
		lng: -79.38,
		x: 23.4,
		y: 41.2,
		real: false
	},
	{
		id: "mex",
		city: "Mexico City",
		lat: 19.43,
		lng: -99.13,
		x: 18.8,
		y: 53.6,
		real: false
	},
	{
		id: "jnb",
		city: "Johannesburg",
		lat: -26.2,
		lng: 28.05,
		x: 54.8,
		y: 73.6,
		real: false
	},
	{
		id: "nbo",
		city: "Nairobi",
		lat: -1.29,
		lng: 36.82,
		x: 58.4,
		y: 61.8,
		real: false
	},
	{
		id: "bkk",
		city: "Bangkok",
		lat: 13.76,
		lng: 100.5,
		x: 76.4,
		y: 57.6,
		real: false
	},
	{
		id: "jkt",
		city: "Jakarta",
		lat: -6.21,
		lng: 106.85,
		x: 79.6,
		y: 65.4,
		real: false
	},
	{
		id: "los",
		city: "Lagos",
		lat: 6.52,
		lng: 3.38,
		x: 48.6,
		y: 58.4,
		real: false
	}
];
var REAL_PINS = EDGE_NODES.map((n) => ({
	id: n.id,
	city: n.city,
	lat: n.lat,
	lng: n.lng,
	x: n.x,
	y: n.y,
	real: true
}));
var ALL_PINS = [...REAL_PINS, ...VIZ_PINS];
var EMPTY_RITUAL = {
	step: "idle",
	you: null,
	how: null,
	count: 0,
	lit: [],
	near: [],
	nearest: null,
	beam: false
};
var TZ_HINT = {
	"Africa/Cairo": {
		lat: 30.0444,
		lng: 31.2357,
		label: "Cairo"
	},
	"Africa/Johannesburg": {
		lat: -26.2041,
		lng: 28.0473,
		label: "Johannesburg"
	},
	"Africa/Lagos": {
		lat: 6.5244,
		lng: 3.3792,
		label: "Lagos"
	},
	"Africa/Nairobi": {
		lat: -1.2921,
		lng: 36.8219,
		label: "Nairobi"
	},
	"Europe/Moscow": {
		lat: 55.7558,
		lng: 37.6173,
		label: "Moscow"
	},
	"Europe/Minsk": {
		lat: 53.9045,
		lng: 27.5615,
		label: "Minsk"
	},
	"Europe/Kyiv": {
		lat: 50.4501,
		lng: 30.5234,
		label: "Kyiv"
	},
	"Europe/Kiev": {
		lat: 50.4501,
		lng: 30.5234,
		label: "Kyiv"
	},
	"Europe/Berlin": {
		lat: 52.52,
		lng: 13.405,
		label: "Berlin"
	},
	"Europe/Warsaw": {
		lat: 52.2297,
		lng: 21.0122,
		label: "Warsaw"
	},
	"Europe/Istanbul": {
		lat: 41.0082,
		lng: 28.9784,
		label: "Istanbul"
	},
	"Europe/London": {
		lat: 51.5074,
		lng: -.1278,
		label: "London"
	},
	"Europe/Paris": {
		lat: 48.8566,
		lng: 2.3522,
		label: "Paris"
	},
	"Europe/Madrid": {
		lat: 40.4168,
		lng: -3.7038,
		label: "Madrid"
	},
	"Europe/Rome": {
		lat: 41.9028,
		lng: 12.4964,
		label: "Rome"
	},
	"Europe/Amsterdam": {
		lat: 52.3676,
		lng: 4.9041,
		label: "Amsterdam"
	},
	"Asia/Dubai": {
		lat: 25.2048,
		lng: 55.2708,
		label: "Dubai"
	},
	"Asia/Tbilisi": {
		lat: 41.7151,
		lng: 44.8271,
		label: "Tbilisi"
	},
	"Asia/Yerevan": {
		lat: 40.1792,
		lng: 44.4991,
		label: "Yerevan"
	},
	"Asia/Baku": {
		lat: 40.4093,
		lng: 49.8671,
		label: "Baku"
	},
	"Asia/Almaty": {
		lat: 43.222,
		lng: 76.8512,
		label: "Almaty"
	},
	"Asia/Tashkent": {
		lat: 41.2995,
		lng: 69.2401,
		label: "Tashkent"
	},
	"Asia/Yekaterinburg": {
		lat: 56.8389,
		lng: 60.6057,
		label: "Yekaterinburg"
	},
	"Asia/Novosibirsk": {
		lat: 55.0084,
		lng: 82.9357,
		label: "Novosibirsk"
	},
	"Asia/Vladivostok": {
		lat: 43.1155,
		lng: 131.8855,
		label: "Vladivostok"
	},
	"Asia/Tokyo": {
		lat: 35.6762,
		lng: 139.6503,
		label: "Tokyo"
	},
	"Asia/Singapore": {
		lat: 1.3521,
		lng: 103.8198,
		label: "Singapore"
	},
	"Asia/Seoul": {
		lat: 37.5665,
		lng: 126.978,
		label: "Seoul"
	},
	"Asia/Hong_Kong": {
		lat: 22.3193,
		lng: 114.1694,
		label: "Hong Kong"
	},
	"Asia/Bangkok": {
		lat: 13.7563,
		lng: 100.5018,
		label: "Bangkok"
	},
	"Asia/Jakarta": {
		lat: -6.2088,
		lng: 106.8456,
		label: "Jakarta"
	},
	"Asia/Kolkata": {
		lat: 19.076,
		lng: 72.8777,
		label: "Mumbai"
	},
	"America/New_York": {
		lat: 40.7128,
		lng: -74.006,
		label: "New York"
	},
	"America/Los_Angeles": {
		lat: 34.0522,
		lng: -118.2437,
		label: "Los Angeles"
	},
	"America/Toronto": {
		lat: 43.6532,
		lng: -79.3832,
		label: "Toronto"
	},
	"America/Sao_Paulo": {
		lat: -23.5558,
		lng: -46.6396,
		label: "São Paulo"
	},
	"Australia/Sydney": {
		lat: -33.8688,
		lng: 151.2093,
		label: "Sydney"
	}
};
function coordsLabel(lat, lng) {
	const ns = lat >= 0 ? "N" : "S";
	const ew = lng >= 0 ? "E" : "W";
	return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lng).toFixed(3)}°${ew}`;
}
function tzGuess() {
	const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
	if (TZ_HINT[tz]) return TZ_HINT[tz];
	const off = -(/* @__PURE__ */ new Date()).getTimezoneOffset() / 60;
	return {
		lat: 35,
		lng: Math.max(-150, Math.min(170, off * 15)),
		label: tz || "локально"
	};
}
function locateYou() {
	return new Promise((resolve) => {
		const fallback = () => resolve({
			point: tzGuess(),
			how: "tz"
		});
		if (!navigator.geolocation) return fallback();
		const timer = window.setTimeout(fallback, 1500);
		navigator.geolocation.getCurrentPosition((pos) => {
			window.clearTimeout(timer);
			const lat = pos.coords.latitude;
			const lng = pos.coords.longitude;
			resolve({
				point: {
					lat,
					lng,
					label: Object.values(TZ_HINT).find((p) => haversine(lat, lng, p.lat, p.lng) < 180)?.label || coordsLabel(lat, lng)
				},
				how: "geo"
			});
		}, () => {
			window.clearTimeout(timer);
			fallback();
		}, {
			enableHighAccuracy: false,
			timeout: 1300,
			maximumAge: 3e5
		});
	});
}
function haversine(aLat, aLng, bLat, bLng) {
	const R = 6371;
	const dLat = (bLat - aLat) * Math.PI / 180;
	const dLng = (bLng - aLng) * Math.PI / 180;
	const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
function nearestReal(from, n = 3) {
	return [...REAL_PINS].sort((a, b) => haversine(from.lat, from.lng, a.lat, a.lng) - haversine(from.lat, from.lng, b.lat, b.lng)).slice(0, n);
}
function diskXY(point) {
	const match = ALL_PINS.find((p) => haversine(point.lat, point.lng, p.lat, p.lng) < 220);
	if (match) return {
		x: match.x,
		y: match.y
	};
	const lon0 = 15;
	const lat0 = 12;
	const φ = point.lat * Math.PI / 180;
	const λ = point.lng * Math.PI / 180;
	const φ0 = lat0 * Math.PI / 180;
	const λ0 = lon0 * Math.PI / 180;
	const x = Math.cos(φ) * Math.sin(λ - λ0);
	const y = Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ - λ0);
	return {
		x: 50 + x * 46,
		y: 50 - y * 46
	};
}
function diskToGeo(clientX, clientY, el) {
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
	const x = lx / (r.width * .46);
	const y = -ly / (r.height * .46);
	const rho2 = x * x + y * y;
	if (rho2 > 1.02) return null;
	const z = Math.sqrt(Math.max(0, 1 - Math.min(1, rho2)));
	const φ0 = 12 * Math.PI / 180;
	const λ0 = 15 * Math.PI / 180;
	const sinφ0 = Math.sin(φ0);
	const cosφ0 = Math.cos(φ0);
	const φ = Math.asin(Math.max(-1, Math.min(1, z * sinφ0 + y * cosφ0)));
	const λ = λ0 + Math.atan2(x, z * cosφ0 - y * sinφ0);
	const lat = φ * 180 / Math.PI;
	const lng = (λ * 180 / Math.PI + 540) % 360 - 180;
	return {
		lat,
		lng,
		label: ALL_PINS.find((p) => haversine(lat, lng, p.lat, p.lng) < 280)?.city || coordsLabel(lat, lng)
	};
}
function reducedMotion() {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function wait(ms) {
	if (reducedMotion()) return Promise.resolve();
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}
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
	const [ritual, setRitual] = (0, import_react.useState)(EMPTY_RITUAL);
	const ritualGen = (0, import_react.useRef)(0);
	const price = plan === "plus" ? 1200 * months : plan === "max" ? 2800 : plan === "trial" ? 0 : 600 * months;
	const guestLabel = user?.displayName || user?.primaryEmail || (user ? "кабинет" : "гость");
	async function playRitual(kind, planTitle) {
		const id = ++ritualGen.current;
		const live = () => ritualGen.current === id;
		const patch = (next) => {
			if (!live()) return;
			setRitual((prev) => ({
				...prev,
				...next
			}));
		};
		patch({
			...EMPTY_RITUAL,
			step: "locate"
		});
		setStatus(kind === "plan" ? "Тариф · ищу тебя" : "Ищу тебя на карте");
		const found = await locateYou();
		const near = nearestReal(found.point);
		const nearest = near[0] ?? null;
		const result = {
			...found,
			near,
			nearest
		};
		if (!live()) return result;
		setFrom((prev) => prev ?? found.point);
		if (nearest) setTo((prev) => prev ?? {
			lat: nearest.lat,
			lng: nearest.lng,
			label: nearest.city
		});
		patch({
			step: "found",
			you: found.point,
			how: found.how,
			near,
			nearest
		});
		const via = found.how === "geo" ? "гео браузера" : "по поясу";
		setStatus(`Нашли · ${found.point.label} · ${via}`);
		await wait(220);
		if (!live()) return result;
		patch({
			step: "scan",
			count: 0,
			lit: []
		});
		const order = [...ALL_PINS];
		for (const count of SCAN_COUNTS) {
			if (!live()) return result;
			patch({
				count,
				lit: order.slice(0, count).map((p) => p.id),
				step: "scan"
			});
			setStatus(`Считаю точки · ${count} по миру · каталог, не живой control plane`);
			await wait(140);
		}
		if (!live()) return result;
		patch({
			step: "lock",
			near,
			nearest,
			lit: near.map((p) => p.id)
		});
		setStatus(`Ближайшие · ${near.map((p) => p.city).join(", ")}`);
		await wait(180);
		if (!live()) return result;
		patch({
			step: "beam",
			beam: true
		});
		const title = planTitle ? `«${planTitle}» · ` : "";
		setStatus(`${title}${found.point.label} → ${nearest?.city ?? "выход"} · это показ маршрута, не туннель`);
		await wait(kind === "plan" ? 260 : 160);
		if (!live()) return result;
		if (kind === "plan") patch({
			step: "lock",
			beam: true
		});
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
		setStatus(`${routeText}${liveRoute} · замер, не туннель`);
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
	function choosePlan(id, title) {
		setPlan(id);
		setTab("pay");
		playRitual("plan", title);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `gx-root is-${tab} ${ritual.step !== "idle" ? `is-ritual is-${ritual.step}` : ""}`,
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "gx-home",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivingPlanet, {
							phase,
							status,
							onConnect: () => void connect(),
							from,
							to,
							onFrom: setFrom,
							onTo: setTo,
							ritual
						}), tab === "home" && results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
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
								onClick: () => choosePlan(id, title),
								className: `gx-plan ${plan === id ? "active" : ""}`,
								"data-plan": id,
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
function LivingPlanet({ phase, status, onConnect, from, to, onFrom, onTo, ritual }) {
	const [zoom, setZoom] = (0, import_react.useState)(1);
	const [pickMode, setPickMode] = (0, import_react.useState)(null);
	const [terrain3d, setTerrain3d] = (0, import_react.useState)(true);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [mapMode, setMapMode] = (0, import_react.useState)(false);
	const [mapLive, setMapLive] = (0, import_react.useState)(false);
	const [focus, setFocus] = (0, import_react.useState)(null);
	const [zoomSignal, setZoomSignal] = (0, import_react.useState)(0);
	const [zoomDir, setZoomDir] = (0, import_react.useState)(1);
	const zoomRef = (0, import_react.useRef)(1);
	const mapModeRef = (0, import_react.useRef)(false);
	const mapZoomRef = (0, import_react.useRef)(3);
	const hoverTimer = (0, import_react.useRef)(null);
	const dragYaw = (0, import_react.useRef)(0);
	const drag = (0, import_react.useRef)(null);
	const pinch = (0, import_react.useRef)(null);
	const wrap = (0, import_react.useRef)(null);
	const stage = (0, import_react.useRef)(null);
	const spin = (0, import_react.useRef)(null);
	const busy = phase === "flying";
	const on = phase === "on";
	const youXY = ritual.you ? diskXY(ritual.you) : null;
	const nearXY = ritual.nearest ? {
		x: ritual.nearest.x,
		y: ritual.nearest.y
	} : null;
	const scale = mapMode ? 2.05 : ritual.step === "found" || ritual.step === "locate" ? Math.max(zoom, 1.55) : zoom;
	function go(next) {
		const target = Math.min(2.15, Math.max(1, next));
		zoomRef.current = target;
		setZoom(target);
	}
	function diveTo(point) {
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
	(0, import_react.useEffect)(() => {
		wrap.current?.style.setProperty("--gx-scale", String(scale));
	}, [scale]);
	(0, import_react.useEffect)(() => {
		import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
		Promise.resolve({});
	}, []);
	(0, import_react.useEffect)(() => {
		if (ritual.step !== "beam" || !ritual.nearest) return;
		const id = window.setTimeout(() => {
			diveTo({
				lat: ritual.nearest.lat,
				lng: ritual.nearest.lng,
				label: ritual.nearest.city
			});
		}, 160);
		return () => window.clearTimeout(id);
	}, [ritual.step, ritual.nearest]);
	(0, import_react.useEffect)(() => {
		const el = stage.current;
		if (!el) return;
		const onWheel = (e) => {
			if (mapModeRef.current) return;
			e.preventDefault();
			const next = zoomRef.current + (e.deltaY > 0 ? -.22 : .22);
			if (e.deltaY < 0 && next >= 1.72) {
				diveTo(to ?? from ?? ritual.you ?? {
					lat: 52.23,
					lng: 21.01,
					label: "Warsaw"
				});
				return;
			}
			go(next);
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [
		from,
		to,
		ritual.you
	]);
	function applyDrag() {
		wrap.current?.style.setProperty("--gx-drag", `${dragYaw.current}deg`);
	}
	function startPicking(mode) {
		setPickMode(mode);
		if (!mapMode && zoom < 1.25) go(1.3);
	}
	function picked(mode, point) {
		if (mode === "from") onFrom(point);
		else onTo(point);
		setPickMode(null);
		diveTo(point);
	}
	function anywhere(point) {
		if (pickMode) {
			picked(pickMode, point);
			return;
		}
		onTo(point);
		diveTo(point);
	}
	function hitPin(clientX, clientY) {
		const root = stage.current;
		if (!root) return null;
		const pins = [...root.querySelectorAll("[data-pin]")];
		let best = null;
		for (const el of pins) {
			const r = el.getBoundingClientRect();
			const d = Math.hypot(r.left + r.width / 2 - clientX, r.top + r.height / 2 - clientY);
			if (!best || d < best.d) best = {
				pin: el,
				d
			};
		}
		if (!best || best.d > 56) return null;
		return ALL_PINS.find((p) => p.id === best.pin.dataset.pin) ?? null;
	}
	function pointerDown(e) {
		if (mapMode || e.button !== 0) return;
		drag.current = {
			x: e.clientX,
			yaw: dragYaw.current
		};
		setDragging(true);
		e.currentTarget.setPointerCapture(e.pointerId);
	}
	function pointerMove(e) {
		if (mapMode || !drag.current) return;
		dragYaw.current = drag.current.yaw + (e.clientX - drag.current.x) * .28;
		applyDrag();
	}
	function pointerUp(e) {
		if (mapMode) return;
		const start = drag.current;
		drag.current = null;
		setDragging(false);
		if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
		if (!start) return;
		if (Math.abs(e.clientX - start.x) > 10) return;
		const pin = hitPin(e.clientX, e.clientY);
		const point = pin ? {
			lat: pin.lat,
			lng: pin.lng,
			label: pin.city
		} : spin.current ? diskToGeo(e.clientX, e.clientY, spin.current) : null;
		if (!point) return;
		if (pickMode) picked(pickMode, point);
		else diveTo(point);
	}
	function hoverPin(pin) {
		if (mapModeRef.current || drag.current) return;
		if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
		hoverTimer.current = window.setTimeout(() => {
			diveTo({
				lat: pin.lat,
				lng: pin.lng,
				label: pin.city
			});
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
		go(zoom - .28);
	}
	function zoomPlus() {
		if (mapMode) {
			setZoomDir(1);
			setZoomSignal((n) => n + 1);
			return;
		}
		if (zoom >= 1.55) {
			diveTo(to ?? from ?? ritual.you ?? {
				lat: 52.23,
				lng: 21.01,
				label: "Warsaw"
			});
			return;
		}
		go(zoom + .32);
	}
	const lit = new Set(ritual.lit);
	const nearIds = new Set(ritual.near.map((p) => p.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: stage,
			className: `gx-earth-stage ${terrain3d ? "is-3d" : "is-top"} ${dragging ? "is-dragging" : ""} ${mapMode ? "is-map" : ""} ${ritual.step !== "idle" ? `is-${ritual.step}` : ""}`,
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
				}
			},
			onTouchMove: (e) => {
				if (mapMode) return;
				if (pinch.current && e.touches.length === 2) {
					const next = pinch.current.z * (gap(e.touches) / pinch.current.d);
					if (next >= 1.75) {
						diveTo(to ?? from ?? ritual.you ?? {
							lat: 52.23,
							lng: 21.01,
							label: "Warsaw"
						});
						return;
					}
					go(next);
				}
			},
			onTouchEnd: () => {
				pinch.current = null;
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gx-planet-stage",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "gx-planet-wrap",
						ref: wrap,
						style: {
							["--gx-scale"]: scale,
							["--gx-tilt"]: terrain3d && !mapMode ? "14deg" : "0deg"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "gx-planet-spin",
							ref: spin,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gx-planet-img" }),
								ritual.beam && youXY && nearXY && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									className: "gx-beams",
									viewBox: "0 0 100 100",
									"aria-hidden": true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										className: "gx-beam",
										d: `M ${youXY.x} ${youXY.y} Q ${(youXY.x + nearXY.x) / 2} ${Math.min(youXY.y, nearXY.y) - 14} ${nearXY.x} ${nearXY.y}`
									})
								}),
								ALL_PINS.map((pin) => {
									const cls = [
										"gx-pin",
										pin.real ? "is-real" : "is-viz",
										lit.has(pin.id) ? "is-lit" : "",
										nearIds.has(pin.id) ? "is-near" : "",
										ritual.nearest?.id === pin.id && ritual.beam ? "is-lock" : ""
									].filter(Boolean).join(" ");
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"data-pin": pin.id,
										className: cls,
										style: {
											left: `${pin.x}%`,
											top: `${pin.y}%`
										},
										"aria-label": pin.city,
										title: pin.city,
										"aria-hidden": false,
										tabIndex: 0,
										onMouseEnter: () => hoverPin(pin),
										onMouseLeave: () => {
											if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
										},
										onClick: (ev) => {
											ev.stopPropagation();
											const point = {
												lat: pin.lat,
												lng: pin.lng,
												label: pin.city
											};
											if (pickMode) picked(pickMode, point);
											else diveTo(point);
										}
									}, pin.id);
								}),
								youXY && ritual.you && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "gx-pin is-you",
									style: {
										left: `${youXY.x}%`,
										top: `${youXY.y}%`
									},
									"aria-label": ritual.you.label
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gx-planet-shade" })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gx-map-shell",
					children: mapLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EarthMap, {
						active: mapMode,
						focus,
						pins: ALL_PINS,
						you: ritual.you,
						pickMode,
						onPick: picked,
						onAnywhere: anywhere,
						zoomSignal,
						zoomDir,
						onZoom: (z) => {
							mapZoomRef.current = z;
						}
					})
				}),
				ritual.count > 0 && ritual.step === "scan" && !mapMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gx-scan-count",
					children: ritual.count
				}),
				pickMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gx-pick-hint",
					children: [
						mapMode ? "Кликни точку на карте" : "Кликни точку на планете",
						" · ",
						pickMode === "from" ? "откуда" : "куда"
					]
				}),
				mapMode && focus && !pickMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gx-pick-hint",
					children: [focus.label, " · клик — любая точка"]
				})
			]
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
					className: `gx-mode-btn ${!mapMode && terrain3d ? "active" : ""}`,
					onClick: () => {
						if (mapMode) leaveMap();
						else setTerrain3d((v) => !v);
					},
					children: mapMode ? "Планета" : terrain3d ? "3D" : "Сверху"
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
					onClick: zoomMinus,
					children: "−"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `gx-connect ${on || busy ? "is-on" : ""}`,
					disabled: busy,
					onClick: onConnect,
					children: on ? "Отключить" : busy ? "Проверяю" : "Подключить"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "gx-zoom",
					"aria-label": "Увеличить",
					onClick: zoomPlus,
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
				pointName(to, "точка")
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
