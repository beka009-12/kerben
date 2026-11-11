"use client";

import { Icon } from "@/components/ui/icon/Icon";
import { useFavoriteButton } from "@/utils/saved/use-favorite-button";
import "./favorite-button.css";

export function FavoriteButton({ slug, title, dark = false }: { slug: string; title: string; dark?: boolean }) {
  const { active, label, className, onClick } = useFavoriteButton({ slug, title, dark });

  return (
    <button type="button" className={className} aria-pressed={active} aria-label={label} title={label} onClick={onClick}>
      <Icon name="heart" size={18} filled={active} />
    </button>
  );
}
