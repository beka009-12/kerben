"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icon/Icon";
import { formatPrice } from "@/utils/format";
import { type SearchItem } from "@/utils/search";
import { useHeaderSearch } from "@/utils/layout/use-header-search";
import "./header-search.css";

export function HeaderSearch({ items }: { items: SearchItem[] }) {
  const { locale, dict, t, open, setOpen, query, setQuery, active, setActive, inputRef, triggerRef, trimmed, results, base, allHref, askHref, close, onInputKey, listId, optionId, heading } = useHeaderSearch({ items });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="header-search-trigger"
        aria-label={dict.a11y.search}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="search" size={20} />
      </button>

      {open &&
        createPortal(
          <div className="header-search" role="dialog" aria-modal="true" aria-label={dict.a11y.search}>
            <button type="button" className="header-search-backdrop" tabIndex={-1} aria-label={t.close} onClick={() => close()} />
            <div className="header-search-panel">
              <div className="header-search-bar">
                <Icon name="search" size={20} className="header-search-icon" />
                <input
                  ref={inputRef}
                  type="search"
                  className="header-search-input"
                  value={query}
                  placeholder={t.placeholder}
                  enterKeyHint="search"
                  autoComplete="off"
                  spellCheck={false}
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls={listId}
                  aria-activedescendant={results[active] ? optionId(active) : undefined}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKey}
                />
                <button type="button" className="header-search-close" onClick={() => close()} aria-label={t.close}>
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="header-search-body">
                {results.length > 0 ? (
                  <>
                    <p className="header-search-heading">{heading}</p>
                    <ul id={listId} role="listbox" className="header-search-list" aria-label={heading}>
                      {results.map((item, i) => (
                        <li key={item.slug} id={optionId(i)} role="option" aria-selected={i === active}>
                          <Link
                            href={`${base}/tours/${item.slug}`}
                            className={i === active ? "header-search-item header-search-item-active" : "header-search-item"}
                            onMouseEnter={() => setActive(i)}
                            onNavigate={() => close(false)}
                          >
                            <span className="header-search-thumb">
                              <Image src={item.image} alt="" fill sizes="56px" className="header-search-thumb-image" />
                            </span>
                            <span className="header-search-text">
                              <span className="header-search-title">{item.title}</span>
                              <span className="header-search-meta">
                                {item.place === item.title ? item.country : `${item.place}, ${item.country}`} · {item.days}{" "}
                                {dict.card.days}
                              </span>
                            </span>
                            <span className="header-search-price">
                              {dict.card.from} {formatPrice(item.price, locale)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="header-search-empty" role="status">
                    <p>{t.empty.replace("{q}", trimmed)}</p>
                    <Link href={askHref} className="header-search-ask" onNavigate={() => close(false)}>
                      <Icon name="chat" size={18} />
                      {t.ask}
                    </Link>
                  </div>
                )}
              </div>

              <Link href={allHref} className="header-search-all" onNavigate={() => close(false)}>
                {t.all}
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
