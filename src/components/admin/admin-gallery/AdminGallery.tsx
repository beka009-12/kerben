"use client";

import { AdminConfirm } from "@/components/admin/admin-confirm/AdminConfirm";
import { Icon } from "@/components/ui/icon/Icon";
import type { AdminRecord, ChildDef } from "@/utils/admin/resources";
import { ACCEPT } from "@/utils/admin/upload";
import { useAdminGalleryView } from "@/utils/admin/use-admin-gallery-view";
import "./admin-gallery.css";

export function AdminGallery({ child, parentId, rows }: { child: ChildDef; parentId: number; rows: AdminRecord[] | null }) {
  const { input, g } = useAdminGalleryView({ child, parentId, rows });

  return (
    <div className="admin-gallery" onPaste={g.paste}>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple
        className="admin-gallery-file"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          if (e.target.files?.length) void g.addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        className={g.over ? "admin-gallery-drop admin-gallery-drop-over" : "admin-gallery-drop"}
        onClick={() => input.current?.click()}
        onDragOver={g.dragOver}
        onDragLeave={g.dragLeave}
        onDrop={g.drop}
      >
        <span className="admin-gallery-drop-icon" aria-hidden="true">
          <Icon name="image" size={24} />
        </span>
        <span className="admin-gallery-drop-title">Добавить фото — можно сразу много</span>
        <span className="admin-gallery-drop-hint">Перетащите файлы, выберите с компьютера или телефона, или вставьте Ctrl+V · без ограничений</span>
      </button>

      <div className="admin-gallery-bar">
        <span className="admin-gallery-count">
          {g.photos.length ? `Фото: ${g.photos.length}` : "Фото пока нет"}
          {g.uploading > 0 && ` · загружаем ${g.uploading}…`}
        </span>
        {rows === null && <span className="admin-gallery-note">Показаны фото, добавленные в этом браузере</span>}
      </div>

      {g.photos.length > 0 && (
        <ul className="admin-gallery-grid">
          {g.photos.map((photo, i) => (
            <li key={photo.key} className={photo.status === "error" ? "admin-gallery-item admin-gallery-item-error" : "admin-gallery-item"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.image} alt="" className="admin-gallery-img" loading="lazy" />
              <span className="admin-gallery-index">{i + 1}</span>
              {photo.status === "uploading" && (
                <span className="admin-gallery-overlay" role="status">
                  <span className="admin-gallery-spinner" aria-hidden="true" />
                </span>
              )}
              {photo.status === "error" && (
                <span className="admin-gallery-overlay admin-gallery-overlay-error" role="alert">
                  <span className="admin-gallery-error-text">{photo.error}</span>
                  {photo.file && (
                    <button type="button" className="admin-gallery-retry" onClick={() => void g.retry(photo)}>
                      <Icon name="refresh" size={14} />
                      Повторить
                    </button>
                  )}
                </span>
              )}
              {photo.status !== "uploading" && (
                <button type="button" className="admin-gallery-remove" onClick={() => g.setRemoving(photo)} aria-label={`Удалить фото ${i + 1}`}>
                  <Icon name="trash" size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <AdminConfirm
        open={g.removing !== null}
        title="Удалить фото?"
        text="Фото пропадёт с сайта. Отменить это нельзя."
        busy={g.busyRemove}
        onConfirm={() => void g.remove()}
        onCancel={() => g.setRemoving(null)}
      />
    </div>
  );
}
