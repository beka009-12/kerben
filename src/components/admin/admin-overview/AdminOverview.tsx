import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon/Icon";
import { adminDateTime } from "@/utils/admin/records";
import { REQUEST_STATUSES, type ResourceKey, type TravelRequest } from "@/utils/admin/resources";
import "./admin-overview.css";

export function AdminOverview({
  lang,
  requests,
  counts,
}: {
  lang: string;
  requests: TravelRequest[] | null;
  counts: { key: ResourceKey; title: string; icon: IconName; count: number | null }[];
}) {
  const base = `/${lang}/admin`;
  const fresh = requests?.filter((r) => r.status === "new").length ?? null;
  const latest = [...(requests ?? [])].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5);

  return (
    <section className="admin-overview">
      <h1 className="admin-overview-title">Обзор</h1>

      <div className="admin-overview-grid">
        <Link href={`${base}/requests`} className="admin-overview-card admin-overview-card-accent">
          <span className="admin-overview-label admin-overview-label-accent">Новые заявки</span>
          <span className="admin-overview-icon admin-overview-icon-accent">
            <Icon name="inbox" size={22} />
          </span>
          <span className="admin-overview-value admin-overview-value-accent">{fresh ?? "—"}</span>
          <span className="admin-overview-go">
            Открыть заявки
            <Icon name="arrowRight" size={16} />
          </span>
        </Link>
        {counts.map((item) => (
          <Link key={item.key} href={`${base}/${item.key}`} className="admin-overview-card">
            <span className="admin-overview-icon">
              <Icon name={item.icon} size={20} />
            </span>
            <span className="admin-overview-label">{item.title}</span>
            <span className="admin-overview-value">{item.count ?? "—"}</span>
          </Link>
        ))}
      </div>

      <div className="admin-overview-panel">
        <div className="admin-overview-panel-head">
          <h2 className="admin-overview-subtitle">Последние заявки</h2>
          <Link href={`${base}/requests`} className="admin-overview-more">
            Все заявки
            <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        {requests === null ? (
          <p className="admin-overview-empty">Бэкенд не отвечает. Обновите страницу через минуту.</p>
        ) : latest.length === 0 ? (
          <p className="admin-overview-empty">Заявок пока нет</p>
        ) : (
          <ul className="admin-overview-list">
            {latest.map((r) => (
              <li key={r.id} className="admin-overview-item">
                <span className="admin-overview-who">
                  <span className="admin-overview-name">{r.name}</span>
                  <span className="admin-overview-what">{r.destination || r.phone}</span>
                </span>
                <span className="admin-overview-when">{adminDateTime.format(new Date(r.created_at))}</span>
                <span className={r.status === "new" ? "admin-overview-status admin-overview-status-new" : "admin-overview-status"}>
                  {REQUEST_STATUSES.find((s) => s.value === r.status)?.label ?? r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
