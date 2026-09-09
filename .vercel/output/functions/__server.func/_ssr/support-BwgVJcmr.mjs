import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { r as createTicket } from "./server-BdIVESeH.mjs";
import { i as Pill, n as Button, r as Field, t as Area } from "./ui-CYR-Z1Vk.mjs";
import { t as useAccount } from "./use-account-XL7xnknw.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-nav-CZsezKPA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support-BwgVJcmr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SupportPage() {
	const { user, isPending } = useCurrentUserState();
	const [subject, setSubject] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const [tick, setTick] = (0, import_react.useState)(0);
	async function send(e) {
		e.preventDefault();
		setMsg(null);
		setErr(null);
		try {
			const res = await createTicket({ data: {
				subject,
				body
			} });
			if (res.ok) {
				setSubject("");
				setBody("");
				setMsg(`Обращение ${res.id} принято`);
				setTick((n) => n + 1);
			}
		} catch {
			setErr("Не удалось отправить");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-3xl px-4 py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Помощь"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl",
						children: "Написать нам"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Пиши про аккаунт, телефон и проверку сети. Не присылай ключи и чужие личные данные."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel mt-6 p-5 text-sm text-muted",
						children: [
							"Telegram:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-fg",
								href: "https://t.me/xfreedommBot",
								target: "_blank",
								rel: "noreferrer",
								children: "@xfreedommBot"
							})
						]
					}),
					isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-40 animate-pulse rounded-xl bg-bg-elevated" }) : null,
					!isPending && !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-sm text-muted",
						children: [
							"Чтобы оставить обращение,",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "text-fg",
								children: "войдите"
							}),
							"."
						]
					}) : null,
					!isPending && user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-6 grid gap-3",
						onSubmit: (e) => void send(e),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								placeholder: "Тема",
								value: subject,
								onChange: (e) => setSubject(e.target.value),
								required: true,
								minLength: 4
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								placeholder: "Что произошло и на каком устройстве",
								value: body,
								onChange: (e) => setBody(e.target.value),
								required: true,
								minLength: 8
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Отправить"
							}),
							msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-ok",
								children: msg
							}) : null,
							err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-bad",
								children: err
							}) : null
						]
					}) : null,
					user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketList, { refresh: tick }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function TicketList({ refresh }) {
	const { data, reload } = useAccount();
	(0, import_react.useEffect)(() => {
		if (refresh > 0) reload();
	}, [refresh, reload]);
	if (!data?.tickets.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-8 grid gap-2",
		children: data.tickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "panel flex items-center justify-between gap-3 p-4 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.subject }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				tone: t.status === "OPEN" ? "warn" : "ok",
				children: t.status
			})]
		}, t.id))
	});
}
//#endregion
export { SupportPage as component };
