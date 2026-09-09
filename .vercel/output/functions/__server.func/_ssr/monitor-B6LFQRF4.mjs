import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Pill } from "./ui-CYR-Z1Vk.mjs";
import { a as Radio, c as Earth, l as Activity } from "../_libs/lucide-react.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-nav-CZsezKPA.mjs";
import { n as MONITOR_OUTSIDE, r as MONITOR_OWN, t as MONITOR_LAYERS } from "./monitor-tools-BsWjyyGB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/monitor-B6LFQRF4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MonitorPage() {
	const [pulse, setPulse] = (0, import_react.useState)("wait");
	const [ms, setMs] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const started = performance.now();
		fetch("/api/agent/health", { cache: "no-store" }).then((r) => {
			setMs(Math.round(performance.now() - started));
			setPulse(r.ok ? "ok" : "no");
		}).catch(() => {
			setMs(null);
			setPulse("no");
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-5xl px-4 py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Градусники"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl md:text-5xl",
						children: "Инструменты мониторинга сети"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm text-muted",
						children: "Разные градусники меряют разное. Пинг «ок» не значит, что открылся YouTube. Семь ссылок OONI это как раз показали. Ни один инструмент здесь не включает коридор."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "panel mt-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
								className: "size-4 text-muted",
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: "Пульс блокнота"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Кабинет отвечает? Это не «YouTube жив»."
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: pulse === "ok" ? "ok" : pulse === "no" ? "bad" : "muted",
								children: pulse === "ok" ? "жив" : pulse === "no" ? "молчит" : "смотрю"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-muted",
								children: ms == null ? "—" : `${ms} мс`
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg",
							children: "Шесть слоёв. Путать их нельзя."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-4 grid gap-3 md:grid-cols-2",
							children: MONITOR_LAYERS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "panel p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs text-muted",
										children: l.n
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-1 text-base",
										children: l.t
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: l.d
									})
								]
							}, l.n))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-12",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
									className: "size-4 text-muted",
									"aria-hidden": true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg",
									children: "Наши"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Работают в этом продукте. Не рисуют CONNECTED."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 grid gap-3",
								children: MONITOR_OWN.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolCard, { tool: t }, t.id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-12",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, {
									className: "size-4 text-muted",
									"aria-hidden": true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg",
									children: "Чужие"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Мы ими не управляем. Берём факты, не кнопки «подключиться». Один замер — одна сеть, не вся Россия."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 grid gap-3",
								children: MONITOR_OUTSIDE.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolCard, { tool: t }, t.id))
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function ToolCard({ tool }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href: tool.href,
		target: tool.external ? "_blank" : void 0,
		rel: tool.external ? "noreferrer" : void 0,
		className: "block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "panel h-full p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base",
						children: tool.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: tool.ours ? "ok" : "muted",
						children: tool.ours ? "наш" : "чужой"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: tool.kid
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "Видит. "
					}), tool.sees]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "Не видит. "
					}), tool.misses]
				})
			]
		})
	}) });
}
//#endregion
export { MonitorPage as component };
