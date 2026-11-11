import { describe, expect, it } from "vitest";
import en from "@/dictionaries/en.json";
import de from "@/dictionaries/de.json";
import ru from "@/dictionaries/ru.json";
import zh from "@/dictionaries/zh.json";
import { negotiateLocale, switchLocaleInPath } from "@/utils/i18n/config";

function keys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((item, i) => keys(item, `${prefix}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => keys(item, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

/** Формы множественного числа (one/few/many/other) у каждого языка свои — сравниваем без них */
const shared = (dict: unknown) => keys(dict).map((key) => key.replace(/Forms\.\w+$/, "Forms")).filter((key, i, all) => all.indexOf(key) === i);

describe("i18n", () => {
  it.each([
    ["ru", ru],
    ["de", de],
    ["zh", zh],
  ])("в словаре %s те же ключи, что в английском", (_, dict) => {
    expect(shared(dict).sort()).toEqual(shared(en).sort());
  });

  it("выбирает язык по Accept-Language", () => {
    expect(negotiateLocale("ru-RU,ru;q=0.9,en;q=0.8")).toBe("ru");
    expect(negotiateLocale("ky-KG,ky;q=0.9")).toBe("ru");
    expect(negotiateLocale("de-DE")).toBe("de");
    expect(negotiateLocale("zh-CN,zh;q=0.9")).toBe("zh");
    expect(negotiateLocale("fr-FR")).toBe("en");
    expect(negotiateLocale(null)).toBe("en");
  });

  it("меняет язык в адресе", () => {
    expect(switchLocaleInPath("/en/tours/bali", "ru")).toBe("/ru/tours/bali");
    expect(switchLocaleInPath("/", "ru")).toBe("/ru");
  });
});

describe("ИИ-ассистент вместо ИИ-гида", () => {
  const raw = (dict: unknown) => JSON.stringify(dict);

  it("во всех словарях нет старого названия", () => {
    expect(raw(ru)).not.toMatch(/ИИ-гид/);
    expect(raw(en)).not.toMatch(/AI guide/i);
    expect(raw(de)).not.toMatch(/KI-Guide|KI-Reiseführer/);
    expect(raw(zh)).not.toMatch(/AI ?(向导|导游)/);
  });

  it("новое название есть во всех языках", () => {
    expect(raw(ru)).toMatch(/ИИ-ассистент/);
    expect(raw(en)).toMatch(/AI assistant/i);
    expect(raw(de)).toMatch(/KI-Assistent/);
    expect(raw(zh)).toMatch(/AI 助手/);
  });
});
