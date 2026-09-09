import { c as issueAgentToken } from "./server-BdIVESeH.mjs";
import { i as asAdvice, o as asRoutes } from "./ingest-metrics-BuxZ01cb.mjs";
import { r as runBrowserDiagnostics } from "./browser-diag-DiQ02GhR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/run-probe-DtgjUC9_.js
var TOKEN_KEY = "xf-probe-token";
function readStoredToken() {
	if (typeof window === "undefined") return null;
	try {
		return sessionStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}
function writeStoredToken(token) {
	if (typeof window === "undefined") return;
	try {
		if (token) sessionStorage.setItem(TOKEN_KEY, token);
		else sessionStorage.removeItem(TOKEN_KEY);
	} catch {}
}
function friendlyIngestError(error) {
	if (error === "rate limited") return "Система только что смотрела. Подожди несколько секунд.";
	if (error === "unknown token") return "Ключ не подошёл. Нажми ещё раз — выдадим новый.";
	if (!error || error === "ingest failed") return "Не получилось отправить замер.";
	return error;
}
async function issueToken(label, onStep) {
	onStep?.("выдаю ключ пробы");
	try {
		const issued = await issueAgentToken({ data: { label } });
		writeStoredToken(issued.token);
		return {
			ok: true,
			token: issued.token
		};
	} catch {
		return {
			ok: false,
			error: "Не получилось выдать ключ пробы"
		};
	}
}
async function postIngest(token, measured) {
	return await (await fetch("/api/agent/ingest", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			token,
			platform: "web-session",
			networkType: measured.networkType,
			online: measured.online,
			ipv4Ok: measured.ipv4Ok,
			ipv6Ok: measured.ipv6Ok,
			httpsOk: measured.httpsOk,
			udpHint: measured.udpHint,
			latencyMs: measured.latencyMs,
			evidence: measured.evidence,
			fingerprintBucket: measured.fingerprintBucket
		})
	})).json();
}
async function runCabinetProbe(opts) {
	const label = opts.label ?? "это устройство";
	let token = opts.token ?? readStoredToken();
	if (!token) {
		const issued = await issueToken(label, opts.onStep);
		if (!issued.ok) return {
			token: null,
			result: {
				ok: false,
				error: issued.error,
				routes: [],
				advice: null
			}
		};
		token = issued.token;
	} else writeStoredToken(token);
	const measured = await runBrowserDiagnostics(opts.onStep);
	opts.onStep?.("отправляю замер");
	let body = await postIngest(token, measured);
	if (!body.ok && body.error === "unknown token") {
		writeStoredToken(null);
		const issued = await issueToken(label, opts.onStep);
		if (!issued.ok) return {
			token: null,
			result: {
				ok: false,
				error: issued.error,
				routes: [],
				advice: null
			}
		};
		token = issued.token;
		opts.onStep?.("отправляю замер");
		body = await postIngest(token, measured);
	}
	if (!body.ok) return {
		token,
		result: {
			ok: false,
			error: friendlyIngestError(body.error),
			routes: [],
			advice: null,
			evidence: measured.evidence,
			latencyMs: measured.latencyMs
		}
	};
	return {
		token,
		result: {
			ok: true,
			id: body.id,
			classification: body.classification,
			routes: asRoutes(body.routes),
			advice: asAdvice(body.advice),
			evidence: measured.evidence,
			latencyMs: measured.latencyMs
		}
	};
}
//#endregion
export { runCabinetProbe as t };
