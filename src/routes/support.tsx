import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Area, Button, Field, Pill } from "@/components/ui";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createTicket } from "@/lib/xfreedom/server";
import { useAccount } from "@/lib/xfreedom/use-account";

export const Route = createFileRoute("/support")({ component: SupportPage });

function SupportPage() {
  const { user, isPending } = useCurrentUserState();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    try {
      const res = await createTicket({ data: { subject, body } });
      if (res.ok) {
        setSubject("");
        setBody("");
        setMsg(`Обращение ${res.id} принято`);
        setTick((n) => n + 1);
      }
    } catch {
      setErr("Не удалось отправить");
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Помощь</p>
        <h1 className="font-display mt-2 text-4xl">Написать нам</h1>
        <p className="mt-3 text-sm text-muted">
          Пиши про аккаунт, телефон и проверку сети. Не присылай ключи и чужие личные данные.
        </p>
        <div className="panel mt-6 p-5 text-sm text-muted">
          Telegram:{" "}
          <a className="text-fg" href="https://t.me/xfreedommBot" target="_blank" rel="noreferrer">
            @xfreedommBot
          </a>
        </div>
        {isPending ? <div className="mt-6 h-40 animate-pulse rounded-xl bg-bg-elevated" /> : null}
        {!isPending && !user ? (
          <p className="mt-6 text-sm text-muted">
            Чтобы оставить обращение,{" "}
            <Link to="/login" className="text-fg">
              войдите
            </Link>
            .
          </p>
        ) : null}
        {!isPending && user ? (
          <form className="mt-6 grid gap-3" onSubmit={(e) => void send(e)}>
            <Field placeholder="Тема" value={subject} onChange={(e) => setSubject(e.target.value)} required minLength={4} />
            <Area placeholder="Что произошло и на каком устройстве" value={body} onChange={(e) => setBody(e.target.value)} required minLength={8} />
            <Button type="submit">Отправить</Button>
            {msg ? <p className="text-sm text-ok">{msg}</p> : null}
            {err ? <p className="text-sm text-bad">{err}</p> : null}
          </form>
        ) : null}
        {user ? <TicketList refresh={tick} /> : null}
      </main>
      <SiteFooter />
    </div>
  );
}

function TicketList({ refresh }: { refresh: number }) {
  const { data, reload } = useAccount();
  useEffect(() => {
    if (refresh > 0) void reload();
  }, [refresh, reload]);
  if (!data?.tickets.length) return null;
  return (
    <ul className="mt-8 grid gap-2">
      {data.tickets.map((t) => (
        <li key={t.id} className="panel flex items-center justify-between gap-3 p-4 text-sm">
          <span>{t.subject}</span>
          <Pill tone={t.status === "OPEN" ? "warn" : "ok"}>{t.status}</Pill>
        </li>
      ))}
    </ul>
  );
}
