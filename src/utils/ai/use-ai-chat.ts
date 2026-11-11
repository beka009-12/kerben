"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type UIEvent } from "react";
import { useAppHeight } from "@/utils/hooks/useAppHeight";
import { tripMessage, useTripChat } from "@/utils/trip/use-trip-chat";
import { useAssistant } from "@/utils/hooks/useAssistant";
import { useI18n } from "@/utils/i18n/I18nProvider";

export function useAiChat() {
  const { locale, dict } = useI18n();
  const t = dict.ai;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const kinds = { tour: dict.tour.tripStepTour, hotel: dict.tour.tripStepHotel, car: dict.tour.tripStepCar, helicopter: dict.nav.helicopter, trekking: dict.nav.trekking };
  const trip = useTripChat(kinds);
  const booking = trip.booking;
  const { conversations, activeId, messages, loadingThread, streaming, error, truncated, booking: confirm, setBooking, open, send, stop, remove, removeAll } =
    useAssistant(locale);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [ask] = useState(() => params.get("ask") ?? "");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const openedFromUrl = useRef(false);
  useAppHeight(rootRef);

  useEffect(() => {
    if (openedFromUrl.current) return;
    openedFromUrl.current = true;
    const id = params.get("c");
    if (id) void open(id);
  }, [open, params]);

  useEffect(() => {
    if (activeId && params.get("c") !== activeId) router.replace(`${pathname}?c=${activeId}`, { scroll: false });
  }, [activeId, params, pathname, router]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stick.current) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function openThread(id: string | null) {
    stick.current = true;
    setAtBottom(true);
    void open(id);
  }

  function startNew() {
    openThread(null);
    router.replace(pathname, { scroll: false });
    setSidebarOpen(false);
  }

  function sendMessage(text: string) {
    stick.current = true;
    setAtBottom(true);
    if (trip.picked.length > 0) {
      void send(tripMessage(text, trip.picked, kinds, dict.trip.chatStartPrompt));
      trip.markSent();
      return;
    }
    void send(text);
  }

  function scrollToBottom() {
    const list = listRef.current;
    if (!list) return;
    stick.current = true;
    setAtBottom(true);
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }

  const empty = messages.length === 0 && !loadingThread;

  function onListScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setAtBottom(stick.current);
  }

  return { locale, dict, t, kinds, trip, booking, confirm, setBooking, conversations, activeId, messages, streaming, error, truncated, open, remove, removeAll, sidebarOpen, setSidebarOpen, atBottom, rootRef, listRef, openThread, startNew, sendMessage, scrollToBottom, empty, send, stop, ask , onListScroll };
}
