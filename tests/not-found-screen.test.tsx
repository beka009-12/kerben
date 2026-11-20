import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotFoundScreen } from "@/components/common/not-found-screen/NotFoundScreen";
import de from "@/dictionaries/de.json";
import ru from "@/dictionaries/ru.json";
import type { Dictionary } from "@/utils/i18n/dictionaries";

vi.mock("next/image", () => ({ default: () => null }));

afterEach(cleanup);

describe("страница 404", () => {
  it("заголовок и указатели, куда пойти дальше", () => {
    render(<NotFoundScreen locale="ru" dict={ru as unknown as Dictionary} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Страница не найдена");
    const ways = screen.getByRole("navigation", { name: "Куда пойти дальше" });
    const links = within(ways)
      .getAllByRole("link")
      .map((link) => [link.textContent, link.getAttribute("href")]);
    expect(links).toEqual([
      ["Главная", "/ru"],
      ["Туры", "/ru/tours"],
      ["Достопримечательности", "/ru/attractions"],
      ["Контакты", "/ru/contact"],
      ["Помощник", "/ru/chat"],
    ]);
  });

  it("без шапки сайта логотип ведёт на главную", () => {
    render(<NotFoundScreen locale="ru" dict={ru as unknown as Dictionary} />);
    expect(screen.getByRole("link", { name: "Kerben Travel — на главную" }).getAttribute("href")).toBe("/ru");
  });

  it("карта — украшение: скрыта от скринридера, но с отметкой 404 и подписью «Вы здесь»", () => {
    const { container } = render(<NotFoundScreen locale="de" dict={de as unknown as Dictionary} />);
    const map = container.querySelector("svg.not-found-map");
    expect(map?.getAttribute("aria-hidden")).toBe("true");
    expect(map?.textContent).toContain("404");
    expect(map?.textContent).toContain("Sie sind hier");
    expect(screen.getAllByRole("link")[0].getAttribute("href")).toBe("/de");
  });

  it("горизонтали одинаковые при каждом рендере — сервер и клиент не расходятся", () => {
    const paths = () => [...document.querySelectorAll(".not-found-contour")].map((p) => p.getAttribute("d"));
    render(<NotFoundScreen locale="ru" dict={ru as unknown as Dictionary} />);
    const first = paths();
    cleanup();
    render(<NotFoundScreen locale="ru" dict={ru as unknown as Dictionary} />);
    expect(first.length).toBeGreaterThan(5);
    expect(paths()).toEqual(first);
  });
});
