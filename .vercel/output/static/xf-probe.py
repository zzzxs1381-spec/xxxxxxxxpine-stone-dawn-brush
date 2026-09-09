#!/usr/bin/env python3
"""XFreedom network probe. Measures the local path and POSTs evidence.
Not a VPN. Does not inspect payloads or browsing history.
Server re-classifies from evidence; local class is only printed.
"""
from __future__ import annotations

import argparse
import json
import socket
import ssl
import sys
import time
import urllib.error
import urllib.request

TARGETS_TCP = [("1.1.1.1", 443), ("8.8.8.8", 53), ("1.1.1.1", 80), ("9.9.9.9", 853)]
HTTPS_URL = "https://cloudflare.com/cdn-cgi/trace"
DNS_NAME = "cloudflare.com"
TLS_HOST = "cloudflare.com"
SNI_HOSTS = ("www.youtube.com", "www.instagram.com", "twitter.com")


def timed_tcp(host: str, port: int, timeout: float = 3.0) -> dict:
    start = time.perf_counter()
    try:
        with socket.create_connection((host, port), timeout=timeout):
            ms = int((time.perf_counter() - start) * 1000)
            return {"check": f"tcp:{host}:{port}", "result": "ok", "ms": ms}
    except OSError as exc:
        ms = int((time.perf_counter() - start) * 1000)
        return {"check": f"tcp:{host}:{port}", "result": "fail", "ms": ms, "detail": str(exc)[:80]}


def timed_udp_dns(timeout: float = 2.5) -> dict:
    payload = bytes.fromhex("000101000001000000000000076578616d706c6503636f6d0000010001")
    start = time.perf_counter()
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(timeout)
    try:
        sock.sendto(payload, ("1.1.1.1", 53))
        data, _ = sock.recvfrom(512)
        ms = int((time.perf_counter() - start) * 1000)
        return {"check": "udp-dns", "result": "ok" if data else "fail", "ms": ms, "detail": f"{len(data)}b"}
    except OSError as exc:
        ms = int((time.perf_counter() - start) * 1000)
        return {"check": "udp-dns", "result": "fail", "ms": ms, "detail": str(exc)[:80]}
    finally:
        sock.close()


def timed_https() -> dict:
    start = time.perf_counter()
    ctx = ssl.create_default_context()
    req = urllib.request.Request(HTTPS_URL, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=5, context=ctx) as res:
            body = res.read(240).decode("utf-8", "replace")
            ms = int((time.perf_counter() - start) * 1000)
            ok = res.status == 200
            captive = "<html" in body.lower() and "fl=" not in body
            return {
                "check": "https",
                "result": "captive" if captive else ("ok" if ok else "fail"),
                "ms": ms,
                "detail": "cloudflare trace",
            }
    except Exception as exc:  # noqa: BLE001 — probe must stay running
        ms = int((time.perf_counter() - start) * 1000)
        return {"check": "https", "result": "fail", "ms": ms, "detail": str(exc)[:80]}


def tls_handshake(host: str = TLS_HOST, port: int = 443) -> dict:
    start = time.perf_counter()
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((host, port), timeout=4) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                ms = int((time.perf_counter() - start) * 1000)
                return {"check": "tls", "result": "ok", "ms": ms, "detail": ssock.version() or "tls"}
    except Exception as exc:  # noqa: BLE001
        ms = int((time.perf_counter() - start) * 1000)
        return {"check": "tls", "result": "fail", "ms": ms, "detail": str(exc)[:80]}


def tls_sni(host: str) -> dict:
    start = time.perf_counter()
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((host, 443), timeout=4) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                ms = int((time.perf_counter() - start) * 1000)
                return {
                    "check": f"tls-sni:{host}",
                    "result": "ok",
                    "ms": ms,
                    "detail": ssock.version() or "tls",
                }
    except Exception as exc:  # noqa: BLE001
        ms = int((time.perf_counter() - start) * 1000)
        text = str(exc)[:80]
        return {"check": f"tls-sni:{host}", "result": "fail", "ms": ms, "detail": text}


def ipv6_hint() -> dict:
    start = time.perf_counter()
    try:
        with socket.create_connection(("2606:4700:4700::1111", 443), timeout=3):
            ms = int((time.perf_counter() - start) * 1000)
            return {"check": "ipv6", "result": "ok", "ms": ms}
    except OSError as exc:
        ms = int((time.perf_counter() - start) * 1000)
        return {"check": "ipv6", "result": "fail", "ms": ms, "detail": str(exc)[:80]}


def dns_resolve() -> dict:
    start = time.perf_counter()
    try:
        infos = socket.getaddrinfo(DNS_NAME, 443, type=socket.SOCK_STREAM)
        ms = int((time.perf_counter() - start) * 1000)
        families = sorted({str(i[0]).replace("AddressFamily.", "") for i in infos})
        return {"check": "dns", "result": "ok", "ms": ms, "detail": ",".join(families)[:80]}
    except OSError as exc:
        ms = int((time.perf_counter() - start) * 1000)
        return {"check": "dns", "result": "fail", "ms": ms, "detail": str(exc)[:80]}


def origin_rtt(url: str) -> dict:
    start = time.perf_counter()
    req = urllib.request.Request(url.rstrip("/") + "/api/agent/health", method="GET")
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            ms = int((time.perf_counter() - start) * 1000)
            return {"check": "origin-rtt", "result": "ok" if res.status < 300 else "fail", "ms": ms}
    except Exception as exc:  # noqa: BLE001
        ms = int((time.perf_counter() - start) * 1000)
        return {"check": "origin-rtt", "result": "fail", "ms": ms, "detail": str(exc)[:80]}


def main() -> int:
    parser = argparse.ArgumentParser(description="XFreedom probe")
    parser.add_argument("--url", required=True, help="Origin of the XFreedom web app")
    parser.add_argument("--token", required=True, help="xfprobe_ token from the cabinet")
    args = parser.parse_args()

    evidence = [{"check": "online", "result": "online"}]
    evidence.append(origin_rtt(args.url))
    evidence.extend(timed_tcp(*t) for t in TARGETS_TCP)
    evidence.append(timed_udp_dns())
    evidence.append(tls_handshake())
    evidence.extend(tls_sni(h) for h in SNI_HOSTS)
    evidence.append(timed_https())
    evidence.append(ipv6_hint())
    evidence.append(dns_resolve())

    https = next((e for e in evidence if e["check"] == "https"), {})
    udp = next((e for e in evidence if e["check"] == "udp-dns"), {})
    v6 = next((e for e in evidence if e["check"] == "ipv6"), {})
    tcp_ok = any(e["check"].startswith("tcp:") and e["result"] == "ok" for e in evidence)
    payload = {
        "token": args.token,
        "platform": sys.platform,
        "networkType": "agent",
        "online": True,
        "ipv4Ok": tcp_ok,
        "ipv6Ok": v6.get("result") == "ok",
        "httpsOk": https.get("result") == "ok",
        "udpHint": "ok" if udp.get("result") == "ok" else "fail",
        "latencyMs": https.get("ms") or 0,
        "evidence": evidence,
        "fingerprintBucket": f"agent:{sys.platform}",
    }
    endpoint = args.url.rstrip("/") + "/api/agent/ingest"
    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {args.token}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            body = res.read().decode("utf-8", "replace")
            print(body)
            return 0 if res.status < 300 else 1
    except urllib.error.HTTPError as exc:
        print(exc.read().decode("utf-8", "replace"), file=sys.stderr)
        return 1
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
