"use client";

import { Fragment } from "react";
import { AdminStatus } from "@/components/admin/admin-status/AdminStatus";
import { Icon } from "@/components/ui/icon/Icon";
import { Select } from "@/components/ui/select/Select";
import { type TravelRequest } from "@/utils/admin/resources";
import { digits, dateTime, dateOnly, formatDate, findItem, statusLabel, PERIODS, SORTS, type CatalogItem } from "@/utils/admin/requests-view";
import { useAdminRequests } from "@/utils/admin/use-admin-requests";
import "./admin-requests.css";

export function AdminRequests({ requests, catalog = [] }: { requests: TravelRequest[]; catalog?: CatalogItem[] }) {
  const { uid, filter, setFilter, openId, toggle, query, setQuery, period, setPeriod, from, setFrom, to, setTo, sort, setSort, visible, filtered, reset, change, tabs } = useAdminRequests({ requests });

  return (
    <section className="admin-requests">
      <header className="admin-requests-head">
        <h1 className="admin-requests-title">Заявки</h1>
        <div className="admin-requests-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={filter === tab.value}
              className={filter === tab.value ? "admin-requests-tab admin-requests-tab-active" : "admin-requests-tab"}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
              <span className="admin-requests-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="admin-requests-toolbar">
        <label className="admin-requests-search">
          <Icon name="search" size={18} className="admin-requests-search-icon" />
          <input
            type="search"
            className="admin-requests-input admin-requests-search-input"
            placeholder="Имя, телефон или что заказали"
            aria-label="Поиск по заявкам"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="admin-requests-control">
          <span id={`${uid}-period`} className="admin-requests-control-label">
            Период
          </span>
          <Select value={period} options={PERIODS} onChange={setPeriod} labelledBy={`${uid}-period`} icon="calendar" />
        </div>
        {period === "custom" && (
          <>
            <label className="admin-requests-control">
              <span className="admin-requests-control-label">С</span>
              <input type="date" className="admin-requests-input" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="admin-requests-control">
              <span className="admin-requests-control-label">По</span>
              <input type="date" className="admin-requests-input" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
            </label>
          </>
        )}
        <div className="admin-requests-control">
          <span id={`${uid}-sort`} className="admin-requests-control-label">
            Сортировка
          </span>
          <Select value={sort} options={SORTS} onChange={setSort} labelledBy={`${uid}-sort`} icon="sliders" />
        </div>
        {filtered && (
          <button type="button" className="admin-requests-reset" onClick={reset}>
            Сбросить
          </button>
        )}
      </div>

      <div className="admin-requests-card">
        {visible.length === 0 ? (
          <p className="admin-requests-empty">
            {requests.length === 0 ? "Заявок пока нет" : filtered ? "Ничего не найдено" : "В этой вкладке пусто"}
          </p>
        ) : (
          <table className="admin-requests-table">
            <thead>
              <tr>
                <th className="admin-requests-th">Клиент</th>
                <th className="admin-requests-th">Что</th>
                <th className="admin-requests-th">Поездка</th>
                <th className="admin-requests-th">Пришла</th>
                <th className="admin-requests-th">Статус</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const isOpen = openId === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr
                      className={["admin-requests-row", r.status === "new" && "admin-requests-row-new", isOpen && "admin-requests-row-open"]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => toggle(r.id)}
                    >
                      <td className="admin-requests-td admin-requests-client">
                        <button
                          type="button"
                          className="admin-requests-name"
                          data-testid="request-name"
                          aria-expanded={isOpen}
                          aria-controls={`request-${r.id}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggle(r.id);
                          }}
                        >
                          {r.name}
                          <Icon name="chevronDown" size={16} className="admin-requests-name-chevron" />
                        </button>
                        <span className="admin-requests-contacts" onClick={(event) => event.stopPropagation()}>
                          <a href={`tel:+${digits(r.phone)}`} className="admin-requests-phone">
                            {r.phone}
                          </a>
                          <a
                            href={`https://wa.me/${digits(r.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-requests-wa"
                            aria-label={`WhatsApp: ${r.name}`}
                          >
                            <Icon name="whatsapp" size={16} />
                          </a>
                        </span>
                      </td>
                      <td className="admin-requests-td admin-requests-what" data-label="Что">
                        {r.destination || "—"}
                      </td>
                      <td className="admin-requests-td admin-requests-nowrap admin-requests-trip" data-label="Поездка">
                        {formatDate(r.travel_date, dateOnly)}
                        {r.travelers_count ? <span className="admin-requests-sub">{r.travelers_count} чел.</span> : null}
                      </td>
                      <td className="admin-requests-td admin-requests-nowrap admin-requests-muted admin-requests-when" data-label="Пришла">
                        {formatDate(r.created_at, dateTime)}
                      </td>
                      <td className="admin-requests-td admin-requests-state" onClick={(event) => event.stopPropagation()}>
                        <AdminStatus value={r.status} label={r.name} onChange={(next) => change(r, next)} />
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="admin-requests-detail-row">
                        <td colSpan={5} className="admin-requests-detail-cell">
                          <RequestDetails request={r} item={findItem(catalog, r.destination)} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </section>
  );
}

function RequestDetails({ request, item }: { request: TravelRequest; item: CatalogItem | null }) {
  const facts: [string, string][] = [
    ["Дата поездки", formatDate(request.travel_date, dateOnly)],
    ["Дней", request.duration_days ? String(request.duration_days) : "—"],
    ["Человек", request.travelers_count ? String(request.travelers_count) : "—"],
    ["Email", request.email || "—"],
    ["Статус", statusLabel(request.status)],
    ["Пришла", formatDate(request.created_at, dateTime)],
  ];
  const phone = digits(request.phone);

  return (
    <div id={`request-${request.id}`} className="admin-requests-detail">
      <div className="admin-requests-photo">
        {item?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="admin-requests-photo-img" loading="lazy" />
        ) : (
          <Icon name="image" size={28} />
        )}
        {item && <span className="admin-requests-photo-kind">{item.kind}</span>}
      </div>

      <div className="admin-requests-info">
        <div className="admin-requests-info-head">
          <p className="admin-requests-info-id">Заявка №{request.id}</p>
          <h3 className="admin-requests-info-title">{item?.title ?? (request.destination || "Без направления")}</h3>
        </div>
        <dl className="admin-requests-facts">
          {facts.map(([label, value]) => (
            <div key={label} className="admin-requests-fact">
              <dt className="admin-requests-fact-label">{label}</dt>
              <dd className="admin-requests-fact-value">{value}</dd>
            </div>
          ))}
        </dl>
        {request.message && <p className="admin-requests-message">{request.message}</p>}
        <div className="admin-requests-actions">
          <a href={`tel:+${phone}`} className="admin-requests-action">
            <Icon name="phone" size={16} />
            Позвонить
          </a>
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="admin-requests-action admin-requests-action-wa">
            <Icon name="whatsapp" size={16} />
            WhatsApp
          </a>
          {request.email && (
            <a href={`mailto:${request.email}`} className="admin-requests-action">
              <Icon name="mail" size={16} />
              Написать
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
