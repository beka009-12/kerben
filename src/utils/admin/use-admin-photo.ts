"use client";

import { useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { uploadPhoto, type UploadResult } from "@/app/[lang]/admin/actions";
import { shrink, UPLOAD_ERRORS } from "@/utils/admin/upload";

export function useAdminPhoto({ value, onChange }: Pick<{
  id: string;
  value: string;
  invalid?: boolean;
  describedBy?: string;
  onChange: (url: string) => void;
}, "value" | "onChange">) {
  const input = useRef<HTMLInputElement>(null);
  const [local, setLocal] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [broken, setBroken] = useState<string | null>(null);
  const src = local ?? (/^https?:\/\//i.test(value.trim()) ? value.trim() : "");

  async function upload(file: File | undefined | null) {
    if (!file || busy) return;
    if (!file.type.startsWith("image/")) {
      setError(UPLOAD_ERRORS.type);
      return;
    }
    setError("");
    setBusy(true);
    const preview = URL.createObjectURL(file);
    setLocal(preview);
    const form = new FormData();
    form.set("file", await shrink(file));
    const result = await uploadPhoto(form).catch((): UploadResult => ({ ok: false, error: "network" }));
    setBusy(false);
    setLocal(null);
    URL.revokeObjectURL(preview);
    if (result.ok) onChange(result.url);
    else setError(UPLOAD_ERRORS[result.error]);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setOver(false);
    void upload(event.dataTransfer.files[0]);
  }

  function onPaste(event: ClipboardEvent) {
    const file = [...event.clipboardData.files].find((f) => f.type.startsWith("image/"));
    if (file) {
      event.preventDefault();
      void upload(file);
    }
  }

  const pick = () => input.current?.click();

  return { input, busy, error, over, setOver, linkMode, setLinkMode, broken, setBroken, src, upload, onDrop, onPaste, pick };
}
