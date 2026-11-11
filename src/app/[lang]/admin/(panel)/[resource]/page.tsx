import { notFound, redirect } from "next/navigation";
import { AdminResource } from "@/components/admin/admin-resource/AdminResource";
import { AdminUnavailable } from "@/components/admin/admin-unavailable/AdminUnavailable";
import { AdminAuthError, listRecords } from "@/utils/admin/api";
import { getResource, RESOURCES, type AdminRecord, type ResourceKey } from "@/utils/admin/resources";
import { ADMIN_EXPIRED, requireAdmin } from "@/utils/admin/session";

export default async function AdminResourcePage({ params }: PageProps<"/[lang]/admin/[resource]">) {
  const { lang, resource } = await params;
  const def = getResource(resource);
  if (!def) notFound();
  const { token } = await requireAdmin();

  const relationKeys = [...new Set(def.fields.flatMap((f) => (f.relation ? [f.relation] : [])))];
  const childKeys = (def.children ?? []).map((c) => c.resource);
  const load = async (keys: ResourceKey[]) =>
    Object.fromEntries(
      await Promise.all(keys.map(async (key) => [key, await listRecords(token, RESOURCES[key]).catch(() => null)] as const)),
    ) as Partial<Record<ResourceKey, AdminRecord[] | null>>;

  const [rows, relations, childRows] = await Promise.all([
    listRecords(token, def).catch((error: unknown) => {
      if (error instanceof AdminAuthError) redirect(ADMIN_EXPIRED);
      return null;
    }),
    load(relationKeys),
    load(childKeys),
  ]);
  if (!rows) return <AdminUnavailable title={def.title} />;
  return <AdminResource resource={def.key} rows={rows} relations={relations} childRows={childRows} lang={lang} />;
}
