import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClassPill, StatCard } from "@/components/xf";
import { MONITOR_OWN } from "@/lib/xfreedom/monitor-tools";
import { useAccount } from "@/lib/xfreedom/use-account";
import { classificationLabel, type Classification } from "@/lib/xfreedom/classify";
import { getIngestMetrics } from "@/lib/xfreedom/server";
import { outcomeLabel, type IngestSummary } from "@/lib/xfreedom/ingest-metrics";
import { Pill } from "@/components/ui";

export const Route = createFileRoute("/app/stat")({ component: StatPage });

function StatPage() {
  const { data } = useAccount();
  const [metrics, setMetrics] = useState<IngestSummary | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const next = await getIngestMetrics();
        if (alive) setMetrics(next);
      } catch {
        if (alive) setMetrics(null);
      }
    }
    void load();
    const t = window.setInterval(() => void load(), 30_000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, []);

  if (!data) return <div className="h-48 animate-pulse rounded-xl bg-bg-elevated" />;

  const rows = data.diagnostics;
  const series = [...rows].reverse().map((d, i) => ({
    i: String(i + 1),
    ms: d.latency_ms ?? 0,
    t: new Date(d.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
  }));
  const classBars = (metrics?.byClass.length ? metrics.byClass : []).map((c) => ({
    name: classificationLabel(c.k as Classification),
    n: c.n,
  }));
  const fallbackClass = new Map<string, number>();
  if (classBars.length === 0) {
    for (const r of rows) fallbackClass.set(r.classification, (fallbackClass.get(r.classification) ?? 0) + 1);
  }
  const classData =
    classBars.length > 0
      ? classBars
      : [...fallbackClass.entries()].map(([k, n]) => ({ name: classificationLabel(k as Classification), n }));

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Стат</p>
        <h1 className="font-display mt-2 text-4xl">Журнал проверок</h1>
        <p className="mt-2 text-sm text-muted">
          Что система видела за сутки. Обновляется само. Это не карта живых VPN-серверов.{" "}
          <Link to="/app/live" className="text-fg">
            Эфир
          </Link>
          {" · "}
          <Link to="/monitor" className="text-fg">
            Все градусники
          </Link>
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {MONITOR_OWN.map((t) => (
          <li key={t.id}>
            <a href={t.href} className="panel block p-4">
              <p className="text-sm">{t.name}</p>
              <p className="mt-1 text-xs text-muted">{t.kid}</p>
            </a>
          </li>
        ))}
      </ul>

      {metrics ? <IngestPanel metrics={metrics} /> : <div className="h-36 animate-pulse rounded-xl bg-bg-elevated" />}

      {series.length >= 2 ? (
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Задержка замера, мс</h2>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="t" tick={{ fill: "var(--color-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--color-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-line)", borderRadius: 12 }}
                  labelStyle={{ color: "var(--color-muted)" }}
                />
                <Area type="monotone" dataKey="ms" stroke="var(--color-accent)" fill="var(--color-bg-subtle)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      {classData.length > 0 ? (
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Что находили</h2>
          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "var(--color-subtle)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--color-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Bar dataKey="n" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted">Пусто. На Главной нажми «проверить» — система сама замерит.</p>
      )}

      <ul className="grid gap-2">
        {rows.map((d) => (
          <li key={d.id}>
            <Link
              to="/app/reports/$id"
              params={{ id: d.id }}
              className="panel flex flex-wrap items-center justify-between gap-2 p-4"
            >
              <ClassPill c={d.classification} />
              <span className="font-mono text-xs text-muted">
                {d.source === "AGENT" ? "агент" : "браузер"} · {d.latency_ms ?? "—"} мс
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IngestPanel({ metrics }: { metrics: IngestSummary }) {
  const last = metrics.lastAt
    ? new Date(metrics.lastAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "—";
  const hasVolume = metrics.hourly.some((h) => h.ok + h.fail > 0);
  const hourly = metrics.hourly.map((h) => ({
    ...h,
    t: new Date(h.start).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard k="Проверок за сутки" v={String(metrics.total)} />
        <StatCard k="Успех" v={metrics.successRate == null ? "—" : `${metrics.successRate}%`} />
        <StatCard k="Подожди" v={String(metrics.rateLimited)} />
        <StatCard k="Медленные" v={metrics.p95ProbeMs == null ? "—" : `${metrics.p95ProbeMs} мс`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard k="Последняя" v={last} />
        <StatCard k="Чем кончилась" v={metrics.lastOutcome ? outcomeLabel(metrics.lastOutcome) : "—"} />
        <StatCard k="Обработка" v={metrics.p95HandleMs == null ? "—" : `${metrics.p95HandleMs} мс`} />
      </div>

      {metrics.alerts.length > 0 ? (
        <ul className="grid gap-2">
          {metrics.alerts.map((a) => (
            <li key={a.text} className="panel flex items-start justify-between gap-3 p-4">
              <p className="text-sm">{a.text}</p>
              <Pill tone={a.tone}>{a.tone === "ok" ? "норма" : a.tone === "bad" ? "сбой" : a.tone === "warn" ? "внимание" : "нет данных"}</Pill>
            </li>
          ))}
        </ul>
      ) : null}

      {hasVolume ? (
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Поток за сутки</h2>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="t" tick={{ fill: "var(--color-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} interval={3} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--color-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-line)", borderRadius: 12 }}
                  labelStyle={{ color: "var(--color-muted)" }}
                />
                <Area type="stepAfter" dataKey="ok" stroke="var(--color-ok)" fill="var(--color-bg-subtle)" strokeWidth={1.5} name="принято" />
                <Area type="stepAfter" dataKey="fail" stroke="var(--color-bad)" fill="transparent" strokeWidth={1.5} name="отказ" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      <section className="panel p-5">
        <h2 className="text-sm font-medium">Что проходило</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {metrics.evidence.map((e) => (
            <li key={e.k} className="flex items-center justify-between border-t border-line py-2 text-sm">
              <span>{e.k}</span>
              <span className="font-mono text-xs tabular-nums text-muted">
                {e.pct == null ? "—" : `${e.pct}%`} · {e.ok}/{e.n}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-medium">Пробы</h2>
        {metrics.agents.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Нет событий по токенам.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {metrics.agents.map((a) => (
              <li key={a.agentId} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3 text-sm">
                <div>
                  <p>{a.label}</p>
                  <p className="font-mono text-xs text-muted">
                    {a.ok}/{a.total} ок
                    {a.rateLimited ? ` · ${a.rateLimited}× подожди` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <Pill tone={a.lastOutcome === "OK" ? "ok" : a.lastOutcome === "ERROR" ? "bad" : "warn"}>
                    {a.lastOutcome ? outcomeLabel(a.lastOutcome) : "—"}
                  </Pill>
                  <p className="mt-1 font-mono text-xs text-subtle">
                    {a.lastAt ? new Date(a.lastAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-medium">Журнал</h2>
        {metrics.events.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Пусто.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {metrics.events.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-2 text-sm">
                <span className="font-mono text-xs text-muted">
                  {new Date(e.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <span>{e.agent_label ?? "—"}</span>
                <Pill tone={e.outcome === "OK" ? "ok" : e.outcome === "ERROR" ? "bad" : "warn"}>{outcomeLabel(e.outcome)}</Pill>
                {e.diagnostic_id ? (
                  <Link to="/app/reports/$id" params={{ id: e.diagnostic_id }} className="font-mono text-xs text-muted">
                    {e.diagnostic_id}
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-subtle">{e.status_code}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
