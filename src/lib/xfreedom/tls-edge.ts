import { spawnSync } from "node:child_process";
import { createHash, generateKeyPairSync, X509Certificate } from "node:crypto";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { connect as netConnect, type Socket } from "node:net";
import { createServer as createTlsServer, connect as tlsConnect, type TLSSocket } from "node:tls";

export const XF_ALPN = "xf-tls1";
export const XF_SNI = "www.cloudflare.com";
export const XF_PORT = 8444;
export const XF_HOST = "127.0.0.1";

export const TYPE = {
  OPEN: 1,
  OPEN_OK: 2,
  OPEN_ERR: 3,
  DATA: 4,
  CLOSE: 5,
  PING: 6,
  PONG: 7,
} as const;

type Frame = { type: number; payload: Buffer };

export function encodeFrame(type: number, payload: Buffer) {
  const out = Buffer.alloc(4 + 1 + payload.length);
  out.writeUInt32BE(1 + payload.length, 0);
  out.writeUInt8(type, 4);
  payload.copy(out, 5);
  return out;
}

export function decodeFrames(buf: Buffer): { frames: Frame[]; rest: Buffer } {
  const frames: Frame[] = [];
  let offset = 0;
  while (buf.length - offset >= 5) {
    const len = buf.readUInt32BE(offset);
    if (len < 1 || len > 1_000_000) break;
    if (buf.length - offset < 4 + len) break;
    const type = buf.readUInt8(offset + 4);
    const payload = buf.subarray(offset + 5, offset + 4 + len);
    frames.push({ type, payload: Buffer.from(payload) });
    offset += 4 + len;
  }
  return { frames, rest: buf.subarray(offset) };
}

export function openPayload(id: number, host: string, port: number) {
  const hostBuf = Buffer.from(host, "utf8");
  const p = Buffer.alloc(4 + 2 + 2 + hostBuf.length);
  p.writeUInt32BE(id, 0);
  p.writeUInt16BE(port, 4);
  p.writeUInt16BE(hostBuf.length, 6);
  hostBuf.copy(p, 8);
  return p;
}

export function parseOpen(payload: Buffer) {
  if (payload.length < 8) return null;
  const id = payload.readUInt32BE(0);
  const port = payload.readUInt16BE(4);
  const hl = payload.readUInt16BE(6);
  if (payload.length < 8 + hl) return null;
  const host = payload.subarray(8, 8 + hl).toString("utf8");
  return { id, host, port };
}

export function idPayload(id: number, extra: Buffer = Buffer.alloc(0)) {
  const p = Buffer.alloc(4 + extra.length);
  p.writeUInt32BE(id, 0);
  extra.copy(p, 4);
  return p;
}

function pemEcSelfSigned(cn: string) {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const keyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  const cert = makeCert(keyPem, cn);
  return { keyPem, certPem: cert.pem, pinSha256: cert.pin };
}

function makeCert(keyPem: string, cn: string) {
  const dir = mkdtempSync(join(tmpdir(), "xf-tls-"));
  const keyPath = join(dir, "key.pem");
  const certPath = join(dir, "cert.pem");
  const confPath = join(dir, "openssl.cnf");
  writeFileSync(keyPath, keyPem);
  writeFileSync(
    confPath,
    `[req]
distinguished_name = dn
x509_extensions = ext
prompt = no
[dn]
CN = ${cn}
[ext]
subjectAltName = DNS:${cn},DNS:localhost,IP:127.0.0.1
keyUsage = digitalSignature,keyEncipherment
extendedKeyUsage = serverAuth
`,
  );
  const r = spawnSync(
    "openssl",
    ["req", "-x509", "-new", "-key", keyPath, "-out", certPath, "-days", "365", "-config", confPath, "-sha256"],
    { encoding: "utf8" },
  );
  if (r.status !== 0) throw new Error(r.stderr || "openssl cert failed");
  const certPem = readFileSync(certPath, "utf8");
  const x = new X509Certificate(certPem);
  const pin = createHash("sha256").update(x.raw).digest("hex");
  return { pem: certPem, pin };
}

export type EdgeStatus = {
  ok: boolean;
  listen: string;
  sni: string;
  alpn: string;
  pinSha256: string;
  startedAt: number;
  handshakes: number;
};

type EdgeState = {
  status: EdgeStatus;
  close: () => Promise<void>;
};

let edge: EdgeState | null = null;

function allowOpen(host: string, port: number, token: string) {
  if (token === "xf-selftest") return host === "127.0.0.1" && port > 0 && port < 65536;
  if (!token.startsWith("xfprobe_")) return false;
  if (host === "127.0.0.1" || host === "localhost") return true;
  return false;
}

export async function ensureTlsEdge(): Promise<EdgeStatus> {
  if (edge) return edge.status;
  const { keyPem, certPem, pinSha256 } = pemEcSelfSigned(XF_SNI);
  let handshakes = 0;
  const server = createTlsServer(
    {
      key: keyPem,
      cert: certPem,
      minVersion: "TLSv1.3",
      maxVersion: "TLSv1.3",
      ALPNProtocols: [XF_ALPN],
    },
    (socket) => {
      handshakes += 1;
      edge && (edge.status.handshakes = handshakes);
      void handleClient(socket);
    },
  );
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(XF_PORT, XF_HOST, () => resolve());
  });
  server.unref();
  const status: EdgeStatus = {
    ok: true,
    listen: `${XF_HOST}:${XF_PORT}`,
    sni: XF_SNI,
    alpn: XF_ALPN,
    pinSha256,
    startedAt: Date.now(),
    handshakes: 0,
  };
  edge = {
    status,
    close: () =>
      new Promise((resolve) => {
        server.close(() => {
          edge = null;
          resolve();
        });
      }),
  };
  return status;
}

export function tlsEdgeStatus(): EdgeStatus | null {
  return edge?.status ?? null;
}

export async function stopTlsEdge() {
  if (!edge) return;
  await edge.close();
}

async function handleClient(socket: TLSSocket) {
  const streams = new Map<number, Socket>();
  let auth = "";
  let buf = Buffer.alloc(0);
  let authed = false;
  const write = (type: number, payload: Buffer) => {
    if (socket.destroyed) return;
    socket.write(encodeFrame(type, payload));
  };
  socket.on("data", (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    if (!authed) {
      const nl = buf.indexOf(0x0a);
      if (nl < 0) return;
      const line = buf.subarray(0, nl).toString("utf8").trim();
      buf = buf.subarray(nl + 1);
      const m = /^AUTH\s+(\S+)/.exec(line);
      if (!m) {
        socket.end("NO\n");
        return;
      }
      auth = m[1]!;
      authed = true;
      socket.write(`OK ${Date.now().toString(36)}\n`);
    }
    const decoded = decodeFrames(buf);
    buf = decoded.rest;
    for (const fr of decoded.frames) {
      if (fr.type === TYPE.PING) write(TYPE.PONG, fr.payload);
      else if (fr.type === TYPE.OPEN) {
        const o = parseOpen(fr.payload);
        if (!o || !allowOpen(o.host, o.port, auth)) {
          write(TYPE.OPEN_ERR, idPayload(o?.id ?? 0));
          continue;
        }
        const dest = netConnect({ host: o.host, port: o.port }, () => write(TYPE.OPEN_OK, idPayload(o.id)));
        dest.on("data", (d: Buffer) => write(TYPE.DATA, idPayload(o.id, d)));
        dest.on("close", () => {
          write(TYPE.CLOSE, idPayload(o.id));
          streams.delete(o.id);
        });
        dest.on("error", () => {
          write(TYPE.OPEN_ERR, idPayload(o.id));
          streams.delete(o.id);
        });
        streams.set(o.id, dest);
      } else if (fr.type === TYPE.DATA) {
        if (fr.payload.length < 4) continue;
        const id = fr.payload.readUInt32BE(0);
        streams.get(id)?.write(fr.payload.subarray(4));
      } else if (fr.type === TYPE.CLOSE) {
        if (fr.payload.length < 4) continue;
        const id = fr.payload.readUInt32BE(0);
        streams.get(id)?.end();
        streams.delete(id);
      }
    }
  });
  socket.on("error", () => {
    for (const s of streams.values()) s.destroy();
  });
  socket.on("close", () => {
    for (const s of streams.values()) s.destroy();
  });
}

export type SelftestResult = {
  ok: boolean;
  handshakeMs: number;
  echoMs: number;
  sni: string;
  alpn: string | false;
  pinSha256: string;
  tlsVersion: string | undefined;
  bytes: number;
  error?: string;
};

export async function runTlsSelftest(): Promise<SelftestResult> {
  const status = await ensureTlsEdge();
  const echoPort = await startEcho();
  const t0 = Date.now();
  try {
    const sock = await new Promise<TLSSocket>((resolve, reject) => {
      const s = tlsConnect(
        {
          host: XF_HOST,
          port: XF_PORT,
          servername: XF_SNI,
          minVersion: "TLSv1.3",
          maxVersion: "TLSv1.3",
          ALPNProtocols: [XF_ALPN],
          rejectUnauthorized: false,
        },
        () => resolve(s),
      );
      s.once("error", reject);
    });
    const handshakeMs = Date.now() - t0;
    const x = sock.getPeerX509Certificate();
    const pin = x ? createHash("sha256").update(x.raw).digest("hex") : "";
    if (pin !== status.pinSha256) {
      sock.destroy();
      return { ok: false, handshakeMs, echoMs: 0, sni: XF_SNI, alpn: sock.alpnProtocol, pinSha256: pin, tlsVersion: sock.getProtocol() ?? undefined, bytes: 0, error: "pin mismatch" };
    }
    sock.write("AUTH xf-selftest\n");
    const first = await readUntil(sock, (b) => b.includes(0x0a));
    if (!first.toString("utf8").startsWith("OK ")) {
      sock.destroy();
      return { ok: false, handshakeMs, echoMs: 0, sni: XF_SNI, alpn: sock.alpnProtocol, pinSha256: pin, tlsVersion: sock.getProtocol() ?? undefined, bytes: 0, error: "auth failed" };
    }
    const t1 = Date.now();
    sock.write(encodeFrame(TYPE.OPEN, openPayload(1, "127.0.0.1", echoPort)));
    let rest = first.subarray(first.indexOf(0x0a) + 1);
    let opened = false;
    let body = Buffer.alloc(0);
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline) {
      const chunk = await readMore(sock, 4000 - (Date.now() - t1));
      if (!chunk) break;
      rest = Buffer.concat([rest, chunk]);
      const dec = decodeFrames(rest);
      rest = dec.rest;
      for (const fr of dec.frames) {
        if (fr.type === TYPE.OPEN_OK) opened = true;
        if (fr.type === TYPE.OPEN_ERR) throw new Error("open err");
        if (fr.type === TYPE.DATA && fr.payload.length > 4) body = Buffer.concat([body, fr.payload.subarray(4)]);
      }
      if (opened && body.length === 0) sock.write(encodeFrame(TYPE.DATA, idPayload(1, Buffer.from("GET / HTTP/1.1\r\nHost: local\r\nConnection: close\r\n\r\n"))));
      if (body.includes(Buffer.from("xf-echo-ok"))) break;
    }
    sock.write(encodeFrame(TYPE.CLOSE, idPayload(1)));
    sock.end();
    const ok = body.includes(Buffer.from("xf-echo-ok"));
    return {
      ok,
      handshakeMs,
      echoMs: Date.now() - t1,
      sni: XF_SNI,
      alpn: sock.alpnProtocol,
      pinSha256: pin,
      tlsVersion: sock.getProtocol() ?? undefined,
      bytes: body.length,
      error: ok ? undefined : "echo missing",
    };
  } catch (err) {
    return {
      ok: false,
      handshakeMs: Date.now() - t0,
      echoMs: 0,
      sni: XF_SNI,
      alpn: false,
      pinSha256: status.pinSha256,
      tlsVersion: undefined,
      bytes: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    stopEcho(echoPort);
  }
}

const echoes = new Map<number, { close: () => void }>();

function startEcho(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("xf-echo-ok");
      void req;
    });
    s.listen(0, "127.0.0.1", () => {
      const addr = s.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("echo bind"));
        return;
      }
      echoes.set(addr.port, { close: () => s.close() });
      resolve(addr.port);
    });
    s.once("error", reject);
  });
}

function stopEcho(port: number) {
  echoes.get(port)?.close();
  echoes.delete(port);
}

function readUntil(socket: TLSSocket, pred: (b: Buffer) => boolean): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let acc = Buffer.alloc(0);
    const onData = (c: Buffer) => {
      acc = Buffer.concat([acc, c]);
      if (pred(acc)) {
        cleanup();
        resolve(acc);
      }
    };
    const onErr = (e: Error) => {
      cleanup();
      reject(e);
    };
    const t = setTimeout(() => {
      cleanup();
      reject(new Error("read timeout"));
    }, 3000);
    const cleanup = () => {
      clearTimeout(t);
      socket.off("data", onData);
      socket.off("error", onErr);
    };
    socket.on("data", onData);
    socket.on("error", onErr);
  });
}

function readMore(socket: TLSSocket, ms: number): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => {
      socket.off("data", onData);
      resolve(null);
    }, Math.max(50, ms));
    const onData = (c: Buffer) => {
      clearTimeout(t);
      socket.off("data", onData);
      resolve(c);
    };
    socket.once("data", onData);
  });
}
