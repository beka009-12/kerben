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
  text,
  points,
  homeHref,
  backLabel,
}: {
  title: string;
  text: string;
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
      <div className="ai-gate-card">
        <div className="ai-gate-intro">
          <Image src={kg("song-kul-yurts")} alt="" fill sizes="(min-width: 900px) 50vw, 100vw" className="ai-gate-image" />
          <div className="ai-gate-shade" />
          <span className="ai-gate-badge">Kerben Travel AI</span>
          <h1 className="ai-gate-title">{title}</h1>
          <p className="ai-gate-text">{text}</p>
          <ul className="ai-gate-points">
            {points.map((point) => (
              <li key={point} className="ai-gate-point">
                <Icon name="check" size={16} />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="ai-gate-form">
          <AuthForm initialMode="register" showLogo={false} />
        </div>
      </div>
    </section>
  );
}
