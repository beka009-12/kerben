import type { UploadResult } from "@/app/[lang]/admin/actions";

export const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

export const UPLOAD_ERRORS: Record<Exclude<UploadResult, { ok: true }>["error"], string> = {
  auth: "Сессия истекла — войдите заново и повторите",
  type: "Нужен файл JPG, PNG, WebP, AVIF или GIF",
  size: "Фото слишком большое — выберите поменьше",
  network: "Не удалось загрузить фото. Попробуйте ещё раз",
};

export { shrink } from "@/utils/images/shrink";
