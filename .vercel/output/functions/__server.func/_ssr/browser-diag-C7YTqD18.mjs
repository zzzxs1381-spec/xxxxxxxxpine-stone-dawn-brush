import { l as classify } from "./ingest-metrics-CttQDW8G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/browser-diag-C7YTqD18.js
var SERVICE_APPS = [
	{
		id: "telegram",
		label: "Telegram",
		host: "telegram.org",
		url: "https://telegram.org/favicon.ico"
	},
	{
		id: "whatsapp",
		label: "WhatsApp",
		host: "web.whatsapp.com",
		url: "https://web.whatsapp.com/favicon.ico"
	},
	{
		id: "instagram",
		label: "Instagram",
		host: "instagram.com",
		url: "https://www.instagram.com/favicon.ico"
	},
	{
		id: "youtube",
		label: "YouTube",
		host: "youtube.com",
		url: "https://www.youtube.com/favicon.ico"
	}
];
var NOTE = {
	none: "ok · consistent",
	dns: "dns.failure",
	tcp: "tcp_ip.failure",
	http: "http.failure"
};
function load(url, ms) {
	return new Promise((resolve) => {
		const t0 = performance.now();
		const img = new Image();
		let doneOnce = false;
		const done = (ok) => {
			if (doneOnce) return;
			doneOnce = true;
			img.onload = null;
			img.onerror = null;
			resolve({
				ok,
				ms: Math.round(performance.now() - t0)
			});
		};
		const t = window.setTimeout(() => done(false), ms);
		img.onload = () => {
			window.clearTimeout(t);
			done(true);
		};
		img.onerror = () => {
			window.clearTimeout(t);
			done(false);
		};
		img.src = `${url}?t=${Date.now()}`;
	});
}
async function doh(host) {
	try {
		const ctrl = new AbortController();
		const t = window.setTimeout(() => ctrl.abort(), 1600);
		const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${host}&type=A`, {
			headers: { Accept: "application/dns-json" },
			signal: ctrl.signal
		});
		window.clearTimeout(t);
		const body = await res.json();
		return Boolean(body.Answer?.some((a) => a.type === 1));
	} catch {
		return false;
	}
}
function klass(ok, ms, dohOk) {
	if (ok) return "none";
	if (dohOk && ms < 200) return "dns";
	if (ms >= 1300) return "tcp";
	return "http";
}
async function measureServices() {
	return Promise.all(SERVICE_APPS.map(async (a) => {
		const [hit, dns] = await Promise.all([load(a.url, 1400), doh(a.host)]);
		const block = klass(hit.ok, hit.ms, dns);
		return {
			id: a.id,
			label: a.label,
			host: a.host,
			ms: hit.ms,
			block,
			note: NOTE[block]
		};
	}));
}
function pickTransport(rows) {
	const blocks = rows.map((r) => r.block);
	if (blocks.length === 0) return {
		transport: "hysteria2",
		vector: "unknown",
		sni: "www.cloudflare.com"
	};
	if (blocks.every((b) => b === "none")) return {
		transport: "hysteria2",
		vector: "clean",
		sni: "www.cloudflare.com"
	};
	if (blocks.includes("dns")) return {
		transport: "hysteria2",
		vector: "dns-poison",
		sni: "www.microsoft.com"
	};
	if (blocks.includes("tcp")) return {
		transport: "amneziawg",
		vector: "ip-blackhole",
		sni: "www.cloudflare.com"
	};
	return {
		transport: "vless-reality",
		vector: "sni-filter",
		sni: "www.microsoft.com"
	};
}
function serviceEvidence(rows) {
	return rows.map((r) => ({
		check: `tls-sni:${r.host}`,
		result: r.block === "none" ? "ok" : "fail",
		ms: r.ms ?? void 0,
		detail: r.note
	}));
}
function connection() {
	const n = navigator;
	return n.connection ?? n.mozConnection ?? n.webkitConnection ?? null;
}
async function timedFetch(url, timeoutMs = 5e3) {
	const started = performance.now();
	const ctrl = new AbortController();
	const t = window.setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			cache: "no-store",
			mode: "cors"
		});
		const ms = Math.round(performance.now() - started);
		const text = await res.text().catch(() => "");
		return {
			ok: res.ok,
			ms,
			status: res.status,
			text: text.slice(0, 240)
		};
	} catch {
		return {
			ok: false,
			ms: Math.round(performance.now() - started)
		};
	} finally {
		window.clearTimeout(t);
	}
}
function probeUdp() {
	return new Promise((resolve) => {
		const RTC = window.RTCPeerConnection;
		if (!RTC) {
			resolve({
				hint: "none",
				detail: "WebRTC недоступен"
			});
			return;
		}
		const pc = new RTC({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
		const types = /* @__PURE__ */ new Set();
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			pc.close();
			if (types.has("relay")) resolve({
				hint: "relay",
				detail: "есть relay ICE"
			});
			else if (types.has("srflx")) resolve({
				hint: "srflx",
				detail: "есть srflx — UDP, вероятно, проходит"
			});
			else if (types.has("host")) resolve({
				hint: "host",
				detail: "только host-кандидаты — STUN не подтверждён"
			});
			else resolve({
				hint: "none",
				detail: "ICE-кандидаты не собраны — это не доказательство блока UDP"
			});
		};
		const timer = window.setTimeout(finish, 2800);
		pc.onicecandidate = (ev) => {
			const c = ev.candidate?.candidate ?? "";
			if (c.includes(" typ srflx")) types.add("srflx");
			else if (c.includes(" typ relay")) types.add("relay");
			else if (c.includes(" typ host")) types.add("host");
			if (!ev.candidate) {
				window.clearTimeout(timer);
				finish();
			}
		};
		pc.createDataChannel("xf");
		pc.createOffer().then((o) => pc.setLocalDescription(o));
	});
}
async function runBrowserDiagnostics(onStep) {
	const evidence = [];
	onStep?.("есть ли интернет");
	const online = navigator.onLine;
	evidence.push({
		check: "online",
		result: online ? "online" : "offline"
	});
	const conn = connection();
	const networkType = conn?.effectiveType ?? conn?.type ?? "unknown";
	evidence.push({
		check: "network-info",
		result: networkType,
		detail: conn ? `downlink=${conn.downlink ?? "?"} rtt=${conn.rtt ?? "?"}` : "Network Information API нет"
	});
	onStep?.("мерю кабинет");
	const origin = await timedFetch("/api/agent/health", 4e3);
	evidence.push({
		check: "origin-rtt",
		result: origin.ok ? "ok" : "fail",
		ms: origin.ms,
		detail: `health ${origin.status ?? "n/a"}`
	});
	onStep?.("открывается ли этот сайт");
	const local = await timedFetch("/", 4e3);
	evidence.push({
		check: "same-origin",
		result: local.ok ? "ok" : "fail",
		ms: local.ms,
		detail: `HTTP ${local.status ?? "n/a"}`
	});
	onStep?.("открывается ли обычный интернет");
	const remote = await timedFetch("https://cloudflare.com/cdn-cgi/trace", 5e3);
	let httpsOk = remote.ok;
	let captive = false;
	if (remote.ok && remote.text && !remote.text.includes("fl=") && remote.text.includes("<html")) {
		captive = true;
		httpsOk = false;
	}
	evidence.push({
		check: "https",
		result: captive ? "captive" : remote.ok ? "ok" : "fail",
		ms: remote.ms,
		detail: remote.ok ? "cloudflare trace" : "запрос не прошёл или CORS/сеть"
	});
	onStep?.("быстрая дорога");
	const udp = await probeUdp();
	evidence.push({
		check: "udp-hint",
		result: udp.hint,
		detail: udp.detail
	});
	evidence.push({
		check: "ip-version",
		result: "browser-limited",
		detail: "Браузер не отдаёт raw IP. Версия протокола — только в пробе или нативном клиенте."
	});
	onStep?.("telegram youtube instagram");
	const services = await measureServices();
	evidence.push(...serviceEvidence(services));
	const classification = classify(evidence);
	const latencyMs = [
		remote.ok ? remote.ms : void 0,
		origin.ok ? origin.ms : void 0,
		local.ms
	].filter((n) => typeof n === "number");
	const bestMs = latencyMs.length ? Math.min(...latencyMs) : local.ms;
	const fingerprintBucket = [
		networkType,
		online ? "on" : "off",
		httpsOk ? "https" : "nohttps",
		udp.hint,
		bestMs < 200 ? "lat-low" : bestMs < 800 ? "lat-mid" : "lat-high"
	].join(":");
	return {
		online,
		networkType,
		httpsOk,
		ipv4Ok: httpsOk || origin.ok,
		ipv6Ok: void 0,
		udpHint: udp.hint,
		latencyMs: bestMs,
		classification,
		evidence,
		fingerprintBucket
	};
}
//#endregion
export { serviceEvidence as i, pickTransport as n, runBrowserDiagnostics as r, measureServices as t };
