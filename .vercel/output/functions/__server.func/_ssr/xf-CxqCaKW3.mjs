import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Pill } from "./ui-CYR-Z1Vk.mjs";
import { T as transportLabel, b as roleLabel, c as classificationLabel, t as EDGE_NODES } from "./ingest-metrics-BuxZ01cb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/xf-CxqCaKW3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var OONI_PACK = {
	title: "Что режут сегодня",
	whenLabel: "9 сентября 2026, около 16:00 МСК",
	cc: "RU",
	asn: "AS205236",
	network: "Gipercom",
	software: "OONI Probe на iPhone",
	note: "Это не замер XFreedom и не этот экран. Это публичный градусник OONI с одного телефона в одной российской сети. Другой город, другой оператор — картина будет другой. Сайт коридор по этим ссылкам не строит.",
	telegram: "В этой пачке Telegram не мерили. Мы не дорисовываем «его тоже закрыли». В других сетях России в тот же день telegram.org часто не достучаться уже на двери TCP.",
	advice: {
		headline: "Имена находят, дверь 443 открывают, разговор ломают",
		detail: "Это не «интернета нет». Книжка адресов работает. Дальше на шифровании рвут или глушат. Телефону прятать имя дороги: быстрая форма или тихая. TikTok отвечает сам и вешает табличку «вам нельзя» — это другая история, не сломанный замок.",
		preferTransport: "HYSTERIA2"
	},
	shots: [
		{
			uid: "20260909125726.399993_RU_webconnectivity_c940f1a71e0b3630",
			name: "Twitter",
			host: "twitter.com",
			at: "2026-09-09T12:57:25Z",
			dns: "ok",
			tcp: "ok",
			tls: "rst",
			http: "rst",
			ipv6: "skip",
			accessible: false,
			blocking: "http-failure",
			kid: "Имя нашли, дверь открыли, шифрование сразу оборвали.",
			tone: "bad"
		},
		{
			uid: "20260909125726.932754_RU_webconnectivity_8e1331bac677c25e",
			name: "Facebook",
			host: "www.facebook.com",
			at: "2026-09-09T12:57:25Z",
			dns: "ok",
			tcp: "ok",
			tls: "rst",
			http: "rst",
			ipv6: "unreachable",
			accessible: false,
			blocking: "http-failure",
			kid: "То же. Короткая дорога IPv6 не идёт, ходят через обычную.",
			tone: "bad"
		},
		{
			uid: "20260909125727.461655_RU_webconnectivity_b855852f2e2f21d2",
			name: "Instagram",
			host: "www.instagram.com",
			at: "2026-09-09T12:57:26Z",
			dns: "ok",
			tcp: "ok",
			tls: "rst",
			http: "rst",
			ipv6: "unreachable",
			accessible: false,
			blocking: "http-failure",
			kid: "Как Facebook: дверь есть, замок ломают.",
			tone: "bad"
		},
		{
			uid: "20260909125807.560633_RU_webconnectivity_1174e9dfd6268e83",
			name: "YouTube",
			host: "www.youtube.com",
			at: "2026-09-09T12:57:26Z",
			dns: "ok",
			tcp: "ok",
			tls: "timeout",
			http: "timeout",
			ipv6: "unreachable",
			accessible: false,
			blocking: "http-failure",
			kid: "Дверь открывается, а закрытый разговор не начинается — тишина 10–30 секунд.",
			tone: "bad"
		},
		{
			uid: "20260909125908.943031_RU_webconnectivity_973c9946d206e16f",
			name: "X",
			host: "x.com",
			at: "2026-09-09T12:58:08Z",
			dns: "ok",
			tcp: "ok",
			tls: "ok",
			http: "timeout",
			ipv6: "skip",
			accessible: false,
			blocking: "http-failure",
			kid: "Шифрование даже договорилось, а страница так и не пришла.",
			tone: "bad"
		},
		{
			uid: "20260909125939.805970_RU_webconnectivity_89e35a690c61daf9",
			name: "Discord",
			host: "discord.com",
			at: "2026-09-09T12:59:08Z",
			dns: "ok",
			tcp: "mixed",
			tls: "timeout",
			http: "timeout",
			ipv6: "skip",
			accessible: false,
			blocking: "http-failure",
			kid: "Часть дверей тормозит, шифрование не успевает.",
			tone: "bad"
		},
		{
			uid: "20260909125808.950928_RU_webconnectivity_e6064a59e7f79cf2",
			name: "TikTok",
			host: "www.tiktok.com",
			at: "2026-09-09T12:58:07Z",
			dns: "ok",
			tcp: "ok",
			tls: "ok",
			http: "legal",
			ipv6: "skip",
			accessible: true,
			blocking: false,
			kid: "Сайт отвечает и вешает табличку «вам нельзя». Это не сломанный замок.",
			tone: "warn"
		}
	]
};
function ooniHref(uid) {
	return `https://explorer.ooni.org/m/${uid}`;
}
function tlsWord(tls) {
	if (tls === "ok") return "шифрованию дали";
	if (tls === "rst") return "шифровку оборвали";
	if (tls === "timeout") return "шифрование молчит";
	return "шифрование не вышло";
}
function httpWord(http) {
	if (http === "ok") return "страница пришла";
	if (http === "rst") return "страницу оборвали";
	if (http === "timeout") return "страница не пришла";
	if (http === "legal") return "табличка «нельзя»";
	return "страницы нет";
}
function classTone(c) {
	if (c === "NO_BLOCK_DETECTED") return "ok";
	if (c === "OFFLINE" || c === "IP_UNREACHABLE") return "bad";
	if (!c) return "muted";
	return "warn";
}
function ClassPill({ c }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
		tone: classTone(c),
		children: classificationLabel(c)
	});
}
function RouteList({ routes }) {
	if (routes.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Дорог нет — сначала проверка."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-2",
		children: routes.map((r) => {
			const node = EDGE_NODES.find((n) => n.id === r.nodeId);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md border border-line px-3 py-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: roleLabel(r.role)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							node?.city ?? r.nodeId,
							" · ",
							transportLabel(r.transport)
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs tabular-nums",
							children: r.score.toFixed(2)
						})
					]
				}), r.why ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-subtle",
					children: r.why
				}) : null]
			}, r.role);
		})
	});
}
function TruthList({ stages }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-2",
		children: stages.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center justify-between gap-3 border-t border-line py-2 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex-1",
				children: s.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				tone: s.state === "ok" ? "ok" : s.state === "no" ? "bad" : "muted",
				children: s.state === "ok" ? "да" : s.state === "no" ? "нет" : "на телефоне"
			})]
		}, s.id))
	});
}
function AdviceCard({ advice }) {
	if (!advice) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.18em] text-muted",
				children: "Что делать"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 text-lg",
				children: advice.headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: advice.detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-subtle",
				children: [
					"Телефону: ",
					transportLabel(advice.preferTransport),
					" дорога",
					advice.avoidUdp ? " · быструю не брать" : ""
				]
			})
		]
	});
}
function EvidenceList({ items }) {
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Фактов нет."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-2",
		children: items.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "grid gap-1 rounded-md border border-line px-3 py-3 text-sm sm:grid-cols-[160px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs text-muted",
				children: e.check
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				e.result,
				e.ms != null ? ` · ${e.ms} мс` : "",
				e.detail ? ` · ${e.detail}` : ""
			] })]
		}, `${e.check}-${i}`))
	});
}
function CopyField({ value, label }) {
	const [done, setDone] = (0, import_react.useState)(false);
	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			setDone(true);
			window.setTimeout(() => setDone(false), 1600);
		} catch {
			setDone(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-subtle",
			children: label
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
				className: "min-h-11 flex-1 break-all rounded-md border border-line bg-bg px-3 py-3 font-mono text-xs",
				children: value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void copy(),
				className: "inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-line px-4 text-sm",
				children: done ? "Скопировано" : "Копировать"
			})]
		})]
	});
}
function StatCard({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-subtle",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-mono text-xl tabular-nums",
			children: v
		})]
	});
}
function ServicePicture({ pack, compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.18em] text-muted",
				children: pack.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					pack.whenLabel,
					" · ",
					pack.network,
					" · ",
					pack.asn,
					" · ",
					pack.software
				]
			}),
			!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: pack.note
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-2",
				children: pack.shots.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-start justify-between gap-2 border-t border-line py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: s.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: s.kid
							}),
							!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-xs text-subtle",
								children: [
									"имя ",
									s.dns === "ok" ? "нашли" : "нет",
									" · дверь ",
									s.tcp === "ok" ? "открыта" : s.tcp === "mixed" ? "частично" : "нет",
									" · ",
									tlsWord(s.tls),
									" · ",
									httpWord(s.http),
									s.ipv6 === "unreachable" ? " · IPv6 закрыт" : ""
								]
							}) : null,
							!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "mt-1 inline-block text-xs text-subtle",
								href: ooniHref(s.uid),
								target: "_blank",
								rel: "noreferrer",
								children: "исходный замер"
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: s.tone,
						children: s.tone === "ok" ? "открыто" : s.tone === "warn" ? "табличка" : "режут"
					})]
				}, s.uid))
			}),
			!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: pack.telegram
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm",
				children: [
					pack.advice.headline,
					". ",
					pack.advice.detail
				]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/picture",
				className: "mt-4 inline-block text-sm text-fg",
				children: "Как это читать →"
			})
		]
	});
}
//#endregion
export { OONI_PACK as a, StatCard as c, EvidenceList as i, TruthList as l, ClassPill as n, RouteList as o, CopyField as r, ServicePicture as s, AdviceCard as t };
