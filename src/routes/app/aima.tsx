import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { askAima, getDiagnostic } from "@/lib/xfreedom/server";
import { Button } from "@/components/ui";
import { ClassPill, EvidenceList } from "@/components/xf";
import { useAccount } from "@/lib/xfreedom/use-account";
import { asEvidence, type Evidence } from "@/lib/xfreedom/classify";

export const Route = createFileRoute("/app/aima")({ component: AimaPage });

function AimaPage() {
  const { data, reload } = useAccount();
  const [preview, setPreview] = useState<Evidence[] | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const last = data?.diagnostics[0];
  const notes = data?.notes ?? [];

  async function run() {
    setBusy(true);
    setErr(null);
    let evidenceText = "Диагностик нет.";
    if (last) {
      const full = await getDiagnostic({ data: { id: last.id } });
      const ev = asEvidence(full?.evidence);
      setPreview(ev);
      evidenceText = ev.map((e) => `${e.check}=${e.result}${e.ms != null ? `@${e.ms}` : ""}`).join("; ").slice(0, 2400);
    }
    const res = await askAima({
      data: {
        classification: last?.classification ?? "UNKNOWN",
        evidenceText,
        diagnosticId: last?.id,
        source: last?.source ?? undefined,
      },
    });
    setBusy(false);
    if (!res.ok) setErr(res.error);
    else {
      setText(res.text);
      await reload();
    }
  }

  if (!data) return <div className="h-48 animate-pulse rounded-xl bg-bg-elevated" />;

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-display text-4xl">Айма</h1>
        <p className="mt-2 text-sm text-muted">
          Умный друг, не начальник. Разбирает последний замер простыми словами. Дорогу выбирает не она.
        </p>
      </div>
      {last ? (
        <div className="flex flex-wrap items-center gap-2">
          <ClassPill c={last.classification} />
          <span className="font-mono text-xs text-muted">
            {last.source === "AGENT" ? "агент" : "браузер"} · {last.latency_ms ?? "—"} мс
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted">Нет замера — Айма разберёт пустую страницу. Сначала проверка на Главной.</p>
      )}
      <Button disabled={busy} onClick={() => void run()}>
        {busy ? "Анализ…" : "Разобрать последний замер"}
      </Button>
      {err ? <p className="text-sm text-bad">{err}</p> : null}
      {text ? <article className="panel whitespace-pre-wrap p-5 text-sm text-muted">{text}</article> : null}
      {preview ? (
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Что ушло к Айме</h2>
          <div className="mt-3">
            <EvidenceList items={preview} />
          </div>
        </section>
      ) : null}
      <section>
        <h2 className="text-sm font-medium">Журнал</h2>
        <ul className="mt-3 grid gap-2">
          {notes.map((n) => (
            <li key={n.id} className="panel p-4 text-sm text-muted">
              <p className="font-mono text-xs">{n.created_at}</p>
              <p className="mt-2 whitespace-pre-wrap">{n.summary}</p>
            </li>
          ))}
          {notes.length === 0 ? <li className="text-sm text-muted">Пока пусто.</li> : null}
        </ul>
      </section>
    </div>
  );
}
