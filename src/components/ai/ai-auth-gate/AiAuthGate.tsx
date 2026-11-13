"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form/AuthForm";
import { Icon } from "@/components/ui/icon/Icon";
import { Logo } from "@/components/ui/logo/Logo";
import { kg } from "@/data/images";
import { useReturnHref } from "@/utils/layout/return-path";
import "./ai-auth-gate.css";

export function AiAuthGate({
  title,
  points,
  homeHref,
  backLabel,
}: {
  title: string;
  points: string[];
  homeHref: string;
  backLabel: string;
}) {
  const backHref = useReturnHref(homeHref);
  return (
    <section className="ai-gate">
      <div className="ai-gate-bar">
        <Link href={backHref} className="ai-gate-back" aria-label={backLabel}>
          <Icon name="arrowLeft" size={20} />
        </Link>
        <Link href={homeHref} className="ai-gate-brand">
          <Logo />
        </Link>
      </div>
      {/* Телефон: только форма. Планшет: фото-полоса → форма «шторкой» → что умеет ассистент. Десктоп: фото с текстом слева, форма справа */}
      <div className="ai-gate-card">
        {/* Без preload: на телефоне блок скрыт, и ленивое фото там не скачивается */}
        <div className="ai-gate-media" aria-hidden="true">
          <Image src={kg("song-kul-yurts")} alt="" fill sizes="(min-width: 900px) 520px, 560px" className="ai-gate-image" />
          <div className="ai-gate-shade" />
        </div>
        {/* Заголовок страницы — «Создать аккаунт» в форме; здесь только подпись к фото, поэтому не <h1> */}
        <div className="ai-gate-intro">
          <p className="ai-gate-title">{title}</p>
        </div>
        <div className="ai-gate-form">
          <AuthForm initialMode="register" showLogo={false} />
        </div>
        <ul className="ai-gate-points">
          {points.map((point) => (
            <li key={point} className="ai-gate-point">
              <span className="ai-gate-point-icon">
                <Icon name="check" size={14} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
