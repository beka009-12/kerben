import { describe, expect, it } from "vitest";
import { NO_PHOTO } from "@/data/images";
import type { BackendTourDetail } from "@/utils/api/backend";
import { fromBackendTour } from "@/utils/api/tours";

const tour = (patch: Partial<BackendTourDetail>): BackendTourDetail => ({
  id: 3,
  category_id: null,
  title: "Иссык-Куль",
  description: "",
  included: null,
  excluded: null,
  price: "100",
  price_unit: "per_person",
  duration_days: 1,
  duration_nights: 0,
  min_people: 1,
  max_people: null,
  tour_type: "classic",
  main_image: null,
  is_active: true,
  created_at: "",
  updated_at: "",
  ...patch,
});

describe("фото тура приходят из backend", () => {
  it("главное фото и галерея — ровно то, что прислал backend, по порядку", () => {
    const result = fromBackendTour(
      tour({
        main_image: "https://13.49.104.87/media/main.jpg",
        images: [
          { id: 2, tour_id: 3, image: "https://13.49.104.87/media/b.jpg", order: 2 },
          { id: 1, tour_id: 3, image: "https://13.49.104.87/media/a.jpg", order: 1 },
        ],
      }),
      "ru",
    );
    expect(result.image).toBe("https://13.49.104.87/media/main.jpg");
    expect(result.gallery).toEqual(["https://13.49.104.87/media/a.jpg", "https://13.49.104.87/media/b.jpg"]);
  });

  it("без фото на backend — одна нейтральная заглушка, без подбора своих снимков", () => {
    const result = fromBackendTour(tour({}), "ru");
    expect(result.image).toBe(NO_PHOTO);
    expect(result.gallery).toEqual([]);
  });
});
