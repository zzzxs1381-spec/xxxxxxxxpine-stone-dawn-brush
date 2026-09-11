import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as addDevice, u as revokeDevice } from "./server-C48RRHDO.mjs";
import { i as Pill, n as Button, r as Field } from "./ui-CYR-Z1Vk.mjs";
import { t as useAccount } from "./use-account-vkO4gr-u.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/devices-24u7mwNV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DevicesPage() {
	const { data, reload } = useAccount();
	const rows = data?.devices ?? [];
	const [label, setLabel] = (0, import_react.useState)("Pixel");
	const [platform, setPlatform] = (0, import_react.useState)("ANDROID");
	const [err, setErr] = (0, import_react.useState)(null);
	async function add(e) {
		e.preventDefault();
		setErr(null);
		const res = await addDevice({ data: {
			label,
			platform
		} });
		if (!res.ok) setErr(res.error);
		else await reload();
	}
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-bg-elevated" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Устройства"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Телефоны, которые система знает. Это список, не кнопка «включить VPN». Проверка сама записывает устройство."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "panel grid gap-3 p-5 md:grid-cols-[1fr_160px_auto]",
				onSubmit: (e) => void add(e),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						value: label,
						onChange: (e) => setLabel(e.target.value),
						placeholder: "Название"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "min-h-11 rounded-md border border-line bg-bg px-3 text-sm",
						value: platform,
						onChange: (e) => setPlatform(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "ANDROID",
								children: "Android"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "IOS",
								children: "iOS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "DESKTOP",
								children: "Desktop"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Добавить"
					}),
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-bad md:col-span-3",
						children: err
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid gap-2",
				children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Устройств пока нет."
				}) : null, rows.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "panel flex flex-wrap items-center justify-between gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted",
						children: [
							d.id,
							" · ",
							d.platform,
							d.last_seen_at ? ` · ${d.last_seen_at}` : ""
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: d.status === "REVOKED" ? "muted" : "ok",
							children: d.status === "REVOKED" ? "выключен" : "жив"
						}), d.status !== "REVOKED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							tone: "danger",
							onClick: () => void revokeDevice({ data: { id: d.id } }).then(() => reload()),
							children: "Выключить"
						}) : null]
					})]
				}, d.id))]
			})
		]
	});
}
//#endregion
export { DevicesPage as component };
