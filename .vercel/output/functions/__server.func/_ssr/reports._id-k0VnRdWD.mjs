import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getDiagnostic } from "./server-C48RRHDO.mjs";
import { E as truthFromReport, a as asEvidence, i as asAdvice, o as asRoutes } from "./ingest-metrics-CttQDW8G.mjs";
import { i as EvidenceList, l as TruthList, n as ClassPill, o as RouteList, t as AdviceCard } from "./xf-DUehVY68.mjs";
import { n as Route } from "./router-JsaXjcyh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports._id-k0VnRdWD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportPage() {
	const { id } = Route.useParams();
	const [row, setRow] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		getDiagnostic({ data: { id } }).then(setRow);
	}, [id]);
	if (row === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-bg-elevated" });
	if (row === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Отчёт не найден."
	});
	const evidence = asEvidence(row.evidence);
	const routes = asRoutes(row.route_json);
	const advice = asAdvice(row.advice_json);
	const stages = truthFromReport({
		source: row.source,
		online: row.online,
		httpsOk: row.https_ok,
		classification: row.classification
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/app/stat",
				className: "text-sm text-muted",
				children: "← Стат"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Отчёт"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPill, { c: row.classification })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted",
				children: [
					row.id,
					" · ",
					row.source,
					" · ",
					row.platform ?? "—",
					" · ",
					row.latency_ms ?? "—",
					" мс"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdviceCard, { advice }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Коридор на телефоне"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruthList, { stages })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Какую дорогу взять телефону"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Совет. Сайт коридор не строит."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteList, { routes })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Что увидели"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceList, { items: evidence })
				})]
			})
		]
	});
}
//#endregion
export { ReportPage as component };
