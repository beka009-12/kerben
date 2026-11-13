"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { localeNames } from "@/utils/i18n/config";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { cancelRequest, hideRequest, loadRequests, REQUESTS_CHANGED, type MyRequest, type RequestKind } from "@/utils/requests";
import type { RequestUpdate } from "@/utils/requests/use-request-updates";
import { REQUEST_KIND_ICONS } from "./request-icons";
import { useAuth } from "@/utils/store/auth";

type State = { phase: "loading" } | { phase: "error" } | { phase: "ready"; items: MyRequest[]; signedIn: boolean };

export function useRequestsList() {
  const { locale, dict } = useI18n();
  const t = dict.requests;
  const authStatus = useAuth((state) => state.status);
  const [state, setState] = useState<State>({ phase: "loading" });
  const [filter, setFilter] = useState<RequestKind | "all">("all");
  const [cancel, setCancel] = useState<{ id: string; phase: "confirm" | "sending" | "error" } | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;
    let cancelled = false;
    loadRequests()
      .then((result) => !cancelled && setState({ phase: "ready", ...result }))
      .catch(() => !cancelled && setState({ phase: "error" }));
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  useEffect(() => {
    const onChange = (event: Event) => {
      const update = (event as CustomEvent<RequestUpdate | undefined>).detail;
      if (!update) return;
      setState((prev) =>
        prev.phase === "ready" && prev.items.some((r) => r.id === update.id && r.status !== update.status)
          ? { ...prev, items: prev.items.map((r) => (r.id === update.id ? { ...r, status: update.status } : r)) }
          : prev,
      );
    };
    window.addEventListener(REQUESTS_CHANGED, onChange);
    return () => window.removeEventListener(REQUESTS_CHANGED, onChange);
  }, []);

  async function confirmCancel(item: MyRequest) {
    if (state.phase !== "ready") return;
    const status = item.status;
    const setStatus = (next: MyRequest["status"]) =>
      setState((prev) => (prev.phase === "ready" ? { ...prev, items: prev.items.map((r) => (r.id === item.id ? { ...r, status: next } : r)) } : prev));
    setStatus("cancelled");
    setCancel(null);
    try {
      await cancelRequest(item);
    } catch {
      setStatus(status);
      setCancel({ id: item.id, phase: "error" });
    }
  }

  async function hide(id: string) {
    if (state.phase !== "ready") return;
    const previous = state;
    setState({ ...state, items: state.items.filter((item) => item.id !== id) });
    try {
      await hideRequest(id);
    } catch {
      setState(previous);
    }
  }

  const formatter = useMemo(
    () => new Intl.DateTimeFormat(localeNames[locale].intl, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }),
    [locale],
  );
  const date = (iso: string) => formatter.format(new Date(iso));

  const items = state.phase === "ready" ? state.items : [];
  const kinds = (Object.keys(REQUEST_KIND_ICONS) as RequestKind[]).filter((kind) => items.some((item) => item.kind === kind));
  const current = filter !== "all" && kinds.includes(filter) ? filter : "all";
  const visible = current === "all" ? items : items.filter((item) => item.kind === current);

  const tabs = (["all", ...kinds] as const).map((kind) => ({
    kind,
    count: kind === "all" ? items.length : items.filter((item) => item.kind === kind).length,
    active: current === kind,
  }));
  const pickTab = (kind: RequestKind | "all", event: MouseEvent<HTMLButtonElement>) => {
    setFilter(kind);
    event.currentTarget.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  };

  return { locale, dict, t, state, filter, setFilter, cancel, setCancel, confirmCancel, hide, date, kinds, current, visible, tabs, pickTab };
}
