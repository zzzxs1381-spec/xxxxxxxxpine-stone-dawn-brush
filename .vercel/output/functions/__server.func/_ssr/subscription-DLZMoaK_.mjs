import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as startTrial } from "./server-C48RRHDO.mjs";
import { i as Pill, n as Button } from "./ui-CYR-Z1Vk.mjs";
import { t as useAccount } from "./use-account-vkO4gr-u.mjs";
import { n as PLANS } from "./ingest-metrics-CttQDW8G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subscription-DLZMoaK_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SubPage() {
	const { data, reload } = useAccount();
	const [note, setNote] = (0, import_react.useState)(null);
	async function trial() {
		const res = await startTrial();
		setNote(res.already ? "Пробный период уже активен или подписка есть" : "Пробный период на 7 дней включён");
		await reload();
	}
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-bg-elevated" });
	const status = data.profile.subscription_status;
	const ends = data.profile.trial_ends_at;
	const statusWord = status === "NONE" || !status ? "нет" : status === "TRIAL" ? "пробный" : status === "ACTIVE" ? "есть" : status;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Подписка"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "7 дней блокнота бесплатно. Карту не просим. Оплаты месяца ещё нет."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel flex flex-wrap items-center justify-between gap-3 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: "Статус"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-lg",
						children: statusWord
					}),
					ends ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["пробный до ", new Date(ends).toLocaleString("ru-RU")]
					}) : null
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone: status === "TRIAL" || status === "ACTIVE" ? "ok" : "muted",
					children: statusWord
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => void trial(),
				children: "Взять 7 дней бесплатно"
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ok",
				children: note
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5 text-sm text-muted",
				children: ["Оплатить месяц или год нельзя: касса не подключена. Когда подключат — здесь появятся настоящие статусы оплаты, не нарисованные.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-1",
					children: PLANS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						p.name,
						": ",
						p.price
					] }, p.code))
				})]
			})
		]
	});
}
//#endregion
export { SubPage as component };
