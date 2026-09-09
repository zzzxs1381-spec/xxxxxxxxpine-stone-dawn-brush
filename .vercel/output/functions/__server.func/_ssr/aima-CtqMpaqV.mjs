import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getDiagnostic, n as askAima } from "./server-BdIVESeH.mjs";
import { n as Button } from "./ui-CYR-Z1Vk.mjs";
import { t as useAccount } from "./use-account-XL7xnknw.mjs";
import { a as asEvidence } from "./ingest-metrics-BuxZ01cb.mjs";
import { i as EvidenceList, n as ClassPill } from "./xf-CxqCaKW3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/aima-CtqMpaqV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AimaPage() {
	const { data, reload } = useAccount();
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [text, setText] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const last = data?.diagnostics[0];
	const notes = data?.notes ?? [];
	async function run() {
		setBusy(true);
		setErr(null);
		let evidenceText = "Диагностик нет.";
		if (last) {
			const full = await getDiagnostic({ data: { id: last.id } });
			const ev = asEvidence(full?.evidence);
			setPreview(ev);
			evidenceText = ev.map((e) => `${e.check}=${e.result}${e.ms != null ? `@${e.ms}` : ""}`).join("; ").slice(0, 2400);
		}
		const res = await askAima({ data: {
			classification: last?.classification ?? "UNKNOWN",
			evidenceText,
			diagnosticId: last?.id,
			source: last?.source ?? void 0
		} });
		setBusy(false);
		if (!res.ok) setErr(res.error);
		else {
			setText(res.text);
			await reload();
		}
	}
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-bg-elevated" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Айма"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Умный друг, не начальник. Разбирает последний замер простыми словами. Дорогу выбирает не она."
			})] }),
			last ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPill, { c: last.classification }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-xs text-muted",
					children: [
						last.source === "AGENT" ? "агент" : "браузер",
						" · ",
						last.latency_ms ?? "—",
						" мс"
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Нет замера — Айма разберёт пустую страницу. Сначала проверка на Главной."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: busy,
				onClick: () => void run(),
				children: busy ? "Анализ…" : "Разобрать последний замер"
			}),
			err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-bad",
				children: err
			}) : null,
			text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
				className: "panel whitespace-pre-wrap p-5 text-sm text-muted",
				children: text
			}) : null,
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Что ушло к Айме"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceList, { items: preview })
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Журнал"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 grid gap-2",
				children: [notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "panel p-4 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs",
						children: n.created_at
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 whitespace-pre-wrap",
						children: n.summary
					})]
				}, n.id)), notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "Пока пусто."
				}) : null]
			})] })
		]
	});
}
//#endregion
export { AimaPage as component };
