import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { PLANS } from "@/lib/xfreedom/catalog";

export const Route = createFileRoute("/plans")({ component: PlansPage });

function PlansPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Тарифы</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Сколько это стоит</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Оплаты ещё нет — кассу не подключали. Можно взять 7 дней бесплатно в кабинете, без карты и без фейковой кнопки
          «оплатить».
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <article key={p.code} className="panel flex flex-col p-6">
              <h2 className="text-sm uppercase tracking-[0.16em] text-muted">{p.name}</h2>
              <p className="font-display mt-3 text-4xl">{p.price}</p>
              <p className="text-sm text-subtle">{p.period}</p>
              <ul className="mt-5 grid gap-2 text-sm text-muted">
                {p.features.map((f) => (
                  <li key={f} className="border-t border-line pt-2">
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/app/subscription"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm text-accent-fg"
              >
                {p.code === "trial" ? "Взять 7 дней" : "Пока нельзя оплатить"}
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
