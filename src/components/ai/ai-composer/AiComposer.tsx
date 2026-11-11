"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon/Icon";
import { COMPOSER_MAX, useAiComposer, type ComposerTour } from "@/utils/ai/use-ai-composer";
import "./ai-composer.css";

export function AiComposer({
  onSend,
  onStop,
  streaming,
  placeholder,
  sendLabel,
  stopLabel,
  initialValue = "",
  autoFocus = false,
  tours = [],
  sendEmpty = false,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  placeholder: string;
  sendLabel: string;
  stopLabel: string;
  initialValue?: string;
  autoFocus?: boolean;
  tours?: ComposerTour[];
  sendEmpty?: boolean;
}) {
  const { inputRef, rootRef, t, templates, ...c } = useAiComposer({ onSend, streaming, initialValue, autoFocus, tours, sendEmpty });

  return (
    <form ref={rootRef} className="ai-composer" onSubmit={c.submit}>
      {c.panel !== "closed" && (
        <div className="ai-composer-panel" role="menu" aria-label={t.open}>
          {c.panel === "menu" && (
            <>
              <button type="button" role="menuitem" className="ai-composer-item" onClick={() => c.setPanel("templates")}>
                <Icon name="sliders" size={18} className="ai-composer-item-icon" />
                <span className="ai-composer-item-label">{t.templates}</span>
                <span className="ai-composer-item-hint">/</span>
                <Icon name="chevronRight" size={16} className="ai-composer-item-icon" />
              </button>
              <button
                type="button"
                role="menuitem"
                className="ai-composer-item"
                disabled={c.saved.length === 0}
                onClick={() => c.setPanel("favorites")}
              >
                <Icon name="heart" size={18} className="ai-composer-item-icon" />
                <span className="ai-composer-item-label">{t.favorites}</span>
                {c.saved.length > 0 && <span className="ai-composer-item-hint">{c.saved.length}</span>}
                {c.saved.length > 0 && <Icon name="chevronRight" size={16} className="ai-composer-item-icon" />}
              </button>
              {c.saved.length === 0 && <p className="ai-composer-note">{t.favoritesEmpty}</p>}
            </>
          )}
          {c.panel === "templates" && (
            <>
              <button type="button" className="ai-composer-item ai-composer-item-back" onClick={() => c.setPanel("menu")}>
                <Icon name="chevronLeft" size={16} className="ai-composer-item-icon" />
                <span className="ai-composer-item-label">{t.templates}</span>
              </button>
              {templates.map((item) => (
                <button key={item.title} type="button" role="menuitem" className="ai-composer-item" onClick={() => c.insert(item.prompt)}>
                  <Icon name="chat" size={16} className="ai-composer-item-icon" />
                  <span className="ai-composer-item-label">{item.title}</span>
                </button>
              ))}
            </>
          )}
          {c.panel === "favorites" && (
            <>
              <button type="button" className="ai-composer-item ai-composer-item-back" onClick={() => c.setPanel("menu")}>
                <Icon name="chevronLeft" size={16} className="ai-composer-item-icon" />
                <span className="ai-composer-item-label">{t.favoritesPick}</span>
              </button>
              {c.saved.map((tour) => (
                <button key={tour.slug} type="button" role="menuitem" className="ai-composer-item" onClick={() => c.pickTour(tour.title)}>
                  <span className="ai-composer-thumb">
                    {tour.image ? (
                      <Image src={tour.image} alt="" fill sizes="40px" className="ai-composer-thumb-image" />
                    ) : (
                      <Icon name="route" size={16} />
                    )}
                  </span>
                  <span className="ai-composer-item-label">{tour.title}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {c.slash !== null && (
        <div className="ai-composer-panel" role="listbox" aria-label={t.slash}>
          <p className="ai-composer-heading">{t.slash}</p>
          {c.slashItems.length === 0 ? (
            <p className="ai-composer-note">{t.noMatch}</p>
          ) : (
            c.slashItems.map((item, i) => (
              <button
                key={item.title}
                type="button"
                role="option"
                aria-selected={i === c.active}
                className={i === c.active ? "ai-composer-item ai-composer-item-active" : "ai-composer-item"}
                onMouseEnter={() => c.setActive(i)}
                onClick={() => c.insert(item.prompt)}
              >
                <span className="ai-composer-slash">/</span>
                <span className="ai-composer-item-label">{item.title}</span>
              </button>
            ))
          )}
        </div>
      )}

      <div className="ai-composer-row">
        <button
          type="button"
          className={c.panel === "closed" ? "ai-composer-plus" : "ai-composer-plus ai-composer-plus-open"}
          aria-label={t.open}
          aria-haspopup="menu"
          aria-expanded={c.panel !== "closed"}
          onClick={c.togglePanel}
        >
          <Icon name="close" size={18} />
        </button>

        <textarea
          ref={inputRef}
          className="ai-composer-input"
          rows={1}
          value={c.value}
          placeholder={placeholder}
          aria-label={placeholder}
          maxLength={COMPOSER_MAX}
          onChange={(event) => c.onChange(event.target.value)}
          onKeyDown={c.onKeyDown}
        />
        {streaming ? (
          <button type="button" className="ai-composer-button ai-composer-button-stop" onClick={onStop} aria-label={stopLabel}>
            <span className="ai-composer-stop" />
          </button>
        ) : (
          <button type="submit" className="ai-composer-button" disabled={!c.canSend} aria-label={sendLabel}>
            <Icon name="arrowRight" size={20} />
          </button>
        )}
      </div>
    </form>
  );
}
