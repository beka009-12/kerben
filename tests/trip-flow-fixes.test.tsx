import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let search = new URLSearchParams();
vi.mock("next/navigation", () => ({ useSearchParams: () => search }));

import { BackLink } from "@/components/ui/back-link/BackLink";
import ru from "@/dictionaries/ru.json";
import type { HotelItem, TransportItem } from "@/utils/api/catalog";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { carOffers, hotelOffers } from "@/utils/trip/trip-offers";
import { useTrip, type TripPick } from "@/utils/trip/trip-store";
import { PICK_PAUSE_MS, useTripPlanner } from "@/utils/trip/use-trip-planner";

const dict = ru as unknown as Dictionary;
const hotel = { id: "3", name: "Отель", location: "", image: "/h.jpg", price: 50, unit: "per_night", stars: 3 } as unknown as HotelItem;
const car = { id: 7, name: "Минивэн", subtitle: "", image: "/c.jpg", seats: 7, hasDriver: true, price: 80, unit: "per_day" } as unknown as TransportItem;
const tour: TripPick = { kind: "tour", key: "tour-6", title: "Тур 06", id: 6, image: "/t.jpg", price: 100, unit: null, href: "/ru/tours/6" };

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  useTrip.setState({ picks: {}, skips: {}, lastAdded: null });
});

describe("из поездки — на детали и обратно к туру", () => {
  it("карточки отеля и машины в поездке помнят, из какого тура пришли", () => {
    expect(hotelOffers([{ hotel, km: null }], "ru", dict, "/ru/tours/6")[0].href).toBe("/ru/hotels/3?from=%2Fru%2Ftours%2F6");
    expect(carOffers([car], "ru", dict, "/ru/tours/6")[0].href).toBe("/ru/transport/7?from=%2Fru%2Ftours%2F6");
    expect(hotelOffers([{ hotel, km: null }], "ru", dict)[0].href).toBe("/ru/hotels/3");
  });

  const renderBack = () =>
    render(
      <I18nProvider locale="ru" dict={dict}>
        <BackLink href="/ru/transport" label="Весь транспорт" className="x" />
      </I18nProvider>,
    );

  it("пришли из тура — «Назад к туру» ведёт к блоку поездки", () => {
    search = new URLSearchParams({ from: "/ru/tours/6" });
    renderBack();
    const link = screen.getByRole("link");
    expect(link.textContent).toContain(ru.trip.backToTour);
    expect(link.getAttribute("href")).toBe("/ru/tours/6#trip");
  });

  it("обычный заход или чужой адрес в from — прежняя ссылка «Весь транспорт»", () => {
    for (const from of ["", "https://evil.example", "//evil.example/ru/tours/6", "/ru/admin"]) {
      search = new URLSearchParams(from ? { from } : {});
      renderBack();
      expect(screen.getByRole("link").getAttribute("href")).toBe("/ru/transport");
      cleanup();
    }
  });
});

describe("выбор отеля: сначала зелёная галочка, потом машины", () => {
  it("шаг «Отель» держится чуть-чуть после выбора, затем переходит к машинам", () => {
    vi.useFakeTimers();
    useTrip.setState({ picks: { tour }, skips: {}, lastAdded: null });
    const { result } = renderHook(() => useTripPlanner({ tour, hasHotels: true, hasCars: true }));
    expect(result.current.step).toBe("hotel");
    act(() => {
      useTrip.getState().add({ ...tour, kind: "hotel", key: "hotel-3", title: "Отель" });
    });
    expect(result.current.step).toBe("hotel");
    act(() => {
      vi.advanceTimersByTime(PICK_PAUSE_MS);
    });
    expect(result.current.step).toBe("car");
  });
});
