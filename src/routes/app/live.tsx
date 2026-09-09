import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdviceCard, ClassPill, RouteList } from "@/components/xf";
import { Button, Pill } from "@/components/ui";
import {
  asAdvice,
  asRoutes,
  checkKid,
  type ClientAdvice,
  type Evidence,
  type RoutePick,
} from "@/lib/xfreedom/classify";
import { getLiveTape } from "@/lib/xfreedom/server";
import { outcomeLabel, type LiveLayer, type LiveTape } from "@/lib/xfreedom/ingest-metrics";
import { runCabinetProbe } from "@/lib/xfreedom/run-probe";

export const Route = createFileRoute("/app/live")({ component: LivePage });

const LAST_KEY = "xf-live-last";

type LastLocal = {
  evidence: Evidence[];
  klass: string | null;
  routes: RoutePick[];
  advice: ClientAdvice | null;
  log: string[];
};

function readLast(): LastLocal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastLocal;
  } catch {
    return null;
  }
}

function writeLast(next: LastLocal) {
  try {
    sessionStorage.setItem(LAST_KEY, JSON.stringify(next));
  } catch {
    /* quota / private */
  }
}

function silenceWord(sec: number | null): string {
  if (sec == null) return "ещё не слушали";
  if (sec < 8) return "сейчас";
  if (sec < 60) return `${sec} с назад`;
  if (sec < 3600) return `${Math.round(sec / 60)} мин назад`;
  return `${Math.round(sec / 3600)} ч назад`;
}

function LayerMeter({ layer }: { layer: LiveLayer }) {
  const w = layer.ok === true ? "100%" : layer.ok === false ? "32%" : "10%";
  const bar = layer.ok === true ? "bg-ok" : layer.ok === false ? "bg-bad" : "bg-subtle";
  return (
    <li className="grid gap-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>{layer.k}</span>
        <Pill tone={layer.ok === true ? "ok" : layer.ok === false ? "bad" : "muted"}>
          {layer.ok === true ? "жив" : layer.ok === false ? "нет" : "нет факта"}
        </Pill>
      </div>
      <p className="text-xs text-subtle">{layer.kid}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
        <div className={`h-full rounded-full ${bar}`} style={{ width: w }} />
      </div>
    </li>
  );
}

function LivePage() {
  const cached = useRef(readLast());
  const [tape, setTape] = useState<LiveTape | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(cached.current?.log ?? []);
  const [evidence, setEvidence] = useState<Evidence[]>(cached.current?.evidence ?? []);
  const [klass, setKlass] = useState<string | null>(cached.current?.klass ?? null);
  const [routes, setRoutes] = useState<RoutePick[]>(cached.current?.routes ?? []);
  const [advice, setAdvice] = useState<ClientAdvice | null>(cached.current?.advice ?? null);
  const seen = useRef(new Set<string>());
  const [fresh, setFresh] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;
    async function tick() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const next = await getLiveTape();
        if (!alive) return;
        const newest = next.events[0]?.id;
        if (newest && seen.current.size > 0 && !seen.current.has(newest)) setFresh(newest);
        for (const e of next.events) seen.current.add(e.id);
        setTape(next);
        setErr(null);
      } catch {
        if (alive) setErr("Эфир не отвечает. Это не значит, что интернет мёртв — молчит блокнот.");
      }
    }
    void tick();
    const t = window.setInterval(() => void tick(), 2500);
    const onVis = () => {
      if (!document.hidden) void tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  async function listenHere() {
    setBusy(true);
    setErr(null);
    setLog([]);
    setKlass(null);
    setAdvice(null);
    setRoutes([]);
    const steps: string[] = [];
    try {
      const { result } = await runCabinetProbe({
        label: "это устройство",
        onStep: (s) => {
          setStep(s);
          steps.push(s);
          setLog([...steps.slice(-14)]);
        },
      });
      if (result.evidence) setEvidence(result.evidence);
      if (!result.ok) setErr(result.error ?? "Не получилось замерить");
      else {
        setKlass(result.classification ?? null);
        const nextRoutes = asRoutes(result.routes);
        const nextAdvice = asAdvice(result.advice);
        setRoutes(nextRoutes);
        setAdvice(nextAdvice);
        writeLast({
          evidence: result.evidence ?? [],
          klass: result.classification ?? null,
          routes: nextRoutes,
          advice: nextAdvice,
          log: steps,
        });
        const next = await getLiveTape();
        setTape(next);
      }
    } catch {
      setErr("Не получилось замерить");
    } finally {
      setBusy(false);
      setStep(null);
    }
  }

  const minutes = (tape?.minutes ?? []).map((m) => ({
    ...m,
    t: new Date(m.start).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
  }));
  const lastTs = tape?.lastAt ? Date.parse(tape.lastAt) : NaN;
  const silenceSec = Number.isNaN(lastTs) ? (tape?.silenceSec ?? null) : Math.max(0, Math.round((now - lastTs) / 1000));
  const listening = silenceSec != null && silenceSec < 25;
  const maxMs = Math.max(1, ...evidence.map((e) => e.ms ?? 0));

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Эфир</p>
          <h1 className="font-display mt-2 text-4xl">Анализ в реальном времени</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Это поток замеров, не прослушивание Telegram и не разбор чужих пакетов. Сайт видит: дошла ли проба и на каком
            слое дорога жива. Сообщения и ролики отсюда не читаются.
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm">
          <span
            className={`inline-block size-2 rounded-full ${listening || busy ? "bg-ok xf-live-dot" : "bg-subtle"}`}
            aria-hidden
          />
          <span className="text-muted">{busy ? "идёт разбор" : listening ? "слушаю" : "тишина"}</span>
          <span className="font-mono text-xs text-subtle">{silenceWord(silenceSec)}</span>
        </p>
      </div>

      <section className="panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Слушать этот экран</p>
            <p className="mt-1 text-sm text-muted">
              {busy ? `Сейчас: ${step ?? "…"}` : "Один замер. Потом эфир обновится сам."}
            </p>
          </div>
          <Button disabled={busy} onClick={() => void listenHere()}>
            {busy ? "Слушаю…" : "Запустить разбор"}
          </Button>
        </div>
        {log.length > 0 ? (
          <ol className="mt-4 grid gap-1 font-mono text-xs text-muted">
            {log.map((s, i) => (
              <li key={`${s}-${i}`} className={i === log.length - 1 && busy ? "text-fg" : ""}>
                {String(i + 1).padStart(2, "0")} · {s}
              </li>
            ))}
          </ol>
        ) : null}
        {err ? <p className="mt-3 text-sm text-bad">{err}</p> : null}
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-5">
          <p className="text-xs text-subtle">За 15 минут</p>
          <p className="mt-2 font-mono text-xl tabular-nums">{tape ? tape.total15 : "—"}</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs text-subtle">Принято / отказ</p>
          <p className="mt-2 font-mono text-xl tabular-nums">{tape ? `${tape.ok15} / ${tape.fail15}` : "—"}</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs text-subtle">Последняя задержка</p>
          <p className="mt-2 font-mono text-xl tabular-nums">
            {tape?.lastLatencyMs == null ? "—" : `${tape.lastLatencyMs} мс`}
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-xs text-subtle">Источники</p>
          <p className="mt-2 font-mono text-xl tabular-nums">{tape ? tape.agents15 : "—"}</p>
          <p className="mt-1 text-xs text-subtle">{tape?.lastAgentLabel ?? "пока нет"}</p>
        </div>
      </div>

      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Слои последнего живого замера</h2>
          {tape?.lastClassification ? <ClassPill c={tape.lastClassification} /> : null}
        </div>
        <p className="mt-1 text-xs text-muted">Не трафик людей. Слои градусника.</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(tape?.layers ?? []).map((l) => (
            <LayerMeter key={l.k} layer={l} />
          ))}
        </ul>
        {!tape?.lastClassification ? <p className="mt-4 text-sm text-muted">Пока тихо. Запусти разбор — слои появятся.</p> : null}
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-medium">Поток, 15 минут</h2>
        <p className="mt-1 text-xs text-muted">Каждая ступенька — минута. Это не график чужого YouTube.</p>
        <div className="mt-3 h-40">
          {tape ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={minutes} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="t" tick={{ fill: "var(--color-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--color-subtle)", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip
                  contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-line)", borderRadius: 12 }}
                  labelStyle={{ color: "var(--color-muted)" }}
                />
                <Area type="stepAfter" dataKey="ok" stroke="var(--color-ok)" fill="var(--color-bg-subtle)" strokeWidth={1.5} name="принято" />
                <Area type="stepAfter" dataKey="fail" stroke="var(--color-bad)" fill="transparent" strokeWidth={1.5} name="отказ" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full animate-pulse rounded-lg bg-bg-subtle" />
          )}
        </div>
      </section>

      {klass ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ClassPill c={klass} />
            <span className="text-sm text-muted">этот экран только что</span>
          </div>
          <AdviceCard advice={advice} />
        </div>
      ) : null}

      {routes.length > 0 ? (
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Совет дорог по этому замеру</h2>
          <p className="mt-1 text-xs text-muted">Не кнопка «подключиться». Телефон возьмёт это сам.</p>
          <div className="mt-3">
            <RouteList routes={routes} />
          </div>
        </section>
      ) : null}

      {evidence.length > 0 ? (
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Водопад этого разбора</h2>
          <p className="mt-1 text-xs text-muted">Сколько занял каждый слой. Это не пакеты Telegram.</p>
          <ul className="mt-4 grid gap-3">
            {evidence.map((e, i) => {
              const w = e.ms != null ? `${Math.max(8, Math.round((e.ms / maxMs) * 100))}%` : "8%";
              const ok = e.result === "ok" || e.result === "online" || e.result === "srflx" || e.result === "relay";
              const bad = e.result === "fail" || e.result === "offline" || e.result === "captive";
              return (
                <li key={`${e.check}-${i}`} className="grid gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>{checkKid(e.check)}</span>
                    <span className="font-mono text-xs text-muted">
                      {e.result}
                      {e.ms != null ? ` · ${e.ms} мс` : ""}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                    <div className={`h-full rounded-full ${ok ? "bg-ok" : bad ? "bg-bad" : "bg-warn"}`} style={{ width: w }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="panel p-5">
        <h2 className="text-sm font-medium">Лента</h2>
        <p className="mt-1 text-xs text-muted">Обновление каждые 2–3 секунды. Только твои пробы.</p>
        {!tape || tape.events.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Пусто. Нажми «Запустить разбор».</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {tape.events.map((e) => (
              <li
                key={e.id}
                className={`flex flex-wrap items-center justify-between gap-2 border-t border-line py-2 text-sm ${fresh === e.id ? "text-fg" : ""}`}
              >
                <span className="font-mono text-xs text-muted">
                  {new Date(e.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <span>{e.agent_label ?? "—"}</span>
                <span className="font-mono text-xs text-subtle">{e.probe_latency_ms != null ? `${e.probe_latency_ms} мс` : ""}</span>
                <Pill tone={e.outcome === "OK" ? "ok" : e.outcome === "ERROR" ? "bad" : "warn"}>{outcomeLabel(e.outcome)}</Pill>
                {e.classification ? <ClassPill c={e.classification} /> : null}
                {e.diagnostic_id ? (
                  <Link to="/app/reports/$id" params={{ id: e.diagnostic_id }} className="font-mono text-xs text-muted">
                    отчёт
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-subtle">{e.status_code}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-medium">Что слышно, а что нет</h2>
        <ul className="mt-3 grid gap-2 text-sm text-muted">
          <li className="border-t border-line pt-2">Слышно: дошла ли проба, живы ли имена / дверь / шифрование / страница.</li>
          <li className="border-t border-line pt-2">Не слышно: текст Telegram, ролик YouTube, чужой Wi‑Fi, пакеты коридора.</li>
          <li className="border-t border-line pt-2">
            YouTube и Instagram с этого экрана не проверяются целиком — для слоя «шифрование к сервису» нужна программа-проба на компьютере.
          </li>
        </ul>
      </section>
    </div>
  );
}
