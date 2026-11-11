"use client";

import { createPortal } from "react-dom";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import { useSelect, type SelectOption } from "@/utils/ui/use-select";
import "./select.css";

export type { SelectOption } from "@/utils/ui/use-select";

export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
  labelledBy,
  icon,
  variant = "field",
  className,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (next: T) => void;
  label?: string;
  labelledBy?: string;
  icon?: IconName;
  variant?: "field" | "pill";
  className?: string;
}) {
  const { id, trigger, menu, open, active, setActive, current, tone, show, close, pick, onTriggerKey, onMenuKey } = useSelect({ value, options, onChange, variant });

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={`select select-${variant}${tone(current)}${className ? ` ${className}` : ""}`}
        aria-label={label ? `${label}: ${current.label}` : undefined}
        aria-labelledby={label ? undefined : `${labelledBy} ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        onClick={() => (open ? close() : show())}
        onKeyDown={onTriggerKey}
      >
        {icon && <Icon name={icon} size={16} className="select-icon" />}
        {current.tone && <span className="select-dot" aria-hidden="true" />}
        <span id={`${id}-value`} className="select-value">
          {current.label}
        </span>
        <Icon name="chevronDown" size={variant === "pill" ? 14 : 16} className="select-chevron" />
      </button>

      {open &&
        createPortal(
          <ul
            ref={menu}
            id={`${id}-menu`}
            role="listbox"
            tabIndex={-1}
            className="select-menu"
            aria-label={label}
            aria-labelledby={label ? undefined : labelledBy}
            aria-activedescendant={`${id}-${options[active].value}`}
            onKeyDown={onMenuKey}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-${option.value}`}
                role="option"
                aria-selected={option.value === value}
                className={`select-option${tone(option)}${index === active ? " select-option-active" : ""}`}
                onPointerEnter={() => setActive(index)}
                onClick={() => pick(option.value)}
              >
                {option.tone && <span className="select-dot" aria-hidden="true" />}
                <span className="select-option-label">{option.label}</span>
                {option.value === value && <Icon name="check" size={16} className="select-check" />}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  );
}
