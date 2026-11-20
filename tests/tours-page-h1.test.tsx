import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Tour } from "@/types/tour";

// В пререндере useSearchParams уводит каталог в Suspense — эмулируем это флагом
const nav = vi.hoisted(() => ({ suspend: false }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/ru/tours",
  useSearchParams: () => {
    if (nav.suspend) throw new Promise(() => {});
    return new URLSearchParams();
  },
  notFound: () => {
    throw new Error("notFound");
  },
}));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

const tour: Tour = {
  id: 50,
  slug: "50",
  place: "Сон-Куль",
  title: "Сон-Куль: ночь в юрте",
  country: "Кыргызстан",
  summary: "",
  overview: "",
  region: "asia",
  coords: [74.77, 41.45],
  image: "/son-kul.webp",
  gallery: [],
  price: 300,
  rating: 0,
  reviews: 0,
  days: 3,
  groupSize: "1–8",
  difficulty: null,
  languages: [],
  category: "nature",
  badge: null,
  highlights: [],
  itinerary: [],
  included: [],
  excluded: [],
};

vi.mock("@/utils/api/tours", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/api/tours")>()),
  getTours: vi.fn(async () => [tour]),
}));

import ToursPage from "@/app/[lang]/tours/page";
import { ToursCatalog } from "@/components/tours/tours-catalog/ToursCatalog";
import ru from "@/dictionaries/ru.json";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";

const dict = ru as unknown as Dictionary;
const h1s = () => screen.queryAllByRole("heading", { level: 1 });

async function renderPage() {
  const page = await ToursPage({ params: Promise.resolve({ lang: "ru" }) } as PageProps<"/[lang]/tours">);
  await act(async () => {
    render(
      <I18nProvider locale="ru" dict={dict}>
        {page}
      </I18nProvider>,
    );
  });
}

afterEach(() => {
  cleanup();
  nav.suspend = false;
});

describe("одна H1 на странице туров", () => {
  it("каталог не рисует свою H1 — она есть у страницы", () => {
    render(
      <I18nProvider locale="ru" dict={dict}>
        <ToursCatalog tours={[tour]} />
      </I18nProvider>,
    );
    expect(h1s()).toHaveLength(0);
  });

  it("пока каталог грузится, H1 уже на месте и она одна", async () => {
    nav.suspend = true;
    await renderPage();
    expect(h1s().map((h) => h.textContent)).toEqual([ru.tours.heroText]);
  });

  it("после загрузки каталога H1 по-прежнему одна, карточки на месте", async () => {
    await renderPage();
    expect(h1s()).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Сон-Куль" })).toBeTruthy();
  });
});
