"use client";

import { useId, useState, type FormEvent } from "react";
import { requestPasswordReset, signIn, signUp, type AuthErrorCode } from "@/utils/auth";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { isEmail, isValid, validateAuth, type AuthInput, type FieldError } from "@/utils/validation";

type Mode = "login" | "register" | "forgot";

export function useAuthForm({ initialMode = "login", onSuccess }: Pick<{
  initialMode?: "login" | "register";
  onSuccess?: () => void;
  showLogo?: boolean;
}, "initialMode" | "onSuccess">) {
  const { dict } = useI18n();
  const t = dict.login;
  const uid = useId();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [values, setValues] = useState<AuthInput>({ name: "", phone: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof AuthInput, FieldError>>>({});
  const [serverError, setServerError] = useState<AuthErrorCode | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const register = mode === "register";
  const forgot = mode === "forgot";

  function set(key: keyof AuthInput, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setResetSent(false);
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setServerError(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setServerError(null);
    setResetSent(false);
  }

  async function sendReset() {
    const email = values.email.trim();
    const code: FieldError | undefined = !email ? "required" : !isEmail(email) ? "email" : undefined;
    setErrors(code ? { email: code } : {});
    if (code) return;
    setBusy(true);
    const result = await requestPasswordReset(email);
    setBusy(false);
    if (result.error) setServerError(result.error);
    else setResetSent(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (forgot) return sendReset();

    const found = validateAuth(mode, values);
    setErrors(found);
    if (!isValid(found)) return;

    setBusy(true);
    setServerError(null);
    const result = register
      ? await signUp(values.name ?? "", values.email, values.password, values.phone)
      : await signIn(values.email, values.password);
    setBusy(false);

    if (result.error) {
      if (result.error === "taken") switchMode("login");
      setServerError(result.error);
      return;
    }
    onSuccess?.();
  }

  const id = (name: string) => `${uid}-${name}`;

  const errorText = (key: keyof AuthInput): string | null => {
    const code = errors[key];
    if (!code) return null;
    if (key === "name" && code !== "required") return t.errors.name;
    if (key === "phone" && code !== "required") return t.errors.phone;
    return t.errors[code as "required" | "email" | "short"];
  };

  return { t, mode, values, errors, serverError, showPassword, setShowPassword, busy, resetSent, register, forgot, set, switchMode, onSubmit, id, errorText };
}
