"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ClipboardEvent, type DragEvent } from "react";
import { deleteRecord, saveRecord, uploadPhoto, type UploadResult } from "@/app/[lang]/admin/actions";
import { errorText } from "@/components/admin/admin-result";
import { useAdminToast } from "@/utils/admin/use-admin-toast";
import { RESOURCES, type AdminRecord, type ChildDef } from "./resources";
import { readMemory, writeMemory, type GalleryPhoto } from "./photo-memory";
import { shrink, UPLOAD_ERRORS } from "./upload";

const PARALLEL = 3;

export function useAdminGallery({ child, parentId, rows }: { child: ChildDef; parentId: number; rows: AdminRecord[] | null }) {
  const def = RESOURCES[child.resource];
  const router = useRouter();
  const notify = useAdminToast();
  const [over, setOver] = useState(false);
  const [removing, setRemoving] = useState<GalleryPhoto | null>(null);
  const [busyRemove, setBusyRemove] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

  useEffect(() => {
    const fromBackend: GalleryPhoto[] = (rows ?? [])
      .filter((row) => Number(row[child.foreignKey]) === parentId)
      .map((row) => ({ key: `id-${row.id}`, id: row.id, image: String(row.image ?? ""), order: Number(row.order ?? 0), status: "done" }));
    const ids = new Set(fromBackend.map((p) => p.id));
    const remembered = readMemory(def.key, parentId).filter((p) => !ids.has(p.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhotos([...fromBackend, ...remembered].sort((a, b) => a.order - b.order));
  }, [rows, child.foreignKey, parentId, def.key]);

  const update = (key: string, patch: Partial<GalleryPhoto>) =>
    setPhotos((prev) => {
      const next = prev.map((p) => (p.key === key ? { ...p, ...patch } : p));
      writeMemory(def.key, parentId, next);
      return next;
    });

  async function uploadOne(photo: GalleryPhoto) {
    const form = new FormData();
    form.set("file", await shrink(photo.file!));
    const uploaded = await uploadPhoto(form).catch((): UploadResult => ({ ok: false, error: "network" }));
    if (!uploaded.ok) return update(photo.key, { status: "error", error: UPLOAD_ERRORS[uploaded.error] });
    const saved = await saveRecord(def.key, null, { [child.foreignKey]: String(parentId), image: uploaded.url, order: String(photo.order) }, null);
    if (!saved.ok) return update(photo.key, { status: "error", error: errorText(saved), image: uploaded.url });
    URL.revokeObjectURL(photo.image);
    update(photo.key, { status: "done", id: saved.record?.id ?? null, image: uploaded.url, file: undefined, error: undefined });
  }

  async function addFiles(list: FileList | File[]) {
    const files = [...list].filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return notify(UPLOAD_ERRORS.type, "error");
    const start = photos.reduce((max, p) => Math.max(max, p.order), 0) + 1;
    const queued: GalleryPhoto[] = files.map((file, i) => ({
      key: `new-${Date.now()}-${i}`,
      id: null,
      image: URL.createObjectURL(file),
      order: start + i,
      status: "uploading",
      file,
    }));
    setPhotos((prev) => [...prev, ...queued]);
    let next = 0;
    const worker = async () => {
      while (next < queued.length) await uploadOne(queued[next++]);
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, queued.length) }, worker));
    notify(files.length === 1 ? "Фото добавлено" : `Загружено фото: ${files.length}`);
    router.refresh();
  }

  async function retry(photo: GalleryPhoto) {
    if (!photo.file) return;
    update(photo.key, { status: "uploading", error: undefined });
    await uploadOne(photo);
  }

  async function remove() {
    const photo = removing;
    if (!photo) return;
    if (photo.id === null) {
      setPhotos((prev) => prev.filter((p) => p.key !== photo.key));
      setRemoving(null);
      return;
    }
    setBusyRemove(true);
    const result = await deleteRecord(def.key, photo.id);
    setBusyRemove(false);
    setRemoving(null);
    if (!result.ok) return notify(errorText(result), "error");
    setPhotos((prev) => {
      const next = prev.filter((p) => p.key !== photo.key);
      writeMemory(def.key, parentId, next);
      return next;
    });
    notify("Фото удалено");
    router.refresh();
  }

  return {
    photos,
    over,
    removing,
    busyRemove,
    uploading: photos.filter((p) => p.status === "uploading").length,
    setRemoving,
    retry,
    remove,
    addFiles,
    dragOver: (event: DragEvent) => {
      event.preventDefault();
      setOver(true);
    },
    dragLeave: () => setOver(false),
    drop: (event: DragEvent) => {
      event.preventDefault();
      setOver(false);
      void addFiles(event.dataTransfer.files);
    },
    paste: (event: ClipboardEvent) => {
      const files = [...event.clipboardData.files].filter((f) => f.type.startsWith("image/"));
      if (files.length) {
        event.preventDefault();
        void addFiles(files);
      }
    },
  };
}
