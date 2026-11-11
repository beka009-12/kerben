"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteRecord, saveRecord } from "@/app/[lang]/admin/actions";
import { errorText } from "@/components/admin/admin-result";
import { toFormValues, type FormValue, type FormValues } from "@/utils/admin/form";
import { RESOURCES, type AdminRecord, type ChildDef } from "@/utils/admin/resources";
import { useAdminToast } from "@/utils/admin/use-admin-toast";

export function useAdminChildItem({
  child,
  parentId,
  record,
  onDone,
}: {
  child: ChildDef;
  parentId: number;
  record: AdminRecord | null;
  onDone?: () => void;
}) {
  const def = RESOURCES[child.resource];
  const router = useRouter();
  const notify = useAdminToast();
  const [original] = useState<FormValues>(() => ({ ...toFormValues(def, record), [child.foreignKey]: String(parentId) }));
  const [values, setValues] = useState<FormValues>(original);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const dirty = record === null || JSON.stringify(values) !== JSON.stringify(original);
  const fields = def.fields.filter((field) => !field.hidden);

  function setField(name: string, value: FormValue) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function save() {
    setBusy(true);
    const result = await saveRecord(def.key, record?.id ?? null, values, record ? original : null);
    setBusy(false);
    if (result.ok) {
      notify("Сохранено");
      onDone?.();
      router.refresh();
      return;
    }
    setErrors(result.fields ?? {});
    notify(errorText(result), "error");
  }

  async function remove() {
    if (!record) return;
    setBusy(true);
    const result = await deleteRecord(def.key, record.id);
    setBusy(false);
    setConfirm(false);
    if (result.ok) {
      notify("Удалено");
      router.refresh();
    } else notify(errorText(result), "error");
  }

  return { def, fields, values, errors, busy, confirm, setConfirm, dirty, setField, save, remove };
}
