import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as getIngestMetrics } from "./server-C48RRHDO.mjs";
import { i as Pill } from "./ui-CYR-Z1Vk.mjs";
import { t as useAccount } from "./use-account-vkO4gr-u.mjs";
import { _ as outcomeLabel, c as classificationLabel } from "./ingest-metrics-CttQDW8G.mjs";
import { c as StatCard, n as ClassPill } from "./xf-DUehVY68.mjs";
import { a as Area, c as Tooltip, i as XAxis, n as BarChart, o as Bar, r as YAxis, s as ResponsiveContainer, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { r as MONITOR_OWN } from "./monitor-tools-BsWjyyGB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stat-Dhaj1DPa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StatPage() {
	const { data } = useAccount();
	const [metrics, setMetrics] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		async function load() {
			try {
				const next = await getIngestMetrics();
				if (alive) setMetrics(next);
			} catch {
				if (alive) setMetrics(null);
			}
		}
		load();
		const t = window.setInterval(() => void load(), 3e4);
		return () => {
			alive = false;
			window.clearInterval(t);
		};
	}, []);
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-bg-elevated" });
	const rows = data.diagnostics;
	const series = [...rows].reverse().map((d, i) => ({
		i: String(i + 1),
		ms: d.latency_ms ?? 0,
		t: new Date(d.created_at).toLocaleTimeString("ru-RU", {
			hour: "2-digit",
			minute: "2-digit"
		})
	}));
	const classBars = (metrics?.byClass.length ? metrics.byClass : []).map((c) => ({
		name: classificationLabel(c.k),
		n: c.n
	}));
	const fallbackClass = /* @__PURE__ */ new Map();
	if (classBars.length === 0) for (const r of rows) fallbackClass.set(r.classification, (fallbackClass.get(r.classification) ?? 0) + 1);
	const classData = classBars.length > 0 ? classBars : [...fallbackClass.entries()].map(([k, n]) => ({
		name: classificationLabel(k),
		n
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-muted",
					children: "Стат"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-2 text-4xl",
					children: "Журнал проверок"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						"Что система видела за сутки. Обновляется само. Это не карта живых VPN-серверов.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app/live",
							className: "text-fg",
							children: "Эфир"
						}),
						" · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/monitor",
							className: "text-fg",
							children: "Все градусники"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
				children: MONITOR_OWN.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: t.href,
					className: "panel block p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: t.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: t.kid
					})]
				}) }, t.id))
			}),
			metrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IngestPanel, { metrics }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-36 animate-pulse rounded-xl bg-bg-elevated" }),
			series.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Задержка замера, мс"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 h-48",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: series,
							margin: {
								top: 8,
								right: 8,
								left: 0,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "t",
									tick: {
										fill: "var(--color-subtle)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fill: "var(--color-subtle)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false,
									width: 36
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										background: "var(--color-bg-elevated)",
										border: "1px solid var(--color-line)",
										borderRadius: 12
									},
									labelStyle: { color: "var(--color-muted)" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "ms",
									stroke: "var(--color-accent)",
									fill: "var(--color-bg-subtle)",
									strokeWidth: 1.5
								})
							]
						})
					})
				})]
			}) : null,
			classData.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Что находили"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 h-40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: classData,
							margin: {
								top: 8,
								right: 8,
								left: 0,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									tick: {
										fill: "var(--color-subtle)",
										fontSize: 10
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									allowDecimals: false,
									tick: {
										fill: "var(--color-subtle)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false,
									width: 24
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "n",
									fill: "var(--color-accent)",
									radius: [
										6,
										6,
										0,
										0
									]
								})
							]
						})
					})
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Пусто. На Главной нажми «проверить» — система сама замерит."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: rows.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/app/reports/$id",
					params: { id: d.id },
					className: "panel flex flex-wrap items-center justify-between gap-2 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPill, { c: d.classification }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-xs text-muted",
						children: [
							d.source === "AGENT" ? "агент" : "браузер",
							" · ",
							d.latency_ms ?? "—",
							" мс"
						]
					})]
				}) }, d.id))
			})
		]
	});
}
function IngestPanel({ metrics }) {
	const last = metrics.lastAt ? new Date(metrics.lastAt).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit"
	}) : "—";
	const hasVolume = metrics.hourly.some((h) => h.ok + h.fail > 0);
	const hourly = metrics.hourly.map((h) => ({
		...h,
		t: new Date(h.start).toLocaleTimeString("ru-RU", {
			hour: "2-digit",
			minute: "2-digit"
		})
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Проверок за сутки",
						v: String(metrics.total)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Успех",
						v: metrics.successRate == null ? "—" : `${metrics.successRate}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Подожди",
						v: String(metrics.rateLimited)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Медленные",
						v: metrics.p95ProbeMs == null ? "—" : `${metrics.p95ProbeMs} мс`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Последняя",
						v: last
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Чем кончилась",
						v: metrics.lastOutcome ? outcomeLabel(metrics.lastOutcome) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Обработка",
						v: metrics.p95HandleMs == null ? "—" : `${metrics.p95HandleMs} мс`
					})
				]
			}),
			metrics.alerts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: metrics.alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "panel flex items-start justify-between gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: a.text
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: a.tone,
						children: a.tone === "ok" ? "норма" : a.tone === "bad" ? "сбой" : a.tone === "warn" ? "внимание" : "нет данных"
					})]
				}, a.text))
			}) : null,
			hasVolume ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Поток за сутки"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 h-48",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: hourly,
							margin: {
								top: 8,
								right: 8,
								left: 0,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "t",
									tick: {
										fill: "var(--color-subtle)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false,
									interval: 3
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									allowDecimals: false,
									tick: {
										fill: "var(--color-subtle)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false,
									width: 28
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										background: "var(--color-bg-elevated)",
										border: "1px solid var(--color-line)",
										borderRadius: 12
									},
									labelStyle: { color: "var(--color-muted)" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "stepAfter",
									dataKey: "ok",
									stroke: "var(--color-ok)",
									fill: "var(--color-bg-subtle)",
									strokeWidth: 1.5,
									name: "принято"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "stepAfter",
									dataKey: "fail",
									stroke: "var(--color-bad)",
									fill: "transparent",
									strokeWidth: 1.5,
									name: "отказ"
								})
							]
						})
					})
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Что проходило"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2 sm:grid-cols-2",
					children: metrics.evidence.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between border-t border-line py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e.k }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-xs tabular-nums text-muted",
							children: [
								e.pct == null ? "—" : `${e.pct}%`,
								" · ",
								e.ok,
								"/",
								e.n
							]
						})]
					}, e.k))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Пробы"
				}), metrics.agents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Нет событий по токенам."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2",
					children: metrics.agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center justify-between gap-2 border-t border-line py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: a.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-muted",
							children: [
								a.ok,
								"/",
								a.total,
								" ок",
								a.rateLimited ? ` · ${a.rateLimited}× подожди` : ""
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: a.lastOutcome === "OK" ? "ok" : a.lastOutcome === "ERROR" ? "bad" : "warn",
								children: a.lastOutcome ? outcomeLabel(a.lastOutcome) : "—"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-subtle",
								children: a.lastAt ? new Date(a.lastAt).toLocaleTimeString("ru-RU", {
									hour: "2-digit",
									minute: "2-digit"
								}) : "—"
							})]
						})]
					}, a.agentId))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Журнал"
				}), metrics.events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Пусто."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2",
					children: metrics.events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center justify-between gap-2 border-t border-line py-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-muted",
								children: new Date(e.created_at).toLocaleTimeString("ru-RU", {
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e.agent_label ?? "—" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: e.outcome === "OK" ? "ok" : e.outcome === "ERROR" ? "bad" : "warn",
								children: outcomeLabel(e.outcome)
							}),
							e.diagnostic_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/app/reports/$id",
								params: { id: e.diagnostic_id },
								className: "font-mono text-xs text-muted",
								children: e.diagnostic_id
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-subtle",
								children: e.status_code
							})
						]
					}, e.id))
				})]
			})
		]
	});
}
//#endregion
export { StatPage as component };
