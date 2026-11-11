"use client";

import { useRef } from "react";
import type { AdminRecord, ChildDef } from "@/utils/admin/resources";
import { useAdminGallery } from "@/utils/admin/use-admin-gallery";

export function useAdminGalleryView({ child, parentId, rows }: { child: ChildDef; parentId: number; rows: AdminRecord[] | null }) {
  const input = useRef<HTMLInputElement>(null);
  const g = useAdminGallery({ child, parentId, rows });

  return { input, g };
}
