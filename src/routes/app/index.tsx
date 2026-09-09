import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdviceCard, ClassPill, RouteList, ServicePicture, StatCard, TruthList } from "@/components/xf";
import { OONI_PACK } from "@/lib/xfreedom/ooni";
import { useAccount } from "@/lib/xfreedom/use-account";
import { asAdvice, asRoutes, truthFromReport } from "@/lib/xfreedom/classify";
import { startTrial } from "@/lib/xfreedom/server";
import { runCabinetProbe } from "@/lib/xfreedom/run-probe";
import { Button } from "@/components/ui";

export const Route = createFileRoute("/app/")({ component: Overview });

function Overview() {
  const { data, err, reload } = useAccount();
  const [note, setNote] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [runErr, setRunErr] = useState<string | null>(null);
  const autoOnce = useRef(false);

  const last = data?.diagnostics[0];

  useEffect(() => {
    if (!data || last || autoOnce.current) return;
    if (typeof window !== "undefined" && sessionStorage.getItem("xf-auto-probe") === "1") return;
    autoOnce.current = true;
    if (typeof window !== "undefined") sessionStorage.setItem("xf-auto-probe", "1");
    void runNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot autopilot
  }, [data, last]);

  async function runNow() {
    setBusy(true);
    setRunErr(null);
    try {
      const { result } = await runCabinetProbe({
        label: "это устройство",
        onStep: setStep,
      });
      if (!result.ok) setRunErr(result.error ?? "Не получилось замерить");
      await reload();
    } catch {
      setRunErr("Не получилось замерить");
    } finally {
      setBusy(false);
      setStep(null);
    }
  }

  async function trial() {
    const res = await startTrial();
    setNote(res.already ? "Пробный период уже есть" : "Пробный период на 7 дней включён");
    await reload();
  }

  if (err) return <p className="text-sm text-bad">{err}</p>;
  if (!data) return <div className="h-48 animate-pulse rounded-xl bg-bg-elevated" />;

  const { profile, devices, tickets } = data;
  const routes = last ? asRoutes(last.route_json) : [];
  const advice = last ? asAdvice(last.advice_json) : null;
  const stages = last
    ? truthFromReport({
        source: last.source,
        online: last.online,
        httpsOk: last.https_ok,
        classification: last.classification,
      })
    : [];
  const activeDevices = devices.filter((d) => d.status !== "REVOKED");
  const needsTrial = profile.subscription_status !== "TRIAL" && profile.subscription_status !== "ACTIVE";

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Главная</p>
        <h1 className="font-display mt-2 text-4xl">Автопилот</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Сайт сам смотрит сеть и выбирает дорогу. Telegram отсюда не откроется — коридор строит только телефон.
        </p>
      </div>

      <section className="panel p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Сейчас</p>
        {busy ? (
          <p className="mt-2 text-lg">Смотрю сеть: {step ?? "…"}</p>
        ) : last ? (
          <p className="mt-2 text-lg">Дорога выбрана. Туннель ещё не включён — это нормально.</p>
        ) : (
          <p className="mt-2 text-lg">Замера нет. Нажми кнопку — система сама всё сделает.</p>
        )}
        <div className="mt-4">
          <Button disabled={busy} onClick={() => void runNow()}>
            {busy ? "Идёт проверка…" : last ? "Проверить ещё раз" : "Пусть система сама проверит"}
          </Button>
        </div>
        {runErr ? <p className="mt-3 text-sm text-bad">{runErr}</p> : null}
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard k="Подписка" v={profile.subscription_status === "NONE" ? "нет" : profile.subscription_status === "TRIAL" ? "пробный" : profile.subscription_status === "ACTIVE" ? "есть" : profile.subscription_status} />
        <StatCard k="Телефоны" v={String(activeDevices.length)} />
        <StatCard k="Проверок за сутки" v={`${data.ingest.ok24} ок`} />
      </div>

      {needsTrial ? (
        <div className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm">7 дней бесплатно, без карты</p>
            <p className="text-xs text-muted">Это доступ к кабинету. Не оплата VPN.</p>
          </div>
          <Button onClick={() => void trial()}>Включить</Button>
        </div>
      ) : null}
      {note ? <p className="text-sm text-ok">{note}</p> : null}

      {last && last.classification === "NO_BLOCK_DETECTED" ? (
        <p className="text-sm text-muted">
          Этот экран — не та сеть. Здесь дорога открыта. Чужой градусник из России сегодня видит другое — ниже.
        </p>
      ) : null}

      {advice ? <AdviceCard advice={advice} /> : null}

      <ServicePicture pack={OONI_PACK} compact />

      {last ? (
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Что система увидела</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ClassPill c={last.classification} />
            <span className="font-mono text-xs text-muted">{last.latency_ms ?? "—"} мс</span>
            <Link to="/app/reports/$id" params={{ id: last.id }} className="text-sm text-muted">
              подробности
            </Link>
          </div>
          <div className="mt-4">
            <RouteList routes={routes} />
          </div>
        </section>
      ) : null}

      {last ? (
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Коридор на телефоне</h2>
          <p className="mt-1 text-sm text-muted">Пока приложения нет — эти шаги серые. Так и должно быть.</p>
          <div className="mt-3">
            <TruthList stages={stages} />
          </div>
        </section>
      ) : null}

      {tickets.length > 0 ? (
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Обращения</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {tickets.slice(0, 3).map((t) => (
              <li key={t.id} className="flex justify-between gap-3 border-t border-line py-2">
                <span>{t.subject}</span>
                <span className="font-mono text-xs text-muted">{t.status}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-muted">
        Не понял, что происходит?{" "}
        <Link to="/onboarding" className="text-fg">
          Простыми словами
        </Link>
        {" · "}
        <Link to="/app/stat" className="text-fg">
          Журнал проверок
        </Link>
        {" · "}
        <Link to="/app/live" className="text-fg">
          Эфир
        </Link>
      </p>
    </div>
  );
}
