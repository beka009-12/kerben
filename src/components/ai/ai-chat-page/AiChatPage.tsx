"use client";

import { AiAuthGate } from "@/components/ai/ai-auth-gate/AiAuthGate";
import { AiChat } from "@/components/ai/ai-chat/AiChat";
import type { ComposerTour } from "@/utils/ai/use-ai-composer";
import { useAiChatPage } from "@/utils/ai/use-ai-chat-page";
import "./ai-chat-page.css";

export function AiChatPage({ tours }: { tours: ComposerTour[] }) {
  const { locale, dict, status, user, next } = useAiChatPage();

  if (status === "loading" || (status === "user" && next)) return <div className="ai-chat-page-loading" aria-busy="true" />;
  if (status === "user" && user) return <AiChat user={user} tours={tours} />;
  return (
    <AiAuthGate
      title={dict.ai.gateTitle}
      points={dict.ai.gatePoints}
      homeHref={`/${locale}`}
      backLabel={dict.ai.back}
    />
  );
}
