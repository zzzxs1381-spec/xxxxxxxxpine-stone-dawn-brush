import { v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as EDGE_NODES, x as scoreRoutes } from "./ingest-metrics-CttQDW8G.mjs";
import { a as OONI_PACK, o as RouteList, s as ServicePicture } from "./xf-DUehVY68.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-nav-BDYyKgj1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/picture-CE68Ce8B.js
var import_jsx_runtime = require_jsx_runtime();
var how = [
	{
		t: "Что это за ссылки",
		d: "Это не наш VPN и не этот сайт. Это чужой градусник: программа OONI на iPhone в сети Gipercom в России. Она ходила к сайтам и записала, где дорога ломается."
	},
	{
		t: "Имена нашлись",
		d: "У всех семи сайтов адресная книжка сработала. Значит это не «интернета нет» и не «YouTube стёрли из DNS». Имя нашли — дальше ломают уже разговор."
	},
	{
		t: "Дверь 443 открыта, замок ломают",
		d: "Twitter, Facebook, Instagram: дверь открыли, шифрование сразу оборвали. Как если охранник пускает в подъезд и сразу выключает свет. Телефону нужно прятать, к кому идёшь."
	},
	{
		t: "YouTube и Discord молчат",
		d: "Дверь тоже открывается, но закрытый разговор не начинается — тишина. Другой способ ломать, не тот же щелчок. Коридор всё равно нужен."
	},
	{
		t: "X договорился и завис",
		d: "Шифрование даже пожали руки, а страница не пришла. Ещё хитрее: пускают почти до конца и глушат. Зелёная галочка на рукопожатии — ещё не «сайт открылся»."
	},
	{
		t: "TikTok — табличка, не замок",
		d: "Сайт сам ответил: «вам нельзя». Это не сломанная дорога, а правило на входе. Коридор в другую страну часто помогает. Если TikTok узнает, что ты из России, табличка может вернуться."
	},
	{
		t: "Telegram в пачке нет",
		d: "Эти ссылки его не проверяли. Мы не дописываем «его тоже закрыли». В других сетях России в тот же день дверь до telegram.org часто уже не открывается. Чтобы знать про твой Telegram — нужен замер с твоего телефона."
	}
];
function PicturePage() {
	const routes = scoreRoutes("TLS_HANDSHAKE_INTERFERENCE", EDGE_NODES);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-3xl px-4 py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.2em] text-muted",
						children: "Чужой градусник"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display mt-2 text-4xl",
						children: "Что режут сегодня"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Семь ссылок с одного iPhone в одной сети. Это факты. Не обещание, что у тебя дома будет так же. Не кнопка «открыть YouTube»."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServicePicture, { pack: OONI_PACK })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-8 grid gap-3",
						children: how.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "panel mt-8 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg",
								children: "Что бы взял телефон"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "По этой картине система выбирает другую форму дороги. Сайт её не включает. Пока приложения нет — это только совет."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteList, { routes })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							className: "inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm text-accent-fg",
							children: "Проверить свою сеть"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/monitor",
							className: "inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm",
							children: "Инструменты мониторинга"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { PicturePage as component };
