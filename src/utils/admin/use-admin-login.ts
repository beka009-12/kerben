"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { adminSignIn, type SignInResult } from "@/app/[lang]/admin/actions";

const ERRORS = {
  invalid: "Неверный email или пароль",
  rate: "Слишком много попыток, подождите минуту",
  network: "Сервер не отвечает, попробуйте ещё раз",
} as const;

export function useAdminLogin({ lang }: { lang: string }) {
  const router = useRouter();
  const id = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Введите email и пароль");
      return;
    }
    setBusy(true);
    setError("");
    const result: SignInResult = await adminSignIn(email, password).catch(() => ({ ok: false, error: "network" }) as const);
    if (result.ok) {
      router.replace(`/${lang}/admin`);
      return;
    }
    setBusy(false);
    setError(ERRORS[result.error]);
  }

  return { id, email, setEmail, password, setPassword, show, setShow, busy, error, onSubmit };
}
