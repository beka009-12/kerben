import { cacheLife, cacheTag } from "next/cache";

const NBKR_DAILY = "https://www.nbkr.kg/XML/daily.xml";

export interface KgsRates {
  usd: number;
  rub: number;
  date: string;
}

function rateOf(xml: string, code: string): number | null {
  const block = new RegExp(`ISOCode="${code}"[\\s\\S]*?<Nominal>(\\d+)</Nominal>[\\s\\S]*?<Value>([\\d,.]+)</Value>`).exec(xml);
  if (!block) return null;
  const nominal = Number(block[1]);
  const value = Number(block[2].replace(",", "."));
  return nominal > 0 && value > 0 ? value / nominal : null;
}

export function parseNbkrRates(xml: string): KgsRates | null {
  const usd = rateOf(xml, "USD");
  const rub = rateOf(xml, "RUB");
  if (!usd || !rub) return null;
  return { usd, rub, date: /Date="([^"]+)"/.exec(xml)?.[1] ?? "" };
}

export async function loadKgsRates(): Promise<KgsRates | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("rates");
  const response = await fetch(NBKR_DAILY, { signal: AbortSignal.timeout(5_000) });
  if (!response.ok) throw new Error(`NBKR ${response.status}`);
  return parseNbkrRates(await response.text());
}

export async function getKgsRates(): Promise<KgsRates | null> {
  try {
    return await loadKgsRates();
  } catch (error) {
    console.warn("[rates] NBKR unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

export function convertUsd(usd: number, rates: KgsRates): { kgs: number; rub: number } {
  const kgs = usd * rates.usd;
  return { kgs: Math.round(kgs / 10) * 10, rub: Math.round(kgs / rates.rub / 10) * 10 };
}
