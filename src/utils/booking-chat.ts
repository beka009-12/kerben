export interface BookingContext {
  slug: string;
  title: string;
  id: number | null;
  price: number;
  unit: string | null;
  image: string | null;
  rental: boolean;
}

export interface BookingDraft {
  title: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  endDate: string;
  guests: number | null;
  message: string;
}

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const isoDate = (value: unknown) => {
  const v = str(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
};

const BLOCK_START = "```booking";

export function splitBookingBlock(text: string): { text: string; draft: BookingDraft | null; pending: boolean } {
  const start = text.indexOf(BLOCK_START);
  if (start === -1) return { text, draft: null, pending: false };
  const body = text.slice(start + BLOCK_START.length);
  const end = body.indexOf("```");
  const before = text.slice(0, start).trimEnd();
  if (end === -1) return { text: before, draft: null, pending: true };
  const after = body.slice(end + 3).trim();
  return { text: [before, after].filter(Boolean).join("\n\n"), draft: parseDraft(body.slice(0, end)), pending: false };
}

const EMPTY_WORDS = /^(empty|none|null|n\/a|-|—|нет)$/i;

export function parseDraft(json: string): BookingDraft | null {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const raw = Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, typeof v === "string" && EMPTY_WORDS.test(v.trim()) ? "" : v]),
    );
    const guests = typeof raw.guests === "number" ? raw.guests : Number.parseInt(String(raw.guests ?? ""), 10);
    const draft: BookingDraft = {
      title: str(raw.title, 200),
      name: str(raw.name, 80),
      phone: str(raw.phone, 30),
      email: str(raw.email, 120),
      date: isoDate(raw.date),
      endDate: isoDate(raw.endDate),
      guests: Number.isInteger(guests) && guests > 0 ? guests : null,
      message: str(raw.message, 1000),
    };
    return draft.name || draft.phone || draft.title ? draft : null;
  } catch {
    return null;
  }
}

export function draftKey(draft: BookingDraft): string {
  const text = JSON.stringify(draft);
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return `b${(hash >>> 0).toString(36)}`;
}
