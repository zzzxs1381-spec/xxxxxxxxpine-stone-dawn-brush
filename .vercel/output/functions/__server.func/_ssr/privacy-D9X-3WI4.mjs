import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteNav, t as SiteFooter } from "./site-nav-BDYyKgj1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privacy-D9X-3WI4.js
var import_jsx_runtime = require_jsx_runtime();
function PrivacyPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-3xl px-4 py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Приватность"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl",
						children: "Что мы не видим"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-4 text-sm text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Не читаем переписку, не храним историю сайтов и содержимое коридора." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Точный адрес в интернете по возможности не пишем. Отпечаток сети — ярлык, не имя человека." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Дополнительные замеры — только если ты согласился в кабинете." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ключ пробы показывается один раз. Дальше система помнит только отпечаток, не сам ключ." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Айма видит обезличенные замеры, не чаты и не коридор." })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { PrivacyPage as component };
