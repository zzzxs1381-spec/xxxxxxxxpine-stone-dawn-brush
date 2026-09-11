import { d as useRouterState, m as Outlet, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { i as UserButton, t as RedirectToSignIn } from "./gates-B9jb3coV.mjs";
import { i as Sparkles, l as Activity, s as House, t as User } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-BWYHbtmh.js
var import_jsx_runtime = require_jsx_runtime();
var top = [
	{
		to: "/app/probe",
		label: "Проба"
	},
	{
		to: "/app/live",
		label: "Эфир"
	},
	{
		to: "/monitor",
		label: "Монитор"
	},
	{
		to: "/app/devices",
		label: "Устройства"
	},
	{
		to: "/app/subscription",
		label: "Подписка"
	}
];
var tabs = [
	{
		to: "/app",
		label: "Главная",
		icon: House,
		exact: true
	},
	{
		to: "/app/stat",
		label: "Стат",
		icon: Activity
	},
	{
		to: "/app/aima",
		label: "Айма",
		icon: Sparkles
	},
	{
		to: "/app/account",
		label: "Я",
		icon: User
	}
];
function AppShell() {
	const { user, isPending } = useCurrentUserState();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-bg p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto h-16 max-w-6xl animate-pulse rounded-lg bg-bg-elevated" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const who = user.displayName || user.primaryEmail?.split("@")[0] || "я";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg pb-24 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-line",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "xf-logo",
							"aria-hidden": true,
							children: "X"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-extrabold tracking-[0.18em]",
							children: "XSERVIS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[10px] text-muted",
							children: who
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2",
					children: top.map((item) => {
						const on = pathname.startsWith(item.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: `shrink-0 rounded-md px-3 py-2 text-sm ${on ? "bg-bg-subtle text-accent" : "text-muted hover:bg-bg-subtle hover:text-fg"}`,
							children: item.label
						}, item.to);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-6xl px-4 py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid max-w-6xl grid-cols-4",
					children: tabs.map((t) => {
						const on = t.to === "/app" ? pathname === "/app" || pathname === "/app/" : pathname.startsWith(t.to);
						const Icon = t.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: t.to,
							className: `relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] ${on ? "text-fg" : "text-subtle"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-4",
									color: on ? "var(--primary)" : "currentColor",
									"aria-hidden": true
								}),
								t.label,
								on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 h-0.5 w-8 rounded-full bg-accent" }) : null
							]
						}, t.to);
					})
				})
			})
		]
	});
}
//#endregion
export { AppShell as component };
