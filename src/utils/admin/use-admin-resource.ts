"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { saveRecord } from "@/app/[lang]/admin/actions";
import { errorText } from "@/components/admin/admin-result";
import { useAdminToast } from "@/utils/admin/use-admin-toast";
import { RESOURCES, type AdminRecord, type ResourceKey } from "@/utils/admin/resources";
import { toFormValues } from "@/utils/admin/form";
import { readHidden, writeHidden } from "@/utils/admin/records";

export function useAdminResource({ resource, rows }: Pick<{
  resource: ResourceKey;
  rows: AdminRecord[];
  relations: Partial<Record<ResourceKey, AdminRecord[] | null>>;
  childRows: Partial<Record<ResourceKey, AdminRecord[] | null>>;
  lang: string;
}, "resource" | "rows">) {
  const def = RESOURCES[resource];
  const router = useRouter();
  const notify = useAdminToast();
  const [active, setActive] = useState<Record<number, boolean>>({});
  const [toggling, setToggling] = useState<number | null>(null);
  const [hidden, setHidden] = useState<AdminRecord[]>([]);

  useEffect(() => {
    const backendIds = new Set(rows.map((row) => row.id));
    const kept = readHidden(resource).filter((record) => !backendIds.has(record.id));
    writeHidden(resource, kept);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(kept);
  }, [resource, rows]);

  function rememberHidden(record: AdminRecord, isHidden: boolean) {
    const rest = readHidden(resource).filter((r) => r.id !== record.id);
    const next = isHidden ? [...rest, { ...record, is_active: false }] : rest;
    writeHidden(resource, next);
    setHidden(next);
  }

  /** Удалённые записи убираем и из списка скрытых, иначе они останутся в таблице */
  function forget(ids: number[]) {
    const next = readHidden(resource).filter((record) => !ids.includes(record.id));
    writeHidden(resource, next);
    setHidden(next);
  }

  async function toggleActive(row: AdminRecord) {
    if (toggling !== null) return;
    const original = toFormValues(def, row);
    const next = !(active[row.id] ?? row.is_active !== false);
    setActive((prev) => ({ ...prev, [row.id]: next }));
    setToggling(row.id);
    const result = await saveRecord(def.key, row.id, { ...original, is_active: next }, original);
    setToggling(null);
    if (result.ok) {
      rememberHidden(row, !next);
      notify(next ? "Показано на сайте" : "Отключено: на сайте не видно");
      router.refresh();
    } else {
      setActive((prev) => ({ ...prev, [row.id]: !next }));
      notify(errorText(result), "error");
    }
  }

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminRecord | null | undefined>(undefined);
  const [editTab, setEditTab] = useState(0);
  const openEditor = (record: AdminRecord | null, tab = 0) => {
    setEditTab(tab);
    setEditing(record);
  };

  const allRows = useMemo(() => {
    const ids = new Set(rows.map((row) => row.id));
    return [...rows, ...hidden.filter((record) => !ids.has(record.id))];
  }, [rows, hidden]);
  const hasOrder = def.fields.some((field) => field.name === "order");
  const [manual, setManual] = useState(false);
  const [order, setOrder] = useState<Record<number, number>>({});
  const [moving, setMoving] = useState(false);
  const orderOf = (row: AdminRecord) => order[row.id] ?? (Number(row.order) || 0);
  const byOrder = (a: AdminRecord, b: AdminRecord) => orderOf(a) - orderOf(b) || a.id - b.id;
  const sorted = useMemo(
    () => [...allRows].sort(hasOrder && manual ? byOrder : (a, b) => b.id - a.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allRows, hasOrder, manual, order],
  );
  const nextOrder = hasOrder ? Math.max(0, ...allRows.map(orderOf)) + 1 : null;

  async function move(row: AdminRecord, direction: -1 | 1) {
    if (moving) return;
    const list = [...allRows].sort(byOrder);
    const from = list.findIndex((item) => item.id === row.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];
    const changes = list.map((item, i) => ({ item, next: i + 1 })).filter(({ item, next }) => orderOf(item) !== next);
    const before = order;
    setOrder((prev) => ({ ...prev, ...Object.fromEntries(changes.map(({ item, next }) => [item.id, next])) }));
    setMoving(true);
    const results = await Promise.all(
      changes.map(({ item, next }) => {
        const original = toFormValues(def, item);
        return saveRecord(def.key, item.id, { ...original, order: String(next) }, original);
      }),
    );
    setMoving(false);
    const failed = results.find((result) => !result.ok);
    if (failed && !failed.ok) {
      setOrder(before);
      notify(errorText(failed), "error");
      return;
    }
    notify("Порядок сохранён");
    router.refresh();
  }
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((row) =>
      [def.titleField, ...def.columns.map((c) => c.field)].some((field) => String(row[field] ?? "").toLowerCase().includes(q)) ||
      (def.subtitle?.(row) ?? "").toLowerCase().includes(q),
    );
  }, [sorted, query, def]);

  return { def, active, query, setQuery, editing, setEditing, editTab, openEditor, allRows, visible, toggling, hidden, toggleActive, forget, hasOrder, manual, setManual, move, moving, nextOrder };
}
