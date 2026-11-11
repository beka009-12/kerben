import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const resetPassword = vi.hoisted(() => vi.fn());
vi.mock("@/utils/auth", () => ({ resetPassword }));

import { ResetPassword } from "@/components/auth/reset-password/ResetPassword";
import ru from "@/dictionaries/ru.json";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";

const t = ru.login;
const renderPage = (search = "?token=reset-123") => {
  window.history.replaceState(null, "", `/ru/reset-password${search}`);
  return render(
    <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
      <ResetPassword />
    </I18nProvider>,
  );
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("новый пароль по ссылке из письма", () => {
  it("токен в ссылке → новый пароль сохраняется", async () => {
    resetPassword.mockResolvedValue({});
    renderPage();
    fireEvent.change(await screen.findByLabelText(t.password), { target: { value: "newsecret" } });
    fireEvent.click(screen.getByRole("button", { name: t.savePassword }));
    await waitFor(() => expect(resetPassword).toHaveBeenCalledWith("reset-123", "newsecret"));
    expect(await screen.findByText(t.passwordSaved)).toBeTruthy();
  });

  it("короткий пароль — подсказка без запроса", async () => {
    renderPage();
    fireEvent.change(await screen.findByLabelText(t.password), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: t.savePassword }));
    expect(await screen.findByText(t.errors.short)).toBeTruthy();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("в ссылке нет токена — понятное сообщение", async () => {
    renderPage("");
    expect(await screen.findByText(t.resetExpired)).toBeTruthy();
  });

  it("backend отклонил токен — ссылка устарела", async () => {
    resetPassword.mockResolvedValue({ error: "invalid" });
    renderPage();
    fireEvent.change(await screen.findByLabelText(t.password), { target: { value: "newsecret" } });
    fireEvent.click(screen.getByRole("button", { name: t.savePassword }));
    expect(await screen.findByText(t.resetExpired)).toBeTruthy();
  });
});
