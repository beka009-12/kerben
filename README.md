# Kerben Travel — сайт туристического агентства

Frontend проекта **Kerben Travel**: туры по Кыргызстану и миру, карта направлений, отели, бронирование.
Данные идут из backend Kerben Travel (FastAPI, документация — https://13.49.104.87/docs).

## Стек

- **Next.js 16** (App Router, Turbopack, Cache Components), **React 19**, **TypeScript**
- Обычный **CSS**: у каждого компонента свой файл, без вложенности
- **MapLibre GL** — карты (стили OpenFreeMap, без ключей)
- **Zustand** — избранное (хранится в localStorage) и состояние входа в ИИ-ассистента
- **Vitest** + Testing Library — тесты
- Языки: английский (`/en`), русский (`/ru`), немецкий (`/de`), китайский (`/zh`)

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте http://localhost:3000. Язык выбирается сам по браузеру (`/en` или `/ru`).

| Команда | Что делает |
| --- | --- |
| `npm run dev` | dev-сервер |
| `npm run build` / `npm start` | production-сборка и запуск |
| `npm run lint` | ESLint |
| `npm run typecheck` | проверка типов TypeScript |
| `npm test` | тесты (Vitest) |
| `npm run check` | всё сразу: lint + типы + тесты + сборка |

## Структура

```
src/
├─ app/
│  ├─ [lang]/                 страницы (en, ru, de, zh)
│  │  ├─ page.tsx             главная
│  │  ├─ tours/               каталог и страница тура tours/[slug]
│  │  ├─ destinations/ hotels/ chat/ faq/ about/ contact/ trips/ credits/
│  │  ├─ trips/               «Мои поездки»: вкладки «Заявки» и «Избранное» (старые /saved, /requests, /login — редиректы в next.config.ts)
│  │  ├─ admin/               админка (скрытая): обзор, заявки, разделы backend; actions.ts — серверные действия
│  │  ├─ not-found.tsx, error.tsx
│  │  └─ layout.tsx           шапка, подвал, нижнее меню, шрифты
│  ├─ api/                    прокси к backend для чата и аккаунта (с лимитом попыток входа)
│  ├─ globals.css             цвета, шрифты, отступы (CSS-переменные)
│  ├─ sitemap.ts, robots.ts
├─ components/                каждый компонент — своя папка
│  ├─ layout/header/          Header.tsx + header.css
│  ├─ layout/footer/          Footer.tsx + footer.css
│  ├─ home/  tours/  tour/  hotels/  contact/  auth/  ai/  trips/  requests/  saved/  about/
│  ├─ admin/                  админка: меню, таблица, панель редактирования, заявки
│  ├─ map/map-view/           карта MapLibre
│  └─ ui/                     кнопки, иконки, логотип, рейтинг…
├─ dictionaries/              тексты: en.json, ru.json, de.json, zh.json
├─ data/                      регионы, темы путешествий, фото (туров и отелей тут нет — только из backend)
├─ utils/                     API, хуки, фильтры, валидация, форматирование, i18n, Zustand; utils/admin — разделы и сессия админки
├─ types/  config/  assets/
└─ proxy.ts                   редирект на язык
tests/                        тесты
scripts/                      seed API, копирование worker'а карты
```

## Правила CSS

- У каждого компонента своя папка: `Header.tsx` + `header.css`.
- Только одиночные классы: `.header`, `.header-link`, `.header-link-active`.
- **Нельзя**: вложенность `&`, селекторы-потомки (`.card .title`), дочерние (`.card > img`).
- Состояния — классами-модификаторами (`.button-primary`) и псевдоклассами (`:hover`, `:focus-visible`).
- Эффект на дочернем элементе при наведении на родителя — через CSS-переменную:
  `.card:hover { --zoom: 1.06 }` и `.card-image { transform: scale(var(--zoom, 1)) }`.
- Цвета, размеры и отступы — только переменные из `globals.css`.

## API (backend Kerben Travel)

Адрес backend — `KERBEN_API_URL` (по умолчанию `https://13.49.104.87`), код — `src/utils/api/backend.ts`.
Backend вызывается **только с сервера Next.js** (страницы и маршруты `/api/*`), чтобы адрес и ключи не попадали в браузер,
а фото из backend раздаёт `next/image` с домена сайта.

| Что на сайте | Запрос к backend |
| --- | --- |
| Каталог, страница тура, карта, поиск, sitemap | `GET /tours/?lang=…` + `GET /tours/{id}/?lang=…` (фото и программа по дням) |
| Регистрация, вход, сброс пароля | `POST /account/register`, `/account/login`, `/account/forgot-password`, `/account/reset-password`, `GET /account/me` |
| «Забронировать» (тур, отель, машина, трекинг, вертолёт) | открывает ИИ-ассистента; заявка — `POST /booking/confirm` (сводка ИИ) или `POST /travel-selections/` + `POST /travel-requests/` (карточка и «Форма») |
| «Мои поездки» → «Заявки» | `GET /travel-requests/me/`, отмена — `DELETE /travel-requests/me/{id}/` (статусы сверяются раз в 30 секунд) |
| Форма «Контакты» | не backend: кнопки WhatsApp и Telegram менеджера (контакты из `GET /contacts/` или `src/config/site.ts`) |
| Отели (`/hotels`) | `GET /hotels/` + `/hotel-images/` + `/regions/`, `/districts/`, `/countries/` (место) |
| Трекинг (`/trekking`, `/trekking/{id}`) | `GET /trekkings/` + `/trekking-programs/` + `/trekking-images/` |
| Транспорт (`/transport`) | `GET /transports/` + `/transport-images/` |
| Вертолётные туры (`/helicopter`) | `GET /helicopter-tours/` + `/helicopter-images/` |
| «Kerben Travel в цифрах» на главной | `GET /abouts/` |
| FAQ: страница `/faq` (все вопросы), на главной — первые 6 | `GET /faqs/` |
| Разделы на странице «О нас» | `GET /about-sections/` |
| Категория тура | `GET /tour-categories/` |
| Отзывы о турах | `GET/POST /tours/{id}/reviews/` |

- Туры кешируются на несколько минут (`"use cache"`). **Пока в backend нет ни одного тура** (или он недоступен),
  каталог показывает «скоро здесь появятся предложения» с кнопкой ИИ-ассистента; выдуманных туров нет.
- Адрес тура из backend — `/tours/{id}`. Тексты backend переводит сам по `?lang=ru|en|de|zh`.
- В backend у тура нет координат, рейтинга, отзывов и сложности — эти блоки у таких туров скрыты,
  а точка на карте ставится в центр Кыргызстана.
- Телефон в заявках обязателен (его требует backend), email — по желанию.
- Пока раздел в backend пустой: FAQ — тексты словаря, цифры — значения словаря,
  а отели, трекинг, транспорт и вертолёт — «скоро здесь появятся предложения» с формой заявки.
- Контакты (телефон, email, WhatsApp, Instagram) — только из `GET /contacts/`; чего нет в backend, того нет и на сайте.
- Код загрузки разделов — `src/utils/api/catalog.ts` (кеш несколько минут, при ошибке раздел просто пустой).

## Бронирование через ИИ-ассистента

На сайте нет кнопки «Войти» и профиля: аккаунт создаётся только в ИИ-ассистенте (`/chat`).

1. Любая кнопка «Забронировать» / «Оставить заявку» ведёт в `/chat?book=…` (что бронируют — в адресе).
2. Гость видит регистрацию «Бронирование: <название>», после неё сразу открывается чат.
3. Первое сообщение («Хочу забронировать: …») пишется само, ИИ, как менеджер, по очереди спрашивает даты,
   сколько человек, имя и телефон и присылает блок ` ```booking {…}``` `.
4. Сайт показывает его карточкой «Проверьте заявку» → «Отправить менеджеру» → заявка в backend (`/travel-requests/`),
   квитанция — в «Мои поездки» → «Заявки». Над полем ввода есть «Форма» — та же заявка без переписки.

Код: `src/utils/booking-chat.ts` (формат блока), `components/ai/ai-booking-card`. Сам ИИ (ответы, инструкция) работает в backend.

При регистрации спрашиваем имя, **телефон**, email и пароль — телефон хранится в аккаунте backend,
поэтому ни ИИ, ни форма заявки контакты больше не спрашивают: в форме только даты и сколько человек.

Отзыв о туре и «Мои заявки» на всех устройствах — тоже через регистрацию в ИИ-ассистенте (`/chat?next=…` возвращает обратно).

## Аккаунты и ИИ-чат (backend)

- Аккаунт клиента — в backend (`/account/*`); браузер ходит туда через прокси `/api/chat/…` (`src/app/api/chat/[...path]/route.ts`).
- Токен входа и профиль хранятся в браузере (`localStorage`, ключ `kerben-session`) — `src/utils/store/auth.ts`, `src/utils/auth.ts`.
- ИИ-чат — websocket backend `wss://…/ws/chat/{id}`. Токен чата выдаёт `/api/chat/token`: если чат принимает токен аккаунта,
  берётся он; иначе сервер заводит отдельный аккаунт чата (пароль выводится из `CHAT_ACCOUNT_SECRET`).
- Websocket backend принимает Origin только `http://localhost:3000` и боевой домен — локально запускайте на порту 3000.
- Сброс пароля: backend шлёт письмо со ссылкой; страница `/{язык}/reset-password` берёт токен из `?token=…`.

## Админка

У сайта **два адреса** — один проект, один деплой:

| Адрес | Что там |
| --- | --- |
| клиентский (`NEXT_PUBLIC_SITE_URL`, например `kerben-travel.vercel.app`) | сайт; `/{язык}/admin` здесь всегда обычная 404 |
| админский (`ADMIN_HOSTS`, например `kerben-travel-admin.vercel.app`) | только админка: вход → рабочее место |

Локально админка открывается на **http://admin.localhost:3000** (браузер сам ведёт `*.localhost` на ваш компьютер).
Логика — в `src/proxy.ts`: по заголовку `Host` решает, какой это адрес.

**Вход.** Email, пароль и код из приложения-аутентификатора (`POST /admin/login/`: `username`, `password`, `totp_code`).
Галочка «Доверять этому браузеру 30 дней» отправляет `remember_device`, а `device_token` хранится в httpOnly-cookie
`kg_admin_device` 30 дней — с ним код не спрашивается. Access-токен живёт `expires_in` (60 минут) в cookie `kg_admin`,
refresh — в `kg_admin_refresh` до `refresh_expires_at`; `src/proxy.ts` сам продлевает сессию через
`POST /admin/token/refresh/`, выход — `POST /admin/logout/` (доверенный браузер при этом остаётся, его можно «забыть» на странице входа).
После 5 неверных попыток с одного IP вход закрыт на 15 минут. Все запросы к backend идут с сервера.

**Что есть.** Обзор (новые заявки, число записей), заявки (вкладки по статусам, смена статуса, телефон и WhatsApp),
туры, отели, транспорт, вертолёты, трекинг (с фото и программой по дням), категории, страны, регионы, районы, FAQ,
«О нас» и контакты. Переключатель «Показывать на сайте» прямо в строке таблицы, Ctrl+S — сохранить,
предупреждение о несохранённых изменениях. Тексты пишутся на русском — backend переводит сам; у тура есть «Перевести заново».
После сохранения сайт сбрасывает кеш (`updateTag`), и изменения видны сразу.

**Код.** Маршрутизация по адресу — `src/proxy.ts`; разделы и поля — `src/utils/admin/resources.ts` (новый раздел — одно описание),
форма — `form.ts`, сессия — `session.ts`, запросы с токеном — `api.ts`, серверные действия — `src/app/[lang]/admin/actions.ts`,
страницы — `src/app/[lang]/admin/` (`login/` и `(panel)/`), интерфейс — `src/components/admin/*`.

**Vercel.** Project → Settings → Domains → добавить второй адрес для админки (например `kerben-travel-admin.vercel.app`
или `admin.ваш-домен`); в Environment Variables — `ADMIN_HOSTS` с этим адресом.

**Ограничения backend.** Фото загружаются в backend (`POST /admin/media/`). Список вертолётов не отдаёт часть полей,
поэтому при сохранении уходят только изменённые поля. Брони туров (`/bookings/`) через API не читаются — в админке только заявки.

## Деплой (Vercel)

1. Залить репозиторий на GitHub.
2. На vercel.com → **Add New Project** → выбрать репозиторий.
3. В **Environment Variables** добавить `NEXT_PUBLIC_SITE_URL` (и `KERBEN_API_URL`, если адрес backend поменяется).
4. Deploy. Каждый push в `main` выкладывается автоматически.

## Фото

Фото Кыргызстана — Wikimedia Commons (лицензии CC, авторы на странице `/credits`), остальные — Unsplash.
