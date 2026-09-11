import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as startTrial } from "./server-C48RRHDO.mjs";
import { n as Button } from "./ui-CYR-Z1Vk.mjs";
import { t as useAccount } from "./use-account-vkO4gr-u.mjs";
import { E as truthFromReport, i as asAdvice, o as asRoutes } from "./ingest-metrics-CttQDW8G.mjs";
import { a as OONI_PACK, c as StatCard, l as TruthList, n as ClassPill, o as RouteList, s as ServicePicture, t as AdviceCard } from "./xf-DUehVY68.mjs";
import { t as runCabinetProbe } from "./run-probe-CrzcJZ0w.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app--o2ttcDl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Overview() {
	const { data, err, reload } = useAccount();
	const [note, setNote] = (0, import_react.useState)(null);
	const [step, setStep] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [runErr, setRunErr] = (0, import_react.useState)(null);
	const autoOnce = (0, import_react.useRef)(false);
	const last = data?.diagnostics[0];
	(0, import_react.useEffect)(() => {
		if (!data || last || autoOnce.current) return;
		if (typeof window !== "undefined" && sessionStorage.getItem("xf-auto-probe") === "1") return;
		autoOnce.current = true;
		if (typeof window !== "undefined") sessionStorage.setItem("xf-auto-probe", "1");
		runNow();
	}, [data, last]);
	async function runNow() {
		setBusy(true);
		setRunErr(null);
		try {
			const { result } = await runCabinetProbe({
				label: "это устройство",
				onStep: setStep
			});
			if (!result.ok) setRunErr(result.error ?? "Не получилось замерить");
			await reload();
		} catch {
			setRunErr("Не получилось замерить");
		} finally {
			setBusy(false);
			setStep(null);
		}
	}
	async function trial() {
		const res = await startTrial();
		setNote(res.already ? "Пробный период уже есть" : "Пробный период на 7 дней включён");
		await reload();
	}
	if (err) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-bad",
		children: err
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-bg-elevated" });
	const { profile, devices, tickets } = data;
	const routes = last ? asRoutes(last.route_json) : [];
	const advice = last ? asAdvice(last.advice_json) : null;
	const stages = last ? truthFromReport({
		source: last.source,
		online: last.online,
		httpsOk: last.https_ok,
		classification: last.classification
	}) : [];
	const activeDevices = devices.filter((d) => d.status !== "REVOKED");
	const needsTrial = profile.subscription_status !== "TRIAL" && profile.subscription_status !== "ACTIVE";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.2em] text-muted",
					children: "Главная"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display mt-2 text-4xl",
					children: "Автопилот"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Сайт сам смотрит сеть и выбирает дорогу. Telegram отсюда не откроется — коридор строит только телефон."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.18em] text-muted",
						children: "Сейчас"
					}),
					busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-lg",
						children: ["Смотрю сеть: ", step ?? "…"]
					}) : last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-lg",
						children: "Дорога выбрана. Туннель ещё не включён — это нормально."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-lg",
						children: "Замера нет. Нажми кнопку — система сама всё сделает."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy,
							onClick: () => void runNow(),
							children: busy ? "Идёт проверка…" : last ? "Проверить ещё раз" : "Пусть система сама проверит"
						})
					}),
					runErr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-bad",
						children: runErr
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Подписка",
						v: profile.subscription_status === "NONE" ? "нет" : profile.subscription_status === "TRIAL" ? "пробный" : profile.subscription_status === "ACTIVE" ? "есть" : profile.subscription_status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Телефоны",
						v: String(activeDevices.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Проверок за сутки",
						v: `${data.ingest.ok24} ок`
					})
				]
			}),
			needsTrial ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: "7 дней бесплатно, без карты"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Это доступ к кабинету. Не оплата VPN."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void trial(),
					children: "Включить"
				})]
			}) : null,
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ok",
				children: note
			}) : null,
			last && last.classification === "NO_BLOCK_DETECTED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Этот экран — не та сеть. Здесь дорога открыта. Чужой градусник из России сегодня видит другое — ниже."
			}) : null,
			advice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdviceCard, { advice }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServicePicture, {
				pack: OONI_PACK,
				compact: true
			}),
			last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Что система увидела"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPill, { c: last.classification }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs text-muted",
								children: [last.latency_ms ?? "—", " мс"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/app/reports/$id",
								params: { id: last.id },
								className: "text-sm text-muted",
								children: "подробности"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteList, { routes })
					})
				]
			}) : null,
			last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Коридор на телефоне"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Пока приложения нет — эти шаги серые. Так и должно быть."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruthList, { stages })
					})
				]
			}) : null,
			tickets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Обращения"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2 text-sm",
					children: tickets.slice(0, 3).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 border-t border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.subject }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted",
							children: t.status
						})]
					}, t.id))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Не понял, что происходит?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/onboarding",
						className: "text-fg",
						children: "Простыми словами"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app/stat",
						className: "text-fg",
						children: "Журнал проверок"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app/live",
						className: "text-fg",
						children: "Эфир"
					})
				]
			})
		]
	});
}
//#endregion
export { Overview as component };
