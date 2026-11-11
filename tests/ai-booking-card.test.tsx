import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({ default: ({ src }: { src: string }) => <span data-testid="photo" data-src={src} /> }));
const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { AiBookingCard } from "@/components/ai/ai-booking-card/AiBookingCard";
import ru from "@/dictionaries/ru.json";
import type { BookingDraft } from "@/utils/booking-chat";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { SESSION_KEY, useAuth } from "@/utils/store/auth";
import { useChatTrip, type TripPick } from "@/utils/trip/trip-store";

const t = ru.ai.booking;
const pick = (kind: TripPick["kind"], title: string, image: string, price: number, unit: string | null): TripPick => ({
  kind,
  key: `${kind}-1`,
  title,
  id: null,
  image,
  price,
  unit,
  href: `/ru/${kind}/1`,
});
const draft: BookingDraft = {
  title: "Тур: ТЕСТ: Ала-Арча · Отель: ТЕСТ: Отель 10",
  name: "Asadbek",
  phone: "+996 700 12 34 56",
  email: "",
  date: "2099-10-25",
  endDate: "",
  guests: 8,
  message: "Группа из 8 человек",
};

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token: "site-token", user: { id: "u1", email: "anna@example.com", name: "Asadbek", phone: "" } }));
  useAuth.setState({ status: "user", user: { id: "u1", email: "anna@example.com", name: "Asadbek", phone: "" } });
  useChatTrip.setState({
    picks: {
      tour: pick("tour", "ТЕСТ: Ала-Арча", "/t.jpg", 100, null),
      hotel: pick("hotel", "ТЕСТ: Отель 10", "/h.jpg", 50, "за ночь"),
      car: pick("car", "ТЕСТ: Транспорт 17", "/c.jpg", 80, "в день"),
    },
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  push.mockClear();
});

describe("карточка заявки в чате", () => {
  it("показывает фото того, что выбрано в заявке, и детали плитками", () => {
    render(
      <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
        <AiBookingCard draft={draft} context={null} />
      </I18nProvider>,
    );
    const photos = screen.getAllByTestId("photo").map((el) => el.getAttribute("data-src"));
    expect(photos).toEqual(["/t.jpg", "/h.jpg"]);
    expect(screen.getByText(ru.tour.tripStepHotel)).toBeTruthy();
    expect(screen.getByText(/50\s\$ \/ за ночь/)).toBeTruthy();
    expect(screen.getByText("8")).toBeTruthy();
    expect(screen.getByText("Группа из 8 человек")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: new RegExp(t.send) })).toBeTruthy();
    expect(screen.queryByText("ТЕСТ: Транспорт 17")).toBeNull();
  });

  it("заявка ушла — «Отправлено», через пару секунд «Мои поездки» с билетом", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const urls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urls.push(url);
        if (url.startsWith("/api/chat/token")) return Response.json({ token: "client-token" });
        return url.endsWith("travel-selections") ? Response.json({ id: 41 }) : Response.json({ id: 42 }, { status: 201 });
      }),
    );
    render(
      <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
        <AiBookingCard draft={draft} context={null} />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: new RegExp(t.send) }));
    await waitFor(() => expect(screen.queryByRole("button", { name: new RegExp(t.send) })).toBeNull());
    expect(push).not.toHaveBeenCalled();
    expect(useChatTrip.getState().picks).toEqual({});
    expect(screen.getAllByTestId("photo")).toHaveLength(2);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    expect(push).toHaveBeenCalledWith("/ru/trips");
    // Заявка ушла в backend: подборка, потом заявка
    expect(urls.filter((url) => !url.includes("/token"))).toEqual(["/api/chat/travel-selections", "/api/chat/travel-requests"]);
  });

  it("ошибка отправки — выбранное остаётся в чате", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ message: "Backend unavailable" }, { status: 502 })));
    render(
      <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
        <AiBookingCard draft={draft} context={null} />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: new RegExp(t.send) }));
    await waitFor(() => expect(screen.getByRole("button", { name: new RegExp(t.send) })).toBeTruthy());
    expect(Object.keys(useChatTrip.getState().picks)).toEqual(["tour", "hotel", "car"]);
  });

  it("ошибка отправки — никуда не уходим", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ message: "Backend unavailable" }, { status: 502 })));
    render(
      <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
        <AiBookingCard draft={draft} context={null} />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: new RegExp(t.send) }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(push).not.toHaveBeenCalled();
  });
});
