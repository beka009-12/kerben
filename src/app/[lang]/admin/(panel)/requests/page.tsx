import { redirect } from "next/navigation";
import { AdminRequests } from "@/components/admin/admin-requests/AdminRequests";
import type { CatalogItem } from "@/utils/admin/requests-view";
import { AdminUnavailable } from "@/components/admin/admin-unavailable/AdminUnavailable";
import { AdminAuthError, listRecords } from "@/utils/admin/api";
import { loadAllRequests } from "@/utils/admin/requests-source";
import { RESOURCES, type ResourceKey } from "@/utils/admin/resources";
import { ADMIN_EXPIRED, requireAdmin } from "@/utils/admin/session";
import { backendImage } from "@/utils/api/backend";

const ORDERABLE: ResourceKey[] = ["tours", "hotels", "transports", "helicopters", "trekkings"];

async function loadCatalog(token: string): Promise<CatalogItem[]> {
  const lists = await Promise.all(
    ORDERABLE.map(async (key) => {
      const def = RESOURCES[key];
      const rows = await listRecords(token, def).catch(() => []);
      return rows.map((row) => ({
        title: String(row[def.titleField] ?? ""),
        image: def.imageField ? backendImage(String(row[def.imageField] ?? "")) : null,
        kind: def.title,
      }));
    }),
  );
  return lists.flat();
}

export default async function AdminRequestsPage() {
  const { token } = await requireAdmin();
  const [requests, catalog] = await Promise.all([
    loadAllRequests(token).catch((error: unknown) => {
      if (error instanceof AdminAuthError) redirect(ADMIN_EXPIRED);
      return null;
    }),
    loadCatalog(token),
  ]);
  if (!requests) return <AdminUnavailable title="Заявки" />;
  return <AdminRequests requests={Array.isArray(requests) ? requests : []} catalog={catalog} />;
}
