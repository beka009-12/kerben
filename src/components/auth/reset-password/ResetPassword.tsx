"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/Button";
import { useResetPassword } from "@/utils/auth-gate/use-reset-password";
import "../auth-form/auth-form.css";

export function ResetPassword() {
  const { locale, t, id, state, password, setPassword, error, setError, busy, onSubmit } = useResetPassword();

  return (
    <section className="auth-form-page">
      <form className="auth-form auth-form-card" onSubmit={onSubmit} noValidate>
        <div className="auth-form-head">
          <h1 className="auth-form-title">{t.newPasswordTitle}</h1>
          <p className="auth-form-text">{t.newPasswordText}</p>
        </div>

        {state === "expired" && (
          <p className="auth-form-alert" role="alert">
            {t.resetExpired}
          </p>
        )}

        {state === "done" && (
          <p className="auth-form-success" role="status">
            {t.passwordSaved}
          </p>
        )}

        {state === "ready" && (
          <>
            <div className="auth-form-field">
              <label htmlFor={`${id}-password`} className="auth-form-label">
                {t.password}
              </label>
              <input
                id={`${id}-password`}
                type="password"
                className="auth-form-input"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                aria-invalid={!!error}
              />
              {error ? <span className="auth-form-error">{error}</span> : <span className="auth-form-hint">{t.passwordHint}</span>}
            </div>
            <Button type="submit" block size="lg" disabled={busy}>
              {busy ? t.loading : t.savePassword}
            </Button>
          </>
        )}

        <p className="auth-form-switch">
          <Link href={`/${locale}/chat`} className="auth-form-switch-button">
            {state === "done" ? t.toChat : t.backToLogin}
          </Link>
        </p>
      </form>
    </section>
  );
}
