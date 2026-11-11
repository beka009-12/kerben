"use client";

import { Button } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import { Logo } from "@/components/ui/logo/Logo";
import { useAuthForm } from "@/utils/auth-gate/use-auth-form";
import type { AuthInput } from "@/utils/validation";
import "./auth-form.css";

export function AuthForm({
  initialMode = "login",
  onSuccess,
  showLogo = true,
}: {
  initialMode?: "login" | "register";
  onSuccess?: () => void;
  showLogo?: boolean;
}) {
  const { t, mode, values, errors, serverError, showPassword, setShowPassword, busy, resetSent, register, forgot, set, switchMode, onSubmit, id, errorText } = useAuthForm({ initialMode, onSuccess });

  const fieldError = (key: keyof AuthInput) => {
    const text = errorText(key);
    return text ? (
      <span id={id(`${key}-error`)} className="auth-form-error">
        {text}
      </span>
    ) : null;
  };

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      {showLogo && <Logo size="lg" />}
      <div className="auth-form-head">
        <h1 className="auth-form-title">{forgot ? t.resetTitle : register ? t.registerTitle : t.title}</h1>
        <p className="auth-form-text">{forgot ? t.resetText : register ? t.registerText : t.text}</p>
      </div>

      {register && (
        <div className="auth-form-field">
          <label htmlFor={id("name")} className="auth-form-label">
            {t.name}
          </label>
          <input
            id={id("name")}
            className="auth-form-input"
            value={values.name}
            placeholder={t.namePh}
            autoComplete="nickname"
            maxLength={40}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? id("name-error") : undefined}
          />
          {fieldError("name")}
        </div>
      )}

      {register && (
        <div className="auth-form-field">
          <label htmlFor={id("phone")} className="auth-form-label">
            {t.phone}
          </label>
          <input
            id={id("phone")}
            type="tel"
            inputMode="tel"
            className="auth-form-input"
            value={values.phone}
            placeholder={t.phonePh}
            autoComplete="tel"
            maxLength={20}
            onChange={(e) => set("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? id("phone-error") : id("phone-hint")}
          />
          {fieldError("phone") ?? (
            <span id={id("phone-hint")} className="auth-form-hint">
              {t.phoneHint}
            </span>
          )}
        </div>
      )}

      <div className="auth-form-field">
        <label htmlFor={id("email")} className="auth-form-label">
          {t.email}
        </label>
        <input
          id={id("email")}
          type="email"
          className="auth-form-input"
          value={values.email}
          autoComplete="email"
          inputMode="email"
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? id("email-error") : undefined}
        />
        {fieldError("email")}
      </div>

      {!forgot && (
        <div className="auth-form-field">
          <label htmlFor={id("password")} className="auth-form-label">
            {t.password}
          </label>
          <span className="auth-form-password">
            <input
              id={id("password")}
              type={showPassword ? "text" : "password"}
              className="auth-form-input auth-form-input-password"
              value={values.password}
              autoComplete={register ? "new-password" : "current-password"}
              onChange={(e) => set("password", e.target.value)}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? id("password-error") : id("password-hint")}
            />
            <button
              type="button"
              className="auth-form-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t.hidePassword : t.showPassword}
              aria-pressed={showPassword}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
            </button>
          </span>
          {fieldError("password") ??
            (register && (
              <span id={id("password-hint")} className="auth-form-hint">
                {t.passwordHint}
              </span>
            ))}
          {mode === "login" && (
            <button type="button" className="auth-form-forgot" onClick={() => switchMode("forgot")}>
              {t.forgot}
            </button>
          )}
        </div>
      )}

      {serverError && (
        <p className="auth-form-alert" role="alert">
          {t.errors[serverError]}
        </p>
      )}

      <Button type="submit" block size="lg" disabled={busy || (forgot && resetSent)}>
        <span aria-live="polite">{busy ? t.loading : forgot ? (resetSent ? t.resetSent : t.resetSend) : register ? t.register : t.submit}</span>
      </Button>

      {forgot ? (
        <p className="auth-form-switch">
          <button type="button" className="auth-form-switch-button" onClick={() => switchMode("login")}>
            {t.backToLogin}
          </button>
        </p>
      ) : (
        <p className="auth-form-switch">
          {register ? t.haveAccount : t.noAccount}{" "}
          <button type="button" className="auth-form-switch-button" onClick={() => switchMode(register ? "login" : "register")}>
            {register ? t.signIn : t.signUp}
          </button>
        </p>
      )}
    </form>
  );
}
