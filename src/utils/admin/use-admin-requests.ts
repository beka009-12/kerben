"use client";

import { useId, useMemo, useState } from "react";
import { setRequestStatus } from "@/app/[lang]/admin/actions";
import { errorText } from "@/components/admin/admin-result";
import { useAdminToast } from "@/utils/admin/use-admin-toast";
import { PICKABLE_STATUSES, type RequestStatus, type TravelRequest } from "@/utils/admin/resources";
import { digits, inPeriod, compare, type CatalogItem, type Period, type Sort } from "@/utils/admin/requests-view";

export function useAdminRequests({ requests }: Pick<{ requests: TravelRequest[]; catalog?: CatalogItem[] }, "requests">) {
  const notify = useAdminToast();
  const uid = useId();
  const [statuses, setStatuses] = useState<Record<number, RequestStatus>>({});
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return requests
      .map((r) => ({ ...r, status: statuses[r.id] ?? r.status }))
      .filter((r) => inPeriod(r.created_at, period, from, to))
      .filter(
        (r) =>
          !q ||
          [r.name, r.destination ?? "", r.email ?? "", r.message ?? ""].some((v) => v.toLowerCase().includes(q)) ||
          (qDigits.length >= 3 && digits(r.phone).includes(qDigits)),
      )
      .sort(compare(sort));
  }, [requests, statuses, query, period, from, to, sort]);
  const visible = filter === "all" ? list : list.filter((r) => r.status === filter);
  const count = (status: RequestStatus) => list.filter((r) => r.status === status).length;
  const filtered = query.trim() !== "" || period !== "all" || sort !== "newest";

  function reset() {
    setQuery("");
    setPeriod("all");
    setFrom("");
    setTo("");
    setSort("newest");
  }

  async function change(request: TravelRequest, next: RequestStatus) {
    const previous = request.status;
    setStatuses((prev) => ({ ...prev, [request.id]: next }));
    const result = await setRequestStatus(request.id, next);
    if (result.ok) notify("Статус изменён");
    else {
      setStatuses((prev) => ({ ...prev, [request.id]: previous }));
      notify(errorText(result), "error");
    }
  }

  const tabs: { value: RequestStatus | "all"; label: string; count: number }[] = [
    { value: "all", label: "Все", count: list.length },
    ...PICKABLE_STATUSES.map((s) => ({ value: s.value, label: s.label, count: count(s.value) })),
  ];

  return { uid, filter, setFilter, openId, toggle, query, setQuery, period, setPeriod, from, setFrom, to, setTo, sort, setSort, visible, count, filtered, reset, change, tabs };
}
