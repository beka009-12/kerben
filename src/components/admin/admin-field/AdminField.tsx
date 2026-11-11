"use client";

import { useId } from "react";
import { AdminPhoto } from "@/components/admin/admin-photo/AdminPhoto";
import { Icon } from "@/components/ui/icon/Icon";
import { parseNumber, type FormValue } from "@/utils/admin/form";
import { joinPhone, PHONE_CODES, splitPhone } from "@/utils/admin/phone";
import type { FieldDef } from "@/utils/admin/resources";
import "./admin-field.css";

export function AdminField({
  field,
  value,
  error,
  onChange,
  relationOptions = [],
}: {
  field: FieldDef;
  value: FormValue;
  error?: string;
  onChange: (value: FormValue) => void;
  relationOptions?: { value: string; label: string }[];
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : field.hint ? `${id}-hint` : undefined;
  const common = {
    id,
    placeholder: field.placeholder,
    "aria-invalid": !!error,
    "aria-describedby": describedBy,
    className: error ? "admin-field-input admin-field-input-error" : "admin-field-input",
  };
  const text = typeof value === "string" ? value : "";

  function step(delta: number) {
    const current = parseNumber(text);
    const base = current === null || Number.isNaN(current) ? 0 : current;
    onChange(String(Math.max(0, Math.round(base) + delta)));
  }

  let control;
  switch (field.type) {
    case "boolean":
      return (
        <label className="admin-field-switch">
          <input
            type="checkbox"
            role="switch"
            className="admin-field-switch-input"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className={value === true ? "admin-field-switch-track admin-field-switch-track-on" : "admin-field-switch-track"} aria-hidden="true" />
          <span className="admin-field-switch-label">{field.label}</span>
        </label>
      );
    case "textarea":
      control = <textarea {...common} className={`${common.className} admin-field-textarea`} rows={4} value={text} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "list":
      control = (
        <textarea
          {...common}
          className={`${common.className} admin-field-textarea`}
          rows={4}
          value={Array.isArray(value) ? value.join("\n") : ""}
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      );
      break;
    case "select":
    case "relation": {
      const options = field.type === "select" ? (field.options ?? []) : relationOptions;
      control = (
        <select {...common} value={text} onChange={(e) => onChange(e.target.value)}>
          {(!field.required || !text) && <option value="">—</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    }
    case "time":
      control = <input {...common} type="time" value={text} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      control = (
        <span className="admin-field-stepper">
          <button type="button" className="admin-field-step" onClick={() => step(-1)} aria-label={`Меньше: ${field.label}`} tabIndex={-1}>
            <Icon name="minus" size={16} />
          </button>
          <input
            {...common}
            className={`${common.className} admin-field-stepper-input`}
            inputMode="numeric"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                step(e.key === "ArrowUp" ? 1 : -1);
              }
            }}
          />
          <button type="button" className="admin-field-step" onClick={() => step(1)} aria-label={`Больше: ${field.label}`} tabIndex={-1}>
            <Icon name="plus" size={16} />
          </button>
        </span>
      );
      break;
    case "price":
      control = <input {...common} inputMode="decimal" value={text} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "phone": {
      const phone = splitPhone(text);
      control = (
        <span className="admin-field-phone">
          <select
            className="admin-field-input admin-field-phone-code"
            aria-label={`Код страны: ${field.label}`}
            value={phone.code}
            onChange={(e) => onChange(joinPhone(e.target.value, phone.number))}
          >
            {PHONE_CODES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <input {...common} type="tel" inputMode="tel" value={phone.number} onChange={(e) => onChange(joinPhone(phone.code, e.target.value))} />
        </span>
      );
      break;
    }
    case "url":
      control = <input {...common} type="url" inputMode="url" value={text} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "image":
      control = <AdminPhoto id={id} value={text} invalid={!!error} describedBy={describedBy} onChange={onChange} />;
      break;
    default:
      control = (
        <>
          <input {...common} list={field.suggestions ? `${id}-list` : undefined} value={text} onChange={(e) => onChange(e.target.value)} />
          {field.suggestions && (
            <datalist id={`${id}-list`}>
              {field.suggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          )}
        </>
      );
  }

  return (
    <div className="admin-field">
      <label htmlFor={id} className="admin-field-label">
        {field.label}
        {field.required && <span className="admin-field-required"> *</span>}
      </label>
      {control}
      {error ? (
        <span id={`${id}-error`} className="admin-field-error">
          {error}
        </span>
      ) : (
        field.hint && (
          <span id={`${id}-hint`} className="admin-field-hint">
            {field.hint}
          </span>
        )
      )}
    </div>
  );
}
