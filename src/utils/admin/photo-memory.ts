export interface GalleryPhoto {
  key: string;
  id: number | null;
  image: string;
  order: number;
  status: "done" | "uploading" | "error";
  error?: string;
  file?: File;
}

const memoryKey = (resource: string, parentId: number) => `kg-admin-photos-${resource}-${parentId}`;

export function readMemory(resource: string, parentId: number): GalleryPhoto[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(memoryKey(resource, parentId)) ?? "[]");
    return Array.isArray(parsed) ? (parsed as GalleryPhoto[]).map((p) => ({ ...p, status: "done" as const })) : [];
  } catch {
    return [];
  }
}

export function writeMemory(resource: string, parentId: number, photos: GalleryPhoto[]) {
  try {
    const saved = photos.filter((p) => p.status === "done" && p.id !== null).map(({ key, id, image, order }) => ({ key, id, image, order }));
    if (saved.length) localStorage.setItem(memoryKey(resource, parentId), JSON.stringify(saved));
    else localStorage.removeItem(memoryKey(resource, parentId));
  } catch {
    return;
  }
}
