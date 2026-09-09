import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pill } from "@/components/ui";
import { EDGE_NODES } from "@/lib/xfreedom/catalog";
import {
  classificationLabel,
  roleLabel,
  transportLabel,
  type Classification,
  type ClientAdvice,
  type Evidence,
  type RoutePick,
  type TruthStage,
} from "@/lib/xfreedom/classify";
import { ooniHref, httpWord, tlsWord, type ServicePack } from "@/lib/xfreedom/ooni";

export function classTone(c: string): "ok" | "warn" | "bad" | "muted" {
  if (c === "NO_BLOCK_DETECTED") return "ok";
  if (c === "OFFLINE" || c === "IP_UNREACHABLE") return "bad";
  if (!c) return "muted";
  return "warn";
}

export function ClassPill({ c }: { c: string }) {
  return <Pill tone={classTone(c)}>{classificationLabel(c as Classification)}</Pill>;
}

export function RouteList({ routes }: { routes: RoutePick[] }) {
  if (routes.length === 0) {
    return <p className="text-sm text-muted">Дорог нет — сначала проверка.</p>;
  }
  return (
    <ul className="grid gap-2">
      {routes.map((r) => {
        const node = EDGE_NODES.find((n) => n.id === r.nodeId);
        return (
          <li key={r.role} className="rounded-md border border-line px-3 py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted">{roleLabel(r.role)}</span>
              <span>
                {node?.city ?? r.nodeId} · {transportLabel(r.transport)}
              </span>
              <span className="font-mono text-xs tabular-nums">{r.score.toFixed(2)}</span>
            </div>
            {r.why ? <p className="mt-1 text-xs text-subtle">{r.why}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function TruthList({ stages }: { stages: TruthStage[] }) {
  return (
    <ul className="grid gap-2">
      {stages.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-3 border-t border-line py-2 text-sm">
          <span className="flex-1">{s.label}</span>
          <Pill tone={s.state === "ok" ? "ok" : s.state === "no" ? "bad" : "muted"}>
            {s.state === "ok" ? "да" : s.state === "no" ? "нет" : "на телефоне"}
          </Pill>
        </li>
      ))}
    </ul>
  );
}

export function AdviceCard({ advice }: { advice: ClientAdvice | null }) {
  if (!advice) return null;
  return (
    <section className="panel p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Что делать</p>
      <h2 className="mt-2 text-lg">{advice.headline}</h2>
      <p className="mt-1 text-sm text-muted">{advice.detail}</p>
      <p className="mt-3 text-xs text-subtle">
        Телефону: {transportLabel(advice.preferTransport)} дорога
        {advice.avoidUdp ? " · быструю не брать" : ""}
      </p>
    </section>
  );
}

export function EvidenceList({ items }: { items: Evidence[] }) {
  if (items.length === 0) return <p className="text-sm text-muted">Фактов нет.</p>;
  return (
    <ul className="grid gap-2">
      {items.map((e, i) => (
        <li key={`${e.check}-${i}`} className="grid gap-1 rounded-md border border-line px-3 py-3 text-sm sm:grid-cols-[160px_1fr]">
          <span className="font-mono text-xs text-muted">{e.check}</span>
          <span>
            {e.result}
            {e.ms != null ? ` · ${e.ms} мс` : ""}
            {e.detail ? ` · ${e.detail}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CopyField({ value, label }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      setDone(false);
    }
  }
  return (
    <div className="grid gap-2">
      {label ? <p className="text-xs text-subtle">{label}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <code className="min-h-11 flex-1 break-all rounded-md border border-line bg-bg px-3 py-3 font-mono text-xs">{value}</code>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-line px-4 text-sm"
        >
          {done ? "Скопировано" : "Копировать"}
        </button>
      </div>
    </div>
  );
}

export function StatCard({ k, v }: { k: string; v: string }) {
  return (
    <div className="panel p-5">
      <p className="text-xs text-subtle">{k}</p>
      <p className="mt-2 font-mono text-xl tabular-nums">{v}</p>
    </div>
  );
}

export function ReportLink({ id }: { id: string }) {
  return (
    <Link to="/app/reports/$id" params={{ id }} className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
      отчёт {id}
    </Link>
  );
}

export function ServicePicture({ pack, compact }: { pack: ServicePack; compact?: boolean }) {
  return (
    <section className="panel p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{pack.title}</p>
      <p className="mt-2 text-sm text-muted">
        {pack.whenLabel} · {pack.network} · {pack.asn} · {pack.software}
      </p>
      {!compact ? <p className="mt-3 text-sm text-muted">{pack.note}</p> : null}
      <ul className="mt-4 grid gap-2">
        {pack.shots.map((s) => (
          <li key={s.uid} className="flex flex-wrap items-start justify-between gap-2 border-t border-line py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm">{s.name}</p>
              <p className="mt-1 text-sm text-muted">{s.kid}</p>
              {!compact ? (
                <p className="mt-1 font-mono text-xs text-subtle">
                  имя {s.dns === "ok" ? "нашли" : "нет"} · дверь {s.tcp === "ok" ? "открыта" : s.tcp === "mixed" ? "частично" : "нет"} · {tlsWord(s.tls)} · {httpWord(s.http)}
                  {s.ipv6 === "unreachable" ? " · IPv6 закрыт" : ""}
                </p>
              ) : null}
              {!compact ? (
                <a className="mt-1 inline-block text-xs text-subtle" href={ooniHref(s.uid)} target="_blank" rel="noreferrer">
                  исходный замер
                </a>
              ) : null}
            </div>
            <Pill tone={s.tone}>{s.tone === "ok" ? "открыто" : s.tone === "warn" ? "табличка" : "режут"}</Pill>
          </li>
        ))}
      </ul>
      {!compact ? (
        <>
          <p className="mt-4 text-sm text-muted">{pack.telegram}</p>
          <p className="mt-3 text-sm">
            {pack.advice.headline}. {pack.advice.detail}
          </p>
        </>
      ) : (
        <Link to="/picture" className="mt-4 inline-block text-sm text-fg">
          Как это читать →
        </Link>
      )}
    </section>
  );
}
