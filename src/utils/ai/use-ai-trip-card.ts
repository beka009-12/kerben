"use client";

import { useId, useState } from "react";

export function useAiTripCard() {
  const [open, setOpen] = useState(false);
  const listId = useId();
  return { open, listId, toggle: () => setOpen((value) => !value) };
}
