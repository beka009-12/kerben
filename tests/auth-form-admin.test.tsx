import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());
const signUp = vi.hoisted(() => vi.fn());
const adminSignIn = vi.hoisted(() => vi.fn());
vi.mock("@/app/[lang]/admin/actions", () => ({ adminSignIn }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/utils/auth", () => ({ signUp, signIn: vi.fn() }));

import { AuthForm } from "@/components/auth/auth-form/AuthForm";
import ru from "@/dictionaries/ru.json";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("форма ИИ-ассистента", () => {
  it("только email и пароль — обычные ошибки, никакого входа в админку", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(
      <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
        <AuthForm initialMode="register" showLogo={false} />
      </I18nProvider>,
    );
    fireEvent.change(screen.getByLabelText(ru.login.email), { target: { value: "boss@kg.kg" } });
    fireEvent.change(screen.getByLabelText(ru.login.password), { target: { value: "secret1" } });
    fireEvent.click(screen.getByRole("button", { name: ru.login.register }));
    await waitFor(() => expect(screen.getAllByText(ru.login.errors.required)).toHaveLength(2));
    expect(push).not.toHaveBeenCalled();
    expect(signUp).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(adminSignIn).not.toHaveBeenCalled();
  });
});
