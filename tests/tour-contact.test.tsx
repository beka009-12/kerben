import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TourContact } from "@/components/tour/tour-contact/TourContact";

const labels = {
  from: "От",
  perPerson: "за человека",
  message: "Здравствуйте! Хочу тур «{title}» {url}",
  whatsapp: "Написать в WhatsApp",
  telegram: "Написать в Telegram",
  ask: "Спросить ИИ-ассистента",
};

afterEach(cleanup);

describe("карточка цены тура: три способа забронировать", () => {
  it("WhatsApp с текстом про тур, Telegram и ИИ-ассистент", () => {
    render(<TourContact title="Сон-Куль" price="299 $" contacts={{ whatsapp: "996555123456", telegram: "kerben_manager" }} askHref="/ru/chat?ask=x" labels={labels} />);
    const whatsapp = screen.getAllByRole("link", { name: labels.whatsapp })[0];
    expect(whatsapp.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/996555123456\?text=.*%D0%A1%D0%BE%D0%BD-%D0%9A%D1%83%D0%BB%D1%8C/);
    expect(screen.getAllByRole("link", { name: labels.telegram })[0].getAttribute("href")).toBe("https://t.me/kerben_manager");
    expect(screen.getAllByRole("link", { name: labels.ask })[0].getAttribute("href")).toBe("/ru/chat?ask=x");
  });

  it("без контактов менеджера — только ИИ-ассистент", () => {
    render(<TourContact title="Сон-Куль" price="299 $" contacts={{ whatsapp: null, telegram: null }} askHref="/ru/chat" labels={labels} />);
    expect(screen.queryByRole("link", { name: labels.whatsapp })).toBeNull();
    expect(screen.queryByRole("link", { name: labels.telegram })).toBeNull();
    expect(screen.getAllByRole("link", { name: labels.ask }).length).toBeGreaterThan(0);
  });
});
