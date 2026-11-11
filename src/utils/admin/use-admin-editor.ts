"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { deleteRecord, retranslateTour, saveRecord } from "@/app/[lang]/admin/actions";
import { errorText } from "@/components/admin/admin-result";
import { useAdminToast } from "@/utils/admin/use-admin-toast";
import { toFormValues, type FormValue, type FormValues } from "@/utils/admin/form";
import { RESOURCES, type AdminRecord, type FieldDef, type ResourceDef, type ResourceKey } from "@/utils/admin/resources";

export function useAdminEditor({ def, record, relations, initialTab = 0, defaults, onClose, onCreated }: Pick<{
  def: ResourceDef;
  record: AdminRecord | null;
  relations: Partial<Record<ResourceKey, AdminRecord[] | null>>;
  childRows: Partial<Record<ResourceKey, AdminRecord[] | null>>;
  lang: string;
  initialTab?: number;
  defaults?: FormValues;
  onClose: () => void;
  onCreated?: (record: AdminRecord) => void;
}, "def" | "record" | "relations" | "initialTab" | "defaults" | "onClose" | "onCreated">) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const notify = useAdminToast();
  const [original] = useState<FormValues>(() => ({ ...toFormValues(def, record), ...(record ? {} : defaults) }));
  const [values, setValues] = useState<FormValues>(original);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [expired, setExpired] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [tab, setTab] = useState(initialTab);
  const photos = record ? def.children?.find((c) => c.tab === "Фото") : undefined;
  const extra = record ? (def.children ?? []).filter((c) => c.tab !== "Фото") : [];
  const tabs = ["Основное", ...extra.map((c) => c.tab)];
  const title = record ? String(record[def.titleField] ?? `#${record.id}`) : `Новая запись: ${def.one}`;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function handleFailure(result: Parameters<typeof errorText>[0]) {
    if (result.error === "auth") setExpired(true);
    if (result.fields) setErrors(result.fields);
    if (result.error !== "auth") notify(errorText(result), "error");
  }

  const dirty = JSON.stringify(values) !== JSON.stringify(original);

  function requestClose() {
    if (dirty && !busy && !window.confirm("Есть несохранённые изменения. Закрыть без сохранения?")) return;
    onClose();
  }

  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (tab === 0) event.currentTarget.requestSubmit();
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const result = await saveRecord(def.key, record?.id ?? null, values, record ? original : null);
    setBusy(false);
    if (!result.ok) return handleFailure(result);
    router.refresh();
    if (!record && result.record && def.children?.length && onCreated) {
      notify("Сохранено — теперь добавьте фото");
      onCreated(result.record);
      return;
    }
    notify("Сохранено");
    onClose();
  }

  async function remove() {
    if (!record || busy) return;
    setBusy(true);
    const result = await deleteRecord(def.key, record.id);
    setBusy(false);
    setConfirm(false);
    if (!result.ok) return handleFailure(result);
    notify("Удалено");
    router.refresh();
    onClose();
  }

  async function retranslate() {
    if (!record || busy) return;
    setBusy(true);
    const result = await retranslateTour(record.id);
    setBusy(false);
    if (result.ok) notify("Перевод запущен");
    else handleFailure(result);
  }

  const visible = def.fields.filter((field) => !field.hidden);
  const more = visible.filter((field) => field.more);
  const sections: { title?: string; fields: FieldDef[] }[] = [];
  for (const field of visible.filter((f) => !f.more)) {
    if (field.section || sections.length === 0) sections.push({ title: field.section, fields: [] });
    sections[sections.length - 1].fields.push(field);
  }

  const optionsFor = (key?: ResourceKey) =>
    (key ? (relations[key] ?? []) : []).map((row) => ({ value: String(row.id), label: String(row[RESOURCES[key!].titleField] ?? `#${row.id}`) }));

  const setField = (name: string, value: FormValue) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return { ref, errors, busy, expired, confirm, setConfirm, tab, setTab, tabs, photos, extra, title, dirty, requestClose, onKeyDown, save, remove, retranslate, more, sections, values, setField, optionsFor };
}
