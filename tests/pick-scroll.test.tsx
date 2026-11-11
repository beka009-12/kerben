import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

import { PickButton } from "@/components/ui/pick-button/PickButton";
import ru from "@/dictionaries/ru.json";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import { useAuth } from "@/utils/store/auth";
import { useTrip, type TripPick } from "@/utils/trip/trip-store";
import { SCROLL_PAUSE_MS } from "@/utils/trip/use-trip-pick";

const tour: TripPick = { kind: "tour", key: "1", title: "Ала-Арча", id: 1, image: null, price: 100, unit: null, href: "/tours/1" };

afterEach(() => {
  vi.useRealTimers();
  act(() => useTrip.getState().clear());
  document.body.innerHTML = "";
});

describe("«Выбрать тур» в шапке тура", () => {
  it("кнопка становится «Тур выбран», затем страница прокручивается к «Ваша поездка»", () => {
    vi.useFakeTimers();
    useAuth.setState({ status: "user", user: { id: "u1", email: "a@example.com", name: "A", phone: "" } });
    render(
      <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
        <PickButton pick={tour} chooseLabel="Выбрать тур" chosenLabel="Тур выбран" scrollTo="trip" />
        <section id="trip" />
      </I18nProvider>,
    );
    const scroll = vi.fn();
    document.getElementById("trip")!.scrollIntoView = scroll;

    fireEvent.click(screen.getByRole("button", { name: "Выбрать тур" }));
    expect(screen.getByRole("button", { name: /Тур выбран/ })).toBeTruthy();
    expect(scroll).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(SCROLL_PAUSE_MS));
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ block: "start" }));
  });
});
