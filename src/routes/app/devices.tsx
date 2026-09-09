import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { addDevice, revokeDevice } from "@/lib/xfreedom/server";
import { Button, Field, Pill } from "@/components/ui";
import { useAccount } from "@/lib/xfreedom/use-account";

export const Route = createFileRoute("/app/devices")({ component: DevicesPage });

function DevicesPage() {
  const { data, reload } = useAccount();
  const rows = data?.devices ?? [];
  const [label, setLabel] = useState("Pixel");
  const [platform, setPlatform] = useState<"ANDROID" | "IOS" | "DESKTOP">("ANDROID");
  const [err, setErr] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await addDevice({ data: { label, platform } });
    if (!res.ok) setErr(res.error);
    else await reload();
  }

  if (!data) return <div className="h-48 animate-pulse rounded-xl bg-bg-elevated" />;

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-display text-4xl">Устройства</h1>
        <p className="mt-2 text-sm text-muted">
          Телефоны, которые система знает. Это список, не кнопка «включить VPN». Проверка сама записывает устройство.
        </p>
      </div>
      <form className="panel grid gap-3 p-5 md:grid-cols-[1fr_160px_auto]" onSubmit={(e) => void add(e)}>
        <Field value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Название" />
        <select
          className="min-h-11 rounded-md border border-line bg-bg px-3 text-sm"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as typeof platform)}
        >
          <option value="ANDROID">Android</option>
          <option value="IOS">iOS</option>
          <option value="DESKTOP">Desktop</option>
        </select>
        <Button type="submit">Добавить</Button>
        {err ? <p className="text-sm text-bad md:col-span-3">{err}</p> : null}
      </form>
      <ul className="grid gap-2">
        {rows.length === 0 ? <p className="text-sm text-muted">Устройств пока нет.</p> : null}
        {rows.map((d) => (
          <li key={d.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p>{d.label}</p>
              <p className="font-mono text-xs text-muted">
                {d.id} · {d.platform}
                {d.last_seen_at ? ` · ${d.last_seen_at}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={d.status === "REVOKED" ? "muted" : "ok"}>{d.status === "REVOKED" ? "выключен" : "жив"}</Pill>
              {d.status !== "REVOKED" ? (
                <Button tone="danger" onClick={() => void revokeDevice({ data: { id: d.id } }).then(() => reload())}>
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
