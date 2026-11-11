"use client";

import { useEffect, useMemo, useState } from "react";
import { tripBooking, tripSummary } from "./trip-steps";
import { pickedList, useChatTrip, useTrip, type PickKind, type TripPick } from "./trip-store";

function useBothReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const check = () => {
      if (!done && useTrip.persist.hasHydrated() && useChatTrip.persist.hasHydrated()) {
        done = true;
        setReady(true);
      }
    };
    const offTrip = useTrip.persist.onFinishHydration(check);
    const offChat = useChatTrip.persist.onFinishHydration(check);
    void Promise.all([useTrip.persist.rehydrate(), useChatTrip.persist.rehydrate()]).then(check);
    return () => {
      offTrip();
      offChat();
    };
  }, []);

  return ready;
}

export function tripMessage(text: string, picked: TripPick[], kindLabels: Record<PickKind, string>, prompt: string): string {
  const lines = picked.map((pick) => `${kindLabels[pick.kind]}: ${pick.title}`);
  const photos = picked
    .filter((pick) => pick.image && /^(https:\/\/|\/(?!\/))/.test(pick.image))
    .map((pick) => `![${kindLabels[pick.kind]}](${pick.image})`);
  return [text.trim() || prompt, lines.join("\n"), photos.join(" ")].filter(Boolean).join("\n\n");
}

export function useTripChat(kindLabels: Record<PickKind, string>) {
  const ready = useBothReady();
  const fromPages = useTrip((state) => state.picks);
  const picks = useChatTrip((state) => state.picks);
  const sent = useChatTrip((state) => state.sent);

  const labelsKey = JSON.stringify(kindLabels);
  const booking = useMemo(() => tripBooking(picks, JSON.parse(labelsKey) as Record<PickKind, string>), [picks, labelsKey]);

  useEffect(() => {
    if (!ready || Object.keys(fromPages).length === 0) return;
    useChatTrip.getState().take(fromPages);
    useTrip.getState().clear();
  }, [ready, fromPages]);

  if (!ready) return { picked: [], booking: null, summary: "", remove: () => {}, markSent: () => {} };
  return {
    picked: sent ? [] : pickedList(picks),
    booking,
    summary: tripSummary(picks, kindLabels),
    remove: (kind: PickKind) => useChatTrip.getState().remove(kind),
    markSent: () => useChatTrip.getState().markSent(),
  };
}
