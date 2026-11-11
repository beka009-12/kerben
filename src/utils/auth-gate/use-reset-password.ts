"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { resetPassword, type AuthErrorCode } from "@/utils/auth";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { PASSWORD_MIN } from "@/utils/validation";

/** Токен сброса из ссылки в письме backend: ?token=… или #token=… */
function tokenFromUrl(): string | null {
  const { search, hash } = window.location;
  const value = new URLSearchParams(search).get("token") ?? new URLSearchParams(hash.replace(/^#/, "")).get("token");
  return value?.trim() || null;
}

export function useResetPassword() {
  const { locale, dict } = useI18n();
  const t = dict.login;
  const id = useId();
  const [state, setState] = useState<"checking" | "ready" | "expired" | "done">("checking");
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const found = tokenFromUrl();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(found);
    setState(found ? "ready" : "expired");
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    if (password.length < PASSWORD_MIN) {
      setError(t.errors.short);
      return;
    }
    setBusy(true);
    const result: { error?: AuthErrorCode } = await resetPassword(token, password);
    setBusy(false);
    if (!result.error) setState("done");
    else if (result.error === "invalid" || result.error === "unknown") setState("expired");
    else setError(t.errors[result.error]);
  }

  return { locale, t, id, state, password, setPassword, error, setError, busy, onSubmit };
}
