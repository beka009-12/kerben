import Image from "next/image";
import { memo } from "react";
import { AiBookingCard } from "@/components/ai/ai-booking-card/AiBookingCard";
import { AiMarkdown } from "@/components/ai/ai-markdown/AiMarkdown";
import mark from "@/assets/brand/logo-mark.png";
import { splitPhotos } from "@/utils/ai/chat-photo";
import { splitBookingBlock, type BookingContext } from "@/utils/booking-chat";
import "./ai-message.css";

export const AiMessage = memo(function AiMessage({
  role,
  content,
  locale,
  pending,
  thinkingLabel,
  preparingLabel,
  booking = null,
}: {
  role: "user" | "assistant";
  content: string;
  locale: string;
  pending?: boolean;
  thinkingLabel: string;
  preparingLabel: string;
  booking?: BookingContext | null;
}) {
  if (role === "user") {
    const { text, photos } = splitPhotos(content);
    return (
      <li className="ai-message ai-message-user">
        {photos.length > 0 && (
          <span className={photos.length > 1 ? "ai-message-photos ai-message-photos-row" : "ai-message-photos"}>
            {photos.map((src) => (
              <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="ai-message-photo">
                <Image src={src} alt="" fill sizes={photos.length > 1 ? "120px" : "260px"} className="ai-message-photo-image" />
              </a>
            ))}
          </span>
        )}
        {text && <p className="ai-message-bubble">{text}</p>}
      </li>
    );
  }

  const { text, draft, pending: preparing } = splitBookingBlock(content);

  return (
    <li className="ai-message ai-message-assistant">
      <span className="ai-message-mark" aria-hidden="true">
        <Image src={mark} alt="" width={22} height={23} />
      </span>
      <div className="ai-message-body">
        {content ? (
          <AiMarkdown text={text} locale={locale} />
        ) : (
          <span className="ai-message-thinking" role="status">
            <span className="ai-message-dot" />
            <span className="ai-message-dot ai-message-dot-2" />
            <span className="ai-message-dot ai-message-dot-3" />
            <span className="visually-hidden">{thinkingLabel}</span>
          </span>
        )}
        {pending && content && !preparing && <span className="ai-message-caret" aria-hidden="true" />}
        {preparing && (
          <p className="ai-message-preparing" role="status">
            {preparingLabel}
          </p>
        )}
        {draft && <AiBookingCard draft={draft} context={booking} />}
      </div>
    </li>
  );
});
