# Админка Kerben Travel — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Админ входит через форму ИИ-ассистента и управляет данными backend Kerben Travel прямо на сайте; заодно «ИИ-гид» → «ИИ-ассистент» и сбой backend больше не кешируется как пустой раздел.

**Architecture:** Описание разделов (`src/lib/admin/resources.ts`) + чистые функции формы (`form.ts`) общие для сервера и браузера. Токен админа — в httpOnly-cookie, доступ к backend только с сервера (`session.ts`, `api.ts`, серверные действия `actions.ts`). Страницы `src/app/[lang]/admin/*` — серверные компоненты внутри `<Suspense>`, интерфейс — клиентские компоненты `src/components/admin/*`.

**Tech Stack:** Next.js 16.4 (App Router, Cache Components, Server Actions, `updateTag`), React 19, TypeScript, обычный CSS по правилам проекта, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-22-admin-panel-design.md`

## Global Constraints

- Backend: `BACKEND_URL` из `src/lib/api/backend.ts`; запросы только с сервера Next.js.
- Вход: `POST /admin/login/` с телом `{ "username": <email из формы>, "password": <пароль> }` → `access_token`; проверка — `GET /admin/me/`; заголовок `Authorization: Bearer <token>`.
- Cookie: имя `kg_admin`, `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"`, `maxAge: 8 * 60 * 60`.
- Вход админа пробуется **только** в режиме регистрации, когда имя и телефон пустые (после `trim`), а email и пароль заполнены. Ответ `adminSignIn` — только `{ ok: boolean }`.
- Без входа любой `/{lang}/admin/*` → `notFound()`. Ссылок на админку на сайте нет. `robots.ts` — `disallow "/*/admin"`; metadata админки — `robots: { index: false, follow: false }`.
- Интерфейс админки — только русский; запросы к backend с `?lang=ru` там, где backend принимает `lang`.
- `PUT` отправляет только изменённые поля.
- После успешной записи — `updateTag` для тегов раздела: `"tours" | "catalog" | "about" | "contacts"`.
- Статусы заявок и подписи: `new` — «Новая», `in_progress` — «В работе», `completed` — «Выполнена», `cancelled` — «Отменена».
- Единицы цены: `per_person` «за человека», `per_day` «в день», `per_night` «за ночь», `per_hour` «в час», `per_trip` «за поездку». Типы тура: `classic` «Классический», `adventure` «Приключения», `cultural` «Культурный», `winter` «Зимний», `individual` «Индивидуальный», `combined` «Комбинированный».
- Тексты ошибок: сеть/5xx — «Бэкенд не отвечает. Попробуйте ещё раз»; 401 — «Сессия истекла. Войдите снова»; тосты успеха — «Сохранено», «Удалено», «Статус изменён», «Перевод запущен».
- CSS: у компонента своя папка `Name.tsx` + `name.css`; только одиночные классы, без вложенности и селекторов потомков; цвета/отступы — переменные из `globals.css` (`--primary`, `--navy`, `--line`, `--soft`, `--muted`, `--danger`, `--success`, `--radius`, `--space-*`, `--fs-*`, `--shadow*`).
- Ветка `feature/admin-panel`; коммиты — после каждой задачи (если заказчик разрешил коммитить).

## Review Focus

1. Сохранение записи, у которой список backend отдаёт не все поля (вертолёт: `instruction`, `included`, `price_unit`, `is_active`) — непереданные поля не должны затираться. → тест в Task 3.
2. Цена или число, введённые как «1 200,50» или «abc» — должно стать `1200.5` либо ошибкой у поля, но никогда `NaN`/строкой в backend. → тест в Task 3.
3. Cookie есть, а токен истёк: страница админки → 404, действие → `{ ok: false, error: "auth" }` и cookie удалена; введённые данные в панели не теряются. → тест в Task 5.
4. Обычный посетитель регистрируется, оставив имя и телефон пустыми, или backend недоступен — форма показывает обычные ошибки «обязательно», никуда не переходит. → тест в Task 6.
5. Удаление записи, которую backend не даёт удалить (например, тур с фото) — сообщение backend показывается, строка остаётся. → тест в Task 5.

---

### Task 1: Сбой backend не кешируется

**Files:**
- Modify: `src/lib/api/catalog.ts` (`loadList`), `src/lib/api/tours.ts` (`loadBackendTours`), `src/lib/api/about.ts` (`getCompanyStats`), `src/lib/api/contacts.ts` (`getContacts`)
- Test: `tests/catalog-cache.test.ts`

**Interfaces:**
- Produces: в каждом файле кешируемая функция (`"use cache"`) **бросает** при ошибке backend; экспортируемая функция ловит и отдаёт прежний запасной вариант (`[]`, демо-туры, `null`, `FALLBACK`). Внешние сигнатуры (`getTransports`, `getTours`, `getCompanyStats`, `getContacts` …) не меняются.

- [ ] **Step 1: Failing test.** В тесте `vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))`, `fetch` подменён (как в `tests/bookings-route.test.ts`).

```ts
it("getTransports: первый запрос упал, второй вернул данные — второй вызов видит данные", async () => {
  const fetchMock = vi.fn()
    .mockRejectedValueOnce(new Error("down"))          // /transports/
    .mockResolvedValue(Response.json([]));             // всё остальное
  vi.stubGlobal("fetch", fetchMock);
  expect(await getTransports("ru")).toEqual([]);
  fetchMock.mockResolvedValueOnce(Response.json([{ id: 1, name: "Минивэн", seats: 7, price: "80.00", price_unit: "per_day", has_driver: true, has_air_conditioner: true, is_active: true }]));
  expect((await getTransports("ru")).map((t) => t.name)).toEqual(["Минивэн"]);
});
it("loadListCached бросает при ошибке backend", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
  await expect(loadListCached("/transports/?lang=ru")).rejects.toThrow();
});
```

`loadListCached` экспортировать из `catalog.ts` только для теста (`/** @internal */`).

- [ ] **Step 2:** `npx vitest run tests/catalog-cache.test.ts` → FAIL (`loadListCached` не существует).
- [ ] **Step 3:** В `catalog.ts`: `export async function loadListCached<T>(url: string): Promise<T[]>` — `"use cache"`, `cacheLife("minutes")`, `cacheTag("catalog")`, без `try`; `loadList` строит `url`, вызывает её в `try/catch` и пишет прежний `console.warn`. Так же в `tours.ts` (пустой список туров — по-прежнему `null` и кешируется; исключение — не кешируется), `about.ts`, `contacts.ts`.
- [ ] **Step 4:** `npx vitest run` → все тесты PASS.
- [ ] **Step 5:** Commit `fix: do not cache backend failures as empty sections`.

### Task 2: «ИИ-гид» → «ИИ-ассистент»

**Files:**
- Modify: `src/dictionaries/ru.json`, `en.json`, `de.json`, `zh.json`
- Test: `tests/i18n.test.ts` (добавить кейс)

- [ ] **Step 1: Failing test.**

```ts
it("ИИ-ассистент вместо ИИ-гида во всех словарях", () => {
  const raw = (l: string) => readFileSync(`src/dictionaries/${l}.json`, "utf8");
  expect(raw("ru")).not.toMatch(/ИИ-гид/);
  expect(raw("en")).not.toMatch(/AI guide/i);
  expect(raw("de")).not.toMatch(/KI-Guide|KI-Reiseführer/);
  expect(raw("zh")).not.toMatch(/AI ?(向导|导游)/);
  expect(raw("ru")).toMatch(/ИИ-ассистент/);
});
```

- [ ] **Step 2:** `npx vitest run tests/i18n.test.ts` → FAIL.
- [ ] **Step 3:** Заменить по смыслу и падежам: ru `ИИ-гид/-а/-у/-ом/-е` → `ИИ-ассистент/-а/-у/-ом/-е` (проверить согласование: «он ответит» остаётся верным); en `AI guide`/`AI Guide` → `AI assistant`/`AI Assistant`; de `KI-Guide`, `KI-Reiseführer` → `KI-Assistent` (с артиклями и падежами: `den KI-Assistenten`, `dem KI-Assistenten`); zh `AI 向导`/`AI 导游` → `AI 助手`. Комментарии в коде не трогать.
- [ ] **Step 4:** `npx vitest run` → PASS; `npm run typecheck` → без ошибок.
- [ ] **Step 5:** Commit `copy: rename AI guide to AI assistant`.

### Task 3: Описание разделов и логика формы

**Files:**
- Create: `src/lib/admin/resources.ts`, `src/lib/admin/form.ts`
- Test: `tests/admin-form.test.ts`, `tests/admin-resources.test.ts`

**Interfaces:**
- Produces (`resources.ts`, без `server-only`):

```ts
export type CacheTag = "tours" | "catalog" | "about" | "contacts";
export type FieldType = "text" | "textarea" | "number" | "price" | "select" | "relation" | "boolean" | "image" | "list" | "time";
export interface FieldDef {
  name: string; label: string; type: FieldType;
  required?: boolean; hint?: string;
  options?: { value: string; label: string }[];   // select
  relation?: ResourceKey;                           // relation: значения — id, подписи — titleField связанного раздела
  defaultValue?: string | boolean;
}
export interface ChildDef { resource: ResourceKey; foreignKey: string; tab: "Фото" | "Программа по дням" }
export interface ResourceDef {
  key: ResourceKey; path: string;                   // "/transports/"
  title: string; one: string;                       // «Транспорт», «машину» (для «Добавить машину»)
  group: "catalog" | "directory" | "content" | "child";
  icon: IconName; titleField: string; imageField?: string; subtitle?: (r: AdminRecord) => string;
  columns: { field: string; label: string; format?: "price" | "boolean" | "date" }[];
  fields: FieldDef[]; children?: ChildDef[]; tags: CacheTag[];
  usesLang: boolean;                                // ?lang=ru у GET списка
  translatable?: boolean;                           // только tours
}
export type AdminRecord = Record<string, unknown> & { id: number };
export type ResourceKey = "tours" | "tourImages" | "tourPrograms" | "hotels" | "hotelImages" | "transports" | "transportImages"
  | "helicopters" | "helicopterImages" | "trekkings" | "trekkingImages" | "trekkingPrograms"
  | "categories" | "countries" | "regions" | "districts" | "faqs" | "abouts" | "aboutSections" | "contacts";
export const RESOURCES: Record<ResourceKey, ResourceDef>;
export const MENU: { title: string; items: ResourceKey[] }[];   // «Каталог», «Справочники», «Контент»
export function getResource(key: string): ResourceDef | null;   // только не-child разделы
export const REQUEST_STATUSES: { value: RequestStatus; label: string }[];
export type RequestStatus = "new" | "in_progress" | "completed" | "cancelled";
```

Поля и пути — из `openapi.json` backend (схемы `*InputSchema`; список в спеке, раздел «Разделы и группы»). Теги: туры и их фото/программы → `["tours"]`; категории туров → `["tours", "catalog"]` (названия категорий читает `loadList`, а их показывают туры); отели, транспорт, вертолёты, трекинг, их дети, страны/регионы/районы, `faqs`, `aboutSections` → `["catalog"]` (всё это читается через `loadList`); `abouts` → `["about"]`; `contacts` → `["contacts"]`. Иконки — из Task 7.

- Produces (`form.ts`, без `server-only`):

```ts
export type FormValue = string | boolean | string[];
export type FormValues = Record<string, FormValue>;
export function toFormValues(def: ResourceDef, record: AdminRecord | null): FormValues;
export function validateValues(def: ResourceDef, values: FormValues): Record<string, string>; // поле → текст ошибки
export function toPayload(def: ResourceDef, values: FormValues, original: FormValues | null): Record<string, unknown>;
export function fieldErrorsFrom422(detail: unknown): Record<string, string>;
export function parseNumber(value: string): number | null; // «1 200,50» → 1200.5; «» → null; «abc» → NaN
```

- [ ] **Step 1: Failing tests** (`tests/admin-form.test.ts`):

```ts
const heli = RESOURCES.helicopters;
it("toPayload при изменении отправляет только изменённые поля", () => {
  const original = toFormValues(heli, { id: 1, title: "Полёт", price: "1000.00", description: null, duration_minutes: 45 });
  const values = { ...original, title: "Полёт над Ала-Арчой" };
  expect(toPayload(heli, values, original)).toEqual({ title: "Полёт над Ала-Арчой" });
});
it("toPayload при создании: числа и цена — числа, пустые необязательные — null, boolean — boolean", () => {
  const values = { ...toFormValues(RESOURCES.transports, null), name: "Sprinter", seats: "18", price: "1 200,50", year: "" };
  expect(toPayload(RESOURCES.transports, values, null)).toMatchObject({ name: "Sprinter", seats: 18, price: 1200.5, year: null, has_driver: true, is_active: true, price_unit: "per_day" });
});
it("validateValues: обязательные и неверные числа", () => {
  const values = { ...toFormValues(RESOURCES.transports, null), name: "", seats: "abc", price: "" };
  expect(validateValues(RESOURCES.transports, values)).toEqual({ name: "Обязательное поле", seats: "Введите число", price: "Обязательное поле" });
});
it("parseNumber", () => {
  expect(parseNumber("1 200,50")).toBe(1200.5);
  expect(parseNumber("")).toBeNull();
  expect(parseNumber("abc")).toBeNaN();
});
it("fieldErrorsFrom422 берёт имя поля из loc", () => {
  expect(fieldErrorsFrom422([{ loc: ["body", "price"], msg: "Input should be a valid number" }, { loc: ["query", "lang"], msg: "x" }]))
    .toEqual({ price: "Input should be a valid number" });
  expect(fieldErrorsFrom422("oops")).toEqual({});
});
it("список удобств отеля: строки по одной на строку ↔ массив", () => {
  const v = toFormValues(RESOURCES.hotels, { id: 1, name: "H", region_id: 1, district_id: 2, price: "50", amenities: ["Wi-Fi", "Завтрак"] });
  expect(v.amenities).toEqual(["Wi-Fi", "Завтрак"]);
});
```

`tests/admin-resources.test.ts`: для каждого раздела — все обязательные поля backend есть в `fields` с `required: true`:

```ts
const REQUIRED: Partial<Record<ResourceKey, string[]>> = {
  tours: ["title", "price"], hotels: ["region_id", "district_id", "name", "price"], transports: ["name", "seats", "price"],
  helicopters: ["title", "price"], trekkings: ["title", "price"], tourImages: ["tour_id", "image"], tourPrograms: ["tour_id", "day_number"],
  hotelImages: ["hotel_id", "image"], transportImages: ["transport_id", "image"], helicopterImages: ["helicopter_id", "image"],
  trekkingImages: ["trekking_id", "image"], trekkingPrograms: ["trekking_id", "day_number"], categories: ["name"],
  countries: ["name"], regions: ["name"], districts: ["region_id", "name"], faqs: ["question", "answer"],
};
it.each(Object.entries(REQUIRED))("%s: обязательные поля backend помечены required", (key, names) => {
  const fields = RESOURCES[key as ResourceKey].fields;
  for (const n of names) expect(fields.find((f) => f.name === n)?.required).toBe(true);
});
it("getResource не отдаёт дочерние разделы и неизвестные ключи", () => {
  expect(getResource("tourImages")).toBeNull();
  expect(getResource("nope")).toBeNull();
  expect(getResource("transports")?.path).toBe("/transports/");
});
```

- [ ] **Step 2:** `npx vitest run tests/admin-form.test.ts tests/admin-resources.test.ts` → FAIL (модулей нет).
- [ ] **Step 3:** Написать `resources.ts` и `form.ts`. Внешний ключ дочернего раздела (`tour_id` …) в форме ребёнка не показывается — его подставляет родитель (Task 8). `toPayload(…, original=null)` отправляет все поля формы; с `original` — только отличающиеся (сравнение после приведения типов). Тексты ошибок: «Обязательное поле», «Введите число».
- [ ] **Step 4:** тесты PASS.
- [ ] **Step 5:** Commit `feat(admin): resource definitions and form logic`.

### Task 4: Сессия и запросы к backend с токеном

**Files:**
- Create: `src/lib/admin/api.ts`, `src/lib/admin/session.ts`
- Test: `tests/admin-api.test.ts`

**Interfaces:**
- Consumes: `apiFetch`, `ApiError` (`src/lib/api/client.ts`), `BACKEND_URL` (`backend.ts`), `ResourceDef`, `AdminRecord` (Task 3).
- Produces:

```ts
// api.ts — import "server-only"
export interface AdminProfile { id: number; username: string }
export class AdminAuthError extends Error {}
export function adminLogin(username: string, password: string): Promise<string | null>; // токен или null (401/422); сеть → null
export function adminMe(token: string): Promise<AdminProfile | null>;                     // 401/403 → null
export function adminFetch<T>(token: string, path: string, init?: { method?: string; body?: unknown }): Promise<T>; // 401/403 → AdminAuthError, остальное — ApiError
export function listRecords(token: string, def: ResourceDef): Promise<AdminRecord[]>;   // GET def.path (+ ?lang=ru если def.usesLang)
// session.ts — import "server-only"
export const ADMIN_COOKIE = "kg_admin";
export function getAdminToken(): Promise<string | null>;
export const requireAdmin: () => Promise<{ admin: AdminProfile; token: string }>; // React cache(); нет/невалиден → notFound()
```

- [ ] **Step 1: Failing tests** (fetch подменён):

```ts
it("adminLogin шлёт username/password и возвращает токен", async () => {
  const f = mockFetch(200, { access_token: "T", token_type: "bearer" });
  expect(await adminLogin("boss@kg.kg", "pw")).toBe("T");
  const [url, init] = f.mock.calls[0];
  expect(url).toMatch(/\/admin\/login\/$/);
  expect(JSON.parse(init.body)).toEqual({ username: "boss@kg.kg", password: "pw" });
});
it("adminLogin: 401 и сетевая ошибка → null", async () => {
  mockFetch(401, { detail: "bad" }); expect(await adminLogin("a@b.kg", "x")).toBeNull();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down"))); expect(await adminLogin("a@b.kg", "x")).toBeNull();
});
it("adminFetch ставит Bearer и превращает 401 в AdminAuthError", async () => {
  const f = mockFetch(200, []);
  await adminFetch("T", "/tours/");
  expect(f.mock.calls[0][1].headers.Authorization).toBe("Bearer T");
  mockFetch(401, { detail: "expired" });
  await expect(adminFetch("T", "/tours/")).rejects.toBeInstanceOf(AdminAuthError);
});
it("listRecords добавляет lang=ru только разделам с usesLang", async () => {
  const f = mockFetch(200, []);
  await listRecords("T", RESOURCES.transports); expect(f.mock.calls[0][0]).toMatch(/\/transports\/\?lang=ru$/);
  await listRecords("T", RESOURCES.transportImages); expect(f.mock.calls[1][0]).toMatch(/\/transport-images\/$/);
});
```

- [ ] **Step 2:** `npx vitest run tests/admin-api.test.ts` → FAIL.
- [ ] **Step 3:** Реализовать. `requireAdmin` — `cache()` из `react`: читает cookie через `cookies()` (`next/headers`), вызывает `adminMe`; при неудаче — `notFound()` (cookie в рендере не трогаем).
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(admin): backend client and session`.

### Task 5: Серверные действия

**Files:**
- Create: `src/app/[lang]/admin/actions.ts` (`"use server"`)
- Test: `tests/admin-actions.test.ts` (`vi.mock("next/headers")` с фейковым хранилищем cookie; `vi.mock("next/cache", () => ({ updateTag: vi.fn() }))`; `vi.mock("next/navigation", () => ({ redirect: vi.fn(), notFound: vi.fn() }))`)

**Interfaces:**
- Consumes: Task 3, Task 4.
- Produces:

```ts
export type ActionResult =
  | { ok: true; record?: AdminRecord }
  | { ok: false; error: "auth" | "network" | "validation" | "backend"; message?: string; fields?: Record<string, string> };
export async function adminSignIn(email: string, password: string): Promise<{ ok: boolean }>;
export async function adminSignOut(lang: string): Promise<void>;                     // удалить cookie, redirect(`/${lang}`)
export async function saveRecord(key: ResourceKey, id: number | null, values: FormValues, original: FormValues | null): Promise<ActionResult>;
export async function deleteRecord(key: ResourceKey, id: number): Promise<ActionResult>;
export async function setRequestStatus(id: number, status: RequestStatus): Promise<ActionResult>;
export async function retranslateTour(id: number): Promise<ActionResult>;
```

- [ ] **Step 1: Failing tests:**

```ts
it("adminSignIn: успех ставит cookie kg_admin с нужными флагами", async () => {
  mockFetch(200, { access_token: "T" });
  expect(await adminSignIn("boss@kg.kg", "pw")).toEqual({ ok: true });
  expect(cookieStore.set).toHaveBeenCalledWith("kg_admin", "T", expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 28800 }));
});
it("adminSignIn: неудача — { ok: false } и без cookie", async () => {
  mockFetch(401, { detail: "bad" });
  expect(await adminSignIn("x@y.kg", "pw")).toEqual({ ok: false });
  expect(cookieStore.set).not.toHaveBeenCalled();
});
it("saveRecord без cookie → auth, в backend не ходит", async () => {
  cookieStore.get.mockReturnValue(undefined);
  const f = mockFetch(200, {});
  expect(await saveRecord("transports", 1, {}, {})).toMatchObject({ ok: false, error: "auth" });
  expect(f).not.toHaveBeenCalled();
});
it("saveRecord: PUT только изменённых полей и updateTag по тегам раздела", async () => {
  const f = mockFetch(200, { id: 1, title: "Новый" });
  const original = toFormValues(RESOURCES.helicopters, { id: 1, title: "Старый", price: "1000.00" });
  const res = await saveRecord("helicopters", 1, { ...original, title: "Новый" }, original);
  expect(res.ok).toBe(true);
  const [url, init] = f.mock.calls[0];
  expect(url).toMatch(/\/helicopter-tours\/1\/$/); expect(init.method).toBe("PUT");
  expect(JSON.parse(init.body)).toEqual({ title: "Новый" });
  expect(updateTag).toHaveBeenCalledWith("catalog");
});
it("saveRecord: неверные поля → validation без запроса; 422 → поля из detail", async () => {
  const f = mockFetch(422, { detail: [{ loc: ["body", "price"], msg: "bad" }] });
  expect(await saveRecord("transports", null, { ...toFormValues(RESOURCES.transports, null), name: "" }, null))
    .toMatchObject({ ok: false, error: "validation", fields: { name: "Обязательное поле" } });
  expect(f).not.toHaveBeenCalled();
  const ok = { ...toFormValues(RESOURCES.transports, null), name: "A", seats: "4", price: "10" };
  expect(await saveRecord("transports", null, ok, null)).toMatchObject({ ok: false, error: "validation", fields: { price: "bad" } });
});
it("истёкший токен: 401 → auth и cookie удалена", async () => {
  mockFetch(401, { detail: "expired" });
  expect(await deleteRecord("tours", 3)).toMatchObject({ ok: false, error: "auth" });
  expect(cookieStore.delete).toHaveBeenCalledWith("kg_admin");
});
it("backend не дал удалить → backend с его сообщением", async () => {
  mockFetch(400, { detail: "Tour has images" });
  expect(await deleteRecord("tours", 3)).toEqual({ ok: false, error: "backend", message: "Tour has images" });
});
it("сеть упала → network", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
  expect(await setRequestStatus(5, "completed")).toMatchObject({ ok: false, error: "network" });
});
it("setRequestStatus: PATCH /admin/requests/5/status/", async () => {
  const f = mockFetch(200, { id: 5, status: "completed" });
  await setRequestStatus(5, "completed");
  expect(f.mock.calls[0][0]).toMatch(/\/admin\/requests\/5\/status\/$/);
  expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ status: "completed" });
});
```

- [ ] **Step 2:** `npx vitest run tests/admin-actions.test.ts` → FAIL.
- [ ] **Step 3:** Реализовать. Каждое действие кроме `adminSignIn` начинается с `getAdminToken()`; `key` проверяется через `RESOURCES` (неизвестный → `{ ok: false, error: "backend" }`). `saveRecord`: `validateValues` → `toPayload` → `POST def.path` или `PUT ${def.path}${id}/`. Пустой payload при PUT → `{ ok: true }` без запроса. `retranslateTour` → `POST /tours/{id}/translate/`, тег `tours`. `setRequestStatus` — `updateTag` не нужен.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(admin): server actions`.

### Task 6: Вход админа из формы ИИ-ассистента

**Files:**
- Modify: `src/components/auth/auth-form/AuthForm.tsx` (`onSubmit`)
- Test: `tests/auth-form-admin.test.tsx`

**Interfaces:**
- Consumes: `adminSignIn` (Task 5).

- [ ] **Step 1: Failing tests** (Testing Library; `vi.mock("@/app/[lang]/admin/actions", () => ({ adminSignIn: vi.fn() }))`, `vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))`, `vi.mock("@/lib/auth")`; компонент обёрнут в `I18nProvider` с `ru`-словарём):

```ts
it("имя и телефон пустые → adminSignIn, успех → /ru/admin", async () => {
  adminSignIn.mockResolvedValue({ ok: true });
  fill({ email: "boss@kg.kg", password: "secret1" }); submit();
  await waitFor(() => expect(push).toHaveBeenCalledWith("/ru/admin"));
  expect(signUp).not.toHaveBeenCalled();
});
it("неудача входа админа → обычные ошибки «обязательно», без перехода", async () => {
  adminSignIn.mockResolvedValue({ ok: false });
  fill({ email: "user@kg.kg", password: "secret1" }); submit();
  expect(await screen.findAllByText(dict.login.errors.required)).toHaveLength(2);
  expect(push).not.toHaveBeenCalled();
});
it("имя заполнено → adminSignIn не вызывается", async () => {
  fill({ name: "Айдана", email: "a@kg.kg", password: "secret1" }); submit();
  await waitFor(() => expect(adminSignIn).not.toHaveBeenCalled());
});
it("режим «Войти» → adminSignIn не вызывается", …);
it("adminSignIn бросил (сеть) → как неудача", …);
```

- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** В `onSubmit` до `validateAuth`: если `register && !values.name?.trim() && !values.phone?.trim() && values.email.trim() && values.password` → `busy`, `await adminSignIn(...).catch(() => ({ ok: false }))`; `ok` → `router.push(\`/${locale}/admin\`)` и выход; иначе обычный путь. Комментарий в коде — нейтральный, без слова «админ» в разметке.
- [ ] **Step 4:** PASS (`npx vitest run`).
- [ ] **Step 5:** Commit `feat(admin): sign in from the assistant sign-up form`.

### Task 7: Оболочка админки, скрытность, иконки, тосты

**Files:**
- Modify: `src/components/layout/chrome-gate/ChromeGate.tsx`, `src/app/[lang]/layout.tsx` (проп для шапки), `src/app/robots.ts`, `src/components/ui/icon/Icon.tsx`
- Create: `src/app/[lang]/admin/layout.tsx`, `src/components/admin/admin-shell/AdminShell.tsx` + `admin-shell.css`, `src/components/admin/admin-toast/AdminToast.tsx` + `admin-toast.css`
- Test: `tests/chrome-gate.test.ts`

**Interfaces:**
- Produces:
  - `isAdminPage(pathname: string): boolean` (`/^\/[^/]+\/admin(?:\/|$)/`); `ChromeGate({ children, keepOnAdmin?: boolean })` — скрывает на полноэкранных страницах всегда и на админке, если `!keepOnAdmin`. В layout: шапка — `keepOnAdmin`, подвал и `MobileNav` — без.
  - Иконки: `pencil`, `logout`, `image`, `refresh`, `inbox`, `layout` (24×24, stroke, как остальные).
  - `AdminShell({ admin: AdminProfile; lang: string; newRequests: number; children })` — клиентский; меню: «Обзор» (`/{lang}/admin`), «Заявки» (+ счётчик `newRequests`), затем группы `MENU`; активный пункт по `usePathname`; наверху имя админа и кнопка «Выйти» (`<form action={adminSignOut.bind(null, lang)}>`); на ширине < 900px вместо меню — `<select>` с переходом `router.push`.
  - `AdminToastProvider`, `useAdminToast(): (text: string, tone?: "success" | "error") => void` — тост внизу справа, 3 секунды, `role="status"`.
  - `admin/layout.tsx`: `export const instant = false`; `metadata = { title: "Админка", robots: { index: false, follow: false } }`; рендерит `<Suspense fallback={<AdminSkeleton/>}><AdminFrame params={params}>{children}</AdminFrame></Suspense>`; `AdminFrame` — async: `hasLocale` → иначе `notFound()`, `requireAdmin()`, число новых заявок (`adminFetch(token, "/admin/requests/")`, при ошибке 0), `<AdminToastProvider><AdminShell …>`.

- [ ] **Step 1: Failing test:** `isAdminPage("/ru/admin")`, `isAdminPage("/en/admin/tours")` → true; `isAdminPage("/ru/administration")`, `isAdminPage("/ru/tours")` → false.
- [ ] **Step 2:** FAIL. **Step 3:** реализовать всё из Interfaces; `robots.ts` — добавить `"/*/admin"` в `disallow`.
- [ ] **Step 4:** `npx vitest run` → PASS; `npm run typecheck` → чисто. Браузер (dev-сервер `tours-app-dev`): `/ru/admin` без cookie → страница 404 с шапкой и подвалом; `/robots.txt` содержит `/*/admin`.
- [ ] **Step 5:** Commit `feat(admin): admin shell, hidden route, toasts`.

### Task 8: Страница раздела: таблица и панель редактирования

**Files:**
- Create: `src/app/[lang]/admin/[resource]/page.tsx`; `src/components/admin/admin-resource/AdminResource.tsx` (+css) — таблица + поиск + «Добавить»; `admin-editor/AdminEditor.tsx` (+css) — панель; `admin-field/AdminField.tsx` (+css); `admin-children/AdminChildren.tsx` (+css) — фото и программа; `admin-confirm/AdminConfirm.tsx` (+css)
- Test: `tests/admin-resource.test.tsx`

**Interfaces:**
- Consumes: Tasks 3–5, 7.
- Produces:
  - `page.tsx`: `getResource(resource)` или `notFound()`; `requireAdmin()`; параллельно `listRecords` раздела, разделов из `relation` его полей и его `children`. Передаёт в `AdminResource({ def, rows, relations: Partial<Record<ResourceKey, AdminRecord[]>>, children: Partial<Record<ResourceKey, AdminRecord[]>> })`.
  - `AdminResource`: заголовок «{title}» + число; поиск по `titleField` и колонкам (без учёта регистра); строки — миниатюра (`imageField`, `next/image` 56×40, нет фото — иконка `image`), колонки, бейдж «Активен/Скрыт» для `is_active`; кнопка «Добавить {one}»; клик/Enter по строке открывает `AdminEditor`.
  - `AdminEditor({ def, record: AdminRecord | null, relations, children, onClose })`: `<dialog>` справа (на < 700px — на весь экран). Вкладки: «Основное» + `def.children[].tab` (только у существующей записи). «Сохранить» → `saveRecord`; результат: `ok` → тост «Сохранено», `router.refresh()`, закрыть; `validation` → ошибки у полей; `auth` → баннер «Сессия истекла. Войдите снова» со ссылкой на `/{lang}/chat`, значения формы сохраняются; `network` → тост-ошибка «Бэкенд не отвечает. Попробуйте ещё раз»; `backend` → тост с `message`. «Удалить» → `AdminConfirm` → `deleteRecord`. У `translatable` — «Перевести заново» → `retranslateTour` → тост «Перевод запущен».
  - `AdminField({ field, value, error, onChange, relationOptions })`: `text`/`number`/`price` — input (`inputMode="decimal"` для чисел); `textarea`; `select`/`relation` — `<select>` (у необязательной связи пустой пункт «—»); `boolean` — переключатель; `image` — input-ссылка + превью 16:9 (битая ссылка → подпись «Не удалось загрузить фото»); `list` — textarea «по одному в строке»; `time` — `<input type="time">`.
  - `AdminChildren({ def: ChildDef, parentId, rows })`: фото — сетка превью с полем порядка, «Добавить фото» (ссылка), удалить; программа — список дней по `day_number`, редактирование строки, добавить день. Сохранение — `saveRecord(child.resource, …)` с подставленным `foreignKey: String(parentId)`.

- [ ] **Step 1: Failing tests:**

```ts
it("поиск фильтрует строки без учёта регистра", async () => {
  render(<AdminResource def={RESOURCES.transports} rows={[{ id: 1, name: "Минивэн", seats: 7, price: "80" }, { id: 2, name: "Sprinter", seats: 18, price: "120" }]} relations={{}} children={{}} />);
  await user.type(screen.getByRole("searchbox"), "SPRINT");
  expect(screen.getByText("Sprinter")).toBeInTheDocument();
  expect(screen.queryByText("Минивэн")).toBeNull();
  await user.clear(screen.getByRole("searchbox")); await user.type(screen.getByRole("searchbox"), "нет такой");
  expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
});
it("ошибки validation из saveRecord показываются у полей, панель не закрывается", async () => {
  saveRecord.mockResolvedValue({ ok: false, error: "validation", fields: { price: "Введите число" } });
  … открыть «Добавить машину», нажать «Сохранить» …
  expect(await screen.findByText("Введите число")).toBeInTheDocument();
  expect(screen.getByRole("dialog")).toBeVisible();
});
it("auth → баннер «Сессия истекла», введённое имя остаётся в поле", …);
```

- [ ] **Step 2:** FAIL. **Step 3:** реализовать. **Step 4:** `npx vitest run` → PASS; `npm run typecheck`, `npm run lint` → чисто.
- [ ] **Step 5:** Commit `feat(admin): resource tables and editor`.

### Task 9: Обзор и заявки

**Files:**
- Create: `src/app/[lang]/admin/page.tsx`, `src/app/[lang]/admin/requests/page.tsx`, `src/components/admin/admin-overview/AdminOverview.tsx` (+css), `src/components/admin/admin-requests/AdminRequests.tsx` (+css)
- Test: `tests/admin-requests.test.tsx`

**Interfaces:**
- Consumes: Tasks 3–5, 7, 8 (`AdminConfirm` не нужен).
- Produces:
  - Обзор: `requireAdmin()`; параллельно `/admin/requests/` и `listRecords` для `tours`, `hotels`, `transports`, `helicopters`, `trekkings`, `faqs` (ошибка раздела → «—»). `AdminOverview({ lang, requests, counts })`: карточка «Новые заявки» (ссылка на заявки), карточки разделов (ссылки), «Последние заявки» — 5 новейших по `created_at`.
  - Заявки: `AdminRequests({ requests: TravelRequest[] })`, `TravelRequest` = поля `TravelRequestOutSchema`. Вкладки «Все» и по `REQUEST_STATUSES` со счётчиками; сортировка — новые сверху; строка: имя, телефон (`tel:` и `https://wa.me/<цифры>`), направление, дата поездки, человек, когда пришла (формат `ru-RU`), статус — `<select>` → `setRequestStatus` (оптимистично; ошибка — откат и тост). Клик по строке — панель со всеми полями и сообщением.

- [ ] **Step 1: Failing tests:**

```ts
it("вкладка «Новая» показывает только новые, счётчики верные", …);
it("смена статуса: оптимистично, при ошибке откат и тост", async () => {
  setRequestStatus.mockResolvedValue({ ok: false, error: "network" });
  … выбрать «Выполнена» …
  await waitFor(() => expect(select).toHaveValue("new"));
  expect(await screen.findByText("Бэкенд не отвечает. Попробуйте ещё раз")).toBeInTheDocument();
});
it("ссылка WhatsApp из телефона «+996 (700) 12-34-56»", () => {
  render(<AdminRequests requests={[{ ...request, phone: "+996 (700) 12-34-56" }]} />);
  expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/996700123456");
});
```

- [ ] **Step 2:** FAIL. **Step 3:** реализовать. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(admin): overview and travel requests`.

### Task 10: Документация и полная проверка

**Files:**
- Modify: `README.md` (раздел «Админка»: как войти, что где лежит, ограничения backend; исправить устаревшее дерево `[lang]` — 4 языка, папки `ai/`, `trips/`, `requests/`)

- [ ] **Step 1:** Обновить README.
- [ ] **Step 2:** `npm run check` → lint, типы, все тесты, сборка без ошибок.
- [ ] **Step 3:** Браузер (dev-сервер): `/ru/admin` без входа → 404; `/ru/chat` → регистрация с пустыми именем и телефоном и неверным паролем → обычные ошибки. Затем **заказчик сам** вводит email и пароль админа во встроенном браузере → открывается `/ru/admin`.
- [ ] **Step 4:** С входом: каждый раздел из меню открывается; на тестовой записи транспорта — изменить цену → «Сохранено» → `/ru/transport` показывает новую цену сразу; добавить и удалить фото; сменить статус заявки и вернуть обратно; ширина 375px — меню-список, панель на весь экран. Скриншоты — заказчику.
- [ ] **Step 5:** Commit `docs: admin panel`.
