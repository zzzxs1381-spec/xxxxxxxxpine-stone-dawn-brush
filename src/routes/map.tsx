import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { EDGE_NODES, type NodeHealth } from "@/lib/xfreedom/catalog";
import { Pill } from "@/components/ui";
import { ServicePicture } from "@/components/xf";
import { OONI_PACK } from "@/lib/xfreedom/ooni";

export const Route = createFileRoute("/map")({ component: MapPage });

const healthTone: Record<NodeHealth, "ok" | "warn" | "bad" | "muted"> = {
  HEALTHY: "ok",
  RECOVERING: "warn",
  DEGRADED: "warn",
  DRAINING: "muted",
  FAILED: "bad",
};

function healthWord(h: NodeHealth) {
  if (h === "HEALTHY") return "жива";
  if (h === "FAILED") return "нет";
  if (h === "DEGRADED") return "слабая";
  if (h === "DRAINING") return "сворачивается";
  return "оживает";
}

function MapPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Карта</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Города-дороги</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Это список улиц, которые система рассматривает. Нажать на точку нельзя — это не кнопка «подключиться к
          Варшаве». Твой точный адрес не показывается.
        </p>
        <div className="panel relative mt-8 overflow-hidden p-4 md:p-8">
          <div className="relative min-h-72 w-full md:min-h-96">
            {EDGE_NODES.map((n) => (
              <div
                key={n.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                <span
                  className={`block size-2.5 rounded-full ${
                    n.health === "HEALTHY" ? "bg-ok" : n.health === "FAILED" ? "bg-bad" : "bg-warn"
                  }`}
                />
                <span className="mt-1 block whitespace-nowrap font-mono text-xs text-muted">{n.city}</span>
              </div>
            ))}
          </div>
        </div>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {EDGE_NODES.map((n) => (
            <li key={n.id} className="panel flex items-start justify-between gap-3 p-4">
              <div>
                <p className="text-sm">
                  {n.city}, {n.country}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {n.transports.includes("HYSTERIA2") ? "быстрая" : ""}
                  {n.transports.includes("HYSTERIA2") && n.transports.includes("VLESS_REALITY") ? " и " : ""}
                  {n.transports.includes("VLESS_REALITY") ? "тихая" : ""}
                  {n.transports.includes("AMNEZIAWG") ? " · другая форма" : ""}
                </p>
              </div>
              <Pill tone={healthTone[n.health]}>{healthWord(n.health)}</Pill>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ServicePicture pack={OONI_PACK} compact />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
