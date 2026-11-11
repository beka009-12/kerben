import { AdminOverview } from "@/components/admin/admin-overview/AdminOverview";
import { listRecords } from "@/utils/admin/api";
import { loadAllRequests } from "@/utils/admin/requests-source";
import { RESOURCES, type ResourceKey } from "@/utils/admin/resources";
import { requireAdmin } from "@/utils/admin/session";

const SECTIONS: ResourceKey[] = ["tours", "hotels", "transports", "helicopters", "trekkings", "faqs"];

export default async function AdminHomePage({ params }: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  const { token } = await requireAdmin();
  const [requests, ...counts] = await Promise.all([
    loadAllRequests(token).catch(() => null),
    ...SECTIONS.map((key) =>
      listRecords(token, RESOURCES[key])
        .then((rows) => rows.length)
        .catch(() => null),
    ),
  ]);
  return (
    <AdminOverview
      lang={lang}
      requests={Array.isArray(requests) ? requests : null}
      counts={SECTIONS.map((key, i) => ({ key, title: RESOURCES[key].title, icon: RESOURCES[key].icon, count: counts[i] }))}
    />
  );
}
