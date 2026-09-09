import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { d as saveDiagnostic } from "./server-BdIVESeH.mjs";
import { n as Button } from "./ui-CYR-Z1Vk.mjs";
import { i as asAdvice, o as asRoutes } from "./ingest-metrics-BuxZ01cb.mjs";
import { i as EvidenceList, n as ClassPill, o as RouteList, t as AdviceCard } from "./xf-CxqCaKW3.mjs";
import { r as runBrowserDiagnostics } from "./browser-diag-DiQ02GhR.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-nav-CZsezKPA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diagnostics-6v9m8g5e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DiagnosticsPage() {
	const { user } = useCurrentUserState();
	const [step, setStep] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [routes, setRoutes] = (0, import_react.useState)([]);
	const [advice, setAdvice] = (0, import_react.useState)(null);
	const [klass, setKlass] = (0, import_react.useState)(null);
	async function run() {
		setBusy(true);
		setSaved(null);
		try {
			const data = await runBrowserDiagnostics(setStep);
			setResult(data);
			setKlass(data.classification);
			if (user) {
				const res = await saveDiagnostic({ data: {
					networkType: data.networkType,
					online: data.online,
					ipv4Ok: data.ipv4Ok,
					httpsOk: data.httpsOk,
					udpHint: data.udpHint,
					latencyMs: data.latencyMs,
					evidence: data.evidence,
					fingerprintBucket: data.fingerprintBucket
				} });
				if (res.ok) {
					setSaved(res.id);
					setKlass(res.classification);
					setRoutes(asRoutes(res.routes));
					setAdvice(asAdvice(res.advice));
				}
			}
		} finally {
			setBusy(false);
			setStep(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-4xl px-4 py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Градусник"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl md:text-5xl",
						children: "Проверка с этого экрана"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm text-muted",
						children: "Как градусник: меряет, не лечит. Браузер видит меньше, чем телефон. Telegram отсюда не откроется."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy,
							onClick: () => void run(),
							children: busy ? `Смотрю: ${step ?? "…"}` : "Проверить сеть"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/picture",
							className: "inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm",
							children: "Что режут в России"
						})]
					}),
					!user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm text-muted",
						children: [
							"Без входа результат останется на этом экране.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "text-fg",
								children: "Войди"
							}),
							", чтобы сохранить в блокнот."
						]
					}) : null,
					result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 grid gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPill, { c: klass ?? result.classification }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-xs text-muted",
											children: [
												result.latencyMs,
												" мс · ",
												result.networkType
											]
										}),
										saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-ok",
											children: "сохранено в блокнот"
										}) : null
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-5 grid gap-3 text-sm sm:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											k: "Интернет",
											v: result.online ? "есть" : "нет"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											k: "Обычные сайты",
											v: result.httpsOk ? "открываются" : "нет"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											k: "Быстрая дорога",
											v: result.udpHint
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
											k: "Отпечаток сети",
											v: result.fingerprintBucket
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdviceCard, { advice }),
							routes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-sm font-medium",
										children: "Какую дорогу взять телефону"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Это совет, не кнопка «подключиться»."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteList, { routes })
									})
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-medium",
									children: "Что увидели"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceList, { items: result.evidence })
								})]
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-line pt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-subtle",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-mono text-sm",
			children: v
		})]
	});
}
//#endregion
export { DiagnosticsPage as component };
