import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as getLiveTape } from "./server-BdIVESeH.mjs";
import { i as Pill, n as Button } from "./ui-CYR-Z1Vk.mjs";
import { _ as outcomeLabel, i as asAdvice, o as asRoutes, s as checkKid } from "./ingest-metrics-BuxZ01cb.mjs";
import { n as ClassPill, o as RouteList, t as AdviceCard } from "./xf-CxqCaKW3.mjs";
import { t as runCabinetProbe } from "./run-probe-DtgjUC9_.mjs";
import { a as Area, c as Tooltip, i as XAxis, r as YAxis, s as ResponsiveContainer, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-Cl6XUgRH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LAST_KEY = "xf-live-last";
function readLast() {
	if (typeof window === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(LAST_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function writeLast(next) {
	try {
		sessionStorage.setItem(LAST_KEY, JSON.stringify(next));
	} catch {}
}
function silenceWord(sec) {
	if (sec == null) return "ещё не слушали";
	if (sec < 8) return "сейчас";
	if (sec < 60) return `${sec} с назад`;
	if (sec < 3600) return `${Math.round(sec / 60)} мин назад`;
	return `${Math.round(sec / 3600)} ч назад`;
}
function LayerMeter({ layer }) {
	const w = layer.ok === true ? "100%" : layer.ok === false ? "32%" : "10%";
	const bar = layer.ok === true ? "bg-ok" : layer.ok === false ? "bg-bad" : "bg-subtle";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "grid gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: layer.k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone: layer.ok === true ? "ok" : layer.ok === false ? "bad" : "muted",
					children: layer.ok === true ? "жив" : layer.ok === false ? "нет" : "нет факта"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: layer.kid
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1.5 overflow-hidden rounded-full bg-bg-subtle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `h-full rounded-full ${bar}`,
					style: { width: w }
				})
			})
		]
	});
}
function LivePage() {
	const cached = (0, import_react.useRef)(readLast());
	const [tape, setTape] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)(null);
	const [log, setLog] = (0, import_react.useState)(cached.current?.log ?? []);
	const [evidence, setEvidence] = (0, import_react.useState)(cached.current?.evidence ?? []);
	const [klass, setKlass] = (0, import_react.useState)(cached.current?.klass ?? null);
	const [routes, setRoutes] = (0, import_react.useState)(cached.current?.routes ?? []);
	const [advice, setAdvice] = (0, import_react.useState)(cached.current?.advice ?? null);
	const seen = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const [fresh, setFresh] = (0, import_react.useState)(null);
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const t = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(t);
	}, []);
	(0, import_react.useEffect)(() => {
		let alive = true;
		async function tick() {
			if (typeof document !== "undefined" && document.hidden) return;
			try {
				const next = await getLiveTape();
				if (!alive) return;
				const newest = next.events[0]?.id;
				if (newest && seen.current.size > 0 && !seen.current.has(newest)) setFresh(newest);
				for (const e of next.events) seen.current.add(e.id);
				setTape(next);
				setErr(null);
			} catch {
				if (alive) setErr("Эфир не отвечает. Это не значит, что интернет мёртв — молчит блокнот.");
			}
		}
		tick();
		const t = window.setInterval(() => void tick(), 2500);
		const onVis = () => {
			if (!document.hidden) tick();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			alive = false;
			window.clearInterval(t);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, []);
	async function listenHere() {
		setBusy(true);
		setErr(null);
		setLog([]);
		setKlass(null);
		setAdvice(null);
		setRoutes([]);
		const steps = [];
		try {
			const { result } = await runCabinetProbe({
				label: "это устройство",
				onStep: (s) => {
					setStep(s);
					steps.push(s);
					setLog([...steps.slice(-14)]);
				}
			});
			if (result.evidence) setEvidence(result.evidence);
			if (!result.ok) setErr(result.error ?? "Не получилось замерить");
			else {
				setKlass(result.classification ?? null);
				const nextRoutes = asRoutes(result.routes);
				const nextAdvice = asAdvice(result.advice);
				setRoutes(nextRoutes);
				setAdvice(nextAdvice);
				writeLast({
					evidence: result.evidence ?? [],
					klass: result.classification ?? null,
					routes: nextRoutes,
					advice: nextAdvice,
					log: steps
				});
				const next = await getLiveTape();
				setTape(next);
			}
		} catch {
			setErr("Не получилось замерить");
		} finally {
			setBusy(false);
			setStep(null);
		}
	}
	const minutes = (tape?.minutes ?? []).map((m) => ({
		...m,
		t: new Date(m.start).toLocaleTimeString("ru-RU", {
			hour: "2-digit",
			minute: "2-digit"
		})
	}));
	const lastTs = tape?.lastAt ? Date.parse(tape.lastAt) : NaN;
	const silenceSec = Number.isNaN(lastTs) ? tape?.silenceSec ?? null : Math.max(0, Math.round((now - lastTs) / 1e3));
	const listening = silenceSec != null && silenceSec < 25;
	const maxMs = Math.max(1, ...evidence.map((e) => e.ms ?? 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Эфир"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl",
						children: "Анализ в реальном времени"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-muted",
						children: "Это поток замеров, не прослушивание Telegram и не разбор чужих пакетов. Сайт видит: дошла ли проба и на каком слое дорога жива. Сообщения и ролики отсюда не читаются."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `inline-block size-2 rounded-full ${listening || busy ? "bg-ok xf-live-dot" : "bg-subtle"}`,
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: busy ? "идёт разбор" : listening ? "слушаю" : "тишина"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-subtle",
							children: silenceWord(silenceSec)
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.18em] text-muted",
							children: "Слушать этот экран"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: busy ? `Сейчас: ${step ?? "…"}` : "Один замер. Потом эфир обновится сам."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy,
							onClick: () => void listenHere(),
							children: busy ? "Слушаю…" : "Запустить разбор"
						})]
					}),
					log.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-4 grid gap-1 font-mono text-xs text-muted",
						children: log.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: i === log.length - 1 && busy ? "text-fg" : "",
							children: [
								String(i + 1).padStart(2, "0"),
								" · ",
								s
							]
						}, `${s}-${i}`))
					}) : null,
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-bad",
						children: err
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: "За 15 минут"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-xl tabular-nums",
							children: tape ? tape.total15 : "—"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: "Принято / отказ"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-xl tabular-nums",
							children: tape ? `${tape.ok15} / ${tape.fail15}` : "—"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: "Последняя задержка"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-xl tabular-nums",
							children: tape?.lastLatencyMs == null ? "—" : `${tape.lastLatencyMs} мс`
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: "Источники"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono text-xl tabular-nums",
								children: tape ? tape.agents15 : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: tape?.lastAgentLabel ?? "пока нет"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: "Слои последнего живого замера"
						}), tape?.lastClassification ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPill, { c: tape.lastClassification }) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Не трафик людей. Слои градусника."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: (tape?.layers ?? []).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerMeter, { layer: l }, l.k))
					}),
					!tape?.lastClassification ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "Пока тихо. Запусти разбор — слои появятся."
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Поток, 15 минут"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Каждая ступенька — минута. Это не график чужого YouTube."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 h-40",
						children: tape ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: minutes,
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
										interval: 2
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
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full animate-pulse rounded-lg bg-bg-subtle" })
					})
				]
			}),
			klass ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPill, { c: klass }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: "этот экран только что"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdviceCard, { advice })]
			}) : null,
			routes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Совет дорог по этому замеру"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Не кнопка «подключиться». Телефон возьмёт это сам."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteList, { routes })
					})
				]
			}) : null,
			evidence.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Водопад этого разбора"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Сколько занял каждый слой. Это не пакеты Telegram."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 grid gap-3",
						children: evidence.map((e, i) => {
							const w = e.ms != null ? `${Math.max(8, Math.round(e.ms / maxMs * 100))}%` : "8%";
							const ok = e.result === "ok" || e.result === "online" || e.result === "srflx" || e.result === "relay";
							const bad = e.result === "fail" || e.result === "offline" || e.result === "captive";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: checkKid(e.check) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-xs text-muted",
										children: [e.result, e.ms != null ? ` · ${e.ms} мс` : ""]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-1.5 overflow-hidden rounded-full bg-bg-subtle",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `h-full rounded-full ${ok ? "bg-ok" : bad ? "bg-bad" : "bg-warn"}`,
										style: { width: w }
									})
								})]
							}, `${e.check}-${i}`);
						})
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Лента"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Обновление каждые 2–3 секунды. Только твои пробы."
					}),
					!tape || tape.events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Пусто. Нажми «Запустить разбор»."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-2",
						children: tape.events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: `flex flex-wrap items-center justify-between gap-2 border-t border-line py-2 text-sm ${fresh === e.id ? "text-fg" : ""}`,
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-subtle",
									children: e.probe_latency_ms != null ? `${e.probe_latency_ms} мс` : ""
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									tone: e.outcome === "OK" ? "ok" : e.outcome === "ERROR" ? "bad" : "warn",
									children: outcomeLabel(e.outcome)
								}),
								e.classification ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPill, { c: e.classification }) : null,
								e.diagnostic_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app/reports/$id",
									params: { id: e.diagnostic_id },
									className: "font-mono text-xs text-muted",
									children: "отчёт"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-subtle",
									children: e.status_code
								})
							]
						}, e.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Что слышно, а что нет"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 grid gap-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-t border-line pt-2",
							children: "Слышно: дошла ли проба, живы ли имена / дверь / шифрование / страница."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-t border-line pt-2",
							children: "Не слышно: текст Telegram, ролик YouTube, чужой Wi‑Fi, пакеты коридора."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-t border-line pt-2",
							children: "YouTube и Instagram с этого экрана не проверяются целиком — для слоя «шифрование к сервису» нужна программа-проба на компьютере."
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { LivePage as component };
