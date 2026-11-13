"use client";

import Link from "next/link";
import { EmptyOffers } from "@/components/common/empty-offers/EmptyOffers";
import { RequestTicket } from "@/components/requests/request-ticket/RequestTicket";
import { ButtonLink } from "@/components/ui/button/Button";
import { Icon } from "@/components/ui/icon/Icon";
import { REQUEST_KIND_ICONS, REQUEST_STEP, REQUEST_STEP_KEYS } from "@/utils/requests/request-icons";
import { useRequestsList } from "@/utils/requests/use-requests-list";
import "./requests-list.css";


export function RequestsList() {
  const { locale, dict, t, state, cancel, setCancel, confirmCancel, hide, date, kinds, visible, tabs, pickTab } = useRequestsList();

  if (state.phase === "loading") {
    return (
      <div className="requests-skeleton" aria-busy="true" aria-label={t.loading}>
        <span className="requests-skeleton-card" />
        <span className="requests-skeleton-card" />
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <p className="requests-error" role="alert">
        {t.error}
      </p>
    );
  }

  const { items, signedIn } = state;

  return (
    <div className="requests">
      {!signedIn && (
        <div className="requests-guest">
          <span className="requests-guest-icon">
            <Icon name="user" size={20} />
          </span>
          <p className="requests-guest-text">{t.guestNote}</p>
          <Link href={`/${locale}/chat?next=${encodeURIComponent("/trips")}`} className="requests-guest-login">
            {t.login}
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyOffers
          icon="heart"
          title={dict.trips.emptyTitle}
          text={dict.trips.emptyText}
          action={
            <ButtonLink href={`/${locale}/tours`} size="lg">
              {dict.hero.primary}
              <Icon name="arrowRight" size={18} />
            </ButtonLink>
          }
        />
      ) : (
        <div className="requests-layout">
          <div className="requests-main">
            {kinds.length > 1 && (
              <div className="requests-tabs" role="tablist" aria-label={t.title}>
                {tabs.map(({ kind, count, active }) => (
                  <button
                    key={kind}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={active ? "requests-tab requests-tab-active" : "requests-tab"}
                    onClick={(event) => pickTab(kind, event)}
                  >
                    {kind !== "all" && <Icon name={REQUEST_KIND_ICONS[kind]} size={16} />}
                    {kind === "all" ? t.all : t.kinds[kind]}
                    <span className="requests-tab-count">{count}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="requests-count">{t.count.replace("{n}", String(visible.length))}</p>
            <ol className="requests-list">
              {visible.map((item, i) => {
                const step = REQUEST_STEP[item.status];
                const cancelled = item.status === "cancelled";
                return (
                  <li key={item.id} className="requests-item" style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}>
                    <RequestTicket item={item} date={date}>
                      <div className="request-ticket-foot">
                        {cancelled ? (
                          <p className="request-card-cancelled-chip">
                            <Icon name="x" size={14} />
                            {t.cancelled}
                          </p>
                        ) : (
                          <ol className="request-steps" aria-label={t.steps[REQUEST_STEP_KEYS[Math.min(step, 2)]]}>
                            {REQUEST_STEP_KEYS.map((key, n) => (
                              <li
                                key={key}
                                className={
                                  n < step
                                    ? "request-step request-step-done"
                                    : n === step
                                      ? "request-step request-step-current"
                                      : "request-step"
                                }
                              >
                                <span className="request-step-dot">{n < step ? <Icon name="check" size={12} /> : null}</span>
                                <span className="request-step-label">{t.steps[key]}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                        <p className="request-card-status">{t.status[item.status]}</p>

                        {(item.status === "new" || item.status === "in_progress") &&
                          (cancel?.id === item.id ? (
                            <div className="request-cancel" role="alertdialog" aria-live="polite">
                              <p className="request-cancel-text">{cancel.phase === "error" ? t.cancelError : t.cancelConfirm}</p>
                              <div className="request-cancel-actions">
                                <button
                                  type="button"
                                  className="request-cancel-yes"
                                  onClick={() => void confirmCancel(item)}
                                  disabled={cancel.phase === "sending"}
                                >
                                  {cancel.phase === "sending" ? t.cancelling : t.cancelYes}
                                </button>
                                <button type="button" className="request-cancel-no" onClick={() => setCancel(null)}>
                                  {t.cancelNo}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="request-card-cancel"
                              onClick={() => setCancel({ id: item.id, phase: "confirm" })}
                            >
                              <Icon name="x" size={14} />
                              {t.cancel}
                            </button>
                          ))}
                        <button type="button" className="request-ticket-hide" onClick={() => void hide(item.id)}>
                          <Icon name="close" size={14} />
                          {t.hide}
                        </button>
                      </div>
                    </RequestTicket>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
