/**
 * Сайт переименован из KyrgyzGo в Kerben Travel: данные, сохранённые в браузере под старыми ключами
 * (заявки, выбранная поездка, отправленные из чата заявки), один раз переносятся под новые ключи.
 */
const RENAMED: [from: string, to: string][] = [
  ["kyrgyzgo-requests", "kerben-requests"],
  ["kyrgyzgo-requests-hidden", "kerben-requests-hidden"],
  ["kyrgyzgo-ai-bookings", "kerben-ai-bookings"],
  ["kyrgyzgo-trip", "kerben-trip"],
  ["kyrgyzgo-chat-trip", "kerben-chat-trip"],
];

export function migrateStorageKeys() {
  try {
    for (const [from, to] of RENAMED) {
      const value = window.localStorage.getItem(from);
      if (value === null) continue;
      if (window.localStorage.getItem(to) === null) window.localStorage.setItem(to, value);
      window.localStorage.removeItem(from);
    }
    // Сессия Supabase больше не используется — вход теперь в backend
    for (const key of Object.keys(window.localStorage)) {
      if (/^sb-.+-auth-token$/.test(key)) window.localStorage.removeItem(key);
    }
  } catch {
  }
}
