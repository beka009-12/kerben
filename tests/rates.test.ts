import { describe, expect, it } from "vitest";
import { convertUsd, parseNbkrRates } from "@/utils/api/rates";
import { telegramUsername, telegramUrl } from "@/utils/contact/manager";

const XML = `<?xml version="1.0" encoding="windows-1251" ?>
<CurrencyRates Name="Daily Exchange Rates" Date="10.11.2026">
<Currency ISOCode="USD"><Nominal>1</Nominal><Value>87,4500</Value></Currency>
<Currency ISOCode="EUR"><Nominal>1</Nominal><Value>97,8303</Value></Currency>
<Currency ISOCode="RUB"><Nominal>1</Nominal><Value>1,0655</Value></Currency>
</CurrencyRates>`;

describe("цены тура в сомах и рублях по курсу НБКР", () => {
  it("курс доллара и рубля к сому из XML Нацбанка", () => {
    expect(parseNbkrRates(XML)).toEqual({ usd: 87.45, rub: 1.0655, date: "10.11.2026" });
  });

  it("65 $ → сомы и рубли, округление до десятков", () => {
    const rates = parseNbkrRates(XML)!;
    expect(convertUsd(65, rates)).toEqual({ kgs: 5680, rub: 5330 });
  });

  it("нет USD или RUB — курса нет, показываем только доллары", () => {
    expect(parseNbkrRates("<CurrencyRates></CurrencyRates>")).toBeNull();
  });
});

describe("Telegram менеджера по номеру телефона", () => {
  it("номер или ссылка t.me/+номер → кнопка ведёт на t.me/+996…", () => {
    expect(telegramUsername("+996 704 201 152")).toBe("+996704201152");
    expect(telegramUsername("https://t.me/+996704201152")).toBe("+996704201152");
    expect(telegramUrl(telegramUsername("+996 704 201 152")!)).toBe("https://t.me/+996704201152");
    expect(telegramUsername("@kerben_manager")).toBe("kerben_manager");
  });
});
