"use client";

import { useRouter } from "next/navigation";
import { startTransition, useOptimistic, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";

const DRAG_THRESHOLD = 6;
/** padding-inline у .mobile-nav-bar: пилюля и вкладки начинаются с этого отступа */
const BAR_INSET = 2;

interface NavDragItem {
  href: string;
}

interface DragSession {
  pointerId: number;
  startX: number;
  dragging: boolean;
}

export interface NavSlot {
  offset: number;
  index: number;
}

/** Куда встаёт пилюля под пальцем: центр под пальцем, но не за краями панели */
export function navSlotAt(clientX: number, left: number, width: number, count: number): NavSlot {
  const inner = width - BAR_INSET * 2;
  const slot = inner / count;
  const x = clientX - left - BAR_INSET;
  return {
    offset: Math.min(Math.max(x - slot / 2, 0), inner - slot),
    index: Math.min(Math.max(Math.floor(x / slot), 0), count - 1),
  };
}

export function useNavDrag(items: NavDragItem[], activeIndex: number) {
  const router = useRouter();
  const barRef = useRef<HTMLDivElement>(null);
  const session = useRef<DragSession | null>(null);
  const suppressClick = useRef(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useOptimistic(activeIndex);

  const slotAt = (clientX: number): NavSlot | null => {
    const bar = barRef.current;
    if (!bar) return null;
    const rect = bar.getBoundingClientRect();
    return navSlotAt(clientX, rect.left, rect.width, items.length);
  };

  const reset = () => {
    session.current = null;
    barRef.current?.style.removeProperty("--pill-x");
    setDragIndex(null);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    suppressClick.current = false;
    session.current = { pointerId: event.pointerId, startX: event.clientX, dragging: false };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = session.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (!current.dragging) {
      if (Math.abs(event.clientX - current.startX) < DRAG_THRESHOLD) return;
      current.dragging = true;
      // Захват только после порога, иначе обычный тап перестанет доходить до ссылки
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const slot = slotAt(event.clientX);
    if (!slot) return;
    event.currentTarget.style.setProperty("--pill-x", `${slot.offset}px`);
    setDragIndex(slot.index);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = session.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const slot = current.dragging ? slotAt(event.clientX) : null;
    reset();
    if (!slot) return;
    suppressClick.current = true;
    const target = items[slot.index];
    if (!target || slot.index === activeIndex) return;
    startTransition(() => {
      setSelectedIndex(slot.index);
      router.push(target.href);
    });
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  // Долгое нажатие на ссылку в Android открывает меню ссылки и обрывает жест
  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => event.preventDefault();

  return {
    barRef,
    dragging: dragIndex !== null,
    highlightIndex: dragIndex ?? selectedIndex,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: reset, onClickCapture, onContextMenu },
  };
}
