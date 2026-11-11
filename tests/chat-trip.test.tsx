import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({ default: () => null }));

import { AiTripCard } from "@/components/ai/ai-trip-card/AiTripCard";
import { useChatTrip, useTrip, type TripPick } from "@/utils/trip/trip-store";
import { tripMessage, useTripChat } from "@/utils/trip/use-trip-chat";

const tour: TripPick = { kind: "tour", key: "4", title: "Маршрут 04", id: 4, image: null, price: 100, unit: null, href: "/tours/4" };
const hotel: TripPick = { kind: "hotel", key: "hotel-2", title: "Отель 02", id: 2, image: null, price: 50, unit: "за ночь", href: "/hotels/2" };
const kinds = { tour: "Тур", hotel: "Отель", car: "Транспорт", helicopter: "Вертолёт", trekking: "Треккинг" };

afterEach(() => {
  act(() => {
    useTrip.getState().clear();
    useChatTrip.getState().clear();
  });
  localStorage.clear();
});

describe("поездка переезжает в чат", () => {
  it("выбор со страниц уходит в бронь чата, а кнопки «Выбрать» сбрасываются", async () => {
    act(() => {
      useTrip.getState().add(tour);
      useTrip.getState().add(hotel);
    });
    const { result } = renderHook(() => useTripChat(kinds));

    await waitFor(() => expect(result.current.picked.map((p) => p.title)).toEqual(["Маршрут 04", "Отель 02"]));
    expect(useTrip.getState().picks).toEqual({});
    expect(result.current.summary).toContain("Отель: Отель 02");

    act(() => result.current.remove("hotel"));
    expect(Object.keys(useChatTrip.getState().picks)).toEqual(["tour"]);
  });

  it("после отправки ассистенту плашка прячется, а заявка по-прежнему знает поездку", async () => {
    act(() => useTrip.getState().add(tour));
    const { result } = renderHook(() => useTripChat(kinds));
    await waitFor(() => expect(result.current.picked).toHaveLength(1));

    act(() => result.current.markSent());
    expect(result.current.picked).toEqual([]);
    expect(result.current.booking?.title).toContain("Маршрут 04");
  });

  it("в чат пришла поездка с другим туром — старая бронь заменяется целиком", () => {
    const other: TripPick = { ...tour, key: "tour-9", title: "Иссык-Куль" };
    act(() => {
      useChatTrip.getState().take({ tour, hotel });
      useChatTrip.getState().take({ tour: other });
    });
    expect(Object.keys(useChatTrip.getState().picks)).toEqual(["tour"]);
    expect(useChatTrip.getState().picks.tour?.title).toBe("Иссык-Куль");
  });

  it("сообщение с поездкой: просьба, список и фото", () => {
    const text = tripMessage("", [{ ...tour, image: "/t.jpg" }, hotel], kinds, "Помогите оформить");
    expect(text).toBe("Помогите оформить\n\nТур: Маршрут 04\nОтель: Отель 02\n\n![Тур](/t.jpg)");
  });
});

describe("бронь в чате", () => {
  const labels = { title: "Ваша поездка", hint: "подсказка", remove: "Убрать", show: "Показать бронь", hide: "Свернуть", count: "{count} в брони" };

  it("свёрнута в строку, по нажатию показывает список", () => {
    render(<AiTripCard picked={[tour, hotel]} kinds={kinds} locale="ru" labels={labels} onRemove={() => {}} />);
    expect(screen.getByText("2 в брони")).toBeTruthy();
    expect(screen.getByText("Маршрут 04 · Отель 02")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Ваша поездка/ }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Оформить поездку" })).toBeNull();
  });
});
