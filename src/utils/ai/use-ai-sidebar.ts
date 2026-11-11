"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { AiConversation } from "@/utils/hooks/useAssistant";
import type { AuthUser } from "@/utils/store/auth";

const LONG_PRESS_MS = 450;

type Sheet = { kind: "chat"; id: string; title: string } | { kind: "all" } | null;

export function useAiSidebar({ onDelete, onClear }: Pick<{
  conversations: AiConversation[];
  activeId: string | null;
  user: AuthUser;
  open: boolean;
  labels: {
    newChat: string;
    history: string;
    empty: string;
    deleteChat: string;
    deleteConfirm: string;
    clear: string;
    clearConfirm: string;
    cancel: string;
    logout: string;
    close: string;
  };
  onNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
  onLogout: () => void;
}, "onDelete" | "onClear">) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const timer = useRef<number | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (!sheet) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSheet(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  function cancelPress() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
  }

  function openChatSheet(conversation: AiConversation) {
    cancelPress();
    suppressClick.current = true;
    navigator.vibrate?.(12);
    setSheet({ kind: "chat", id: conversation.id, title: conversation.title || "…" });
  }

  function onPointerDown(event: PointerEvent, conversation: AiConversation) {
    if (event.pointerType === "mouse") return;
    suppressClick.current = false;
    start.current = { x: event.clientX, y: event.clientY };
    timer.current = window.setTimeout(() => openChatSheet(conversation), LONG_PRESS_MS);
  }

  function onPointerMove(event: PointerEvent) {
    if (start.current && Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > 10) cancelPress();
  }

  function confirm() {
    if (sheet?.kind === "chat") onDelete(sheet.id);
    if (sheet?.kind === "all") onClear();
    setSheet(null);
  }

  return { sheet, setSheet, suppressClick, cancelPress, openChatSheet, onPointerDown, onPointerMove, confirm };
}
