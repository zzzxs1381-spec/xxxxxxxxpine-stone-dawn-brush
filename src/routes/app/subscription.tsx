import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { startTrial } from "@/lib/xfreedom/server";
import { Button, Pill } from "@/components/ui";
import { PLANS } from "@/lib/xfreedom/catalog";
import { useAccount } from "@/lib/xfreedom/use-account";

export const Route = createFileRoute("/app/subscription")({ component: SubPage });

function SubPage() {
  const { data, reload } = useAccount();
  const [note, setNote] = useState<string | null>(null);

  async function trial() {
    const res = await startTrial();
    setNote(res.already ? "Пробный период уже активен или подписка есть" : "Пробный период на 7 дней включён");
    await reload();
  }

  if (!data) return <div className="h-48 animate-pulse rounded-xl bg-bg-elevated" />;
  const status = data.profile.subscription_status;
  const ends = data.profile.trial_ends_at;
  const statusWord = status === "NONE" || !status ? "нет" : status === "TRIAL" ? "пробный" : status === "ACTIVE" ? "есть" : status;

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-display text-4xl">Подписка</h1>
        <p className="mt-2 text-sm text-muted">7 дней блокнота бесплатно. Карту не просим. Оплаты месяца ещё нет.</p>
      </div>
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs text-subtle">Статус</p>
          <p className="mt-1 text-lg">{statusWord}</p>
          {ends ? <p className="text-xs text-muted">пробный до {new Date(ends).toLocaleString("ru-RU")}</p> : null}
        </div>
        <Pill tone={status === "TRIAL" || status === "ACTIVE" ? "ok" : "muted"}>{statusWord}</Pill>
      </div>
      <Button onClick={() => void trial()}>Взять 7 дней бесплатно</Button>
      {note ? <p className="text-sm text-ok">{note}</p> : null}
      <div className="panel p-5 text-sm text-muted">
        Оплатить месяц или год нельзя: касса не подключена. Когда подключат — здесь появятся настоящие статусы оплаты, не
        нарисованные.
        <ul className="mt-3 grid gap-1">
          {PLANS.map((p) => (
            <li key={p.code}>
              {p.name}: {p.price}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
