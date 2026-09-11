import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { Jt as number, Qt as string, Ut as array, Vt as _enum, Wt as boolean, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-BwvtoFqX.mjs";
import { C as summarizeLive, S as summarizeIngest, a as asEvidence, h as loadIngestEvents, i as asAdvice, m as hashToken, o as asRoutes, p as getSql, v as persistDiagnostic } from "./ingest-metrics-CttQDW8G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-BlyphY3y.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function rid(prefix) {
	return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
}
async function ensureProfileRow(sql, userId) {
	await sql`
    insert into xf_profiles (user_id)
    values (${userId})
    on conflict (user_id) do nothing
  `;
}
var getAccount_createServerFn_handler = createServerRpc({
	id: "471cdbcc2be282be09c1f2e2cbe3d9596cc7c00e90417f4f66c30b458ea4d472",
	name: "getAccount",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => getAccount.__executeServer(opts));
var getAccount = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getAccount_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfileRow(sql, context.userId);
	const [profile] = await sql`select user_id, display_name, plan_code, subscription_status, trial_started_at, trial_ends_at, telemetry_consent from xf_profiles where user_id = ${context.userId}`;
	const devices = await sql`select id, label, platform, status, last_seen_at, created_at from xf_devices where user_id = ${context.userId} order by created_at desc`;
	const diagnostics = await sql`select id, network_type, online, latency_ms, classification, source, platform, https_ok, route_json, advice_json, created_at from xf_diagnostics where user_id = ${context.userId} order by created_at desc limit 20`;
	const tickets = await sql`select id, subject, status, created_at from xf_tickets where user_id = ${context.userId} order by created_at desc limit 8`;
	const notes = await sql`select id, summary, created_at from xf_aima_notes where user_id = ${context.userId} order by created_at desc limit 6`;
	const agents = await sql`select id, token_prefix, label, status, last_seen_at, created_at from xf_agent_tokens where user_id = ${context.userId} order by created_at desc`;
	const ingest24 = await sql`
      select outcome, count(*)::int as c
      from xf_ingest_events
      where user_id = ${context.userId} and created_at > now() - interval '24 hours'
      group by outcome
    `;
	const [lastIngest] = await sql`
      select outcome, created_at, classification
      from xf_ingest_events
      where user_id = ${context.userId}
      order by created_at desc
      limit 1
    `;
	const ingestOk = ingest24.find((r) => r.outcome === "OK")?.c ?? 0;
	const ingestFail = ingest24.reduce((a, r) => a + (r.outcome === "OK" ? 0 : r.c), 0);
	return {
		profile,
		devices,
		diagnostics: diagnostics.map((d) => ({
			...d,
			route_json: asRoutes(d.route_json),
			advice_json: asAdvice(d.advice_json)
		})),
		tickets,
		notes,
		agents,
		ingest: {
			ok24: ingestOk,
			fail24: ingestFail,
			lastAt: lastIngest?.created_at ?? null,
			lastOutcome: lastIngest?.outcome ?? null,
			lastClassification: lastIngest?.classification ?? null
		}
	};
});
var updateProfile_createServerFn_handler = createServerRpc({
	id: "e05e2f794d438b49c125b7aa91cd6515218092c594fe462297c3616c4e522b6a",
	name: "updateProfile",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => updateProfile.__executeServer(opts));
var updateProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	displayName: string().trim().max(80).optional(),
	telemetryConsent: boolean().optional()
})).handler(updateProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureProfileRow(sql, context.userId);
	if (data.displayName !== void 0) await sql`update xf_profiles set display_name = ${data.displayName}, updated_at = now() where user_id = ${context.userId}`;
	if (data.telemetryConsent !== void 0) await sql`update xf_profiles set telemetry_consent = ${data.telemetryConsent}, updated_at = now() where user_id = ${context.userId}`;
	return { ok: true };
});
var startTrial_createServerFn_handler = createServerRpc({
	id: "b8b3201c0590671b534ccc899e5d990e67eb344c3d2b26a693e40f30e7e5cac6",
	name: "startTrial",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => startTrial.__executeServer(opts));
var startTrial = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(startTrial_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfileRow(sql, context.userId);
	const [row] = await sql`
      select subscription_status from xf_profiles where user_id = ${context.userId}
    `;
	if (row?.subscription_status === "ACTIVE" || row?.subscription_status === "TRIAL") return {
		ok: true,
		already: true
	};
	await sql`
      update xf_profiles
      set plan_code = 'trial',
          subscription_status = 'TRIAL',
          trial_started_at = now(),
          trial_ends_at = now() + interval '7 days',
          updated_at = now()
      where user_id = ${context.userId}
    `;
	return {
		ok: true,
		already: false
	};
});
var addDevice_createServerFn_handler = createServerRpc({
	id: "556a2d2f4b8fd986bfc41f3407fbf9145db184338f57eef72054139fff172c0e",
	name: "addDevice",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => addDevice.__executeServer(opts));
var addDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	label: string().trim().min(2).max(40),
	platform: _enum([
		"ANDROID",
		"IOS",
		"DESKTOP"
	])
})).handler(addDevice_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (((await sql`select count(*)::int as c from xf_devices where user_id = ${context.userId} and status <> 'REVOKED'`)[0]?.c ?? 0) >= 8) return {
		ok: false,
		error: "Достигнут лимит устройств"
	};
	const id = rid("dev");
	await sql`
      insert into xf_devices (id, user_id, label, platform, status, last_seen_at)
      values (${id}, ${context.userId}, ${data.label}, ${data.platform}, 'REGISTERED', now())
    `;
	return {
		ok: true,
		id
	};
});
var revokeDevice_createServerFn_handler = createServerRpc({
	id: "c92aed5e2004e9bd70c857962ec234d2f1f1772f75fcea211654f21e19323515",
	name: "revokeDevice",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => revokeDevice.__executeServer(opts));
var revokeDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string().min(3) })).handler(revokeDevice_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`update xf_devices set status = 'REVOKED' where id = ${data.id} and user_id = ${context.userId}`;
	return { ok: true };
});
var saveDiagnostic_createServerFn_handler = createServerRpc({
	id: "26bc2d51bd76e7317b1501a0d079e5c164e30ca9bc26af66ac737268ab6366a7",
	name: "saveDiagnostic",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => saveDiagnostic.__executeServer(opts));
var saveDiagnostic = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	networkType: string().max(40).optional(),
	online: boolean(),
	ipv4Ok: boolean().optional(),
	ipv6Ok: boolean().optional(),
	httpsOk: boolean(),
	udpHint: string().max(20).optional(),
	latencyMs: number().int().min(0).max(6e4).optional(),
	classification: string().min(3).max(48).optional(),
	evidence: array(object({
		check: string(),
		result: string(),
		detail: string().optional(),
		ms: number().optional()
	})),
	fingerprintBucket: string().max(64).optional()
})).handler(saveDiagnostic_createServerFn_handler, async ({ context, data }) => {
	const saved = await persistDiagnostic({
		userId: context.userId,
		source: "BROWSER",
		networkType: data.networkType,
		online: data.online,
		ipv4Ok: data.ipv4Ok,
		ipv6Ok: data.ipv6Ok,
		httpsOk: data.httpsOk,
		udpHint: data.udpHint,
		latencyMs: data.latencyMs,
		evidence: data.evidence,
		fingerprintBucket: data.fingerprintBucket
	});
	return {
		ok: true,
		id: saved.id,
		classification: saved.classification,
		routes: saved.routes,
		advice: saved.advice
	};
});
var issueAgentToken_createServerFn_handler = createServerRpc({
	id: "387fdfdb0955cdd28dc84b3e70a6ece8f103336f2f5da5ecf94cc1f83f74d3cb",
	name: "issueAgentToken",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => issueAgentToken.__executeServer(opts));
var issueAgentToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ label: string().trim().min(2).max(40).default("probe") })).handler(issueAgentToken_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (((await sql`select count(*)::int as c from xf_agent_tokens where user_id = ${context.userId} and status = 'ACTIVE'`)[0]?.c ?? 0) >= 4) await sql`
        update xf_agent_tokens
        set status = 'REVOKED'
        where id = (
          select id from xf_agent_tokens
          where user_id = ${context.userId} and status = 'ACTIVE'
          order by (label = ${data.label}) desc, created_at asc
          limit 1
        )
        and user_id = ${context.userId}
      `;
	const raw = `xfprobe_${crypto.randomUUID().replaceAll("-", "")}`;
	const tokenHash = await hashToken(raw);
	const id = rid("agt");
	await sql`
      insert into xf_agent_tokens (id, user_id, token_hash, token_prefix, label, status)
      values (${id}, ${context.userId}, ${tokenHash}, ${raw.slice(0, 16)}, ${data.label}, 'ACTIVE')
    `;
	return {
		ok: true,
		id,
		token: raw
	};
});
var revokeAgentToken_createServerFn_handler = createServerRpc({
	id: "85044fe77992531c04a66d204b910e8fc8a9d6ad4f4b85b61355423fde9f583f",
	name: "revokeAgentToken",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => revokeAgentToken.__executeServer(opts));
var revokeAgentToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string().min(3) })).handler(revokeAgentToken_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`update xf_agent_tokens set status = 'REVOKED' where id = ${data.id} and user_id = ${context.userId}`;
	return { ok: true };
});
var createTicket_createServerFn_handler = createServerRpc({
	id: "4a209084acb0b5b5313f6b2b2af91f8090a16ed2728765f6d4cfc311a91d627c",
	name: "createTicket",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => createTicket.__executeServer(opts));
var createTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	subject: string().trim().min(4).max(80),
	body: string().trim().min(8).max(2e3)
})).handler(createTicket_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const id = rid("tkt");
	await sql`
      insert into xf_tickets (id, user_id, subject, body)
      values (${id}, ${context.userId}, ${data.subject}, ${data.body})
    `;
	return {
		ok: true,
		id
	};
});
var getDiagnostic_createServerFn_handler = createServerRpc({
	id: "66a25ed3188fa592738844f871f4f9bd5c76f76ee1325ea1f5391e00a16a731b",
	name: "getDiagnostic",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => getDiagnostic.__executeServer(opts));
var getDiagnostic = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string().min(3).max(40) })).handler(getDiagnostic_createServerFn_handler, async ({ context, data }) => {
	const [row] = await (await getSql())`select id, network_type, online, ipv4_ok, ipv6_ok, https_ok, udp_hint, latency_ms, classification, evidence, fingerprint_bucket, source, platform, route_json, advice_json, created_at from xf_diagnostics where id = ${data.id} and user_id = ${context.userId} limit 1`;
	if (!row) return null;
	return {
		...row,
		evidence: asEvidence(row.evidence),
		route_json: asRoutes(row.route_json),
		advice_json: asAdvice(row.advice_json)
	};
});
var askAima_createServerFn_handler = createServerRpc({
	id: "6c798fc653a6a9a68b4494988224cf66d5d2235e18c960873c0321ca4ac03256",
	name: "askAima",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => askAima.__executeServer(opts));
var askAima = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	classification: string().max(48),
	evidenceText: string().max(2500),
	diagnosticId: string().max(40).optional(),
	source: string().max(20).optional()
})).handler(askAima_createServerFn_handler, async ({ context, data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AIMA сейчас недоступна в этой среде"
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 420,
			messages: [{
				role: "system",
				content: "Ты AIMA — советник XFreedom. Объясняй по-русски просто, как школьнику. Без протоколов в первом абзаце. 1) что видно по замерам 2) чего сайт не знает, потому что он не телефон 3) какую дорогу взять телефону (главная и запасные). Не обещай «подключено». Не обещай связь 24/7 по всей России. Не выдумывай факты."
			}, {
				role: "user",
				content: `Источник: ${data.source ?? "unknown"}\nКласс: ${data.classification}\nEvidence:\n${data.evidenceText}`
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `AIMA недоступна (${res.status})`
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() || "Нет ответа.";
	await (await getSql())`
      insert into xf_aima_notes (id, user_id, source_diagnostic_id, summary)
      values (${rid("aima")}, ${context.userId}, ${data.diagnosticId ?? null}, ${text})
    `;
	return {
		ok: true,
		text
	};
});
var getIngestMetrics_createServerFn_handler = createServerRpc({
	id: "47910efacd4f0a5515f826e9c1bd5ebc6820412f0b56e7809367c20293dc318d",
	name: "getIngestMetrics",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => getIngestMetrics.__executeServer(opts));
var getIngestMetrics = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getIngestMetrics_createServerFn_handler, async ({ context }) => {
	const events = await loadIngestEvents(context.userId, 200);
	return summarizeIngest(events);
});
var getLiveTape_createServerFn_handler = createServerRpc({
	id: "ab989e86fc49822bcc8ef89070621eb4eb97920a8f6b85073fc33e70a22d534d",
	name: "getLiveTape",
	filename: "src/lib/xfreedom/server.ts"
}, (opts) => getLiveTape.__executeServer(opts));
var getLiveTape = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getLiveTape_createServerFn_handler, async ({ context }) => {
	const events = await loadIngestEvents(context.userId, 80);
	return summarizeLive(events);
});
//#endregion
export { addDevice_createServerFn_handler, askAima_createServerFn_handler, createTicket_createServerFn_handler, getAccount_createServerFn_handler, getDiagnostic_createServerFn_handler, getIngestMetrics_createServerFn_handler, getLiveTape_createServerFn_handler, issueAgentToken_createServerFn_handler, revokeAgentToken_createServerFn_handler, revokeDevice_createServerFn_handler, saveDiagnostic_createServerFn_handler, startTrial_createServerFn_handler, updateProfile_createServerFn_handler };
