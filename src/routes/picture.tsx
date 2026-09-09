import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { RouteList, ServicePicture } from "@/components/xf";
import { EDGE_NODES } from "@/lib/xfreedom/catalog";
import { scoreRoutes } from "@/lib/xfreedom/classify";
import { OONI_PACK } from "@/lib/xfreedom/ooni";

export const Route = createFileRoute("/picture")({ component: PicturePage });

const how = [
  {
    t: "Что это за ссылки",
    d: "Это не наш VPN и не этот сайт. Это чужой градусник: программа OONI на iPhone в сети Gipercom в России. Она ходила к сайтам и записала, где дорога ломается.",
  },
  {
    t: "Имена нашлись",
    d: "У всех семи сайтов адресная книжка сработала. Значит это не «интернета нет» и не «YouTube стёрли из DNS». Имя нашли — дальше ломают уже разговор.",
  },
  {
    t: "Дверь 443 открыта, замок ломают",
    d: "Twitter, Facebook, Instagram: дверь открыли, шифрование сразу оборвали. Как если охранник пускает в подъезд и сразу выключает свет. Телефону нужно прятать, к кому идёшь.",
  },
  {
    t: "YouTube и Discord молчат",
    d: "Дверь тоже открывается, но закрытый разговор не начинается — тишина. Другой способ ломать, не тот же щелчок. Коридор всё равно нужен.",
  },
  {
    t: "X договорился и завис",
    d: "Шифрование даже пожали руки, а страница не пришла. Ещё хитрее: пускают почти до конца и глушат. Зелёная галочка на рукопожатии — ещё не «сайт открылся».",
  },
  {
    t: "TikTok — табличка, не замок",
    d: "Сайт сам ответил: «вам нельзя». Это не сломанная дорога, а правило на входе. Коридор в другую страну часто помогает. Если TikTok узнает, что ты из России, табличка может вернуться.",
  },
  {
    t: "Telegram в пачке нет",
    d: "Эти ссылки его не проверяли. Мы не дописываем «его тоже закрыли». В других сетях России в тот же день дверь до telegram.org часто уже не открывается. Чтобы знать про твой Telegram — нужен замер с твоего телефона.",
  },
];

function PicturePage() {
  const routes = scoreRoutes("TLS_HANDSHAKE_INTERFERENCE", EDGE_NODES);
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Чужой градусник</p>
        <h1 className="font-display mt-2 text-4xl">Что режут сегодня</h1>
        <p className="mt-3 text-sm text-muted">
          Семь ссылок с одного iPhone в одной сети. Это факты. Не обещание, что у тебя дома будет так же. Не кнопка «открыть YouTube».
        </p>
        <div className="mt-8">
          <ServicePicture pack={OONI_PACK} />
        </div>
        <ol className="mt-8 grid gap-3">
          {how.map((s, i) => (
            <li key={s.t} className="panel p-5">
              <p className="font-mono text-xs text-muted">0{i + 1}</p>
              <h2 className="mt-1 text-lg">{s.t}</h2>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <section className="panel mt-8 p-5">
          <h2 className="text-lg">Что бы взял телефон</h2>
          <p className="mt-2 text-sm text-muted">
            По этой картине система выбирает другую форму дороги. Сайт её не включает. Пока приложения нет — это только совет.
          </p>
          <div className="mt-4">
            <RouteList routes={routes} />
          </div>
        </section>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/app" className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm text-accent-fg">
            Проверить свою сеть
          </Link>
          <Link to="/monitor" className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm">
            Инструменты мониторинга
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
