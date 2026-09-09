import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { issueAgentToken, revokeAgentToken } from "@/lib/xfreedom/server";
import { Button, Field, Pill } from "@/components/ui";
import { AdviceCard, ClassPill, CopyField, RouteList } from "@/components/xf";
import { runCabinetProbe } from "@/lib/xfreedom/run-probe";
import { type ClientAdvice, type RoutePick } from "@/lib/xfreedom/classify";
import { useAccount } from "@/lib/xfreedom/use-account";

export const Route = createFileRoute("/app/probe")({ component: ProbePage });

function ProbePage() {
  const { data, reload } = useAccount();
  const agents = data?.agents ?? [];
  const [token, setToken] = useState<string | null>(null);
  const [label, setLabel] = useState("это устройство");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [klass, setKlass] = useState<string | null>(null);
  const [routes, setRoutes] = useState<RoutePick[]>([]);
  const [advice, setAdvice] = useState<ClientAdvice | null>(null);
  const origin = useMemo(() => (typeof window === "undefined" ? "" : window.location.origin), []);

  async function issue() {
    setErr(null);
    try {
      const res = await issueAgentToken({ data: { label } });
      setToken(res.token);
      await reload();
      return res.token;
    } catch {
      setErr("Не получилось выдать ключ");
      return null;
    }
  }

  async function runHere() {
    setBusy(true);
    setErr(null);
    setResultId(null);
    try {
      const { token: nextToken, result } = await runCabinetProbe({
        token,
        label,
        onStep: setStep,
      });
      if (nextToken) setToken(nextToken);
      if (!result.ok) setErr(result.error ?? "не получилось");
      else {
        setResultId(result.id ?? null);
        setKlass(result.classification ?? null);
        setRoutes(result.routes);
        setAdvice(result.advice);
        await reload();
      }
    } finally {
      setBusy(false);
      setStep(null);
    }
  }

  const cmd = token
    ? `python3 xf-probe.py --url ${origin} --token ${token}`
    : `python3 xf-probe.py --url ${origin} --token xfprobe_…`;

  if (!data) return <div className="h-48 animate-pulse rounded-xl bg-bg-elevated" />;

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-display text-4xl">Проба</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Кнопка — градусник с этого экрана. Программа на компьютере — градусник помощнее. Ни то ни другое не включает
          VPN.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={busy} onClick={() => void runHere()}>
          {busy ? `Смотрю: ${step ?? "…"}` : "Проверить с этого экрана"}
        </Button>
        <a className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm" href="/xf-probe.py" download>
          Программа для компьютера
        </a>
      </div>
      {klass ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ClassPill c={klass} />
            {resultId ? (
              <Link to="/app/reports/$id" params={{ id: resultId }} className="text-sm text-muted underline">
                отчёт {resultId}
              </Link>
            ) : null}
          </div>
          <AdviceCard advice={advice} />
          <RouteList routes={routes} />
        </div>
      ) : null}
      <form
        className="panel grid gap-3 p-5 md:grid-cols-[1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          void issue();
        }}
      >
        <Field value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Имя пробы" />
        <Button type="submit" tone="line">
          Ключ для компьютера
        </Button>
        {err ? <p className="text-sm text-bad md:col-span-2">{err}</p> : null}
      </form>
      {token ? (
        <div className="panel grid gap-3 p-5">
          <p className="text-sm">Ключ показывается один раз. Дальше система помнит только отпечаток.</p>
          <CopyField value={token} label="Ключ" />
          <CopyField value={cmd} label="Команда на компьютере" />
        </div>
      ) : null}
      <ul className="grid gap-2">
        {agents.map((a) => (
          <li key={a.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p>{a.label}</p>
              <p className="font-mono text-xs text-muted">
                {a.token_prefix}… · {a.last_seen_at ? `был ${a.last_seen_at}` : "ещё не присылал"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={a.status === "ACTIVE" ? "ok" : "muted"}>{a.status === "ACTIVE" ? "жив" : "выключен"}</Pill>
              {a.status === "ACTIVE" ? (
                <Button tone="danger" onClick={() => void revokeAgentToken({ data: { id: a.id } }).then(() => reload())}>
                  Выключить
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
