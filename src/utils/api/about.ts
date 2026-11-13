import { cacheLife, cacheTag } from "next/cache";
import { backendFetch } from "./backend";
import { RETRY_SOON, errorText } from "./cache-fallback";

interface BackendAbout {
  id: number;
  experience_years: number;
  travelers_count: number;
  branches_count: number;
  destinations_count: number;
  routes_count: number;
  is_active: boolean;
}

export type CompanyStats = [experience: number, travelers: number, branches: number, destinations: number, routes: number];

export async function getCompanyStats(): Promise<CompanyStats | null> {
  try {
    return await loadCompanyStats();
  } catch (error) {
    console.warn("[about] backend unavailable — using default stats:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function loadCompanyStats(): Promise<CompanyStats | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("about");

  let list: BackendAbout[];
  try {
    list = await backendFetch<BackendAbout[]>("/abouts/");
  } catch (error) {
    // Ошибка внутри "use cache" валит сборку — короткий кеш и цифры по умолчанию
    console.warn("[about] backend unavailable — using default stats:", errorText(error));
    cacheLife(RETRY_SOON);
    return null;
  }
  const about = (Array.isArray(list) ? list : []).find((item) => item.is_active !== false);
  if (!about) return null;
  return [about.experience_years, about.travelers_count, about.branches_count, about.destinations_count, about.routes_count];
}
