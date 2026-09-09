import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { updateProfile } from "@/lib/xfreedom/server";
import { Button, Field, Pill } from "@/components/ui";
import { useAccount } from "@/lib/xfreedom/use-account";

export const Route = createFileRoute("/app/account")({ component: AccountPage });

function AccountPage() {
  const user = useCurrentUser();
  const { data, reload } = useAccount();
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data) return;
    setName(data.profile.display_name ?? user?.displayName ?? "");
    setConsent(data.profile.telemetry_consent);
  }, [data, user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile({ data: { displayName: name, telemetryConsent: consent } });
    setSaved(true);
    await reload();
  }

  if (!data) return <div className="h-48 animate-pulse rounded-xl bg-bg-elevated" />;

  return (
    <div className="grid max-w-xl gap-5">
      <div>
        <h1 className="font-display text-4xl">Я</h1>
        <p className="mt-2 text-sm text-muted">Твои данные. Не туннель.</p>
        <p className="mt-1 font-mono text-xs text-muted">{user?.primaryEmail ?? user?.id}</p>
      </div>
      <form className="panel grid gap-4 p-5" onSubmit={(e) => void save(e)}>
        <label className="grid gap-2 text-sm">
          Имя
          <Field value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="flex items-start gap-3 text-sm text-muted">
          <input type="checkbox" className="mt-1 size-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          Согласие на обезличенную телеметрию сети. Без содержимого трафика и истории сайтов.
        </label>
        <Button type="submit">Сохранить</Button>
        {saved ? <p className="text-sm text-ok">Сохранено</p> : null}
      </form>
      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Устройства</h2>
          <Link to="/app/devices" className="text-xs text-muted">
            все
          </Link>
        </div>
        <ul className="mt-3 grid gap-2 text-sm">
          {data.devices.filter((d) => d.status !== "REVOKED").length === 0 ? (
            <li className="text-muted">Нет активных.</li>
          ) : null}
          {data.devices
            .filter((d) => d.status !== "REVOKED")
            .slice(0, 4)
            .map((d) => (
              <li key={d.id} className="flex justify-between gap-3 border-t border-line py-2">
                <span>
                  {d.label} · {d.platform}
                </span>
                <span className="font-mono text-xs text-muted">{d.last_seen_at ? "был" : "новый"}</span>
              </li>
            ))}
        </ul>
      </section>
      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Обращения</h2>
          <Link to="/support" className="text-xs text-muted">
            написать
          </Link>
        </div>
        <ul className="mt-3 grid gap-2 text-sm">
          {data.tickets.length === 0 ? <li className="text-muted">Обращений нет.</li> : null}
          {data.tickets.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 border-t border-line py-2">
              <span>{t.subject}</span>
              <Pill tone={t.status === "OPEN" ? "warn" : "ok"}>{t.status}</Pill>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
