import type { ActionResult } from "@/app/[lang]/admin/actions";

export const SESSION_EXPIRED = "Сессия истекла. Войдите снова";
export const BACKEND_DOWN = "Бэкенд не отвечает. Попробуйте ещё раз";

export function errorText(result: Extract<ActionResult, { ok: false }>): string {
  switch (result.error) {
    case "auth":
      return SESSION_EXPIRED;
    case "network":
      return BACKEND_DOWN;
    case "validation":
      return "Проверьте поля формы";
    default:
      return result.message || "Бэкенд отклонил запрос";
  }
}
