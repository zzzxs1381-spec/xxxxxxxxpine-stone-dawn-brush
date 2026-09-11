import { v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as PLANS } from "./ingest-metrics-CttQDW8G.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-nav-BDYyKgj1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plans-BmWo3GeM.js
var import_jsx_runtime = require_jsx_runtime();
function PlansPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-5xl px-4 py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Тарифы"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl md:text-5xl",
						children: "Сколько это стоит"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-sm text-muted",
						children: "Оплаты ещё нет — кассу не подключали. Можно взять 7 дней бесплатно в кабинете, без карты и без фейковой кнопки «оплатить»."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid gap-4 md:grid-cols-3",
						children: PLANS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "panel flex flex-col p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm uppercase tracking-[0.16em] text-muted",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display mt-3 text-4xl",
									children: p.price
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-subtle",
									children: p.period
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-5 grid gap-2 text-sm text-muted",
									children: p.features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "border-t border-line pt-2",
										children: f
									}, f))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app/subscription",
									className: "mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm text-accent-fg",
									children: p.code === "trial" ? "Взять 7 дней" : "Пока нельзя оплатить"
								})
							]
						}, p.code))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { PlansPage as component };
