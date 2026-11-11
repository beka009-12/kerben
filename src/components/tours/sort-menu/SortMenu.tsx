"use client";

import { Icon } from "@/components/ui/icon/Icon";
import { useSortMenu } from "@/utils/tours/use-sort-menu";
import "./sort-menu.css";

export function SortMenu<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) {
  const { open, active, setActive, toggle, pick, rootRef, buttonRef, listRef, listId, optionId, onButtonKey, onListKey } = useSortMenu({
    options,
    value,
    onChange,
  });

  return (
    <div ref={rootRef} className="sort-menu">
      <button
        ref={buttonRef}
        type="button"
        className="sort-menu-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggle}
        onKeyDown={onButtonKey}
      >
        <Icon name="sliders" size={16} className="sort-menu-icon" />
        <span className="visually-hidden">{label}: </span>
        <span className="sort-menu-value">{labels[value]}</span>
        <Icon name="chevronDown" size={16} className="sort-menu-chevron" />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          className="sort-menu-list"
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={optionId(active)}
          onKeyDown={onListKey}
        >
          {options.map((option, index) => {
            const selected = option === value;
            const classes = ["sort-menu-option", selected && "sort-menu-option-selected", index === active && "sort-menu-option-active"].filter(Boolean).join(" ");
            return (
              <li
                key={option}
                id={optionId(index)}
                role="option"
                aria-selected={selected}
                className={classes}
                onPointerMove={() => setActive(index)}
                onClick={() => pick(option)}
              >
                {labels[option]}
                {selected && <Icon name="check" size={18} className="sort-menu-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
