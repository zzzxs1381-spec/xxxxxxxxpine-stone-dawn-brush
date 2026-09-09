import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/download")({ component: DownloadPage });

function DownloadPage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Телефон</p>
        <h1 className="font-display mt-2 text-4xl md:text-5xl">Коридор строит телефон</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Сайт — глаза и блокнот. Машина, которая едет, — приложение. Пока его нельзя скачать из магазина, закрытого
          коридора нет. Здесь честно написано «ещё нет», а не кнопка «скачать VPN».
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="panel p-6">
            <h2 className="text-lg">Android</h2>
            <p className="mt-2 text-sm text-muted">
              Настоящий коридор на телефоне. «Подключено» только когда коридор встал и интернет внутри него проверен.
            </p>
            <p className="mt-4 text-sm text-warn">Сборки в магазине нет. Скачать нечего.</p>
          </article>
          <article className="panel p-6">
            <h2 className="text-lg">iPhone</h2>
            <p className="mt-2 text-sm text-muted">
              Тоже настоящее приложение, не сайт в полноэкранном режиме. Браузер так не умеет.
            </p>
            <p className="mt-4 text-sm text-warn">TestFlight не опубликован. Скачать нечего.</p>
          </article>
        </div>
        <div className="panel mt-4 p-6">
          <h2 className="text-lg">Градусник для компьютера</h2>
          <p className="mt-2 text-sm text-muted">
            Браузер видит мало. Маленькая программа на компьютере видит больше: открыты ли двери, работает ли быстрая
            дорога, не ломают ли шифрование. VPN она не включает — только меряет и пишет в кабинет.
          </p>
          <ol className="mt-4 grid gap-2 text-sm text-muted">
            <li>1. Войди в кабинет и на вкладке «Проба» возьми ключ.</li>
            <li>2. Скачай программу для своего компьютера.</li>
            <li>3. Запусти команду. Отчёт появится в «Стат».</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 text-sm text-accent-fg" href="/xf-probe.py" download>
              Для Mac и Linux
            </a>
            <a className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm" href="/xf-probe.ps1" download>
              Для Windows
            </a>
            <Link to="/app/probe" className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm">
              Взять ключ в кабинете
            </Link>
          </div>
        </div>
        <div className="panel mt-4 p-6">
          <h2 className="text-lg">Telegram</h2>
          <p className="mt-2 text-sm text-muted">
            Бот аккаунта: @xfreedommBot. Это чат с сервисом, не коридор.
          </p>
          <a className="mt-4 inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm" href="https://t.me/xfreedommBot" target="_blank" rel="noreferrer">
            Открыть бота
          </a>
        </div>
        <Link to="/onboarding" className="mt-8 inline-block text-sm text-muted">
          Как это работает простыми словами →
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
