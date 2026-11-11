"use client";

import { Icon } from "@/components/ui/icon/Icon";
import { ACCEPT } from "@/utils/admin/upload";
import { useAdminPhoto } from "@/utils/admin/use-admin-photo";
import "./admin-photo.css";

export function AdminPhoto({
  id,
  value,
  invalid,
  describedBy,
  onChange,
}: {
  id: string;
  value: string;
  invalid?: boolean;
  describedBy?: string;
  onChange: (url: string) => void;
}) {
  const { input, busy, error, over, setOver, linkMode, setLinkMode, broken, setBroken, src, upload, onDrop, onPaste, pick } = useAdminPhoto({ value, onChange });

  return (
    <div className="admin-photo" onPaste={onPaste}>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className="admin-photo-file"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          void upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {src && broken !== src ? (
        <div className={busy ? "admin-photo-frame admin-photo-frame-busy" : "admin-photo-frame"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="admin-photo-img" onError={() => setBroken(src)} />
          {busy ? (
            <span className="admin-photo-status" role="status">
              <span className="admin-photo-spinner" aria-hidden="true" />
              Загружаем…
            </span>
          ) : (
            <div className="admin-photo-tools">
              <button type="button" id={id} className="admin-photo-tool" onClick={pick} aria-describedby={describedBy}>
                <Icon name="refresh" size={16} />
                Заменить
              </button>
              <button type="button" className="admin-photo-tool admin-photo-tool-danger" onClick={() => onChange("")} aria-label="Убрать фото">
                <Icon name="trash" size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          id={id}
          className={["admin-photo-drop", over && "admin-photo-drop-over", invalid && "admin-photo-drop-invalid"].filter(Boolean).join(" ")}
          onClick={pick}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          aria-describedby={describedBy}
          disabled={busy}
        >
          <span className="admin-photo-drop-icon" aria-hidden="true">
            <Icon name="image" size={22} />
          </span>
          <span className="admin-photo-drop-title">
            {broken && broken === src ? "Фото по ссылке не открылось — загрузите файл" : "Перетащите фото или нажмите, чтобы выбрать"}
          </span>
          <span className="admin-photo-drop-hint">JPG, PNG, WebP · можно вставить из буфера Ctrl+V</span>
        </button>
      )}

      {error && (
        <p className="admin-photo-error" role="alert">
          {error}
        </p>
      )}

      {linkMode ? (
        <input
          type="url"
          className="admin-photo-link-input"
          placeholder="https://…"
          aria-label="Ссылка на фото"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      ) : (
        <button type="button" className="admin-photo-link" onClick={() => setLinkMode(true)}>
          Вставить ссылку вместо файла
        </button>
      )}
    </div>
  );
}
