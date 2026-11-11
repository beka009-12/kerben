import { useEffect } from "react";
import { create } from "zustand";

interface HeaderState {
  solidRequests: number;
  overDark: boolean;
  adminShell: number;
}

export const useHeaderStore = create<HeaderState>(() => ({ solidRequests: 0, overDark: false, adminShell: 0 }));

export function useSolidHeader() {
  useEffect(() => {
    useHeaderStore.setState((state) => ({ solidRequests: state.solidRequests + 1 }));
    return () => useHeaderStore.setState((state) => ({ solidRequests: state.solidRequests - 1 }));
  }, []);
}

export function useAdminChrome() {
  useEffect(() => {
    useHeaderStore.setState((state) => ({ adminShell: state.adminShell + 1 }));
    return () => useHeaderStore.setState((state) => ({ adminShell: state.adminShell - 1 }));
  }, []);
}

const HERO_SECTIONS = new Set(["tours", "destinations", "hotels", "about", "contact", "saved", "trekking", "transport", "helicopter", "requests", "faq", "trips"]);

export function hasHeroImage(pathname: string, base: string): boolean {
  const segments = pathname.slice(base.length).split("/").filter(Boolean);
  if (segments.length === 0) return true;
  if (segments.length === 1) return HERO_SECTIONS.has(segments[0]);
  return segments.length === 2 && (segments[0] === "tours" || segments[0] === "trekking" || segments[0] === "helicopter");
}
