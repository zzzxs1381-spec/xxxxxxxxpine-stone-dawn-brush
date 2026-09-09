import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

const steps = [
  {
    t: "Что это вообще",
    d: "XFreedom — система связи, не «ещё один VPN со списком стран». Ты не выбираешь сервер пальцем. Система сама смотрит сеть и выбирает рабочий путь.",
  },
  {
    t: "Как в жизни",
    d: "Дорогу к школе перекрыли. Ты не ломаешь забор. Спрашиваешь: какая улица ещё открыта? Идёшь туда. Если и её закрыли — берёшь запасную. Вот и всё.",
  },
  {
    t: "Что делает сайт",
    d: "Сайт — глаза. Он меряет: есть ли интернет, проходит ли UDP, не ломают ли HTTPS. Пишет это в блокнот (кабинет). Выбирает главную дорогу и две запасных.",
  },
  {
    t: "Что делает телефон",
    d: "Телефон строит закрытый коридор (туннель) и уже по нему открывает Telegram, YouTube, Instagram. Браузер так не умеет. Пока приложения в магазине нет — коридора нет. Это правда, не «скоро сам заработает в вкладке».",
  },
  {
    t: "Когда будет «подключено»",
    d: "Только когда коридор реально встал, DNS внутри него отвечает и интернет проверяется. Зелёная галочка без этого — вранье. Мы её не рисуем.",
  },
  {
    t: "Почему не 100% по всей России",
    d: "В Москве, Крыму, Чечне и Дагестане интернет ломают по-разному. Система подстраивается под твою сеть. Если государство закрыло все оставшиеся улицы — мы это покажем, а не будем врать что YouTube жив.",
  },
];

function OnboardingPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Простыми словами</p>
        <h1 className="font-display mt-2 text-4xl">Как это работает</h1>
        <p className="mt-3 text-sm text-muted">Без протоколов. Сначала смысл, потом кнопки.</p>
        <ol className="mt-8 grid gap-3">
          {steps.map((s, i) => (
            <li key={s.t} className="panel p-5">
              <p className="font-mono text-xs text-muted">0{i + 1}</p>
              <h2 className="mt-1 text-lg">{s.t}</h2>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/app" className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm text-accent-fg">
            Пусть система сама проверит
          </Link>
          <Link to="/diagnostics" className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm">
            Замер без входа
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
