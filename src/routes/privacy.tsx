import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Приватность</p>
        <h1 className="font-display mt-2 text-4xl">Что мы не видим</h1>
        <div className="mt-6 grid gap-4 text-sm text-muted">
          <p>Не читаем переписку, не храним историю сайтов и содержимое коридора.</p>
          <p>Точный адрес в интернете по возможности не пишем. Отпечаток сети — ярлык, не имя человека.</p>
          <p>Дополнительные замеры — только если ты согласился в кабинете.</p>
          <p>Ключ пробы показывается один раз. Дальше система помнит только отпечаток, не сам ключ.</p>
          <p>Айма видит обезличенные замеры, не чаты и не коридор.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
