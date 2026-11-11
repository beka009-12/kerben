"use client";

import { Icon } from "@/components/ui/icon/Icon";
import { localeNames, locales } from "@/utils/i18n/config";
import { useLanguageSwitcher } from "@/utils/layout/use-language-switcher";
import "./language-switcher.css";

export function LanguageSwitcher({
  id,
  light = false,
  variant = "menu",
}: {
  id: string;
  light?: boolean;
  variant?: "menu" | "inline";
}) {
  const { locale, dict, pending, open, setOpen, rootRef, buttonRef, itemsRef, prefetch, names, change, onMenuKey } = useLanguageSwitcher();

  if (variant === "inline") {
    return (
      <div
        className={pending ? "language-inline language-switcher-pending" : "language-inline"}
        role="group"
        aria-label={dict.a11y.language}
        onPointerEnter={prefetch}
        onFocus={prefetch}
      >
        <Icon name="globe" size={18} />
        {locales.map((code) => (
          <button
            key={code}
            type="button"
            lang={localeNames[code].htmlLang}
            className={code === locale ? "language-chip language-chip-active" : "language-chip"}
            aria-pressed={code === locale}
            title={localeNames[code].native}
            onClick={() => change(code)}
          >
            {localeNames[code].short}
          </button>
        ))}
      </div>
    );
  }

  const classes = [
    "language-switcher",
    light ? "language-switcher-light" : "",
    open ? "language-switcher-open" : "",
    pending ? "language-switcher-pending" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className={classes}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        className="language-switcher-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-label={`${dict.a11y.language}: ${localeNames[locale].native}`}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Icon name="globe" size={17} />
        <span className="language-switcher-value">{localeNames[locale].short}</span>
        <span className="language-switcher-chevron">
          <Icon name="chevronDown" size={14} />
        </span>
      </button>

      <div id={`${id}-menu`} className="language-menu" role="menu" aria-labelledby={id} hidden={!open} onKeyDown={onMenuKey}>
        <p className="language-menu-title" aria-hidden="true">
          {dict.a11y.language}
        </p>
        {locales.map((code, i) => {
          const active = code === locale;
          const translated = names.of(code);
          return (
            <button
              key={code}
              ref={(node) => {
                itemsRef.current[i] = node;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              lang={localeNames[code].htmlLang}
              className={active ? "language-option language-option-active" : "language-option"}
              onClick={() => change(code)}
            >
              <span className="language-option-code">{code.toUpperCase()}</span>
              <span className="language-option-names">
                <span className="language-option-native">{localeNames[code].native}</span>
                {translated && translated !== localeNames[code].native && (
                  <span className="language-option-full" lang={localeNames[locale].htmlLang}>
                    {translated}
                  </span>
                )}
              </span>
              <span className="language-option-check">
                <Icon name="check" size={18} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
