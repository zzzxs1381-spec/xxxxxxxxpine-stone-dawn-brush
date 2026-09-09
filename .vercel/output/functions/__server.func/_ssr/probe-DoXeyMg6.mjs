import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as issueAgentToken, l as revokeAgentToken } from "./server-BdIVESeH.mjs";
import { i as Pill, n as Button, r as Field } from "./ui-CYR-Z1Vk.mjs";
import { t as useAccount } from "./use-account-XL7xnknw.mjs";
import { n as ClassPill, o as RouteList, r as CopyField, t as AdviceCard } from "./xf-CxqCaKW3.mjs";
import { t as runCabinetProbe } from "./run-probe-DtgjUC9_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/probe-DoXeyMg6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProbePage() {
	const { data, reload } = useAccount();
	const agents = data?.agents ?? [];
	const [token, setToken] = (0, import_react.useState)(null);
	const [label, setLabel] = (0, import_react.useState)("это устройство");
	const [err, setErr] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)(null);
	const [resultId, setResultId] = (0, import_react.useState)(null);
	const [klass, setKlass] = (0, import_react.useState)(null);
	const [routes, setRoutes] = (0, import_react.useState)([]);
	const [advice, setAdvice] = (0, import_react.useState)(null);
	const origin = (0, import_react.useMemo)(() => typeof window === "undefined" ? "" : window.location.origin, []);
	async function issue() {
		setErr(null);
		try {
			const res = await issueAgentToken({ data: { label } });
			setToken(res.token);
			await reload();
			return res.token;
		} catch {
			setErr("Не получилось выдать ключ");
			return null;
		}
	}
	async function runHere() {
		setBusy(true);
		setErr(null);
		setResultId(null);
		try {
			const { token: nextToken, result } = await runCabinetProbe({
				token,
				label,
				onStep: setStep
			});
			if (nextToken) setToken(nextToken);
			if (!result.ok) setErr(result.error ?? "не получилось");
			else {
				setResultId(result.id ?? null);
				setKlass(result.classification ?? null);
				setRoutes(result.routes);
				setAdvice(result.advice);
				await reload();
			}
		} finally {
			setBusy(false);
			setStep(null);
		}
	}
	const cmd = token ? `python3 xf-probe.py --url ${origin} --token ${token}` : `python3 xf-probe.py --url ${origin} --token xfprobe_…`;
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-bg-elevated" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Проба"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-sm text-muted",
				children: "Кнопка — градусник с этого экрана. Программа на компьютере — градусник помощнее. Ни то ни другое не включает VPN."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: busy,
					onClick: () => void runHere(),
					children: busy ? `Смотрю: ${step ?? "…"}` : "Проверить с этого экрана"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm",
					href: "/xf-probe.py",
					download: true,
					children: "Программа для компьютера"
				})]
			}),
			klass ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPill, { c: klass }), resultId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/app/reports/$id",
							params: { id: resultId },
							className: "text-sm text-muted underline",
							children: ["отчёт ", resultId]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdviceCard, { advice }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteList, { routes })
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "panel grid gap-3 p-5 md:grid-cols-[1fr_auto]",
				onSubmit: (e) => {
					e.preventDefault();
					issue();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						value: label,
						onChange: (e) => setLabel(e.target.value),
						placeholder: "Имя пробы"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						tone: "line",
						children: "Ключ для компьютера"
					}),
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-bad md:col-span-2",
						children: err
					}) : null
				]
			}),
			token ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel grid gap-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "Ключ показывается один раз. Дальше система помнит только отпечаток."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyField, {
						value: token,
						label: "Ключ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyField, {
						value: cmd,
						label: "Команда на компьютере"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: agents.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "panel flex flex-wrap items-center justify-between gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: a.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted",
						children: [
							a.token_prefix,
							"… · ",
							a.last_seen_at ? `был ${a.last_seen_at}` : "ещё не присылал"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: a.status === "ACTIVE" ? "ok" : "muted",
							children: a.status === "ACTIVE" ? "жив" : "выключен"
						}), a.status === "ACTIVE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							tone: "danger",
							onClick: () => void revokeAgentToken({ data: { id: a.id } }).then(() => reload()),
							children: "Выключить"
						}) : null]
					})]
				}, a.id))
			})
		]
	});
}
//#endregion
export { ProbePage as component };
