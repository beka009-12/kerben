import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const signUp = vi.hoisted(() => vi.fn());
const signIn = vi.hoisted(() => vi.fn());
const requestPasswordReset = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/utils/auth", () => ({ signUp, signIn, requestPasswordReset }));
vi.mock("next/image", () => ({ default: () => null }));

import { AuthForm } from "@/components/auth/auth-form/AuthForm";
import { OfferBookingCard } from "@/components/common/offer-booking-card/OfferBookingCard";
import ru from "@/dictionaries/ru.json";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";

const dict = ru as unknown as Dictionary;
const t = ru.login;

function renderAuth(initialMode: "register" | "login") {
  render(
    <I18nProvider locale="ru" dict={dict}>
      <AuthForm initialMode={initialMode} showLogo={false} />
    </I18nProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("регистрация: email уже есть", () => {
  it("форма сама переключается на «Войти» и сохраняет email и пароль", async () => {
    signUp.mockResolvedValue({ error: "taken" });
    renderAuth("register");
    fireEvent.change(screen.getByLabelText(t.name), { target: { value: "Айдана" } });
    fireEvent.change(screen.getByLabelText(t.phone), { target: { value: "+996 700 123 456" } });
    fireEvent.change(screen.getByLabelText(t.email), { target: { value: "aidana@mail.kg" } });
    fireEvent.change(screen.getByLabelText(t.password), { target: { value: "secret12" } });
    fireEvent.click(screen.getByRole("button", { name: t.register }));
    expect(await screen.findByRole("heading", { name: t.title })).toBeTruthy();
    expect((screen.getByLabelText(t.email) as HTMLInputElement).value).toBe("aidana@mail.kg");
    expect(screen.getByRole("alert").textContent).toBe(t.errors.taken);
  });
});

describe("забыли пароль", () => {
  it("по email отправляется ссылка для нового пароля", async () => {
    requestPasswordReset.mockResolvedValue({});
    renderAuth("login");
    fireEvent.click(screen.getByRole("button", { name: t.forgot }));
    fireEvent.change(screen.getByLabelText(t.email), { target: { value: "aidana@mail.kg" } });
    fireEvent.click(screen.getByRole("button", { name: t.resetSend }));
    await waitFor(() => expect(requestPasswordReset).toHaveBeenCalledWith("aidana@mail.kg"));
    expect(await screen.findByText(t.resetSent)).toBeTruthy();
  });

  it("пустой email — подсказка без запроса", async () => {
    renderAuth("login");
    fireEvent.click(screen.getByRole("button", { name: t.forgot }));
    fireEvent.click(screen.getByRole("button", { name: t.resetSend }));
    expect(await screen.findByText(t.errors.required)).toBeTruthy();
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });
});

describe("лишние кнопки убраны", () => {
  it("на карточке машины и вертолёта нет «Позвонить» и «Выбрать»", () => {
    render(
      <I18nProvider locale="ru" dict={dict}>
        <OfferBookingCard
          price={80}
          unit="per_day"
          askPrompt="?"
          locale="ru"
          dict={dict}
        />
      </I18nProvider>,
    );
    expect(screen.queryByText(ru.hotels.call)).toBeNull();
    expect(screen.queryByRole("button", { name: ru.trip.choose })).toBeNull();
  });
});
