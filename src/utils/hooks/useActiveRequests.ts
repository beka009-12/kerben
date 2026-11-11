"use client";

import { useEffect, useState } from "react";
import { countActiveRequests, REQUESTS_CHANGED } from "@/utils/requests";
import { useAuth } from "@/utils/store/auth";

export function useActiveRequests(): number {
  const [count, setCount] = useState(0);
  const authStatus = useAuth((state) => state.status);

  useEffect(() => {
    if (authStatus === "loading") return;
    let alive = true;
    const refresh = () => void countActiveRequests().then((n) => alive && setCount(n));
    refresh();
    window.addEventListener(REQUESTS_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      alive = false;
      window.removeEventListener(REQUESTS_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [authStatus]);

  return count;
}
