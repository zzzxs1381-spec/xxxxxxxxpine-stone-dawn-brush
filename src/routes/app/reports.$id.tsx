import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getDiagnostic } from "@/lib/xfreedom/server";
import { AdviceCard, ClassPill, EvidenceList, RouteList, TruthList } from "@/components/xf";
import { asAdvice, asEvidence, asRoutes, truthFromReport } from "@/lib/xfreedom/classify";

export const Route = createFileRoute("/app/reports/$id")({ component: ReportPage });

function ReportPage() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Awaited<ReturnType<typeof getDiagnostic>> | undefined>(undefined);

  useEffect(() => {
    void getDiagnostic({ data: { id } }).then(setRow);
  }, [id]);

  if (row === undefined) return <div className="h-48 animate-pulse rounded-xl bg-bg-elevated" />;
  if (row === null) return <p className="text-sm text-muted">Отчёт не найден.</p>;

  const evidence = asEvidence(row.evidence);
  const routes = asRoutes(row.route_json);
  const advice = asAdvice(row.advice_json);
  const stages = truthFromReport({
    source: row.source,
    online: row.online,
    httpsOk: row.https_ok,
    classification: row.classification,
  });

  return (
    <div className="grid gap-4">
      <Link to="/app/stat" className="text-sm text-muted">
        ← Стат
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl">Отчёт</h1>
        <ClassPill c={row.classification} />
      </div>
      <p className="font-mono text-xs text-muted">
        {row.id} · {row.source} · {row.platform ?? "—"} · {row.latency_ms ?? "—"} мс
      </p>
      <AdviceCard advice={advice} />
      <section className="panel p-5">
        <h2 className="text-sm font-medium">Коридор на телефоне</h2>
        <TruthList stages={stages} />
      </section>
      <section className="panel p-5">
        <h2 className="text-sm font-medium">Какую дорогу взять телефону</h2>
        <p className="mt-1 text-sm text-muted">Совет. Сайт коридор не строит.</p>
        <div className="mt-3">
          <RouteList routes={routes} />
        </div>
      </section>
      <section className="panel p-5">
        <h2 className="text-sm font-medium">Что увидели</h2>
        <div className="mt-3">
          <EvidenceList items={evidence} />
        </div>
      </section>
    </div>
  );
}
