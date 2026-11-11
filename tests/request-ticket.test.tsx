import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({ default: ({ src }: { src: string }) => <span data-testid="photo" data-src={src} /> }));

import { RequestTicket } from "@/components/requests/request-ticket/RequestTicket";
import ru from "@/dictionaries/ru.json";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { loadRequests, saveRequest, type MyRequest } from "@/utils/requests";
import { forgetChatToken } from "@/utils/ai/backend-chat";
import { SESSION_KEY } from "@/utils/store/auth";

const t = ru.requests;
const ticket: MyRequest = {
  id: "r1",
  kind: "tour",
  title: "ТЕСТ: Маршрут 04",
  link: "/tours/4",
  image: "/t.jpg",
  price: 100,
  unit: null,
  backendId: "42",
  contactName: "Asadbek",
  contactPhone: "+996 700 12 34 56",
  status: "new",
  createdAt: "2026-10-24T10:00:00Z",
  details: {
    items: [
      { icon: "route", label: "Тур", title: "ТЕСТ: Маршрут 04", image: "/t.jpg", price: "100 $" },
      { icon: "bed", label: "Отель", title: "ТЕСТ: Отель 03", image: "/h.jpg", price: "55 $ / за ночь" },
      { icon: "car", label: "Транспорт", title: "ТЕСТ: Транспорт 04", image: "/c.jpg", price: "80 $ / в день" },
    ],
    date: "2026-10-25",
    endDate: "",
    guests: 8,
    message: "С детьми",
  },
};

const renderTicket = (item: MyRequest) =>
  render(
    <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
      <RequestTicket item={item} date={() => "24 октября, 16:00"} />
    </I18nProvider>,
  );

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("билет заявки в «Мои поездки»", () => {
  it("в одном билете — тур, отель, машина с фото, даты, люди, имя, телефон и номер", () => {
    renderTicket(ticket);
    const card = screen.getByRole("article", { name: /Заявка № 42/ });
    for (const text of ["ТЕСТ: Маршрут 04", "ТЕСТ: Отель 03", "ТЕСТ: Транспорт 04", "55 $ / за ночь", "8", "Asadbek", "+996 700 12 34 56", "С детьми"]) {
      expect(within(card).getByText(text)).toBeTruthy();
    }
    expect(within(card).getByText(/25 октября 2026/)).toBeTruthy();
    expect(screen.getAllByTestId("photo").map((p) => p.getAttribute("data-src"))).toEqual(["/t.jpg", "/h.jpg", "/c.jpg"]);
    expect(within(card).getByText(t.ticket.statuses.new)).toBeTruthy();
  });

  it("старая заявка без деталей — один пункт из названия и фото, без пустых строк", () => {
    renderTicket({ ...ticket, details: null });
    expect(screen.getAllByTestId("photo")).toHaveLength(1);
    expect(screen.getByText("ТЕСТ: Маршрут 04")).toBeTruthy();
    expect(screen.queryByText(t.ticket.dates)).toBeNull();
    expect(screen.getByText("Asadbek")).toBeTruthy();
  });

  it("детали поездки сохраняются вместе с заявкой и читаются обратно", async () => {
    const { details, ...rest } = ticket;
    await saveRequest({ ...rest, details } as Omit<MyRequest, "id" | "status" | "createdAt">);
    const { items } = await loadRequests();
    expect(items[0].details?.items.map((i) => i.title)).toEqual(["ТЕСТ: Маршрут 04", "ТЕСТ: Отель 03", "ТЕСТ: Транспорт 04"]);
    expect(items[0].details?.guests).toBe(8);
  });

  it("вошедший клиент: статус — из backend, фото и состав поездки — из браузера", async () => {
    localStorage.clear();
    forgetChatToken();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: "site-token", user: { id: "u1", email: "a@b.kg", name: "Asadbek", phone: "" } }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.startsWith("/api/chat/token")) return Response.json({ token: "client-token" });
        return Response.json([
          { id: 42, destination: "Тур", message: null, name: "Asadbek", phone: "+996", travel_date: "2026-10-25", travelers_count: 8, status: "in_progress", created_at: "2026-10-24T10:00:00Z" },
          { id: 43, destination: "Заявка из чата", message: "Сон-Куль", name: "Asadbek", phone: "+996", travel_date: null, travelers_count: 2, status: "new", created_at: "2026-10-25T10:00:00Z" },
        ]);
      }),
    );
    const { details, ...rest } = ticket;
    await saveRequest({ ...rest, details } as Omit<MyRequest, "id" | "status" | "createdAt">);
    const { items, signedIn } = await loadRequests();
    expect(signedIn).toBe(true);
    const byId = Object.fromEntries(items.map((i) => [i.id, i]));
    expect(Object.keys(byId).sort()).toEqual(["kg-42", "kg-43"]);
    expect(byId["kg-42"].status).toBe("in_progress");
    expect(byId["kg-42"].details?.items).toHaveLength(3);
    expect(byId["kg-43"].title).toBe("Заявка из чата");
    vi.unstubAllGlobals();
    localStorage.clear();
  });
});
