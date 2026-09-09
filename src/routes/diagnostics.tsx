import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui";
import { AdviceCard, ClassPill, EvidenceList, RouteList } from "@/components/xf";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { runBrowserDiagnostics } from "@/lib/xfreedom/browser-diag";
import { asAdvice, asRoutes, type ClientAdvice, type RoutePick } from "@/lib/xfreedom/classify";
import { saveDiagnostic } from "@/lib/xfreedom/server";

export const Route = createFileRoute("/diagnostics")({ component: DiagnosticsPage });

function DiagnosticsPage() {
  const { user } = useCurrentUserState();
  const [step, setStep] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof runBrowserDiagnostics>> | null>(null);
  const [routes, setRoutes] = useState<RoutePick[]>([]);
  const [advice, setAdvice] = useState<ClientAdvice | null>(null);
  const [klass, setKlass] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setSaved(null);
    try {
      const data = await runBrowserDiagnostics(setStep);
      setResult(data);
      setKlass(data.classification);
      if (user) {
        const res = await saveDiagnostic({
          data: {
            networkType: data.networkType,
            online: data.online,
            ipv4Ok: data.ipv4Ok,
            httpsOk: data.httpsOk,
            udpHint: data.udpHint,
            latencyMs: data.latencyMs,
            evidence: data.evidence,
            fingerprintBucket: data.fingerprintBucket,
          },
        });
        if (res.ok) {
          setSaved(res.id);
          setKlass(res.classification);
          setRoutes(asRoutes(res.routes));
          setAdvice(asAdvice(res.advice));
        }
      }
    } finally {
      setBusy(false);
      setStep(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Градусник</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Проверка с этого экрана</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Как градусник: меряет, не лечит. Браузер видит меньше, чем телефон. Telegram отсюда не откроется.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button disabled={busy} onClick={() => void run()}>
            {busy ? `Смотрю: ${step ?? "…"}` : "Проверить сеть"}
          </Button>
          <Link to="/picture" className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm">
            Что режут в России
          </Link>
        </div>
        {!user ? (
          <p className="mt-4 text-sm text-muted">
            Без входа результат останется на этом экране.{" "}
            <Link to="/login" className="text-fg">
              Войди
            </Link>
            , чтобы сохранить в блокнот.
          </p>
        ) : null}

        {result ? (
          <div className="mt-10 grid gap-4">
            <div className="panel p-6">
              <div className="flex flex-wrap items-center gap-3">
                <ClassPill c={klass ?? result.classification} />
                <span className="font-mono text-xs text-muted">
                  {result.latencyMs} мс · {result.networkType}
                </span>
                {saved ? <span className="text-xs text-ok">сохранено в блокнот</span> : null}
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <Row k="Интернет" v={result.online ? "есть" : "нет"} />
                <Row k="Обычные сайты" v={result.httpsOk ? "открываются" : "нет"} />
                <Row k="Быстрая дорога" v={result.udpHint} />
                <Row k="Отпечаток сети" v={result.fingerprintBucket} />
              </dl>
            </div>
            <AdviceCard advice={advice} />
            {routes.length > 0 ? (
              <div className="panel p-6">
                <h2 className="text-sm font-medium">Какую дорогу взять телефону</h2>
                <p className="mt-1 text-sm text-muted">Это совет, не кнопка «подключиться».</p>
                <div className="mt-4">
                  <RouteList routes={routes} />
                </div>
              </div>
            ) : null}
            <div className="panel p-6">
              <h2 className="text-sm font-medium">Что увидели</h2>
              <div className="mt-4">
                <EvidenceList items={result.evidence} />
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-line pt-3">
      <dt className="text-xs text-subtle">{k}</dt>
      <dd className="font-mono text-sm">{v}</dd>
    </div>
  );
}
