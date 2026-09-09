import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { Jt as number, Qt as string, Ut as array, Vt as _enum, Wt as boolean, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-D19euZf_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-BdIVESeH.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getAccount = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("471cdbcc2be282be09c1f2e2cbe3d9596cc7c00e90417f4f66c30b458ea4d472"));
var updateProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	displayName: string().trim().max(80).optional(),
	telemetryConsent: boolean().optional()
})).handler(createSsrRpc("e05e2f794d438b49c125b7aa91cd6515218092c594fe462297c3616c4e522b6a"));
var startTrial = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("b8b3201c0590671b534ccc899e5d990e67eb344c3d2b26a693e40f30e7e5cac6"));
var addDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	label: string().trim().min(2).max(40),
	platform: _enum([
		"ANDROID",
		"IOS",
		"DESKTOP"
	])
})).handler(createSsrRpc("556a2d2f4b8fd986bfc41f3407fbf9145db184338f57eef72054139fff172c0e"));
var revokeDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string().min(3) })).handler(createSsrRpc("c92aed5e2004e9bd70c857962ec234d2f1f1772f75fcea211654f21e19323515"));
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
})).handler(createSsrRpc("26bc2d51bd76e7317b1501a0d079e5c164e30ca9bc26af66ac737268ab6366a7"));
var issueAgentToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ label: string().trim().min(2).max(40).default("probe") })).handler(createSsrRpc("387fdfdb0955cdd28dc84b3e70a6ece8f103336f2f5da5ecf94cc1f83f74d3cb"));
var revokeAgentToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string().min(3) })).handler(createSsrRpc("85044fe77992531c04a66d204b910e8fc8a9d6ad4f4b85b61355423fde9f583f"));
var createTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	subject: string().trim().min(4).max(80),
	body: string().trim().min(8).max(2e3)
})).handler(createSsrRpc("4a209084acb0b5b5313f6b2b2af91f8090a16ed2728765f6d4cfc311a91d627c"));
var getDiagnostic = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: string().min(3).max(40) })).handler(createSsrRpc("66a25ed3188fa592738844f871f4f9bd5c76f76ee1325ea1f5391e00a16a731b"));
var askAima = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	classification: string().max(48),
	evidenceText: string().max(2500),
	diagnosticId: string().max(40).optional(),
	source: string().max(20).optional()
})).handler(createSsrRpc("6c798fc653a6a9a68b4494988224cf66d5d2235e18c960873c0321ca4ac03256"));
var getIngestMetrics = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("47910efacd4f0a5515f826e9c1bd5ebc6820412f0b56e7809367c20293dc318d"));
var getLiveTape = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("ab989e86fc49822bcc8ef89070621eb4eb97920a8f6b85073fc33e70a22d534d"));
//#endregion
export { getDiagnostic as a, issueAgentToken as c, saveDiagnostic as d, startTrial as f, getAccount as i, revokeAgentToken as l, askAima as n, getIngestMetrics as o, updateProfile as p, createTicket as r, getLiveTape as s, addDevice as t, revokeDevice as u };
