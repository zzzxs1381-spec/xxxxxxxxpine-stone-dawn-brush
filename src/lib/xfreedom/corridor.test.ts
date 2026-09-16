import assert from "node:assert/strict";
import test from "node:test";
import { EDGE_NODES } from "./catalog.ts";
import { scoreRoutes } from "./classify.ts";
import { buildCorridor, pickSni } from "./corridor.ts";

test("UDP down prefers quiet TCP, not Hysteria", () => {
  const routes = scoreRoutes("UDP_UNAVAILABLE", EDGE_NODES);
  assert.ok(routes.length >= 1);
  assert.notEqual(routes[0]?.transport, "HYSTERIA2");
});

test("TLS trouble prefers a form that is not plain SNI-TCP", () => {
  const routes = scoreRoutes("TLS_HANDSHAKE_INTERFERENCE", EDGE_NODES);
  assert.ok(["HYSTERIA2", "AMNEZIAWG", "TLS13_SNI"].includes(String(routes[0]?.transport)));
});

test("cover SNI uses a live handshake, not a guess", () => {
  const picked = pickSni([
    { check: "tls-sni:instagram.com", result: "fail" },
    { check: "tls-sni:www.apple.com", result: "ok" },
  ]);
  assert.equal(picked.sni, "www.apple.com");
  assert.equal(picked.coverOk, true);
});

test("IPv6 is prefer only with evidence", () => {
  const a = buildCorridor({
    classification: "NO_BLOCK_DETECTED",
    routes: scoreRoutes("NO_BLOCK_DETECTED", EDGE_NODES),
    ipv6Ok: true,
    nodes: EDGE_NODES,
  });
  const b = buildCorridor({
    classification: "NO_BLOCK_DETECTED",
    routes: scoreRoutes("NO_BLOCK_DETECTED", EDGE_NODES),
    ipv6Ok: null,
    nodes: EDGE_NODES,
  });
  assert.equal(a.ipv6, "prefer");
  assert.equal(b.ipv6, "off");
  assert.equal(a.tunnel, false);
  assert.equal(a.alwaysOn, true);
});

test("UDP down recipe forbids games on the primary hop", () => {
  const routes = scoreRoutes("UDP_UNAVAILABLE", EDGE_NODES);
  const recipe = buildCorridor({
    classification: "UDP_UNAVAILABLE",
    routes,
    evidence: [
      { check: "udp-dns", result: "fail" },
      { check: "tls-sni:www.microsoft.com", result: "ok" },
    ],
    ipv6Ok: false,
    fromLabel: "Moscow",
    nodes: EDGE_NODES,
  });
  assert.equal(recipe.udp, false);
  assert.equal(recipe.sni, "www.microsoft.com");
  assert.equal(recipe.hops[0]?.gamesOk, false);
  assert.equal(recipe.tunnel, false);
});

test("SSH is last hop when doors are filtered, never the first", () => {
  const routes = scoreRoutes("TCP_PORT_FILTERING", EDGE_NODES);
  assert.ok(routes.length >= 3);
  assert.notEqual(routes[0]?.transport, "SSH_TCP");
  assert.equal(routes[2]?.transport, "SSH_TCP");
});
