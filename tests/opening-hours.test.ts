import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import de from "@/dictionaries/de.json";
import en from "@/dictionaries/en.json";
import ru from "@/dictionaries/ru.json";
import zh from "@/dictionaries/zh.json";

describe("часы работы", () => {
  it("Пн–Сб 11:00–20:00, как в карточке 2ГИС", () => {
    expect(siteConfig.openingHours).toEqual({
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "11:00",
      closes: "20:00",
    });
  });

  it.each([
    ["ru", ru],
    ["en", en],
    ["de", de],
    ["zh", zh],
  ])("тексты %s совпадают с часами в разметке", (_, dict) => {
    const hours = `${siteConfig.openingHours.opens}–${siteConfig.openingHours.closes}`;
    expect(dict.contact.hoursText).toContain(hours);
    expect(dict.contact.replyNote).toContain(hours);
  });
});
