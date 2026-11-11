"use client";

import { AdminChildren } from "@/components/admin/admin-children/AdminChildren";
import { AdminConfirm } from "@/components/admin/admin-confirm/AdminConfirm";
import { AdminField } from "@/components/admin/admin-field/AdminField";
import { AdminGallery } from "@/components/admin/admin-gallery/AdminGallery";
import { SESSION_EXPIRED } from "@/components/admin/admin-result";
import { Icon } from "@/components/ui/icon/Icon";
import type { FormValues } from "@/utils/admin/form";
import type { AdminRecord, FieldDef, ResourceDef, ResourceKey } from "@/utils/admin/resources";
import { useAdminEditor } from "@/utils/admin/use-admin-editor";
import "./admin-editor.css";

export function AdminEditor({
  def,
  record,
  relations,
  childRows,
  lang,
  initialTab = 0,
  defaults,
  onClose,
  onCreated,
}: {
  def: ResourceDef;
  record: AdminRecord | null;
  relations: Partial<Record<ResourceKey, AdminRecord[] | null>>;
  childRows: Partial<Record<ResourceKey, AdminRecord[] | null>>;
  lang: string;
  initialTab?: number;
  defaults?: FormValues;
  onClose: () => void;
  onCreated?: (record: AdminRecord) => void;
}) {
  const { ref, errors, busy, expired, confirm, setConfirm, tab, setTab, tabs, photos, extra, title, dirty, requestClose, onKeyDown, save, remove, retranslate, more, sections, values, setField, optionsFor } = useAdminEditor({ def, record, relations, initialTab, defaults, onClose, onCreated });

  const renderField = (field: FieldDef) => (
    <div key={field.name} className={field.half ? "admin-editor-cell admin-editor-cell-half" : "admin-editor-cell"}>
      <AdminField
        field={field}
        value={values[field.name]}
        error={errors[field.name]}
        relationOptions={optionsFor(field.relation)}
        onChange={(value) => setField(field.name, value)}
      />
    </div>
  );

  return (
    <dialog
      ref={ref}
      className="admin-editor"
      aria-labelledby="admin-editor-title"
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && requestClose()}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
    >
      <form className="admin-editor-box" onSubmit={save} onKeyDown={onKeyDown} noValidate>
        <header className="admin-editor-head">
          <div className="admin-editor-heading">
            <p className="admin-editor-kicker">{def.title}</p>
            <h2 id="admin-editor-title" className="admin-editor-title">
              {title}
            </h2>
          </div>
          <button type="button" className="admin-editor-close" onClick={requestClose} aria-label="Закрыть">
            <Icon name="close" size={20} />
          </button>
        </header>

        {tabs.length > 1 && (
          <div className="admin-editor-tabs" role="tablist">
            {tabs.map((name, i) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={tab === i}
                className={tab === i ? "admin-editor-tab admin-editor-tab-active" : "admin-editor-tab"}
                onClick={() => setTab(i)}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {expired && (
          <p className="admin-editor-alert" role="alert">
            {SESSION_EXPIRED}.{" "}
            <a href={`/${lang}/admin/login`} target="_blank" rel="noopener noreferrer" className="admin-editor-alert-link">
              Войти в новой вкладке
            </a>
            , затем снова нажмите «Сохранить» — введённое здесь не пропадёт.
          </p>
        )}

        <div className="admin-editor-body">
          {tab === 0 ? (
            <div className="admin-editor-fields">
              {sections.map((section, i) => (
                <section key={section.title ?? i} className="admin-editor-section">
                  {section.title && <h3 className="admin-editor-section-title">{section.title}</h3>}
                  <div className="admin-editor-grid">{section.fields.map(renderField)}</div>
                </section>
              ))}
              {record && photos && (
                <section className="admin-editor-section">
                  <h3 className="admin-editor-section-title">Фото</h3>
                  <AdminGallery child={photos} parentId={record.id} rows={childRows[photos.resource] ?? null} />
                </section>
              )}
              {more.length > 0 && (
                <details className="admin-editor-more" open={more.some((f) => errors[f.name]) || undefined}>
                  <summary className="admin-editor-more-summary">Дополнительно</summary>
                  <div className="admin-editor-grid">{more.map(renderField)}</div>
                </details>
              )}
            </div>
          ) : (
            record &&
            extra[tab - 1] && <AdminChildren child={extra[tab - 1]} parentId={record.id} rows={childRows[extra[tab - 1].resource] ?? null} />
          )}
        </div>

        {tab === 0 && (
          <footer className="admin-editor-foot">
            {dirty && <span className="admin-editor-dirty">Есть несохранённые изменения · Ctrl+S</span>}
            {record && (
              <button type="button" className="admin-editor-delete" onClick={() => setConfirm(true)} disabled={busy}>
                <Icon name="trash" size={18} />
                Удалить
              </button>
            )}
            {record && def.translatable && (
              <button type="button" className="admin-editor-secondary" onClick={retranslate} disabled={busy}>
                <Icon name="refresh" size={18} />
                Перевести заново
              </button>
            )}
            <button type="submit" className="admin-editor-save" disabled={busy}>
              {busy ? "Сохраняем…" : "Сохранить"}
            </button>
          </footer>
        )}
      </form>

      <AdminConfirm
        open={confirm}
        title={`Удалить «${title}»?`}
        text="Запись пропадёт с сайта. Отменить это нельзя."
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      />
    </dialog>
  );
}
