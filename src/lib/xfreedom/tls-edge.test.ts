import assert from "node:assert/strict";
import test from "node:test";
import { decodeFrames, encodeFrame, openPayload, parseOpen, runTlsSelftest, stopTlsEdge, TYPE } from "./tls-edge.ts";

test("frames round-trip", () => {
  const a = encodeFrame(TYPE.OPEN, openPayload(7, "127.0.0.1", 80));
  const b = encodeFrame(TYPE.DATA, Buffer.from("hi"));
  const { frames, rest } = decodeFrames(Buffer.concat([a, b]));
  assert.equal(rest.length, 0);
  assert.equal(frames.length, 2);
  assert.equal(frames[0]?.type, TYPE.OPEN);
  const o = parseOpen(frames[0]!.payload);
  assert.equal(o?.id, 7);
  assert.equal(o?.host, "127.0.0.1");
  assert.equal(o?.port, 80);
});

test("TLS 1.3 SNI pin AUTH OPEN echo", async () => {
  const r = await runTlsSelftest();
  await stopTlsEdge();
  assert.equal(r.ok, true, r.error);
  assert.ok(r.handshakeMs >= 0 && r.handshakeMs < 4000);
  assert.equal(r.sni, "www.cloudflare.com");
  assert.equal(r.alpn, "xf-tls1");
  assert.ok((r.pinSha256 || "").length === 64);
  assert.ok(r.bytes > 0);
});
