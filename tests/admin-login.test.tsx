import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const replace = vi.hoisted(() => vi.fn());
const adminSignIn = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh: vi.fn() }) }));
vi.mock("@/app/[lang]/admin/actions", () => ({ adminSignIn }));
vi.mock("@/components/ui/logo/Logo", () => ({ Logo: () => null }));

import { AdminLogin } from "@/components/admin/admin-login/AdminLogin";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function fill(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Пароль"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Войти" }));
}

describe("вход в админку", () => {
  it("только email и пароль: поля кода и галочки «доверять» нет", () => {
    render(<AdminLogin lang="ru" />);
    expect(screen.queryByLabelText("Код из приложения")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("429 — просим подождать", async () => {
    adminSignIn.mockResolvedValue({ ok: false, error: "rate" });
    render(<AdminLogin lang="ru" />);
    fill("boss@kg.kg", "secret1");
    expect((await screen.findByRole("alert")).textContent).toBe("Слишком много попыток, подождите минуту");
  });

  it("успех → в админку", async () => {
    adminSignIn.mockResolvedValue({ ok: true });
    render(<AdminLogin lang="ru" />);
    fill("boss@kg.kg", "secret1");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/ru/admin"));
    expect(adminSignIn).toHaveBeenCalledWith("boss@kg.kg", "secret1");
  });

  it("неудача → понятная ошибка, пароль остаётся", async () => {
    adminSignIn.mockResolvedValue({ ok: false, error: "invalid" });
    render(<AdminLogin lang="ru" />);
    fill("boss@kg.kg", "wrong");
    expect((await screen.findByRole("alert")).textContent).toBe("Неверный email или пароль");
    expect((screen.getByLabelText("Пароль") as HTMLInputElement).value).toBe("wrong");
    expect(replace).not.toHaveBeenCalled();
  });

  it("пустые поля — подсказка без запроса", async () => {
    render(<AdminLogin lang="ru" />);
    fill("", "");
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Введите email и пароль");
    expect(adminSignIn).not.toHaveBeenCalled();
  });

  it("сеть упала → как неудача, без падения страницы", async () => {
    adminSignIn.mockRejectedValue(new Error("down"));
    render(<AdminLogin lang="ru" />);
    fill("boss@kg.kg", "secret1");
    expect(await screen.findByRole("alert")).toBeTruthy();
  });
});
