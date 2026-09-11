import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Pill } from "./ui-CYR-Z1Vk.mjs";
import { t as EDGE_NODES } from "./ingest-metrics-CttQDW8G.mjs";
import { a as OONI_PACK, s as ServicePicture } from "./xf-DUehVY68.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-nav-BDYyKgj1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/map-CCzUNX-4.js
var import_jsx_runtime = require_jsx_runtime();
var healthTone = {
	HEALTHY: "ok",
	RECOVERING: "warn",
	DEGRADED: "warn",
	DRAINING: "muted",
	FAILED: "bad"
};
function healthWord(h) {
	if (h === "HEALTHY") return "жива";
	if (h === "FAILED") return "нет";
	if (h === "DEGRADED") return "слабая";
	if (h === "DRAINING") return "сворачивается";
	return "оживает";
}
function MapPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Карта"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl md:text-5xl",
						children: "Города-дороги"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm text-muted",
						children: "Это список улиц, которые система рассматривает. Нажать на точку нельзя — это не кнопка «подключиться к Варшаве». Твой точный адрес не показывается."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "panel relative mt-8 overflow-hidden p-4 md:p-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative min-h-72 w-full md:min-h-96",
							children: EDGE_NODES.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute -translate-x-1/2 -translate-y-1/2",
								style: {
									left: `${n.x}%`,
									top: `${n.y}%`
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block size-2.5 rounded-full ${n.health === "HEALTHY" ? "bg-ok" : n.health === "FAILED" ? "bg-bad" : "bg-warn"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block whitespace-nowrap font-mono text-xs text-muted",
									children: n.city
								})]
							}, n.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-6 grid gap-3 md:grid-cols-2",
						children: EDGE_NODES.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "panel flex items-start justify-between gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm",
								children: [
									n.city,
									", ",
									n.country
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									n.transports.includes("HYSTERIA2") ? "быстрая" : "",
									n.transports.includes("HYSTERIA2") && n.transports.includes("VLESS_REALITY") ? " и " : "",
									n.transports.includes("VLESS_REALITY") ? "тихая" : "",
									n.transports.includes("AMNEZIAWG") ? " · другая форма" : ""
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: healthTone[n.health],
								children: healthWord(n.health)
							})]
						}, n.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServicePicture, {
							pack: OONI_PACK,
							compact: true
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { MapPage as component };
