import { d as useRouterState, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { i as UserButton, n as SignedIn, r as SignedOut } from "./gates-B9jb3coV.mjs";
import { o as MessageCircle, r as Tag, s as House } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/site-nav-BDYyKgj1.js
var import_jsx_runtime = require_jsx_runtime();
var tabs = [
	{
		to: "/",
		label: "Главная",
		icon: House,
		exact: true
	},
	{
		to: "/plans",
		label: "Тариф",
		icon: Tag,
		exact: false
	},
	{
		to: "/support",
		label: "Канал",
		icon: MessageCircle,
		exact: false
	}
];
function XsHeader({ who }) {
	const { user, isPending } = useCurrentUserState();
	const name = who ?? (user?.displayName || user?.primaryEmail?.split("@")[0] || "гость");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "safe-top flex items-center justify-between gap-3 px-4 pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "xf-logo",
				"aria-hidden": true,
				children: "X"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-extrabold tracking-[0.18em]",
				children: "XSERVIS"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] font-semibold uppercase tracking-[0.16em] text-muted",
				children: "XFreedom"
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-16 animate-pulse rounded-full bg-bg-subtle" }) : null,
				!isPending && user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignedIn, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/app",
					className: "text-xs text-muted",
					children: name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})] }) : null,
				!isPending && !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "text-xs text-muted",
					children: "гость"
				}) }) : null
			]
		})]
	});
}
function XsTabs() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed inset-x-0 bottom-0 z-30",
		style: { paddingBottom: "env(safe-area-inset-bottom, 0px)" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto w-full max-w-[640px] border-t border-line bg-bg/95 px-1 pb-1 pt-2 backdrop-blur-xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3",
				children: tabs.map((t) => {
					const on = t.exact ? pathname === "/" : pathname.startsWith(t.to);
					const Icon = t.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: t.to,
						className: `relative flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] ${on ? "text-fg" : "text-subtle"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-4",
								strokeWidth: on ? 2.3 : 1.8,
								color: on ? "var(--primary)" : "currentColor"
							}),
							t.label,
							on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 h-0.5 w-8 rounded-full bg-accent" }) : null
						]
					}, t.to);
				})
			})
		})
	});
}
function SiteNav() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XsHeader, {});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
			className: "mx-auto hidden max-w-6xl gap-3 px-4 py-8 text-xs text-subtle md:flex md:items-center md:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Xservis — доступ есть. Сайт не является системным VPN." }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/privacy",
						className: "hover:text-fg",
						children: "Приватность"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/support",
						className: "hover:text-fg",
						children: "Канал"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/monitor",
						className: "hover:text-fg",
						children: "Монитор"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XsTabs, {})
	] });
}
//#endregion
export { SiteNav as n, SiteFooter as t };
