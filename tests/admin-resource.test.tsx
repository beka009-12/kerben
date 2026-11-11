import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const refresh = vi.hoisted(() => vi.fn());
const saveRecord = vi.hoisted(() => vi.fn());
const deleteRecord = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push: vi.fn() }) }));
vi.mock("@/app/[lang]/admin/actions", () => ({ saveRecord, deleteRecord, retranslateTour: vi.fn() }));

import { AdminResource } from "@/components/admin/admin-resource/AdminResource";
import { AdminToastProvider } from "@/components/admin/admin-toast/AdminToast";

HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute("open");
};

const rows = [
  { id: 1, name: "Минивэн", seats: 7, price: "80.00", is_active: true },
  { id: 2, name: "Sprinter", seats: 18, price: "120.00", is_active: false },
];

function renderTransports() {
  render(
    <AdminToastProvider>
      <AdminResource resource="transports" rows={rows} relations={{}} childRows={{}} lang="ru" />
    </AdminToastProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("раздел админки", () => {
  it("поиск фильтрует строки без учёта регистра", () => {
    renderTransports();
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "SPRINT" } });
    expect(screen.getByText("Sprinter")).toBeTruthy();
    expect(screen.queryByText("Минивэн")).toBeNull();
    fireEvent.change(search, { target: { value: "нет такой" } });
    expect(screen.getByText("Ничего не найдено")).toBeTruthy();
  });

  it("статус записи: Активен / Не активен", () => {
    renderTransports();
    expect(screen.getByText("Активен")).toBeTruthy();
    expect(screen.getByText("Не активен")).toBeTruthy();
  });

  it("отключённая запись остаётся в списке, даже если backend её больше не отдаёт", async () => {
    localStorage.clear();
    saveRecord.mockResolvedValue({ ok: true });
    const view = render(
      <AdminToastProvider>
        <AdminResource resource="transports" rows={[rows[0]]} relations={{}} childRows={{}} lang="ru" />
      </AdminToastProvider>,
    );
    fireEvent.click(screen.getByRole("switch", { name: /Минивэн/ }));
    await waitFor(() => expect(screen.getByText("Не активен")).toBeTruthy());
    expect(saveRecord).toHaveBeenCalledWith("transports", 1, expect.objectContaining({ is_active: false }), expect.anything());

    view.rerender(
      <AdminToastProvider>
        <AdminResource resource="transports" rows={[]} relations={{}} childRows={{}} lang="ru" />
      </AdminToastProvider>,
    );
    expect(screen.getByText("Минивэн")).toBeTruthy();
    fireEvent.click(screen.getByRole("switch", { name: /Минивэн/ }));
    await waitFor(() => expect(screen.getByText("Активен")).toBeTruthy());
    expect(saveRecord).toHaveBeenLastCalledWith("transports", 1, expect.objectContaining({ is_active: true }), expect.anything());
  });

  it("ошибки validation показываются у полей, панель не закрывается", async () => {
    saveRecord.mockResolvedValue({ ok: false, error: "validation", fields: { price: "Введите число" } });
    renderTransports();
    fireEvent.click(screen.getAllByRole("button", { name: "Добавить машину" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(await screen.findByText("Введите число")).toBeTruthy();
    expect(screen.getByRole("dialog", { hidden: true, name: /Новая запись/ }).hasAttribute("open")).toBe(true);
  });

  it("сохранение изменённой записи: в action уходят значения и исходник, после успеха — тост и обновление", async () => {
    saveRecord.mockResolvedValue({ ok: true, record: { id: 1 } });
    renderTransports();
    fireEvent.click(screen.getByText("Минивэн"));
    fireEvent.change(screen.getByLabelText(/^Мест/), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    const [key, id, values, original] = saveRecord.mock.calls[0];
    expect([key, id, values.seats, original.seats]).toEqual(["transports", 1, "8", "7"]);
    expect(await screen.findByText("Сохранено")).toBeTruthy();
  });

  it("auth → баннер «Сессия истекла», введённое остаётся в поле", async () => {
    saveRecord.mockResolvedValue({ ok: false, error: "auth" });
    renderTransports();
    fireEvent.click(screen.getByText("Минивэн"));
    fireEvent.change(screen.getByLabelText(/^Название/), { target: { value: "Минивэн VIP" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(await screen.findByText(/Сессия истекла/)).toBeTruthy();
    expect((screen.getByLabelText(/^Название/) as HTMLInputElement).value).toBe("Минивэн VIP");
  });

  it("network → тост «Бэкенд не отвечает»", async () => {
    saveRecord.mockResolvedValue({ ok: false, error: "network" });
    renderTransports();
    fireEvent.click(screen.getByText("Минивэн"));
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(await screen.findByText("Бэкенд не отвечает. Попробуйте ещё раз")).toBeTruthy();
  });

  it("удаление — только после подтверждения; отказ backend показывает его сообщение", async () => {
    deleteRecord.mockResolvedValue({ ok: false, error: "backend", message: "Transport has images" });
    renderTransports();
    fireEvent.click(screen.getByText("Минивэн"));
    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));
    expect(deleteRecord).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Да, удалить" }));
    await waitFor(() => expect(deleteRecord).toHaveBeenCalledWith("transports", 1));
    expect(await screen.findByText("Transport has images")).toBeTruthy();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("переключатель в строке скрывает запись без открытия формы", async () => {
    saveRecord.mockResolvedValue({ ok: true });
    renderTransports();
    fireEvent.click(screen.getByRole("switch", { name: "Показывать на сайте: Минивэн" }));
    await waitFor(() => expect(saveRecord).toHaveBeenCalled());
    const [key, id, values, original] = saveRecord.mock.calls[0];
    expect([key, id, values.is_active, original.is_active]).toEqual(["transports", 1, false, true]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Ctrl+S в форме сохраняет", async () => {
    saveRecord.mockResolvedValue({ ok: true, record: { id: 1 } });
    renderTransports();
    fireEvent.click(screen.getByText("Минивэн"));
    fireEvent.keyDown(screen.getByLabelText(/^Название/), { key: "s", ctrlKey: true });
    await waitFor(() => expect(saveRecord).toHaveBeenCalledTimes(1));
  });

  it("закрытие с несохранёнными изменениями спрашивает подтверждение", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderTransports();
    fireEvent.click(screen.getByText("Минивэн"));
    fireEvent.change(screen.getByLabelText(/^Название/), { target: { value: "Другое" } });
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(confirm).toHaveBeenCalled();
    expect(screen.getByLabelText(/^Название/)).toBeTruthy();
  });

  it("двойной клик по «Сохранить» отправляет один запрос", async () => {
    let resolve: (v: unknown) => void = () => {};
    saveRecord.mockReturnValue(new Promise((r) => (resolve = r)));
    renderTransports();
    fireEvent.click(screen.getByText("Минивэн"));
    const save = screen.getByRole("button", { name: "Сохранить" });
    fireEvent.click(save);
    fireEvent.click(save);
    resolve({ ok: true });
    await waitFor(() => expect(saveRecord).toHaveBeenCalledTimes(1));
  });

  it("форма тура компактная: разделы, пары полей, координаты спрятаны в «Дополнительно»", () => {
    render(
      <AdminToastProvider>
        <AdminResource resource="tours" rows={[]} relations={{}} childRows={{}} lang="ru" />
      </AdminToastProvider>,
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Добавить тур" })[0]);
    expect(screen.getByRole("heading", { name: "Цена и длительность" })).toBeTruthy();
    const more = screen.getByText("Дополнительно").closest("details");
    expect(more?.hasAttribute("open")).toBe(false);
    expect(more?.contains(screen.getByLabelText("Широта"))).toBe(true);
    expect(screen.getByLabelText("Ночей").closest(".admin-editor-cell-half")).toBeTruthy();
  });

  it("выбрать все и удалить разом", async () => {
    localStorage.clear();
    deleteRecord.mockResolvedValue({ ok: true });
    renderTransports();
    fireEvent.click(screen.getByRole("checkbox", { name: "Выбрать все" }));
    expect(screen.getByText("Выбрано: 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));
    fireEvent.click(screen.getByRole("button", { name: "Да, удалить" }));
    await waitFor(() => expect(deleteRecord).toHaveBeenCalledTimes(2));
    expect(deleteRecord).toHaveBeenCalledWith("transports", 1);
    expect(deleteRecord).toHaveBeenCalledWith("transports", 2);
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("в режиме выбора клик по строке ставит галочку, а не открывает запись", () => {
    renderTransports();
    fireEvent.click(screen.getByRole("button", { name: "Выбрать" }));
    fireEvent.click(screen.getByText("Минивэн"));
    expect(screen.getByRole("checkbox", { name: "Выбрать: Минивэн" })).toHaveProperty("checked", true);
    expect(screen.getByText("Выбрано: 1")).toBeTruthy();
  });
});
