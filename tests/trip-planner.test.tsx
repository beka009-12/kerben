import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => "/ru/tours/6" }));

import { TripPlanner } from "@/components/tour/trip-planner/TripPlanner";
import ru from "@/dictionaries/ru.json";
import type { HotelItem, TransportItem } from "@/utils/api/catalog";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { useAuth } from "@/utils/store/auth";
import { carOffers, hotelOffers } from "@/utils/trip/trip-offers";
import { tourPick } from "@/utils/trip/trip-picks";
import { useChatTrip, useTrip } from "@/utils/trip/trip-store";

HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute("open");
};

const dict = ru as unknown as Dictionary;
const t = ru.tour;
const hotel = { id: 4, name: "ТЕСТ: Отель 04", image: "/h.jpg", location: "Чуй", price: 60, unit: "per_night", stars: 2 } as unknown as HotelItem;
const car = { id: 2, name: "Минивэн", subtitle: "Toyota", image: "/c.jpg", seats: 7, hasDriver: true, price: 80, unit: "per_day" } as unknown as TransportItem;
const tour = tourPick({ slug: "6", title: "ТЕСТ: Маршрут 06", id: 6, image: "/t.jpg", price: 100 }, "ru");

function renderPlanner() {
  render(
    <I18nProvider locale="ru" dict={dict}>
      <TripPlanner tour={tour} hotels={hotelOffers([{ hotel, km: 138 }], "ru", dict)} cars={carOffers([car], "ru", dict)} />
    </I18nProvider>,
  );
}

const signIn = () => useAuth.setState({ status: "user", user: { id: "u1", email: "a@b.kg", name: "Айгуль", phone: "" } });

beforeEach(async () => {
  localStorage.clear();
  await useTrip.persist.rehydrate();
  await useChatTrip.persist.rehydrate();
  useTrip.setState({ picks: {}, skips: {}, lastAdded: null });
  useChatTrip.setState({ picks: {}, sent: false });
  useAuth.setState({ status: "guest", user: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("«Ваша поездка» на странице тура", () => {
  it("шага «Тур» нет: сразу отели, выбор отеля добавляет и этот тур", async () => {
    signIn();
    renderPlanner();
    expect(screen.queryByText(ru.trip.stepTitle)).toBeNull();
    fireEvent.click((await screen.findAllByRole("button", { name: ru.trip.choose }))[0]);
    expect(useTrip.getState().picks.tour?.title).toBe("ТЕСТ: Маршрут 06");
    expect(useTrip.getState().picks.hotel?.title).toBe("ТЕСТ: Отель 04");
  });

  it("поездка ушла в чат — вышел из чата, страница тура снова чистая (бронь помнит ассистент)", async () => {
    signIn();
    useChatTrip.setState({ picks: { tour, hotel: hotelOffers([{ hotel, km: 1 }], "ru", dict)[0].pick, car: carOffers([car], "ru", dict)[0].pick }, sent: false });
    renderPlanner();
    expect(await screen.findByText("Минивэн")).toBeTruthy();
    expect(screen.queryByText(t.tripDoneTitle)).toBeNull();
    expect(screen.queryByRole("button", { name: ru.trip.chosen })).toBeNull();
    expect(useChatTrip.getState().picks.hotel).toBeTruthy();
  });

  it("выбрал отель — прокрутка к машинам, выбрал машину — к отелям", async () => {
    signIn();
    const scrolled: string[] = [];
    Element.prototype.scrollIntoView = function (this: Element) {
      scrolled.push(this.id);
    };
    renderPlanner();

    fireEvent.click((await screen.findAllByRole("button", { name: ru.trip.choose }))[1]);
    await vi.waitFor(() => expect(scrolled.at(-1)).toBe("trip-hotel"), { timeout: 2000 });

    useTrip.getState().remove("car");
    fireEvent.click((await screen.findAllByRole("button", { name: ru.trip.choose }))[0]);
    await vi.waitFor(() => expect(scrolled.at(-1)).toBe("trip-car"), { timeout: 2000 });
  });

  it("отель выбирается зелёной кнопкой, машину можно пропустить — итог без «Мои поездки»", async () => {
    signIn();
    useTrip.getState().add(tour);
    renderPlanner();

    const [choose] = await screen.findAllByRole("button", { name: ru.trip.choose });
    fireEvent.click(choose);
    expect(useTrip.getState().picks.hotel?.title).toBe("ТЕСТ: Отель 04");

    expect(await screen.findByText("Минивэн")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: t.tripSkipCar }));

    expect(await screen.findByText(t.tripDoneTitle)).toBeTruthy();
    expect(screen.getAllByText("ТЕСТ: Отель 04").length).toBeGreaterThan(0);
    expect(screen.queryByText(t.tripMyTrips)).toBeNull();
    expect(screen.getByRole("link", { name: new RegExp(ru.trip.chatStart) }).getAttribute("href")).toBe("/ru/chat");
  });

  it("отели и машины видны сразу, машины — под отелями", async () => {
    signIn();
    renderPlanner();
    expect(await screen.findByText("ТЕСТ: Отель 04")).toBeTruthy();
    expect(screen.getByText("Минивэн")).toBeTruthy();
    expect(screen.getByRole("heading", { name: t.tripCarTitle })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: ru.trip.choose })).toHaveLength(2);
  });

  it("другой тур — отель и машина прошлого тура не переносятся, выбор с нуля", async () => {
    signIn();
    const other = tourPick({ slug: "9", title: "ТЕСТ: Иссык-Куль", id: 9, image: "/i.jpg", price: 200 }, "ru");
    const oldHotel = hotelOffers([{ hotel, km: 1 }], "ru", dict)[0].pick;
    useTrip.setState({ picks: { tour: other, hotel: oldHotel }, skips: { car: true }, lastAdded: null });
    renderPlanner();
    expect(await screen.findByText("Минивэн")).toBeTruthy();
    expect(screen.queryByText(t.tripDoneTitle)).toBeNull();
    expect(screen.getAllByRole("button", { name: ru.trip.choose })).toHaveLength(2);

    useTrip.getState().add(tour);
    expect(useTrip.getState().picks.hotel).toBeUndefined();
    expect(useTrip.getState().skips).toEqual({});
  });

  it("«Изменить выбор» возвращает к выбору отеля", async () => {
    signIn();
    useTrip.setState({ picks: { tour }, skips: { hotel: true, car: true }, lastAdded: null });
    renderPlanner();
    fireEvent.click(await screen.findByRole("button", { name: t.tripChange }));
    expect(await screen.findByText("ТЕСТ: Отель 04")).toBeTruthy();
  });
});
