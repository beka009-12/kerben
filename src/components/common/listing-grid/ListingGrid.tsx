"use client";

import { useMemo, useState } from "react";
import { ListingCard, type ListingCardProps } from "@/components/common/listing-card/ListingCard";
import { Icon } from "@/components/ui/icon/Icon";
import "./listing-grid.css";

export interface ListingGridItem {
  id: string;
  group?: string;
  price: number;
  card: ListingCardProps;
}

type SortKey = "default" | "asc" | "desc";

export interface ListingGridLabels {
  all: string;
  filter: string;
  sort: string;
  sortAsc: string;
  sortDesc: string;
}

export function ListingGrid({ items, labels, filters = true }: { items: ListingGridItem[]; labels: ListingGridLabels; filters?: boolean }) {
  const [group, setGroup] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const groups = useMemo(() => [...new Set(items.map((item) => item.group).filter((value): value is string => Boolean(value)))], [items]);

  const shown = useMemo(() => {
    const list = group ? items.filter((item) => item.group === group) : items;
    if (sort === "default") return list;
    return [...list].sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));
  }, [items, group, sort]);

  return (
    <>
      {filters && (
        <div className="listing-grid-toolbar">
          <div className="listing-grid-chips" role="group" aria-label={labels.filter}>
            {["", ...groups].map((value) => (
              <button
                key={value || "all"}
                type="button"
                className={group === value ? "listing-grid-chip listing-grid-chip-active" : "listing-grid-chip"}
                aria-pressed={group === value}
                onClick={() => setGroup(value)}
              >
                {value || labels.all}
              </button>
            ))}
          </div>
          <label className="listing-grid-sort">
            <span className="visually-hidden">{labels.sort}</span>
            <select className="listing-grid-sort-select" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
              <option value="default">{labels.sort}</option>
              <option value="asc">{labels.sortAsc}</option>
              <option value="desc">{labels.sortDesc}</option>
            </select>
            <Icon name="chevronDown" size={16} className="listing-grid-sort-icon" />
          </label>
        </div>
      )}
      <ul className="listing-grid">
        {shown.map((item, index) => (
          <li key={item.id} className="listing-grid-item">
            <ListingCard {...item.card} eager={index < 3} />
          </li>
        ))}
      </ul>
    </>
  );
}
