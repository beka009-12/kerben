import { describe, expect, it } from "vitest";
import de from "@/dictionaries/de.json";
import en from "@/dictionaries/en.json";
import ru from "@/dictionaries/ru.json";
import zh from "@/dictionaries/zh.json";
import type { HelicopterItem, HotelItem, TransportItem } from "@/utils/api/catalog";
import { carSeo, contactDescription, flightSeo, hotelCity, hotelSeo } from "@/utils/detail-seo";

const hotel: HotelItem = {
  id: "50",
  name: "Green Yard Hotel",
  location: "Karakol, Issyk-Kul Region, Kyrgyzstan",
  description: "",
  image: "",
  gallery: [],
  address: "",
  phone: "",
  coords: null,
  price: 60,
  unit: "per_night",
  stars: 0,
  amenities: [],
  rating: 0,
  reviews: 0,
};

const car: TransportItem = {
  id: 42,
  name: "Toyota RAV4",
  subtitle: "",
  model: "",
  color: "",
  description: "",
  image: "",
  gallery: [],
  seats: 5,
  year: null,
  hasDriver: false,
  hasAirConditioner: true,
  price: 70,
  unit: "per_day",
};

const flight: HelicopterItem = {
  id: 41,
  title: "Sightseeing flight over Ala-Archa",
  description: "",
  image: "",
  gallery: [],
  price: 900,
  unit: "per_trip",
  minutes: 30,
  passengers: 4,
  route: "Ala-Archa",
};

describe("город отеля для title", () => {
  it("«Район, Город, Страна» → город посередине", () => {
    expect(hotelCity("Pervomaysky District, Bishkek, Kyrgyzstan")).toBe("Bishkek");
    expect(hotelCity("Первомайский район, Бишкек, Кыргызстан")).toBe("Бишкек");
    expect(hotelCity("五一区, 比什凯克, 吉尔吉斯斯坦")).toBe("比什凯克");
  });

  it("«Город, Область, Страна» → город первым; без города — область", () => {
    expect(hotelCity("Karakol, Issyk-Kul Region, Kyrgyzstan")).toBe("Karakol");
    expect(hotelCity("Karakol, Gebiet Issyk-Kul, Kirgisistan")).toBe("Karakol");
    expect(hotelCity("Каракол, Иссык-Кульская область, Кыргызстан")).toBe("Каракол");
    expect(hotelCity("Issyk-Kul District, Issyk-Kul Region, Kyrgyzstan")).toBe("Issyk-Kul Region");
  });
});

describe("title и description детальных страниц", () => {
  it("отель: город в title, если его нет в названии; описание своё у каждого отеля", () => {
    expect(hotelSeo(hotel, "en", en).title).toBe("Green Yard Hotel, Karakol");
    expect(hotelSeo({ ...hotel, name: "Hyatt Regency Bishkek", location: "Sverdlovsky District, Bishkek, Kyrgyzstan" }, "en", en).title).toBe("Hyatt Regency Bishkek");
    const a = hotelSeo(hotel, "en", en).description;
    const b = hotelSeo({ ...hotel, name: "Karagat Hotel" }, "en", en).description;
    expect(a).toMatch(/^Green Yard Hotel, Karakol, Issyk-Kul Region, Kyrgyzstan: from \$60 per night\./);
    expect(a).not.toBe(b);
    expect(a.length).toBeLessThanOrEqual(160);
  });

  it("машина: «с водителем» или «в аренду» по данным backend", () => {
    expect(carSeo(car, "en", en).title).toBe("Toyota RAV4 for rent in Kyrgyzstan");
    expect(carSeo({ ...car, hasDriver: true }, "ru", ru).title).toBe("Toyota RAV4 с водителем в Кыргызстане");
    expect(carSeo(car, "en", en).description).toMatch(/^Toyota RAV4: 5 seats, without driver, air conditioning, from \$70 per day\. /);
  });

  it("немецкие существительные не теряют заглавную букву", () => {
    expect(carSeo(car, "de", de).description).toContain("ohne Fahrer, Klimaanlage, ab");
    expect(flightSeo(flight, "de", de).description).toContain("Passagiere bis 4");
  });

  it("вертолёт: маршрут, время, места и цена в описании", () => {
    expect(flightSeo(flight, "en", en).description).toMatch(/^Sightseeing flight over Ala-Archa: Ala-Archa, 30 min, passengers up to 4, from \$900 per trip\./);
    expect(flightSeo({ ...flight, description: "Своё описание из backend, достаточно длинное для сниппета в поиске Google." }, "ru", ru).description).toBe(
      "Своё описание из backend, достаточно длинное для сниппета в поиске Google.",
    );
  });

  it("контакты: телефон и часы подставляются, без телефона не остаётся пустой запятой", () => {
    expect(contactDescription(en, "+996 705 120169")).toBe(
      "Contact Kerben Travel, a tour operator in Bishkek: phone and WhatsApp +996 705 120169, Telegram and email. Office hours Mon–Sat, 11:00–20:00.",
    );
    expect(contactDescription(en, null)).toContain("phone and WhatsApp, Telegram");
    expect(contactDescription(zh, "+996 705 120169")).toContain("+996 705 120169");
  });
});
