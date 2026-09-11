import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useCurrentUser } from "./use-current-user-DG6UNzh9.mjs";
import { p as updateProfile } from "./server-C48RRHDO.mjs";
import { i as Pill, n as Button, r as Field } from "./ui-CYR-Z1Vk.mjs";
import { t as useAccount } from "./use-account-vkO4gr-u.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-D5A_rTxz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	const user = useCurrentUser();
	const { data, reload } = useAccount();
	const [name, setName] = (0, import_react.useState)("");
	const [consent, setConsent] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!data) return;
		setName(data.profile.display_name ?? user?.displayName ?? "");
		setConsent(data.profile.telemetry_consent);
	}, [data, user]);
	async function save(e) {
		e.preventDefault();
		await updateProfile({ data: {
			displayName: name,
			telemetryConsent: consent
		} });
		setSaved(true);
		await reload();
	}
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-bg-elevated" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid max-w-xl gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Я"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Твои данные. Не туннель."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-xs text-muted",
					children: user?.primaryEmail ?? user?.id
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "panel grid gap-4 p-5",
				onSubmit: (e) => void save(e),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-2 text-sm",
						children: ["Имя", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							value: name,
							onChange: (e) => setName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-3 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mt-1 size-4",
							checked: consent,
							onChange: (e) => setConsent(e.target.checked)
						}), "Согласие на обезличенную телеметрию сети. Без содержимого трафика и истории сайтов."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Сохранить"
					}),
					saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-ok",
						children: "Сохранено"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Устройства"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app/devices",
						className: "text-xs text-muted",
						children: "все"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 grid gap-2 text-sm",
					children: [data.devices.filter((d) => d.status !== "REVOKED").length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted",
						children: "Нет активных."
					}) : null, data.devices.filter((d) => d.status !== "REVOKED").slice(0, 4).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 border-t border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							d.label,
							" · ",
							d.platform
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted",
							children: d.last_seen_at ? "был" : "новый"
						})]
					}, d.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Обращения"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/support",
						className: "text-xs text-muted",
						children: "написать"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 grid gap-2 text-sm",
					children: [data.tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted",
						children: "Обращений нет."
					}) : null, data.tickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 border-t border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.subject }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: t.status === "OPEN" ? "warn" : "ok",
							children: t.status
						})]
					}, t.id))]
				})]
			})
		]
	});
}
//#endregion
export { AccountPage as component };
