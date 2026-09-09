import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Globe2, Radio } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Pill } from "@/components/ui";
import { MONITOR_LAYERS, MONITOR_OUTSIDE, MONITOR_OWN, type MonitorTool } from "@/lib/xfreedom/monitor-tools";

export const Route = createFileRoute("/monitor")({ component: MonitorPage });

function MonitorPage() {
  const [pulse, setPulse] = useState<"ok" | "no" | "wait">("wait");
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const started = performance.now();
    void fetch("/api/agent/health", { cache: "no-store" })
      .then((r) => {
        setMs(Math.round(performance.now() - started));
        setPulse(r.ok ? "ok" : "no");
      })
      .catch(() => {
        setMs(null);
        setPulse("no");
      });
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Градусники</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Инструменты мониторинга сети</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Разные градусники меряют разное. Пинг «ок» не значит, что открылся YouTube. Семь ссылок OONI это как раз показали.
          Ни один инструмент здесь не включает коридор.
        </p>

        <section className="panel mt-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Radio className="size-4 text-muted" aria-hidden />
            <div>
              <p className="text-sm">Пульс блокнота</p>
              <p className="text-xs text-muted">Кабинет отвечает? Это не «YouTube жив».</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Pill tone={pulse === "ok" ? "ok" : pulse === "no" ? "bad" : "muted"}>
              {pulse === "ok" ? "жив" : pulse === "no" ? "молчит" : "смотрю"}
            </Pill>
            <span className="font-mono text-xs text-muted">{ms == null ? "—" : `${ms} мс`}</span>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg">Шесть слоёв. Путать их нельзя.</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {MONITOR_LAYERS.map((l) => (
              <li key={l.n} className="panel p-5">
                <p className="font-mono text-xs text-muted">{l.n}</p>
                <h3 className="mt-1 text-base">{l.t}</h3>
                <p className="mt-1 text-sm text-muted">{l.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-muted" aria-hidden />
            <h2 className="text-lg">Наши</h2>
          </div>
          <p className="mt-1 text-sm text-muted">Работают в этом продукте. Не рисуют CONNECTED.</p>
          <ul className="mt-4 grid gap-3">
            {MONITOR_OWN.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Globe2 className="size-4 text-muted" aria-hidden />
            <h2 className="text-lg">Чужие</h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Мы ими не управляем. Берём факты, не кнопки «подключиться». Один замер — одна сеть, не вся Россия.
          </p>
          <ul className="mt-4 grid gap-3">
            {MONITOR_OUTSIDE.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ToolCard({ tool }: { tool: MonitorTool }) {
  return (
    <li>
      <a href={tool.href} target={tool.external ? "_blank" : undefined} rel={tool.external ? "noreferrer" : undefined} className="block">
        <article className="panel h-full p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-base">{tool.name}</h3>
            <Pill tone={tool.ours ? "ok" : "muted"}>{tool.ours ? "наш" : "чужой"}</Pill>
          </div>
          <p className="mt-2 text-sm text-muted">{tool.kid}</p>
          <p className="mt-3 text-sm">
            <span className="text-subtle">Видит. </span>
            {tool.sees}
          </p>
          <p className="mt-1 text-sm">
            <span className="text-subtle">Не видит. </span>
            {tool.misses}
          </p>
        </article>
      </a>
    </li>
  );
}
