"use client";

import { useState } from "react";
import { RESOURCES, type AdminRecord, type ChildDef } from "@/utils/admin/resources";

export function useAdminChildren({
  child,
  parentId,
  rows,
}: {
  child: ChildDef;
  parentId: number;
  rows: AdminRecord[] | null;
}) {
  const def = RESOURCES[child.resource];
  const sortField = def.fields.some((f) => f.name === "day_number") ? "day_number" : "order";
  const sorted = (rows ?? [])
    .filter((row) => Number(row[child.foreignKey]) === parentId)
    .sort((a, b) => Number(a[sortField] ?? 0) - Number(b[sortField] ?? 0));
  const [adding, setAdding] = useState(false);
  const isPhotos = child.tab === "Фото";

  return { def, sorted, adding, setAdding, isPhotos };
}
