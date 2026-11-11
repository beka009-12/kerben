"use client";

import type { MouseEvent } from "react";
import { useI18n } from "@/utils/i18n/I18nProvider";
import { useFavorites } from "@/utils/store/favorites";

export function useFavoriteButton({ slug, title, dark }: { slug: string; title: string; dark: boolean }) {
  const { dict } = useI18n();
  const active = useFavorites((state) => state.slugs.includes(slug));
  const toggle = useFavorites((state) => state.toggle);
  const label = `${active ? dict.card.removeFavorite : dict.card.addFavorite}: ${title}`;

  return {
    active,
    label,
    className: ["favorite-button", dark ? "favorite-button-dark" : "", active ? "favorite-button-active" : ""].filter(Boolean).join(" "),
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      toggle(slug);
    },
  };
}
