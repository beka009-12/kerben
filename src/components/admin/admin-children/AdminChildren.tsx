"use client";

import { AdminConfirm } from "@/components/admin/admin-confirm/AdminConfirm";
import { AdminField } from "@/components/admin/admin-field/AdminField";
import { Icon } from "@/components/ui/icon/Icon";
import { type AdminRecord, type ChildDef } from "@/utils/admin/resources";
import { useAdminChildItem } from "@/utils/admin/use-admin-child-item";
import { useAdminChildren } from "@/utils/admin/use-admin-children";
import "./admin-children.css";

export function AdminChildren({ child, parentId, rows }: { child: ChildDef; parentId: number; rows: AdminRecord[] | null }) {
  const { sorted, adding, setAdding, isPhotos } = useAdminChildren({
    child,
    parentId,
    rows,
  });

  return (
    <div className="admin-children">
      {rows === null && (
        <p className="admin-children-warning" role="alert">
          <Icon name="refresh" size={18} />
          {isPhotos
            ? "Не удалось загрузить уже добавленные фото — backend не отдал список. Новые фото добавить можно."
            : "Не удалось загрузить программу — backend не отдал список. Новый день добавить можно."}
        </p>
      )}
      {rows !== null && sorted.length === 0 && !adding && (
        <p className="admin-children-empty">{isPhotos ? "Фото пока нет." : "Программа пока не заполнена."}</p>
      )}
      <ul className={isPhotos ? "admin-children-list admin-children-grid" : "admin-children-list"}>
        {sorted.map((row) => (
          <li key={JSON.stringify(row)}>
            <ChildItem child={child} parentId={parentId} record={row} />
          </li>
        ))}
        {adding && (
          <li>
            <ChildItem child={child} parentId={parentId} record={null} onDone={() => setAdding(false)} />
          </li>
        )}
      </ul>
      {!adding && (
        <button type="button" className="admin-children-add" onClick={() => setAdding(true)}>
          <Icon name="plus" size={18} />
          {isPhotos ? "Добавить фото" : "Добавить день"}
        </button>
      )}
    </div>
  );
}

function ChildItem({
  child,
  parentId,
  record,
  onDone,
}: {
  child: ChildDef;
  parentId: number;
  record: AdminRecord | null;
  onDone?: () => void;
}) {
  const { fields, values, errors, busy, confirm, setConfirm, dirty, setField, save, remove } = useAdminChildItem({
    child,
    parentId,
    record,
    onDone,
  });

  return (
    <div className="admin-children-item">
      {fields.map((field) => (
        <AdminField
          key={field.name}
          field={field}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={(value) => setField(field.name, value)}
        />
      ))}
      <div className="admin-children-actions">
        {record ? (
          <button type="button" className="admin-children-delete" onClick={() => setConfirm(true)} aria-label="Удалить">
            <Icon name="trash" size={18} />
          </button>
        ) : (
          <button type="button" className="admin-children-cancel" onClick={onDone}>
            Отмена
          </button>
        )}
        {dirty && (
          <button type="button" className="admin-children-save" onClick={save} disabled={busy}>
            {busy ? "Сохраняем…" : "Сохранить"}
          </button>
        )}
      </div>
      <AdminConfirm
        open={confirm}
        title={child.tab === "Фото" ? "Удалить фото?" : "Удалить день программы?"}
        text="Запись удалится с сайта. Отменить это нельзя."
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
