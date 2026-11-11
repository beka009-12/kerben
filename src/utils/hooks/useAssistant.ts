"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chatErrorCode, type AssistantErrorCode } from "@/utils/assistant";
import { ChatHttpError, ChatSocket, chatApi, type BookingPreview, type ChatEvent } from "@/utils/ai/backend-chat";

export interface AiConversation {
  id: string;
  title: string;
  updated_at: string;
}

export interface AiMessage {
  key: string;
  role: "user" | "assistant";
  content: string;
}

export interface BookingState {
  preview: BookingPreview;
  /** Номер заявки, если она уже ушла (кнопкой или словами в чате) */
  requestId: string;
}

let localId = 0;
const nextKey = () => `local-${++localId}`;

/** Названия бесед и скрытые беседы живут в браузере: у backend нет ни заголовков, ни удаления */
const TITLES_KEY = "kerben-chat-titles";
const HIDDEN_KEY = "kerben-chat-hidden";

function readStore<T>(key: string, fallback: T): T {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? "null") as T) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

const shortTitle = (text: string) => (text.length > 60 ? `${text.slice(0, 57).trimEnd()}…` : text);

/** Сводку показываем, когда данных хватает или заявка уже ушла — не на каждом шаге консультации */
const worthShowing = (preview: BookingPreview) => preview.can_confirm || preview.complete || preview.status === "submitted" || preview.status === "already_submitted";

/**
 * Чат с AI-ассистентом backend Kerben Travel: беседы и история по HTTP, переписка — по websocket
 * (ответ приходит кусками сразу, без задержки). Обрыв связи — переподключение и перечитывание истории.
 */
export function useAssistant(locale: string) {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<AssistantErrorCode | "load" | null>(null);
  const [booking, setBooking] = useState<BookingState | null>(null);
  const socket = useRef<ChatSocket | null>(null);
  const activeRef = useRef<string | null>(null);
  const ignored = useRef(new Set<string>());
  const stopped = useRef(false);

  const loadConversations = useCallback(async () => {
    try {
      const list = await chatApi<{ session_id: string; created_at: string; stage?: string }[]>("chat/sessions");
      const titles = readStore<Record<string, string>>(TITLES_KEY, {});
      const hidden = new Set(readStore<string[]>(HIDDEN_KEY, []));
      const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      const next = (Array.isArray(list) ? list : [])
        .filter((s) => !hidden.has(s.session_id))
        .map((s) => ({ id: s.session_id, title: titles[s.session_id] || date.format(new Date(s.created_at)), updated_at: s.created_at }));
      setConversations((prev) =>
        prev.length === next.length && prev.every((c, i) => c.id === next[i].id && c.title === next[i].title) ? prev : next,
      );
    } catch {
    }
  }, [locale]);

  useEffect(() => {
    void (async () => {
      await loadConversations();
    })();
  }, [loadConversations]);

  const loadHistory = useCallback(async (id: string) => {
    const rows = await chatApi<{ role: string; content: string; created_at: string }[]>(`chat/history/${id}`);
    if (activeRef.current !== id) return;
    setMessages(
      (Array.isArray(rows) ? rows : [])
        .filter((row) => row.content?.trim())
        .map((row, i) => ({ key: `h-${i}-${row.created_at}`, role: row.role === "user" ? "user" : "assistant", content: row.content })),
    );
  }, []);

  const loadPreview = useCallback(async (id: string) => {
    try {
      const preview = await chatApi<BookingPreview>("booking/preview", { method: "POST", body: { session_id: id } });
      if (activeRef.current === id && worthShowing(preview)) setBooking((prev) => ({ preview, requestId: prev?.requestId ?? "" }));
    } catch {
    }
  }, []);

  const onEvent = useCallback((event: ChatEvent) => {
    switch (event.type) {
      case "typing":
        if (event.status && !stopped.current) {
          setStreaming(true);
          setMessages((prev) => (prev.at(-1)?.role === "assistant" && !prev.at(-1)?.content ? prev : [...prev, { key: nextKey(), role: "assistant", content: "" }]));
        }
        return;
      case "message_start":
        if (stopped.current) {
          ignored.current.add(event.message_id);
          return;
        }
        setMessages((prev) => {
          const last = prev.at(-1);
          if (last?.role === "assistant" && !last.content) return [...prev.slice(0, -1), { ...last, key: event.message_id }];
          return [...prev, { key: event.message_id, role: "assistant", content: "" }];
        });
        return;
      case "message_delta":
        if (ignored.current.has(event.message_id)) return;
        setMessages((prev) =>
          prev.some((m) => m.key === event.message_id)
            ? prev.map((m) => (m.key === event.message_id ? { ...m, content: m.content + event.delta } : m))
            : [...prev, { key: event.message_id, role: "assistant", content: event.delta }],
        );
        return;
      case "message_end":
        stopped.current = false;
        setStreaming(false);
        setMessages((prev) => prev.filter((m) => m.role === "user" || m.content.trim()));
        return;
      case "booking_preview":
        if (worthShowing(event)) setBooking((prev) => ({ preview: event, requestId: prev?.requestId ?? "" }));
        return;
      case "booking_submitted":
        setBooking((prev) => (prev ? { ...prev, requestId: String(event.request_id) } : prev));
        return;
      case "error":
        setStreaming(false);
        setError(chatErrorCode(event.code));
        setMessages((prev) => prev.filter((m) => m.role === "user" || m.content.trim()));
        return;
      default:
    }
  }, []);

  const connect = useCallback(
    (id: string) => {
      socket.current?.close();
      socket.current = new ChatSocket(id, {
        onEvent,
        onReconnect: () => void loadHistory(id).catch(() => {}),
        onFail: (code) => {
          setStreaming(false);
          setError(code);
        },
      });
    },
    [onEvent, loadHistory],
  );

  useEffect(() => () => socket.current?.close(), []);

  const open = useCallback(
    async (id: string | null) => {
      socket.current?.close();
      socket.current = null;
      activeRef.current = id;
      stopped.current = false;
      setActiveId(id);
      setError(null);
      setStreaming(false);
      setBooking(null);
      if (!id) {
        setMessages([]);
        return;
      }
      setMessages([]);
      setLoadingThread(true);
      try {
        await loadHistory(id);
        connect(id);
        void loadPreview(id);
      } catch (loadError) {
        setError(loadError instanceof ChatHttpError && loadError.status === 401 ? "unauthorized" : "load");
      } finally {
        setLoadingThread(false);
      }
    },
    [connect, loadHistory, loadPreview],
  );

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || streaming) return;
      setError(null);
      stopped.current = false;
      setMessages((prev) => [...prev, { key: nextKey(), role: "user", content: message }, { key: nextKey(), role: "assistant", content: "" }]);
      setStreaming(true);
      let id = activeRef.current;
      try {
        if (!id) {
          const created = await chatApi<{ session_id: string }>("chat/session", { method: "POST" });
          id = created.session_id;
          activeRef.current = id;
          setActiveId(id);
          writeStore(TITLES_KEY, { ...readStore<Record<string, string>>(TITLES_KEY, {}), [id]: shortTitle(message) });
          connect(id);
          void loadConversations();
        } else if (!socket.current) {
          connect(id);
        }
        await socket.current?.send(message);
      } catch (sendError) {
        setStreaming(false);
        setMessages((prev) => prev.filter((m) => m.role === "user" || m.content.trim()));
        if (sendError instanceof ChatHttpError) setError(sendError.status === 401 ? "unauthorized" : sendError.status === 429 ? "dailyLimit" : sendError.status === 0 ? "network" : "server");
        else setError("network");
      }
    },
    [streaming, connect, loadConversations],
  );

  /** Остановить ожидание: сервер допишет ответ, но мы его уже не показываем */
  const stop = useCallback(() => {
    stopped.current = true;
    setStreaming(false);
    setMessages((prev) => {
      const last = prev.at(-1);
      if (last?.role === "assistant") ignored.current.add(last.key);
      return prev.filter((m) => m.role === "user" || m.content.trim());
    });
  }, []);

  const hide = useCallback((ids: string[]) => writeStore(HIDDEN_KEY, [...new Set([...readStore<string[]>(HIDDEN_KEY, []), ...ids])]), []);

  const remove = useCallback(
    async (id: string) => {
      hide([id]);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === activeRef.current) await open(null);
    },
    [hide, open],
  );

  const removeAll = useCallback(async () => {
    hide(conversations.map((c) => c.id));
    setConversations([]);
    await open(null);
  }, [conversations, hide, open]);

  return { conversations, activeId, messages, loadingThread, streaming, error, truncated: false, booking, setBooking, open, send, stop, remove, removeAll };
}
