import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { n as Button, r as Field } from "./ui-CYR-Z1Vk.mjs";
import { t as GROK_PROVIDERS } from "./server-CyT6g-Rx.mjs";
import { n as SiteNav, t as SiteFooter } from "./site-nav-BDYyKgj1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Dz78onO6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("in");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			if (mode === "up") {
				const { error: err } = await authClient.signUp.email({
					email,
					password,
					name: email.split("@")[0] ?? "user"
				});
				if (err) setError(err.message ?? "Не удалось создать аккаунт");
				else window.location.assign("/app");
			} else {
				const { error: err } = await authClient.signIn.email({
					email,
					password
				});
				if (err) setError(err.message ?? "Неверный вход");
				else window.location.assign("/app");
			}
		} catch {
			setError("Ошибка входа");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteNav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-md gap-6 px-4 py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.2em] text-muted",
							children: "Аккаунт"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display mt-2 text-4xl",
							children: "Войти в XFreedom"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Кабинет — блокнот: проверки, устройства, совет. Коридор здесь не строится."
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2",
							children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								tone: "line",
								type: "button",
								onClick: () => signIn(p.providerId, { callbackURL: "/app" }),
								children: ["Продолжить через ", p.label]
							}, p.providerId))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-xs text-subtle",
							children: "или почта"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "grid gap-3",
							onSubmit: submit,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "xf-email",
									type: "email",
									required: true,
									placeholder: "email",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									autoComplete: "email"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "xf-password",
									type: "password",
									required: true,
									minLength: 8,
									placeholder: "пароль, от 8 символов",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									autoComplete: mode === "up" ? "new-password" : "current-password"
								}),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-bad",
									children: error
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									disabled: busy,
									type: "submit",
									children: mode === "up" ? "Создать аккаунт" : "Войти"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-sm text-muted",
									onClick: () => setMode(mode === "up" ? "in" : "up"),
									children: mode === "up" ? "Уже есть аккаунт" : "Нужна регистрация"
								})
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "text-sm text-muted",
						children: "На главную"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Login as component };
