import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, _ as createRootRoute, b as useRouter, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as __exportAll } from "./ssr.mjs";
import { $t as union, Jt as number, Kt as literal, Qt as string, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { E as truthFromReport, a as asEvidence, d as flagsFromEvidence, g as mapPlatform, i as asAdvice, l as classify, m as hashToken, o as asRoutes, p as getSql, t as EDGE_NODES, v as persistDiagnostic, w as touchDevice, y as recordIngestEvent } from "./ingest-metrics-BuxZ01cb.mjs";
import { n as auth } from "./server-CiHnYTmd.mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-2YL8A5zK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-C-BNwGMj.css";
var APP_NAME = "Xservis";
var Route$27 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Xservis — доступ есть. Диагностика сети, кабинет и нативные клиенты."
			},
			{
				name: "theme-color",
				content: "#020612"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "XFreedom"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ru",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$20 = () => import("./routes-Cw4gOECh.mjs");
var Route$26 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = () => import("./app-BaqsM8_q.mjs");
var Route$25 = createFileRoute("/app")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./diagnostics-6v9m8g5e.mjs");
var Route$24 = createFileRoute("/diagnostics")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./download-B-i1hXI7.mjs");
var Route$23 = createFileRoute("/download")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./login-B5gETOlQ.mjs");
var Route$22 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./map-Bpg6q6JX.mjs");
var Route$21 = createFileRoute("/map")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./monitor-B6LFQRF4.mjs");
var Route$20 = createFileRoute("/monitor")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./onboarding-DiDcdXi0.mjs");
var Route$19 = createFileRoute("/onboarding")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./picture-C4vlMI1p.mjs");
var Route$18 = createFileRoute("/picture")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./plans-DyL1U45c.mjs");
var Route$17 = createFileRoute("/plans")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./privacy-Bc6QD9Tj.mjs");
var Route$16 = createFileRoute("/privacy")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./support-BwgVJcmr.mjs");
var Route$15 = createFileRoute("/support")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./app-CNcIR3v2.mjs");
var Route$14 = createFileRoute("/app/")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./account-FScsGU4w.mjs");
var Route$13 = createFileRoute("/app/account")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./aima-CtqMpaqV.mjs");
var Route$12 = createFileRoute("/app/aima")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./devices-CLW6OPwz.mjs");
var Route$11 = createFileRoute("/app/devices")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./live-Cl6XUgRH.mjs");
var Route$10 = createFileRoute("/app/live")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./probe-DoXeyMg6.mjs");
var Route$9 = createFileRoute("/app/probe")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./stat-uaRVZ3gR.mjs");
var Route$8 = createFileRoute("/app/stat")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./subscription-D3kFViRy.mjs");
var Route$7 = createFileRoute("/app/subscription")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
async function resolveAgent(token) {
	if (!token.startsWith("xfprobe_") || token.length < 20) return { kind: "bad" };
	const [agent] = await (await getSql())`
    select id, user_id, status, label, last_seen_at
    from xf_agent_tokens
    where token_hash = ${await hashToken(token)}
    limit 1
  `;
	if (!agent) return { kind: "unknown" };
	if (agent.status !== "ACTIVE") return {
		kind: "revoked",
		agent
	};
	return {
		kind: "ok",
		agent
	};
}
async function ingestAgentReport(payload) {
	const started = Date.now();
	const resolved = await resolveAgent(payload.token?.trim() ?? "");
	const handle = () => Date.now() - started;
	const bytes = typeof payload.payloadBytes === "number" ? payload.payloadBytes : null;
	const platform = payload.platform?.slice(0, 24) ?? null;
	const probeLatency = typeof payload.latencyMs === "number" ? Math.round(payload.latencyMs) : null;
	if (resolved.kind === "bad" || resolved.kind === "unknown") return {
		ok: false,
		status: 401,
		error: "unknown token"
	};
	if (resolved.kind === "revoked") {
		await recordIngestEvent({
			userId: resolved.agent.user_id,
			agentId: resolved.agent.id,
			outcome: "REVOKED",
			statusCode: 401,
			platform,
			probeLatencyMs: probeLatency,
			handleMs: handle(),
			payloadBytes: bytes
		});
		return {
			ok: false,
			status: 401,
			error: "unknown token"
		};
	}
	const agent = resolved.agent;
	if (agent.last_seen_at) {
		const last = Date.parse(agent.last_seen_at);
		if (!Number.isNaN(last) && Date.now() - last < 8e3) {
			await recordIngestEvent({
				userId: agent.user_id,
				agentId: agent.id,
				outcome: "RATE_LIMIT",
				statusCode: 429,
				platform,
				probeLatencyMs: probeLatency,
				handleMs: handle(),
				payloadBytes: bytes
			});
			return {
				ok: false,
				status: 429,
				error: "rate limited"
			};
		}
	}
	const evidence = Array.isArray(payload.evidence) ? payload.evidence.slice(0, 40) : [];
	const flags = flagsFromEvidence(evidence);
	try {
		const deviceId = await touchDevice({
			userId: agent.user_id,
			label: agent.label,
			platform: mapPlatform(platform)
		});
		const saved = await persistDiagnostic({
			userId: agent.user_id,
			source: "AGENT",
			agentId: agent.id,
			deviceId,
			platform: platform ?? void 0,
			networkType: payload.networkType?.slice(0, 40),
			online: payload.online !== false,
			ipv4Ok: payload.ipv4Ok,
			ipv6Ok: payload.ipv6Ok,
			httpsOk: payload.httpsOk !== false,
			udpHint: payload.udpHint?.slice(0, 20),
			latencyMs: probeLatency ?? void 0,
			evidence,
			fingerprintBucket: payload.fingerprintBucket?.slice(0, 64)
		});
		await (await getSql())`update xf_agent_tokens set last_seen_at = now(), device_id = ${deviceId ?? null} where id = ${agent.id}`;
		await recordIngestEvent({
			userId: agent.user_id,
			agentId: agent.id,
			outcome: "OK",
			statusCode: 200,
			platform,
			classification: saved.classification,
			probeLatencyMs: probeLatency,
			handleMs: handle(),
			payloadBytes: bytes,
			diagnosticId: saved.id,
			ipv4Ok: flags.ipv4Ok,
			ipv6Ok: flags.ipv6Ok,
			httpsOk: flags.httpsOk,
			udpOk: flags.udpOk,
			tlsOk: flags.tlsOk,
			dnsOk: flags.dnsOk
		});
		const truth = truthFromReport({
			source: "AGENT",
			online: payload.online !== false,
			httpsOk: payload.httpsOk !== false,
			classification: saved.classification
		});
		return {
			ok: true,
			status: 200,
			id: saved.id,
			classification: saved.classification,
			routes: saved.routes,
			advice: saved.advice,
			truth
		};
	} catch (err) {
		console.error("[ingest] persist failed", err);
		await recordIngestEvent({
			userId: agent.user_id,
			agentId: agent.id,
			outcome: "ERROR",
			statusCode: 500,
			platform,
			probeLatencyMs: probeLatency,
			handleMs: handle(),
			payloadBytes: bytes,
			ipv4Ok: flags.ipv4Ok,
			ipv6Ok: flags.ipv6Ok,
			httpsOk: flags.httpsOk,
			udpOk: flags.udpOk,
			tlsOk: flags.tlsOk,
			dnsOk: flags.dnsOk
		});
		return {
			ok: false,
			status: 500,
			error: "ingest failed"
		};
	}
}
async function adviceForToken(token) {
	const resolved = await resolveAgent(token);
	if (resolved.kind !== "ok") return {
		ok: false,
		status: 401,
		error: "unknown token"
	};
	const agent = resolved.agent;
	const [row] = await (await getSql())`
    select id, classification, source, online, https_ok, latency_ms, route_json, advice_json, evidence, created_at
    from xf_diagnostics
    where user_id = ${agent.user_id}
    order by created_at desc
    limit 1
  `;
	if (!row) return {
		ok: true,
		status: 200,
		diagnosticId: null,
		classification: "UNKNOWN",
		routes: [],
		advice: null
	};
	const classification = row.classification || classify(asEvidence(row.evidence));
	return {
		ok: true,
		status: 200,
		diagnosticId: row.id,
		classification,
		routes: asRoutes(row.route_json),
		advice: asAdvice(row.advice_json),
		latencyMs: row.latency_ms,
		createdAt: row.created_at,
		truth: truthFromReport({
			source: row.source,
			online: row.online,
			httpsOk: row.https_ok,
			classification
		})
	};
}
var cors$4 = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "content-type, authorization"
};
function bearer(request) {
	const h = request.headers.get("authorization") ?? "";
	if (h.toLowerCase().startsWith("bearer ")) return h.slice(7).trim();
	return "";
}
var Route$6 = createFileRoute("/api/agent/advice")({ server: { handlers: {
	OPTIONS: () => new Response(null, {
		status: 204,
		headers: cors$4
	}),
	GET: async ({ request }) => {
		const result = await adviceForToken(bearer(request));
		return Response.json(result, {
			status: result.status,
			headers: cors$4
		});
	}
} } });
var cors$3 = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "content-type, authorization"
};
var Route$5 = createFileRoute("/api/agent/health")({ server: { handlers: {
	OPTIONS: () => new Response(null, {
		status: 204,
		headers: cors$3
	}),
	GET: () => Response.json({
		ok: true,
		service: "xfreedom-observer",
		ts: Date.now()
	}, { headers: cors$3 })
} } });
var cors$2 = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "content-type, authorization"
};
var Route$4 = createFileRoute("/api/agent/ingest")({ server: { handlers: {
	OPTIONS: () => new Response(null, {
		status: 204,
		headers: cors$2
	}),
	POST: async ({ request }) => {
		const raw = await request.text();
		if (raw.length > 16e3) return Response.json({
			ok: false,
			error: "payload too large"
		}, {
			status: 413,
			headers: cors$2
		});
		let payload;
		try {
			payload = JSON.parse(raw);
		} catch {
			return Response.json({
				ok: false,
				error: "invalid json"
			}, {
				status: 400,
				headers: cors$2
			});
		}
		const header = request.headers.get("authorization") ?? "";
		if (!payload.token && header.toLowerCase().startsWith("bearer ")) payload.token = header.slice(7).trim();
		const result = await ingestAgentReport({
			...payload,
			payloadBytes: raw.length
		});
		return Response.json(result, {
			status: result.status,
			headers: cors$2
		});
	}
} } });
var Route$3 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var LIVE_ORIGIN = "https://xservis.app";
var ROUTES_TTL_MS = 2e4;
var STATUS_TTL_MS = 15e3;
var routesCache = null;
var statusCache = null;
function asStr(v) {
	if (typeof v !== "string") return void 0;
	const s = v.trim();
	return s ? s.slice(0, 120) : void 0;
}
function sanitizePublicRoute(raw) {
	if (!raw || typeof raw !== "object") return null;
	const o = raw;
	const id = asStr(o.id);
	const name = asStr(o.name);
	if (!id && !name) return null;
	return {
		id,
		name,
		protocol: asStr(o.protocol),
		transport: o.transport == null ? null : asStr(o.transport) ?? null,
		health: asStr(o.health) ?? asStr(o.status)
	};
}
function catalogFallback() {
	return EDGE_NODES.filter((n) => n.health !== "FAILED").map((n) => ({
		id: n.id,
		name: n.city,
		protocol: n.transports[0]?.toLowerCase().replace("_", "-"),
		transport: n.transports[0] === "HYSTERIA2" ? "udp" : "tcp",
		health: n.health === "HEALTHY" ? "up" : n.health.toLowerCase()
	}));
}
async function getJson(path, ms) {
	const res = await fetch(`${LIVE_ORIGIN}${path}`, {
		cache: "no-store",
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(ms)
	});
	if (!res.ok) throw new Error(`live ${path} ${res.status}`);
	return res.json();
}
async function getPublicRoutes() {
	const now = Date.now();
	if (routesCache && now - routesCache.at < ROUTES_TTL_MS) return routesCache.value;
	try {
		const body = await getJson("/api/public/routes", 2600);
		const routes = Array.isArray(body.routes) ? body.routes.map(sanitizePublicRoute).filter((r) => Boolean(r)) : [];
		const value = {
			routes: routes.length > 0 ? routes : catalogFallback(),
			live: routes.length > 0,
			count: routes.length
		};
		routesCache = {
			at: now,
			value
		};
		return value;
	} catch {
		const value = {
			routes: catalogFallback(),
			live: false,
			count: 0
		};
		routesCache = {
			at: now,
			value
		};
		return value;
	}
}
async function getPublicStatus() {
	const now = Date.now();
	if (statusCache && now - statusCache.at < STATUS_TTL_MS) return statusCache.value;
	try {
		const raw = await getJson("/api/public/status", 2600);
		const value = {
			service: asStr(raw.service) ?? "XFreedom",
			version: asStr(raw.version) ?? "unknown",
			domain: asStr(raw.domain) ?? "xservis.app",
			botUsername: asStr(raw.botUsername) ?? "xfreedommBot",
			telegramEnabled: Boolean(raw.telegramEnabled),
			publishedRoutes: typeof raw.publishedRoutes === "number" ? raw.publishedRoutes : null,
			routeTypes: Array.isArray(raw.routeTypes) ? raw.routeTypes.filter((t) => typeof t === "string") : [],
			upstreamError: raw.upstreamError == null ? null : asStr(raw.upstreamError) ?? String(raw.upstreamError),
			serverTime: asStr(raw.serverTime) ?? (/* @__PURE__ */ new Date()).toISOString(),
			live: true
		};
		statusCache = {
			at: now,
			value
		};
		return value;
	} catch {
		const value = {
			service: "XFreedom",
			version: "sandbox",
			domain: "local",
			botUsername: "xfreedommBot",
			telegramEnabled: false,
			publishedRoutes: EDGE_NODES.length,
			routeTypes: ["hysteria2", "vless"],
			upstreamError: "live status unreachable",
			serverTime: (/* @__PURE__ */ new Date()).toISOString(),
			live: false
		};
		statusCache = {
			at: now,
			value
		};
		return value;
	}
}
var cors$1 = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "content-type",
	"Cache-Control": "no-store"
};
var Route$2 = createFileRoute("/api/public/routes")({ server: { handlers: {
	OPTIONS: () => new Response(null, {
		status: 204,
		headers: cors$1
	}),
	GET: async () => {
		const data = await getPublicRoutes();
		return Response.json({
			source: data.live ? "xservis.app" : "catalog",
			credentialsExposed: false,
			routes: data.routes,
			count: data.count || data.routes.length
		}, { headers: cors$1 });
	}
} } });
var cors = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "content-type",
	"Cache-Control": "no-store"
};
var Route$1 = createFileRoute("/api/public/status")({ server: { handlers: {
	OPTIONS: () => new Response(null, {
		status: 204,
		headers: cors
	}),
	GET: async () => {
		const data = await getPublicStatus();
		return Response.json(data, { headers: cors });
	}
} } });
var $$splitComponentImporter = () => import("./reports._id-B2bODsff.mjs");
var Route = createFileRoute("/app/reports/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$26.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$27
});
var AppRoute = Route$25.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => Route$27
});
var DiagnosticsRoute = Route$24.update({
	id: "/diagnostics",
	path: "/diagnostics",
	getParentRoute: () => Route$27
});
var DownloadRoute = Route$23.update({
	id: "/download",
	path: "/download",
	getParentRoute: () => Route$27
});
var LoginRoute = Route$22.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$27
});
var MapRoute = Route$21.update({
	id: "/map",
	path: "/map",
	getParentRoute: () => Route$27
});
var MonitorRoute = Route$20.update({
	id: "/monitor",
	path: "/monitor",
	getParentRoute: () => Route$27
});
var OnboardingRoute = Route$19.update({
	id: "/onboarding",
	path: "/onboarding",
	getParentRoute: () => Route$27
});
var PictureRoute = Route$18.update({
	id: "/picture",
	path: "/picture",
	getParentRoute: () => Route$27
});
var PlansRoute = Route$17.update({
	id: "/plans",
	path: "/plans",
	getParentRoute: () => Route$27
});
var PrivacyRoute = Route$16.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$27
});
var SupportRoute = Route$15.update({
	id: "/support",
	path: "/support",
	getParentRoute: () => Route$27
});
var AppIndexRoute = Route$14.update({
	id: "/",
	path: "/",
	getParentRoute: () => AppRoute
});
var AppAccountRoute = Route$13.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => AppRoute
});
var AppAimaRoute = Route$12.update({
	id: "/aima",
	path: "/aima",
	getParentRoute: () => AppRoute
});
var AppDevicesRoute = Route$11.update({
	id: "/devices",
	path: "/devices",
	getParentRoute: () => AppRoute
});
var AppLiveRoute = Route$10.update({
	id: "/live",
	path: "/live",
	getParentRoute: () => AppRoute
});
var AppProbeRoute = Route$9.update({
	id: "/probe",
	path: "/probe",
	getParentRoute: () => AppRoute
});
var AppStatRoute = Route$8.update({
	id: "/stat",
	path: "/stat",
	getParentRoute: () => AppRoute
});
var AppSubscriptionRoute = Route$7.update({
	id: "/subscription",
	path: "/subscription",
	getParentRoute: () => AppRoute
});
var ApiAgentAdviceRoute = Route$6.update({
	id: "/api/agent/advice",
	path: "/api/agent/advice",
	getParentRoute: () => Route$27
});
var ApiAgentHealthRoute = Route$5.update({
	id: "/api/agent/health",
	path: "/api/agent/health",
	getParentRoute: () => Route$27
});
var ApiAgentIngestRoute = Route$4.update({
	id: "/api/agent/ingest",
	path: "/api/agent/ingest",
	getParentRoute: () => Route$27
});
var ApiAuthSplatRoute = Route$3.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$27
});
var ApiPublicRoutesRoute = Route$2.update({
	id: "/api/public/routes",
	path: "/api/public/routes",
	getParentRoute: () => Route$27
});
var ApiPublicStatusRoute = Route$1.update({
	id: "/api/public/status",
	path: "/api/public/status",
	getParentRoute: () => Route$27
});
var AppRouteChildren = {
	AppAccountRoute,
	AppAimaRoute,
	AppDevicesRoute,
	AppLiveRoute,
	AppProbeRoute,
	AppStatRoute,
	AppSubscriptionRoute,
	AppIndexRoute,
	AppReportsIdRoute: Route.update({
		id: "/reports/$id",
		path: "/reports/$id",
		getParentRoute: () => AppRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AppRoute: AppRoute._addFileChildren(AppRouteChildren),
	DiagnosticsRoute,
	DownloadRoute,
	LoginRoute,
	MapRoute,
	MonitorRoute,
	OnboardingRoute,
	PictureRoute,
	PlansRoute,
	PrivacyRoute,
	SupportRoute,
	ApiAgentAdviceRoute,
	ApiAgentHealthRoute,
	ApiAgentIngestRoute,
	ApiAuthSplatRoute,
	ApiPublicRoutesRoute,
	ApiPublicStatusRoute
};
var routeTree = Route$27._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route as n, router_exports as t };
