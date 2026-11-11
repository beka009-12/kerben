import "./admin-loading.css";

export function AdminLoading() {
  return (
    <section className="admin-loading" aria-busy="true" aria-label="Загрузка">
      <span className="admin-loading-title" />
      <span className="admin-loading-card">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="admin-loading-row" />
        ))}
      </span>
    </section>
  );
}
