import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-CYR-Z1Vk.js
var import_jsx_runtime = require_jsx_runtime();
function cx(...parts) {
	return parts.filter(Boolean).join(" ");
}
function Button({ tone = "primary", className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cx("inline-flex min-h-11 items-center justify-center rounded-[13px] px-4 text-sm font-extrabold transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-40", {
			primary: "xf-primary",
			ghost: "bg-transparent text-fg hover:bg-bg-subtle",
			line: "bg-transparent text-fg hairline hover:bg-bg-subtle",
			danger: "bg-transparent text-bad hairline hover:bg-bg-subtle"
		}[tone], className),
		...props
	});
}
function Field(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: "min-h-11 w-full rounded-[12px] border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-muted",
		...props
	});
}
function Area(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: "min-h-28 w-full rounded-[12px] border border-line bg-bg px-3 py-2 text-sm text-fg outline-none placeholder:text-subtle focus:border-muted",
		...props
	});
}
function Pill({ children, tone = "muted" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cx("inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs", tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : tone === "bad" ? "text-bad" : "text-muted"),
		children
	});
}
//#endregion
export { Pill as i, Button as n, Field as r, Area as t };
