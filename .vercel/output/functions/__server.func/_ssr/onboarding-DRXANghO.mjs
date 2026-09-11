import { v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteNav, t as SiteFooter } from "./site-nav-BDYyKgj1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-DRXANghO.js
var import_jsx_runtime = require_jsx_runtime();
var steps = [
	{
		t: "Что это вообще",
		d: "XFreedom — система связи, не «ещё один VPN со списком стран». Ты не выбираешь сервер пальцем. Система сама смотрит сеть и выбирает рабочий путь."
	},
	{
		t: "Как в жизни",
		d: "Дорогу к школе перекрыли. Ты не ломаешь забор. Спрашиваешь: какая улица ещё открыта? Идёшь туда. Если и её закрыли — берёшь запасную. Вот и всё."
	},
	{
		t: "Что делает сайт",
		d: "Сайт — глаза. Он меряет: есть ли интернет, проходит ли UDP, не ломают ли HTTPS. Пишет это в блокнот (кабинет). Выбирает главную дорогу и две запасных."
	},
	{
		t: "Что делает телефон",
		d: "Телефон строит закрытый коридор (туннель) и уже по нему открывает Telegram, YouTube, Instagram. Браузер так не умеет. Пока приложения в магазине нет — коридора нет. Это правда, не «скоро сам заработает в вкладке»."
	},
	{
		t: "Когда будет «подключено»",
		d: "Только когда коридор реально встал, DNS внутри него отвечает и интернет проверяется. Зелёная галочка без этого — вранье. Мы её не рисуем."
	},
	{
		t: "Почему не 100% по всей России",
		d: "В Москве, Крыму, Чечне и Дагестане интернет ломают по-разному. Система подстраивается под твою сеть. Если государство закрыло все оставшиеся улицы — мы это покажем, а не будем врать что YouTube жив."
	}
];
function OnboardingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-3xl px-4 py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Простыми словами"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl",
						children: "Как это работает"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Без протоколов. Сначала смысл, потом кнопки."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-8 grid gap-3",
						children: steps.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "panel p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-xs text-muted",
									children: ["0", i + 1]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-1 text-lg",
									children: s.t
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: s.d
								})
							]
						}, s.t))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							className: "inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm text-accent-fg",
							children: "Пусть система сама проверит"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/diagnostics",
							className: "inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm",
							children: "Замер без входа"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { OnboardingPage as component };
