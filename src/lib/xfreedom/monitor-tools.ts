export type MonitorTool = {
  id: string;
  name: string;
  kid: string;
  sees: string;
  misses: string;
  ours: boolean;
  href: string;
  external?: boolean;
};

export const MONITOR_OWN: MonitorTool[] = [
  {
    id: "screen",
    name: "Проверка с экрана",
    kid: "Градусник в этой вкладке. Меряет, не лечит.",
    sees: "Есть ли интернет, открывается ли кабинет, грубый намёк на UDP.",
    misses: "Сырой IP, полный DNS, обрыв шифрования YouTube, туннель.",
    ours: true,
    href: "/diagnostics",
  },
  {
    id: "probe",
    name: "Проба на компьютере",
    kid: "Градусник помощнее. Маленькая программа, не VPN.",
    sees: "TCP, UDP/DNS, TLS, IPv6 и обрыв шифрования у YouTube / Instagram / Twitter.",
    misses: "Системный коридор. Telegram MTProto. «Подключено».",
    ours: true,
    href: "/app/probe",
  },
  {
    id: "live",
    name: "Эфир",
    kid: "Разбор в реальном времени: слои дороги, водопад замера, не чужие сообщения.",
    sees: "Дошла ли проба, живы ли имена / дверь / шифрование / страница. Лента и поток за 15 минут.",
    misses: "Содержимое Telegram и YouTube. Пакеты туннеля. Чужой трафик.",
    ours: true,
    href: "/app/live",
  },
  {
    id: "journal",
    name: "Журнал проверок",
    kid: "Блокнот: что пришло за сутки, где подождать, где ключ выключен.",
    sees: "Успех, отказы, задержку, какие факты проходили.",
    misses: "Живые VPN-серверы. Сеть всей России.",
    ours: true,
    href: "/app/stat",
  },
  {
    id: "picture",
    name: "Что режут",
    kid: "Чужой градусник OONI с одного iPhone в одной сети.",
    sees: "Где ломают разговор: обрыв, тишина, табличка «нельзя».",
    misses: "Твою домашнюю сеть. Telegram в той пачке не мерили.",
    ours: true,
    href: "/picture",
  },
  {
    id: "aima",
    name: "Айма",
    kid: "Советник. Читает замер и говорит гипотезу. Маршруты не меняет.",
    sees: "Последние факты из блокнота.",
    misses: "Секреты, туннель, право сказать «подключено».",
    ours: true,
    href: "/app/aima",
  },
];

export const MONITOR_OUTSIDE: MonitorTool[] = [
  {
    id: "ooni-probe",
    name: "OONI Probe",
    kid: "Тот градусник, с которого пришли семь ссылок. Ставится на телефон.",
    sees: "DNS, TCP, TLS, HTTP к конкретным сайтам. Сравнивает с контролем снаружи.",
    misses: "Коридор XFreedom. Не открывает YouTube за тебя.",
    ours: false,
    href: "https://ooni.org/install/",
    external: true,
  },
  {
    id: "ooni-explorer",
    name: "OONI Explorer",
    kid: "Публичный архив чужих градусников по странам и сетям.",
    sees: "Как режут в разных AS: обрыв, DNS, таймаут.",
    misses: "Твой кабинет. Одного замера мало для всей России.",
    ours: false,
    href: "https://explorer.ooni.org/search?probe_cc=RU&since=2026-09-08&until=2026-09-10&test_name=web_connectivity",
    external: true,
  },
  {
    id: "ripe-atlas",
    name: "RIPE Atlas",
    kid: "Много маленьких пингов по миру. Хорошо слышит «жива ли сеть», плохо — «ломают ли шифрование».",
    sees: "Ping, traceroute, DNS с тысяч точек.",
    misses: "SNI-обрыв как у Instagram. Табличку TikTok. Туннель.",
    ours: false,
    href: "https://atlas.ripe.net/",
    external: true,
  },
  {
    id: "cf-radar",
    name: "Cloudflare Radar",
    kid: "Погода большого интернета, не твой дом.",
    sees: "Всплески трафика, отключения кусков сети, доли протоколов.",
    misses: "Один провайдер в Чечне. Твой Telegram.",
    ours: false,
    href: "https://radar.cloudflare.com/",
    external: true,
  },
  {
    id: "ioda",
    name: "IODA",
    kid: "Смотрит, не отвалилась ли страна или оператор целиком.",
    sees: "Крупные выключения BGP и доступности.",
    misses: "Точечный обрыв YouTube при живом интернете.",
    ours: false,
    href: "https://ioda.inetintel.cc.gatech.edu/",
    external: true,
  },
  {
    id: "censored-planet",
    name: "Censored Planet",
    kid: "Исследовательский градусник цензуры снаружи, не из квартиры.",
    sees: "Признаки фильтрации по странам и сетям.",
    misses: "Замер с твоего Wi‑Fi. Коридор на телефоне.",
    ours: false,
    href: "https://censoredplanet.org/",
    external: true,
  },
  {
    id: "bgp",
    name: "bgp.tools / RIPEstat",
    kid: "Карта объявлений сети. Видно, существует ли оператор в большой книжке.",
    sees: "AS, префиксы, куда уходит маршрут.",
    misses: "Шифрование, YouTube, «подключено».",
    ours: false,
    href: "https://bgp.tools/as/205236",
    external: true,
  },
];

export const MONITOR_LAYERS = [
  { n: "1", t: "Жива ли сеть", d: "Пинг, BGP, IODA. Если тут тишина — коридор не поможет, как зонтик в комнате." },
  { n: "2", t: "Находятся ли имена", d: "DNS. Если книжку вырвали — внутри коридора будет своя." },
  { n: "3", t: "Открывается ли дверь", d: "TCP 443. Часто дверь открыта, а дальше ломают." },
  { n: "4", t: "Дают ли шифрование", d: "TLS / SNI. Семь ссылок OONI ломаются в основном здесь." },
  { n: "5", t: "Пришла ли страница", d: "HTTP. X договорился о шифровании, а страница так и не пришла." },
  { n: "6", t: "Жив ли сервис", d: "Telegram, YouTube, Instagram. Это умеет только телефон после коридора, не этот сайт." },
];
