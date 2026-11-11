import type { IconName } from "@/components/ui/icon/Icon";
import { CITIES } from "./phone";

export type CacheTag = "tours" | "catalog" | "about" | "contacts";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "price"
  | "select"
  | "relation"
  | "boolean"
  | "image"
  | "list"
  | "time"
  | "phone"
  | "url";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  relation?: ResourceKey;
  defaultValue?: string | boolean;
  hidden?: boolean;
  placeholder?: string;
  half?: boolean;
  section?: string;
  more?: boolean;
  suggestions?: string[];
}

export interface ChildDef {
  resource: ResourceKey;
  foreignKey: string;
  tab: "Фото" | "Программа по дням";
}

export interface ColumnDef {
  field: string;
  label: string;
  format?: "price" | "boolean" | "date";
}

export type ResourceKey =
  | "tours"
  | "tourImages"
  | "tourPrograms"
  | "hotels"
  | "hotelImages"
  | "transports"
  | "transportImages"
  | "helicopters"
  | "helicopterImages"
  | "trekkings"
  | "trekkingImages"
  | "trekkingPrograms"
  | "categories"
  | "countries"
  | "regions"
  | "districts"
  | "faqs"
  | "aboutSections"
  | "contacts";

export type AdminRecord = Record<string, unknown> & { id: number };

export interface ResourceDef {
  key: ResourceKey;
  path: string;
  title: string;
  one: string;
  group: "catalog" | "directory" | "content" | "child";
  icon: IconName;
  titleField: string;
  imageField?: string;
  subtitle?: (record: AdminRecord) => string;
  columns: ColumnDef[];
  fields: FieldDef[];
  children?: ChildDef[];
  tags: CacheTag[];
  usesLang: boolean;
  translatable?: boolean;
}

export type RequestStatus = "new" | "in_progress" | "completed" | "cancelled";

export const REQUEST_STATUSES: { value: RequestStatus; label: string }[] = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Выполнена" },
  { value: "cancelled", label: "Отменена" },
];

export const PICKABLE_STATUSES = REQUEST_STATUSES.filter((s) => s.value !== "in_progress");

export const PRICE_UNITS = [
  { value: "per_person", label: "за человека" },
  { value: "per_day", label: "в день" },
  { value: "per_night", label: "за ночь" },
  { value: "per_hour", label: "в час" },
  { value: "per_trip", label: "за поездку" },
];

const TOUR_TYPES = [
  { value: "classic", label: "Классический" },
  { value: "adventure", label: "Приключения" },
  { value: "cultural", label: "Культурный" },
  { value: "winter", label: "Зимний" },
  { value: "individual", label: "Индивидуальный" },
  { value: "combined", label: "Комбинированный" },
];

const priceFields = (unit: string, section?: string): FieldDef[] => [
  { name: "price", label: "Цена, $", type: "price", required: true, half: true, placeholder: "450", section },
  { name: "price_unit", label: "Цена указана", type: "select", options: PRICE_UNITS, defaultValue: unit, half: true },
];
const coordinates: FieldDef[] = [
  { name: "latitude", label: "Широта", type: "price", placeholder: "41.87", half: true, more: true },
  { name: "longitude", label: "Долгота", type: "price", placeholder: "75.15", half: true, more: true },
];
const mainImage: FieldDef = { name: "main_image", label: "Главное фото", type: "image" };
const isActive: FieldDef = { name: "is_active", label: "Показывать на сайте", type: "boolean", defaultValue: true };
const description: FieldDef = { name: "description", label: "Описание", type: "textarea" };
const activeColumn: ColumnDef = { field: "is_active", label: "Статус", format: "boolean" };
const priceColumn: ColumnDef = { field: "price", label: "Цена", format: "price" };

function imagesOf(key: ResourceKey, path: string, foreignKey: string, tags: CacheTag[]): ResourceDef {
  return {
    key,
    path,
    title: "Фото",
    one: "фото",
    group: "child",
    icon: "image",
    titleField: "image",
    imageField: "image",
    columns: [{ field: "order", label: "Порядок" }],
    fields: [
      { name: foreignKey, label: "Запись", type: "number", required: true, hidden: true },
      { name: "image", label: "Фото", type: "image", required: true },
      { name: "order", label: "Порядок", type: "number", defaultValue: "0" },
    ],
    tags,
    usesLang: false,
  };
}

function programOf(key: ResourceKey, path: string, foreignKey: string, tags: CacheTag[]): ResourceDef {
  return {
    key,
    path,
    title: "Программа по дням",
    one: "день",
    group: "child",
    icon: "route",
    titleField: "title",
    columns: [{ field: "day_number", label: "День" }],
    fields: [
      { name: foreignKey, label: "Запись", type: "number", required: true, hidden: true },
      { name: "day_number", label: "День", type: "number", required: true },
      { name: "title", label: "Заголовок", type: "text" },
      description,
      { name: "start_time", label: "Начало", type: "time" },
    ],
    tags,
    usesLang: true,
  };
}

const join = (...parts: unknown[]) => parts.filter((part) => part !== null && part !== undefined && part !== "").join(" · ");

export const RESOURCES: Record<ResourceKey, ResourceDef> = {
  tours: {
    key: "tours",
    path: "/tours/",
    title: "Туры",
    one: "тур",
    group: "catalog",
    icon: "mountain",
    titleField: "title",
    imageField: "main_image",
    subtitle: (r) => join(r.duration_days ? `${r.duration_days} дн.` : "", TOUR_TYPES.find((t) => t.value === r.tour_type)?.label),
    columns: [priceColumn, activeColumn],
    fields: [
      { name: "title", label: "Название", type: "text", required: true },
      { name: "category_id", label: "Категория", type: "relation", relation: "categories", half: true },
      { name: "tour_type", label: "Тип тура", type: "select", options: TOUR_TYPES, defaultValue: "classic", half: true },
      description,
      mainImage,
      isActive,
      ...priceFields("per_person", "Цена и длительность"),
      { name: "duration_days", label: "Дней", type: "number", half: true },
      { name: "duration_nights", label: "Ночей", type: "number", half: true },
      { name: "min_people", label: "Человек от", type: "number", defaultValue: "1", half: true },
      { name: "max_people", label: "Человек до", type: "number", half: true },
      { name: "included", label: "Что входит", type: "textarea", placeholder: "Каждый пункт с новой строки", section: "Что входит в тур" },
      { name: "excluded", label: "Что не входит", type: "textarea", placeholder: "Каждый пункт с новой строки" },
      ...coordinates,
    ],
    children: [
      { resource: "tourImages", foreignKey: "tour_id", tab: "Фото" },
      { resource: "tourPrograms", foreignKey: "tour_id", tab: "Программа по дням" },
    ],
    tags: ["tours"],
    usesLang: true,
    translatable: true,
  },
  tourImages: imagesOf("tourImages", "/tour-images/", "tour_id", ["tours"]),
  tourPrograms: programOf("tourPrograms", "/tour-programs/", "tour_id", ["tours"]),

  hotels: {
    key: "hotels",
    path: "/hotels/",
    title: "Отели",
    one: "отель",
    group: "catalog",
    icon: "bed",
    titleField: "name",
    imageField: "main_image",
    subtitle: (r) => join(r.stars ? `${r.stars}★` : "", r.address),
    columns: [priceColumn, activeColumn],
    fields: [
      { name: "name", label: "Название", type: "text", required: true },
      description,
      mainImage,
      isActive,
      { name: "region_id", label: "Регион", type: "relation", relation: "regions", required: true, half: true, section: "Где" },
      { name: "district_id", label: "Район", type: "relation", relation: "districts", required: true, half: true },
      { name: "address", label: "Адрес", type: "text" },
      ...priceFields("per_night", "Цена и удобства"),
      { name: "stars", label: "Звёзд", type: "number", half: true },
      { name: "phone", label: "Телефон", type: "text", half: true },
      { name: "amenities", label: "Удобства", type: "list", placeholder: "Wi-Fi\nЗавтрак\nПарковка" },
      ...coordinates,
    ],
    children: [{ resource: "hotelImages", foreignKey: "hotel_id", tab: "Фото" }],
    tags: ["catalog"],
    usesLang: true,
  },
  hotelImages: imagesOf("hotelImages", "/hotel-images/", "hotel_id", ["catalog"]),

  transports: {
    key: "transports",
    path: "/transports/",
    title: "Транспорт",
    one: "машину",
    group: "catalog",
    icon: "car",
    titleField: "name",
    imageField: "main_image",
    subtitle: (r) => join(r.has_driver === false ? "без водителя" : "с водителем", r.year),
    columns: [{ field: "seats", label: "Мест" }, priceColumn, activeColumn],
    fields: [
      { name: "name", label: "Название", type: "text", required: true },
      description,
      mainImage,
      isActive,
      { name: "brand", label: "Марка", type: "text", half: true, section: "Машина" },
      { name: "model", label: "Модель", type: "text", half: true },
      { name: "year", label: "Год выпуска", type: "number", half: true },
      { name: "seats", label: "Мест", type: "number", required: true, half: true },
      { name: "color", label: "Цвет", type: "text", half: true },
      { name: "has_driver", label: "С водителем", type: "boolean", defaultValue: true, half: true },
      { name: "has_air_conditioner", label: "Кондиционер", type: "boolean", defaultValue: true, half: true },
      ...priceFields("per_day", "Цена"),
    ],
    children: [{ resource: "transportImages", foreignKey: "transport_id", tab: "Фото" }],
    tags: ["catalog"],
    usesLang: true,
  },
  transportImages: imagesOf("transportImages", "/transport-images/", "transport_id", ["catalog"]),

  helicopters: {
    key: "helicopters",
    path: "/helicopter-tours/",
    title: "Вертолёты",
    one: "вертолётный тур",
    group: "catalog",
    icon: "helicopter",
    titleField: "title",
    imageField: "main_image",
    subtitle: (r) => join(r.duration_minutes ? `${r.duration_minutes} мин` : "", join(r.departure_location, r.destination).replace(" · ", " → ")),
    columns: [{ field: "max_passengers", label: "Мест" }, priceColumn],
    fields: [
      { name: "title", label: "Название", type: "text", required: true },
      description,
      mainImage,
      isActive,
      { name: "departure_location", label: "Откуда", type: "text", half: true, section: "Полёт" },
      { name: "destination", label: "Куда", type: "text", half: true },
      { name: "duration_minutes", label: "Минут в полёте", type: "number", half: true },
      { name: "max_passengers", label: "Пассажиров до", type: "number", half: true },
      ...priceFields("per_trip", "Цена"),
      { name: "included", label: "Что входит", type: "textarea", more: true },
      { name: "instruction", label: "Инструкция для пассажиров", type: "textarea", more: true },
    ],
    children: [{ resource: "helicopterImages", foreignKey: "helicopter_id", tab: "Фото" }],
    tags: ["catalog"],
    usesLang: true,
  },
  helicopterImages: imagesOf("helicopterImages", "/helicopter-images/", "helicopter_id", ["catalog"]),

  trekkings: {
    key: "trekkings",
    path: "/trekkings/",
    title: "Трекинг",
    one: "поход",
    group: "catalog",
    icon: "backpack",
    titleField: "title",
    imageField: "main_image",
    subtitle: (r) => (r.duration_days ? `${r.duration_days} дн.` : ""),
    columns: [priceColumn, activeColumn],
    fields: [
      { name: "title", label: "Название", type: "text", required: true },
      description,
      mainImage,
      isActive,
      ...priceFields("per_person", "Цена и длительность"),
      { name: "duration_days", label: "Дней", type: "number", half: true },
    ],
    children: [
      { resource: "trekkingImages", foreignKey: "trekking_id", tab: "Фото" },
      { resource: "trekkingPrograms", foreignKey: "trekking_id", tab: "Программа по дням" },
    ],
    tags: ["catalog"],
    usesLang: true,
  },
  trekkingImages: imagesOf("trekkingImages", "/trekking-images/", "trekking_id", ["catalog"]),
  trekkingPrograms: programOf("trekkingPrograms", "/trekking-programs/", "trekking_id", ["catalog"]),

  categories: {
    key: "categories",
    path: "/tour-categories/",
    title: "Категории туров",
    one: "категорию",
    group: "directory",
    icon: "gem",
    titleField: "name",
    imageField: "image",
    columns: [],
    fields: [
      { name: "name", label: "Название", type: "text", required: true },
      { name: "image", label: "Фото", type: "image", more: true },
    ],
    tags: ["tours", "catalog"],
    usesLang: true,
  },
  countries: {
    key: "countries",
    path: "/countries/",
    title: "Страны",
    one: "страну",
    group: "directory",
    icon: "globe",
    titleField: "name",
    columns: [],
    fields: [{ name: "name", label: "Название", type: "text", required: true }],
    tags: ["catalog"],
    usesLang: true,
  },
  regions: {
    key: "regions",
    path: "/regions/",
    title: "Регионы",
    one: "регион",
    group: "directory",
    icon: "mapPin",
    titleField: "name",
    imageField: "image",
    columns: [],
    fields: [
      { name: "name", label: "Название", type: "text", required: true },
      { name: "country_id", label: "Страна", type: "relation", relation: "countries" },
      { name: "image", label: "Фото", type: "image", more: true },
    ],
    tags: ["catalog"],
    usesLang: true,
  },
  districts: {
    key: "districts",
    path: "/districts/",
    title: "Районы",
    one: "район",
    group: "directory",
    icon: "compass",
    titleField: "name",
    columns: [],
    fields: [
      { name: "name", label: "Название", type: "text", required: true },
      { name: "region_id", label: "Регион", type: "relation", relation: "regions", required: true },
    ],
    tags: ["catalog"],
    usesLang: true,
  },

  faqs: {
    key: "faqs",
    path: "/faqs/",
    title: "FAQ",
    one: "вопрос",
    group: "content",
    icon: "help",
    titleField: "question",
    columns: [{ field: "order", label: "Порядок" }, activeColumn],
    fields: [
      { name: "question", label: "Вопрос", type: "text", required: true },
      { name: "answer", label: "Ответ", type: "textarea", required: true },
      { name: "order", label: "Порядок", type: "number", defaultValue: "0" },
      isActive,
    ],
    tags: ["catalog"],
    usesLang: true,
  },
  aboutSections: {
    key: "aboutSections",
    path: "/about-sections/",
    title: "О нас: разделы",
    one: "раздел",
    group: "content",
    icon: "users",
    titleField: "title",
    imageField: "image",
    columns: [{ field: "order", label: "Порядок" }, activeColumn],
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      description,
      { name: "image", label: "Фото", type: "image" },
      { name: "order", label: "Порядок", type: "number", defaultValue: "0" },
      isActive,
    ],
    tags: ["catalog"],
    usesLang: true,
  },
  contacts: {
    key: "contacts",
    path: "/contacts/",
    title: "Контакты",
    one: "контакт",
    group: "content",
    icon: "phone",
    titleField: "phone",
    subtitle: (r) => join(r.city, r.email),
    columns: [activeColumn],
    fields: [
      { name: "phone", label: "Телефон", type: "phone", half: true, placeholder: "700 123 456" },
      {
        name: "whatsapp",
        label: "WhatsApp — ссылка",
        type: "url",
        half: true,
        placeholder: "https://wa.me/996700123456",
        hint: "Ссылка на чат: https://wa.me/ и номер без «+» и пробелов",
      },
      { name: "email", label: "Email", type: "text", placeholder: "info@kerbentravel.kg" },
      { name: "city", label: "Город", type: "text", half: true, placeholder: "Бишкек", suggestions: CITIES },
      { name: "address", label: "Адрес", type: "text", half: true },
      { name: "instagram", label: "Instagram", type: "text", half: true, placeholder: "kerbentravel", section: "Соцсети" },
      { name: "telegram", label: "Telegram", type: "text", half: true, placeholder: "kerbentravel" },
      { name: "facebook", label: "Facebook", type: "text", placeholder: "kerbentravel" },
      isActive,
      { name: "country", label: "Страна", type: "text", more: true },
    ],
    tags: ["contacts"],
    usesLang: true,
  },
};

export const MENU: { title: string; items: ResourceKey[] }[] = [
  { title: "Каталог", items: ["tours", "hotels", "transports", "helicopters", "trekkings"] },
  { title: "Справочники", items: ["categories", "countries", "regions", "districts"] },
  { title: "Контент", items: ["faqs", "aboutSections", "contacts"] },
];

export function getResource(key: string): ResourceDef | null {
  if (!Object.hasOwn(RESOURCES, key)) return null;
  const def = RESOURCES[key as ResourceKey];
  return def.group !== "child" ? def : null;
}

export interface TravelRequest {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  travel_date: string | null;
  duration_days: number | null;
  travelers_count: number | null;
  destination: string | null;
  message: string | null;
  status: RequestStatus;
  created_at: string;
}
