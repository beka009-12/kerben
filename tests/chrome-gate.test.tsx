import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/ru/admin" }));

import { ChromeGate } from "@/components/layout/chrome-gate/ChromeGate";
import { isAdminPage } from "@/utils/routes";
import { useHeaderStore } from "@/utils/store/header";

afterEach(() => {
  cleanup();
  useHeaderStore.setState({ adminShell: 0 });
});

describe("ChromeGate", () => {
  it("isAdminPage узнаёт админку на любом языке", () => {
    expect(isAdminPage("/ru/admin")).toBe(true);
    expect(isAdminPage("/en/admin/tours")).toBe(true);
    expect(isAdminPage("/ru/administration")).toBe(false);
    expect(isAdminPage("/ru/tours")).toBe(false);
  });

  it("без входа /admin — обычная 404 с подвалом: снаружи админку не видно", () => {
    render(<ChromeGate>подвал</ChromeGate>);
    expect(screen.getByText("подвал")).toBeTruthy();
  });

  it("открыта админка — шапка, подвал и меню сайта скрыты: у админки своя панель", () => {
    act(() => useHeaderStore.setState({ adminShell: 1 }));
    render(<ChromeGate>шапка сайта</ChromeGate>);
    expect(screen.queryByText("шапка сайта")).toBeNull();
  });
});
