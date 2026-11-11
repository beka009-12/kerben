"use client";

import { RequestsList } from "@/components/requests/requests-list/RequestsList";
import { SavedList } from "@/components/saved/saved-list/SavedList";
import { Icon } from "@/components/ui/icon/Icon";
import type { Tour } from "@/types/tour";
import { TABS, TRIPS_TAB_ICONS, useTripsTabs } from "@/utils/trips/use-trips-tabs";
import "./trips-tabs.css";

export function TripsTabs({ tours }: { tours: Tour[] }) {
  const { t, uid, tab, counts, select, onKey } = useTripsTabs();

  return (
    <div className="trips-tabs">
      <div className="trips-tabs-bar" role="tablist" aria-label={t.title} onKeyDown={onKey}>
        {TABS.map((key) => (
          <button
            key={key}
            id={`${uid}-${key}`}
            type="button"
            role="tab"
            aria-selected={tab === key}
            aria-controls={`${uid}-panel`}
            tabIndex={tab === key ? 0 : -1}
            className={tab === key ? "trips-tabs-tab trips-tabs-tab-active" : "trips-tabs-tab"}
            onClick={() => select(key)}
          >
            <Icon name={TRIPS_TAB_ICONS[key]} size={18} filled={key === "saved" && tab === key} />
            {t.tabs[key]}
            {counts[key] > 0 && <span className="trips-tabs-count">{counts[key]}</span>}
          </button>
        ))}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-${tab}`} className="trips-tabs-panel">
        {tab === "requests" ? <RequestsList /> : <SavedList tours={tours} />}
      </div>
    </div>
  );
}
