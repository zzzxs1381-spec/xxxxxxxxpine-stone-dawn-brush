# XFREEDOM / XSERVIS — MASTER PROMPT (снимок 2026-09-13)

Язык продукта: русский. Режим: audit-first, preserve-first, production-only.
Домен живого лендинга: xservis.app. Дизайн живого сайта НЕ переписывать.
Этот контур — веб-кабинет + замер + рецепт коридора + TLS-edge (доказанный) + исходник Android VpnService.
Браузер НЕ является системным VPN. CONNECTED только после TUNNEL_UP + INTERNET_VERIFY на телефоне.

## 0. Главное правило
Ничего не ломать. Не выдавать заглушку за работающую функцию.
Не писать «VPN работает», если поднят только сайт.
Не копировать чужой APK (TLS Tunnel / TLSVPN SERVICES LTDA).
Не подключать фиктивную кассу.

## 1. Что это
XFreedom — adaptive connectivity: сам меряет сеть, выбирает дорогу, на телефоне поднимает туннель, сам лечит обрыв.
Пользователь видит «Подключить». Не обязан знать VLESS, REALITY, Hysteria, SNI, QUIC, DPI.

Цепочка:
DEVICE → сеть → observer → classifier (только evidence) → scoring PRIMARY+2 fallback → TunnelEngine → edge → интернет
Параллельно: telemetry → privacy filter → Postgres (истина) / Qdrant (похожесть) → AIMA (советник, не власть)

## 2. Что уже сделано в этом контуре (WORKING)
- Веб как xservis.app: шар, Откуда/Куда, Подключить, Тариф, Канал. Дизайн не трогать.
- Аккаунт: Google / X / почта. Trial 7 дней без карты. Месяц/год — кассы нет.
- Браузерный замер + проба Python/PowerShell → ingest. Класс только по evidence.
- Рецепт коридора: HYSTERIA2 / VLESS_REALITY / AMNEZIAWG / TLS13_SNI / SSH_TCP.
- SNI-прикрытие только с живого handshake. IPv6 только с факта. UDP↓ → не Hysteria. SSH только последний hop.
- Кабинет: Главная, Стат, Эфир, Проба, AIMA, устройства, ingest-метрики.
- Карта/глобус — визуализация, не control plane. VPN не зависит от карты.
- OONI — чужой градусник, не наш туннель.
- Правда соединения: CONFIG_RECEIVED может быть ok в вебе; TRANSPORT/HANDSHAKE/TUNNEL/SERVICE_TESTS = web-limit, пока нет натива.
- Репозиторий GitHub xfreedom в этом контуре был почти пустой. Живой прод (Xray/Caddy/ноды) сюда не приезжал.

## 3. Что на скрине — делать до конца
1) Android VpnService Implementation
2) TLS Tunneling Mechanics

Не клонировать TLS Tunnel. Взять механику: TLS 1.3, SNI, pin самоподписанного сертификата, Always-On, IPv6 флаг, UDP честно, SSH как последний запас.

## 4. TLS mechanics (контракт)
Протокол xf-tls1:
- TLS 1.3 only. ALPN xf-tls1. SNI = cover name (microsoft/apple/cloudflare).
- Сертификат самоподписанный, клиент проверяет SHA-256 pin. Не публичный CA.
- После handshake: строка AUTH <token>\\n → OK <session>\\n
- Дальше фреймы: u32be length + u8 type + payload
  OPEN id,host,port / OPEN_OK / OPEN_ERR / DATA / CLOSE / PING / PONG
- OPEN — TCP к цели. Это не чтение чужого трафика и не DPI.
- В этом контуре edge слушает 127.0.0.1 (не открытый прокси в интернет).
- Selftest автономен: TLS + SNI + AUTH + OPEN на локальный echo HTTP. Без selftest «TLS готов» не писать.
- Payload-injector / чужие SSH-фермы не внедрять.

## 5. Android VpnService (контракт)
Пакет: app.xservis.xfreedom
- VpnService.prepare → Builder.establish → foreground → protect(tunnelSocket)
- Always-On meta-data true. Kill switch = default route + нет bypass (кроме сам туннель).
- Состояния: IDLE PREPARING DIAGNOSING SELECTING_ROUTE CONNECTING HANDSHAKING TUNNEL_UP VERIFYING CONNECTED DEGRADED FAILING_OVER RECONNECTING OFFLINE ERROR
- CONNECTED только после TUNNEL_INTERFACE_UP + DNS_OK + INTERNET_OK.
- TunnelEngine: start/stop/restart/status/health/stats/migrate
- Адаптер TLS13_SNI говорит xf-tls1. PacketBridge: IPv4 TCP из TUN → OPEN. UDP пока drop, если рецепт avoidUdp.
- Берёт /api/native/config по probe token. Шлёт /api/native/stage на каждый этап.
- Сборки Play/TestFlight нет, пока нет SDK/подписи. Исходник должен быть полным, не TODO.

## 6. Чего нет и нельзя врать
- APK в магазине, iOS PacketTunnel, живые ноды Xray/Hysteria в этом sandbox
- 100% Telegram/YouTube/Instagram 24/7 по РФ (ТСПУ разный в Москве, Крыму, Чечне)
- Фейковая оплата, фейковый CONNECTED в браузере
- Чужой APK как «наш клиент»

## 7. Как стыкуется
Сайт = глаза и блокнот. Проба = градусник. Рецепт = какая дорога. TLS-edge = механика коридора (доказана selftest). Android VpnService = машина, которая едет. Касса и iOS — позже. AIMA не рулит маршрутом.

## 8. Definition of done для ЭТОГО шага
- Selftest TLS 1.3 + SNI + OPEN проходит сам
- /api/native/edge отдаёт pin, handshakeMs, echo ok
- Android исходник: VpnService + TLS client + TUN bridge + stage API, без заглушек в критическом пути
- Веб по-прежнему не ставит CONNECTED
- startup поднимает сайт; edge стартует лениво и переживает selftest
