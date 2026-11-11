import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const ratings = [5, 4, 2, 5, 1, 3, 5, 4, 5, 2, 5, 4, 3, 5];
const rows = ratings.map((rating, i) => ({
  id: i + 1,
  rating,
  text: `Отзыв ${i + 1}`,
  created_at: new Date(2026, 9, 30 - i).toISOString(),
  display_name: `Гость ${i + 1}`,
}));

vi.mock("@/utils/api/client-backend", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  loadBackendReviews: async () => rows,
}));
vi.mock("@/utils/store/auth", () => ({ useAuth: () => ({ status: "guest", user: null }) }));

import { TourReviews } from "@/components/tour/tour-reviews/TourReviews";
import ru from "@/dictionaries/ru.json";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";

const t = ru.reviews;
const renderReviews = () =>
  render(
    <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
      <TourReviews tourSlug="12" />
    </I18nProvider>,
  );
const cards = () => document.querySelectorAll(".tour-reviews-card").length;

afterEach(cleanup);

describe("отзывы о туре", () => {
  it("сначала 10 отзывов, по кнопке — все, и обратно", async () => {
    renderReviews();
    const more = await screen.findByRole("button", { name: t.showAll.replace("{n}", "14") });
    expect(cards()).toBe(10);
    fireEvent.click(more);
    expect(cards()).toBe(14);
    fireEvent.click(screen.getByRole("button", { name: t.showLess }));
    expect(cards()).toBe(10);
  });

  it("фильтр: хорошие — 4–5 звёзд, плохие — 1–3", async () => {
    renderReviews();
    fireEvent.click(await screen.findByRole("button", { name: new RegExp(`^${t.filterGood}`) }));
    expect(cards()).toBe(9);
    expect(screen.queryByRole("button", { name: /Показать все/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${t.filterBad}`) }));
    expect(cards()).toBe(5);
  });
});
