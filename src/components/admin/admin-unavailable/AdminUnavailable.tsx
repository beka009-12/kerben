import { Icon } from "@/components/ui/icon/Icon";
import "./admin-unavailable.css";

export function AdminUnavailable({ title }: { title: string }) {
  return (
    <section className="admin-unavailable" role="alert">
      <Icon name="refresh" size={28} />
      <h1 className="admin-unavailable-title">{title}: бэкенд не отвечает</h1>
      <p className="admin-unavailable-text">Обновите страницу через минуту. Данные на сайте при этом не пропадают.</p>
    </section>
  );
}
