export const PHONE_CODES = [
  { code: "+996", label: "🇰🇬 +996" },
  { code: "+7", label: "🇰🇿🇷🇺 +7" },
  { code: "+998", label: "🇺🇿 +998" },
  { code: "+992", label: "🇹🇯 +992" },
  { code: "+993", label: "🇹🇲 +993" },
  { code: "+86", label: "🇨🇳 +86" },
  { code: "+90", label: "🇹🇷 +90" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+1", label: "🇺🇸 +1" },
];

const LONGEST_FIRST = [...PHONE_CODES].sort((a, b) => b.code.length - a.code.length);

export function splitPhone(value: string): { code: string; number: string } {
  const v = value.trim();
  const match = LONGEST_FIRST.find((item) => v.startsWith(item.code));
  if (match) return { code: match.code, number: v.slice(match.code.length).trim() };
  return { code: PHONE_CODES[0].code, number: v.replace(/^\+/, "") };
}

export function joinPhone(code: string, number: string): string {
  const n = number.trim();
  return n ? `${code} ${n}` : "";
}

export const CITIES = ["Бишкек", "Ош", "Каракол", "Чолпон-Ата", "Нарын", "Талас", "Джалал-Абад", "Баткен", "Токмок", "Кант", "Балыкчы", "Кара-Балта"];
