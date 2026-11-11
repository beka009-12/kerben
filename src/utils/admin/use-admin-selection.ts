"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { deleteRecord, type ActionResult } from "@/app/[lang]/admin/actions";
import { errorText } from "@/components/admin/admin-result";
import { useAdminToast } from "@/utils/admin/use-admin-toast";
import type { ResourceKey } from "@/utils/admin/resources";

const HOLD_MS = 500;
const MOVE_TOLERANCE = 10;
/** Сколько записей удаляем одновременно, чтобы не забить backend */
const BATCH = 4;

/**
 * Выбор нескольких записей и удаление разом: галочки, «Выбрать все»
 * и долгое нажатие на карточку (на телефоне), которое включает режим выбора.
 */
export function useAdminSelection({ resource, onRemoved }: { resource: ResourceKey; onRemoved: (ids: number[]) => void }) {
  const router = useRouter();
  const notify = useAdminToast();
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [mode, setMode] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const hold = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null);
  const held = useRef(false);

  const selecting = mode || selected.size > 0;

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setAll(ids: number[], on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  function clear() {
    setSelected(new Set());
    setMode(false);
  }

  function cancelHold() {
    if (hold.current) clearTimeout(hold.current.timer);
    hold.current = null;
  }

  /** Долгое нажатие на карточку выбирает её и включает режим выбора */
  const holdHandlers = (id: number) => ({
    onPointerDown: (event: PointerEvent) => {
      if (event.button !== 0) return;
      held.current = false;
      cancelHold();
      hold.current = {
        x: event.clientX,
        y: event.clientY,
        timer: setTimeout(() => {
          held.current = true;
          hold.current = null;
          setMode(true);
          setSelected((prev) => new Set(prev).add(id));
          navigator.vibrate?.(15);
        }, HOLD_MS),
      };
    },
    onPointerMove: (event: PointerEvent) => {
      const start = hold.current;
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > MOVE_TOLERANCE) cancelHold();
    },
    onPointerUp: cancelHold,
    onPointerLeave: cancelHold,
    onPointerCancel: cancelHold,
    onContextMenu: (event: MouseEvent) => {
      if (held.current || hold.current) event.preventDefault();
    },
  });

  /** Клик по строке: после долгого нажатия его глотаем, в режиме выбора — переключаем галочку */
  function onRowClick(id: number, open: () => void) {
    if (held.current) {
      held.current = false;
      return;
    }
    if (selecting) toggle(id);
    else open();
  }

  async function removeSelected() {
    if (busy || selected.size === 0) return;
    setBusy(true);
    const ids = [...selected];
    const removed: number[] = [];
    let failure: Extract<ActionResult, { ok: false }> | null = null;
    for (let i = 0; i < ids.length; i += BATCH) {
      const chunk = ids.slice(i, i + BATCH);
      const results = await Promise.all(chunk.map((id) => deleteRecord(resource, id)));
      for (const [index, result] of results.entries()) {
        if (result.ok) removed.push(chunk[index]);
        else failure ??= result;
      }
    }
    setBusy(false);
    setConfirm(false);
    if (removed.length) onRemoved(removed);
    setSelected(new Set(ids.filter((id) => !removed.includes(id))));
    if (failure) notify(`Удалено ${removed.length} из ${ids.length}. ${errorText(failure)}`, "error");
    else {
      notify(`Удалено: ${removed.length}`);
      setMode(false);
    }
    router.refresh();
  }

  return { selected, selecting, setMode, toggle, setAll, clear, holdHandlers, onRowClick, confirm, setConfirm, busy, removeSelected };
}
