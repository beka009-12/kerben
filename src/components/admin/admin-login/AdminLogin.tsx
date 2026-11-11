"use client";

import { Icon } from "@/components/ui/icon/Icon";
import { Logo } from "@/components/ui/logo/Logo";
import { useAdminLogin } from "@/utils/admin/use-admin-login";
import "./admin-login.css";

export function AdminLogin({ lang }: { lang: string }) {
  const { id, email, setEmail, password, setPassword, show, setShow, busy, error, onSubmit } = useAdminLogin({ lang });

  return (
    <div className="admin-login">
      <aside className="admin-login-brand">
        <Logo light size="lg" />
        <div className="admin-login-pitch">
          <p className="admin-login-kicker">Рабочее место</p>
          <h1 className="admin-login-headline">Админка Kerben Travel</h1>
          <ul className="admin-login-points">
            <li className="admin-login-point">
              <Icon name="inbox" size={18} />
              Заявки клиентов и их статусы
            </li>
            <li className="admin-login-point">
              <Icon name="mountain" size={18} />
              Туры, отели, транспорт, вертолёты, трекинг
            </li>
            <li className="admin-login-point">
              <Icon name="refresh" size={18} />
              Изменения сразу видны на сайте
            </li>
          </ul>
        </div>
        <p className="admin-login-foot">Доступ только для сотрудников Kerben Travel</p>
      </aside>

      <main className="admin-login-main">
        <form className="admin-login-card" onSubmit={onSubmit} noValidate>
          <span className="admin-login-mobile-logo">
            <Logo />
          </span>
          <div className="admin-login-head">
            <h2 className="admin-login-title">Вход для администратора</h2>
            <p className="admin-login-text">Email и пароль от админки Kerben Travel.</p>
          </div>

          <label className="admin-login-field" htmlFor={`${id}-email`}>
            <span className="admin-login-label">Email</span>
          </label>
          <input
            id={`${id}-email`}
            type="email"
            className="admin-login-input"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />

          <label className="admin-login-field" htmlFor={`${id}-password`}>
            <span className="admin-login-label">Пароль</span>
          </label>
          <span className="admin-login-password">
            <input
              id={`${id}-password`}
              type={show ? "text" : "password"}
              className="admin-login-input admin-login-input-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="admin-login-eye"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Скрыть пароль" : "Показать пароль"}
              aria-pressed={show}
            >
              <Icon name={show ? "eyeOff" : "eye"} size={18} />
            </button>
          </span>

          {error && (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="admin-login-submit" disabled={busy}>
            {busy ? "Проверяем…" : "Войти"}
          </button>
        </form>
      </main>
    </div>
  );
}
