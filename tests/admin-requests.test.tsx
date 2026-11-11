import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setRequestStatus = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/[lang]/admin/actions", () => ({ setRequestStatus }));

import { AdminRequests } from "@/components/admin/admin-requests/AdminRequests";
import { AdminToastProvider } from "@/components/admin/admin-toast/AdminToast";
import type { TravelRequest } from "@/utils/admin/resources";

HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute("open");
};

const request: TravelRequest = {
  id: 1,
  name: "Айдана",
  phone: "+996 700 123 456",
  email: null,
  travel_date: "2026-11-01",
  duration_days: null,
  travelers_count: 2,
  destination: "Сон-Куль",
  message: "Хотим с ночёвкой в юрте",
  status: "new",
  created_at: "2026-10-22T10:00:00Z",
};
const requests: TravelRequest[] = [
  request,
  { ...request, id: 2, name: "Бакыт", status: "completed", created_at: "2026-10-20T10:00:00Z" },
  { ...request, id: 3, name: "Нурлан", status: "new", created_at: "2026-10-21T10:00:00Z" },
];

function renderRequests(list = requests) {
  render(
    <AdminToastProvider>
      <AdminRequests requests={list} />
    </AdminToastProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("заявки", () => {
  it("новые сверху; вкладка «Новая» показывает только новые, счётчики верные", () => {
    renderRequests();
    const names = screen.getAllByTestId("request-name").map((el) => el.textContent);
    expect(names).toEqual(["Айдана", "Нурлан", "Бакыт"]);
    const tab = screen.getByRole("tab", { name: /Новая/ });
    expect(within(tab).getByText("2")).toBeTruthy();
    fireEvent.click(tab);
    expect(screen.getAllByTestId("request-name").map((el) => el.textContent)).toEqual(["Айдана", "Нурлан"]);
  });

  it("смена статуса: сразу в списке, при ошибке — откат и тост", async () => {
    setRequestStatus.mockResolvedValue({ ok: false, error: "network" });
    renderRequests([request]);
    fireEvent.click(screen.getByRole("button", { name: /^Статус заявки Айдана/ }));
    fireEvent.click(screen.getByRole("option", { name: "Выполнена" }));
    expect(screen.getByRole("button", { name: "Статус заявки Айдана: Выполнена" })).toBeTruthy();
    await waitFor(() => expect(screen.getByRole("button", { name: "Статус заявки Айдана: Новая" })).toBeTruthy());
    expect(await screen.findByText("Бэкенд не отвечает. Попробуйте ещё раз")).toBeTruthy();
    expect(setRequestStatus).toHaveBeenCalledWith(1, "completed");
  });

  it("успешная смена статуса — тост «Статус изменён»", async () => {
    setRequestStatus.mockResolvedValue({ ok: true });
    renderRequests([request]);
    fireEvent.keyDown(screen.getByRole("button", { name: /^Статус заявки Айдана/ }), { key: "ArrowDown" });
    const menu = screen.getByRole("listbox", { name: "Статус заявки Айдана" });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    fireEvent.keyDown(menu, { key: "Enter" });
    expect(await screen.findByText("Статус изменён")).toBeTruthy();
    expect(setRequestStatus).toHaveBeenCalledWith(1, "completed");
  });

  it("ссылка WhatsApp из телефона «+996 (700) 12-34-56»", () => {
    renderRequests([{ ...request, phone: "+996 (700) 12-34-56" }]);
    expect(screen.getByRole("link", { name: /WhatsApp/ }).getAttribute("href")).toBe("https://wa.me/996700123456");
    expect(screen.getByRole("link", { name: "+996 (700) 12-34-56" }).getAttribute("href")).toBe("tel:+996700123456");
  });

  it("нажатие на строку открывает панель с сообщением", () => {
    renderRequests([request]);
    fireEvent.click(screen.getByTestId("request-name"));
    expect(screen.getByText("Хотим с ночёвкой в юрте")).toBeTruthy();
  });

  it("пусто — понятный текст", () => {
    renderRequests([]);
    expect(screen.getByText("Заявок пока нет")).toBeTruthy();
  });
});

function choose(field: string, option: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${field} `) }));
  fireEvent.click(screen.getByRole("option", { name: option }));
}

describe("фильтры заявок", () => {
  const list: TravelRequest[] = [
    { ...request, id: 1, name: "Айдана", destination: "Сон-Куль", travel_date: "2026-11-10", created_at: "2026-10-22T10:00:00Z" },
    { ...request, id: 2, name: "Бакыт", phone: "+996 555 111 222", destination: "Отели: Отель 02", travel_date: "2026-11-01", created_at: "2026-10-10T10:00:00Z" },
    { ...request, id: 3, name: "Нурлан", destination: "Транспорт: Минивэн", travel_date: null, created_at: "2026-09-01T10:00:00Z" },
  ];
  const names = () => screen.getAllByTestId("request-name").map((el) => el.textContent);

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-23T12:00:00Z") });
  });
  afterEach(() => vi.useRealTimers());

  it("поиск по имени, телефону и «что»", () => {
    renderRequests(list);
    const search = screen.getByRole("searchbox", { name: "Поиск по заявкам" });
    fireEvent.change(search, { target: { value: "отель" } });
    expect(names()).toEqual(["Бакыт"]);
    fireEvent.change(search, { target: { value: "111 222" } });
    expect(names()).toEqual(["Бакыт"]);
    fireEvent.change(search, { target: { value: "нет такой" } });
    expect(screen.getByText("Ничего не найдено")).toBeTruthy();
  });

  it("период: последние 7 дней и свой период «с — по»", () => {
    renderRequests(list);
    choose("Период", "7 дней");
    expect(names()).toEqual(["Айдана"]);
    choose("Период", "Свой период");
    fireEvent.change(screen.getByLabelText("С"), { target: { value: "2026-10-01" } });
    fireEvent.change(screen.getByLabelText("По"), { target: { value: "2026-10-15" } });
    expect(names()).toEqual(["Бакыт"]);
  });

  it("сортировка: старые сверху, по дате поездки (без даты — в конце), по имени", () => {
    renderRequests(list);
    expect(names()).toEqual(["Айдана", "Бакыт", "Нурлан"]);
    choose("Сортировка", "Сначала старые");
    expect(names()).toEqual(["Нурлан", "Бакыт", "Айдана"]);
    choose("Сортировка", "По дате поездки");
    expect(names()).toEqual(["Бакыт", "Айдана", "Нурлан"]);
    choose("Сортировка", "По имени");
    expect(names()).toEqual(["Айдана", "Бакыт", "Нурлан"]);
  });

  it("счётчики вкладок учитывают поиск и период; «Сбросить» возвращает всё", () => {
    renderRequests(list);
    choose("Период", "7 дней");
    expect(screen.getByRole("tab", { name: /Все/ }).textContent).toContain("1");
    fireEvent.click(screen.getByRole("button", { name: "Сбросить" }));
    expect(names()).toHaveLength(3);
  });
});
