const SENT_KEY = "kerben-ai-bookings";

export function readSent(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function markSent(key: string, id: string) {
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify({ ...readSent(), [key]: id }));
  } catch {
    return;
  }
}
