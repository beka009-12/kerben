"use client";

import { AdminConfirm } from "@/components/admin/admin-confirm/AdminConfirm";
import { AdminEditor } from "@/components/admin/admin-editor/AdminEditor";
import { Icon } from "@/components/ui/icon/Icon";
import { type AdminRecord, type ColumnDef, type ResourceKey } from "@/utils/admin/resources";
import { priceText } from "@/utils/admin/records";
import { useAdminResource } from "@/utils/admin/use-admin-resource";
import { useAdminSelection } from "@/utils/admin/use-admin-selection";
import "./admin-resource.css";

function cell(record: AdminRecord, column: ColumnDef) {
  const value = record[column.field];
  if (column.format === "price") return priceText(record);
  if (column.format === "boolean")
    return value === false ? (
      <span className="admin-resource-pill">Не активен</span>
    ) : (
      <span className="admin-resource-pill admin-resource-pill-on">Активен</span>
    );
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function AdminResource({
  resource,
  rows,
  relations,
  childRows,
  lang,
}: {
  resource: ResourceKey;
  rows: AdminRecord[];
  relations: Partial<Record<ResourceKey, AdminRecord[] | null>>;
  childRows: Partial<Record<ResourceKey, AdminRecord[] | null>>;
  lang: string;
}) {
  const { def, active, query, setQuery, editing, setEditing, editTab, openEditor, allRows, visible, toggling, toggleActive, forget, hasOrder, manual, setManual, move, moving, nextOrder } =
    useAdminResource({ resource, rows });
  const pick = useAdminSelection({ resource, onRemoved: forget });
  const canMove = hasOrder && manual && !query.trim() && !pick.selecting;
  const visibleIds = visible.map((row) => row.id);
  const allPicked = visibleIds.length > 0 && visibleIds.every((id) => pick.selected.has(id));
  const somePicked = !allPicked && visibleIds.some((id) => pick.selected.has(id));
  const titleOf = (row: AdminRecord) => String(row[def.titleField] || `#${row.id}`);

  function renderCell(row: AdminRecord, column: ColumnDef) {
    if (column.format !== "boolean" || column.field !== "is_active") return cell(row, column);
    const on = active[row.id] ?? row.is_active !== false;
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`Показывать на сайте: ${String(row[def.titleField] || `#${row.id}`)}`}
        className={on ? "admin-resource-toggle admin-resource-toggle-on" : "admin-resource-toggle"}
        disabled={toggling === row.id}
        onClick={(event) => {
          event.stopPropagation();
          void toggleActive(row);
        }}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <span className={on ? "admin-resource-toggle-track admin-resource-toggle-track-on" : "admin-resource-toggle-track"} aria-hidden="true" />
        {on ? "Активен" : "Не активен"}
      </button>
    );
  }

  return (
    <section className="admin-resource">
      <header className="admin-resource-head">
        <div className="admin-resource-heading">
          <h1 className="admin-resource-title">{def.title}</h1>
          <span className="admin-resource-count">{query.trim() ? `${visible.length} из ${allRows.length}` : allRows.length}</span>
        </div>
        <label className="admin-resource-search">
          <Icon name="search" size={18} className="admin-resource-search-icon" />
          <input
            type="search"
            className="admin-resource-search-input"
            placeholder="Поиск"
            aria-label={`Поиск: ${def.title}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {!pick.selecting && visible.length > 0 && (
          <button type="button" className="admin-resource-select" onClick={() => pick.setMode(true)}>
            <Icon name="check" size={18} />
            Выбрать
          </button>
        )}
        <button type="button" className="admin-resource-add" onClick={() => openEditor(null)}>
          <Icon name="plus" size={18} />
          {`Добавить ${def.one}`}
        </button>
      </header>

      {hasOrder && (
        <div className="admin-resource-order" role="radiogroup" aria-label="Порядок">
          <span className="admin-resource-order-label">Порядок:</span>
          <button
            type="button"
            role="radio"
            aria-checked={!manual}
            className={manual ? "admin-resource-order-option" : "admin-resource-order-option admin-resource-order-option-on"}
            onClick={() => setManual(false)}
          >
            По умолчанию
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={manual}
            className={manual ? "admin-resource-order-option admin-resource-order-option-on" : "admin-resource-order-option"}
            onClick={() => setManual(true)}
          >
            Вручную
          </button>
          {manual && <span className="admin-resource-order-hint">Стрелками ↑↓ поставьте записи как на сайте</span>}
        </div>
      )}

      <div className="admin-resource-card">
        {visible.length === 0 ? (
          <p className="admin-resource-empty">
            <Icon name={allRows.length === 0 ? "inbox" : "search"} size={28} />
            {allRows.length === 0 ? "Записей пока нет — добавьте первую." : "Ничего не найдено"}
          </p>
        ) : (
          <table className={pick.selecting ? "admin-resource-table admin-resource-table-picking" : "admin-resource-table"}>
            <thead>
              <tr>
                <th className="admin-resource-th admin-resource-th-pick">
                  <input
                    type="checkbox"
                    className="admin-resource-check"
                    aria-label="Выбрать все"
                    checked={allPicked}
                    ref={(box) => {
                      if (box) box.indeterminate = somePicked;
                    }}
                    onChange={(event) => pick.setAll(visibleIds, event.target.checked)}
                  />
                </th>
                {canMove && <th className="admin-resource-th admin-resource-th-move">Место</th>}
                <th className="admin-resource-th">Название</th>
                {def.columns.map((column) => (
                  <th key={column.field} className="admin-resource-th admin-resource-th-narrow">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, index) => {
                const image = def.imageField ? String(row[def.imageField] ?? "") : "";
                const subtitle = def.subtitle?.(row);
                const picked = pick.selected.has(row.id);
                const rowClass = [
                  "admin-resource-row",
                  (active[row.id] ?? row.is_active !== false) ? "" : "admin-resource-row-off",
                  picked ? "admin-resource-row-picked" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <tr
                    key={row.id}
                    className={rowClass}
                    tabIndex={0}
                    aria-selected={pick.selecting ? picked : undefined}
                    {...pick.holdHandlers(row.id)}
                    onClick={() => pick.onRowClick(row.id, () => openEditor(row))}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pick.onRowClick(row.id, () => openEditor(row)))}
                  >
                    <td className="admin-resource-td admin-resource-td-pick" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="admin-resource-check"
                        aria-label={`Выбрать: ${titleOf(row)}`}
                        checked={picked}
                        onChange={() => pick.toggle(row.id)}
                      />
                    </td>
                    {canMove && (
                      <td className="admin-resource-td admin-resource-td-move" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                        <span className="admin-resource-move">
                          <button
                            type="button"
                            className="admin-resource-move-button"
                            onClick={() => void move(row, -1)}
                            disabled={moving || index === 0}
                            aria-label={`Выше: ${String(row[def.titleField] || `#${row.id}`)}`}
                          >
                            <Icon name="chevronUp" size={16} />
                          </button>
                          <span className="admin-resource-move-place">{index + 1}</span>
                          <button
                            type="button"
                            className="admin-resource-move-button"
                            onClick={() => void move(row, 1)}
                            disabled={moving || index === visible.length - 1}
                            aria-label={`Ниже: ${String(row[def.titleField] || `#${row.id}`)}`}
                          >
                            <Icon name="chevronDown" size={16} />
                          </button>
                        </span>
                      </td>
                    )}
                    <td className="admin-resource-td admin-resource-td-main">
                      <span className="admin-resource-name">
                        {def.imageField && (
                          <span className="admin-resource-thumb">
                            {/^https?:\/\//i.test(image) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image} alt="" className="admin-resource-thumb-img" loading="lazy" />
                            ) : (
                              <Icon name="image" size={18} />
                            )}
                          </span>
                        )}
                        <span className="admin-resource-text">
                          <span className="admin-resource-label">{String(row[def.titleField] || `#${row.id}`)}</span>
                          {subtitle && <span className="admin-resource-sub">{subtitle}</span>}
                        </span>
                        <Icon name="chevronRight" size={18} className="admin-resource-chevron" />
                      </span>
                    </td>
                    {def.columns.map((column) => (
                      <td key={column.field} className="admin-resource-td admin-resource-td-narrow" data-label={column.label}>
                        {renderCell(row, column)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pick.selecting ? (
        <div className="admin-resource-bulk" role="toolbar" aria-label="Выбранные записи">
          <span className="admin-resource-bulk-count" aria-live="polite">
            Выбрано: {pick.selected.size}
          </span>
          <button type="button" className="admin-resource-bulk-link" onClick={() => pick.setAll(visibleIds, !allPicked)}>
            {allPicked ? "Снять все" : "Выбрать все"}
          </button>
          <button type="button" className="admin-resource-bulk-cancel" onClick={pick.clear}>
            <Icon name="close" size={18} />
            <span className="admin-resource-bulk-cancel-text">Отмена</span>
          </button>
          <button type="button" className="admin-resource-bulk-delete" disabled={pick.selected.size === 0} onClick={() => pick.setConfirm(true)}>
            <Icon name="trash" size={18} />
            Удалить
          </button>
        </div>
      ) : (
        <button type="button" className="admin-resource-fab" onClick={() => openEditor(null)} aria-label={`Добавить ${def.one}`} title={`Добавить ${def.one}`}>
          <Icon name="plus" size={26} />
        </button>
      )}

      <AdminConfirm
        open={pick.confirm}
        title={`Удалить выбранное: ${pick.selected.size}?`}
        text="Записи удалятся с сайта навсегда. Отменить это нельзя."
        busy={pick.busy}
        onConfirm={() => void pick.removeSelected()}
        onCancel={() => pick.setConfirm(false)}
      />

      {editing !== undefined && (
        <AdminEditor
          key={editing?.id ?? "new"}
          def={def}
          record={editing}
          relations={relations}
          childRows={childRows}
          lang={lang}
          initialTab={editTab}
          defaults={nextOrder !== null ? { order: String(nextOrder) } : undefined}
          onClose={() => setEditing(undefined)}
          onCreated={(created) => openEditor(created)}
        />
      )}
    </section>
  );
}
