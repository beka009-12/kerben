"use client";

import Link from "next/link";
import { AiBookingCard } from "@/components/ai/ai-booking-card/AiBookingCard";
import { AiComposer } from "@/components/ai/ai-composer/AiComposer";
import { AiMessage } from "@/components/ai/ai-message/AiMessage";
import { AiSidebar } from "@/components/ai/ai-sidebar/AiSidebar";
import { AiTripCard } from "@/components/ai/ai-trip-card/AiTripCard";
import { AiWelcome } from "@/components/ai/ai-welcome/AiWelcome";
import { Icon } from "@/components/ui/icon/Icon";
import { signOut } from "@/utils/auth";
import type { AuthUser } from "@/utils/store/auth";
import type { ComposerTour } from "@/utils/ai/use-ai-composer";
import { useAiChat } from "@/utils/ai/use-ai-chat";
import { previewDraft } from "@/utils/ai/use-ai-booking-card";
import { useReturnHref } from "@/utils/layout/return-path";
import "./ai-chat.css";

export function AiChat({ user, tours }: { user: AuthUser; tours: ComposerTour[] }) {
  const { locale, dict, t, kinds, trip, booking, confirm, setBooking, conversations, activeId, messages, streaming, error, truncated, remove, removeAll, sidebarOpen, setSidebarOpen, atBottom, rootRef, listRef, openThread, startNew, sendMessage, scrollToBottom, empty, stop, ask, onListScroll } = useAiChat();
  const backHref = useReturnHref(`/${locale}`);

  const composer = (
    <AiComposer
      key={activeId ?? "new"}
      onSend={sendMessage}
      onStop={stop}
      streaming={streaming}
      placeholder={t.placeholder}
      sendLabel={t.send}
      stopLabel={t.stop}
      initialValue={messages.length === 0 ? ask : ""}
      autoFocus
      tours={tours}
      sendEmpty={trip.picked.length > 0}
    />
  );

  return (
    <div ref={rootRef} className="ai-chat">
      <AiSidebar
        conversations={conversations}
        activeId={activeId}
        user={user}
        open={sidebarOpen}
        labels={{
          newChat: t.newChat,
          history: t.history,
          empty: t.emptyHistory,
          deleteChat: t.deleteChat,
          deleteConfirm: t.deleteConfirm,
          clear: t.clearHistory,
          clearConfirm: t.clearConfirm,
          cancel: t.cancel,
          logout: dict.login.logout,
          close: dict.a11y.close,
        }}
        onNew={startNew}
        onOpen={(id) => {
          openThread(id);
          setSidebarOpen(false);
        }}
        onDelete={(id) => void remove(id)}
        onClear={() => void removeAll()}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => void signOut()}
      />

      <section className="ai-chat-main" aria-label={t.title}>
        <header className="ai-chat-bar">
          <Link href={backHref} className="ai-chat-home" aria-label={t.back} title={t.back}>
            <Icon name="arrowLeft" size={20} />
          </Link>
          <span className="ai-chat-name">
            {t.title}
            <span className="ai-chat-badge">AI</span>
          </span>
          <button type="button" className="ai-chat-new" onClick={startNew} aria-label={t.newChat} title={t.newChat}>
            <Icon name="chat" size={18} />
          </button>
          <button type="button" className="ai-chat-menu" onClick={() => setSidebarOpen(true)} aria-label={t.openHistory}>
            <Icon name="menu" size={20} />
          </button>
        </header>

        <div
          ref={listRef}
          className="ai-chat-scroll"
          onScroll={onListScroll}
        >
          {empty ? (
            <AiWelcome title={t.welcomeTitle} text={t.welcomeText} suggestions={t.suggestions} onPick={sendMessage} />
          ) : (
            <ol className="ai-chat-thread" aria-live="polite">
              {messages.map((message, i) => (
                <AiMessage
                  key={message.key}
                  role={message.role}
                  content={message.content}
                  locale={locale}
                  pending={streaming && i === messages.length - 1}
                  thinkingLabel={t.thinking}
                  preparingLabel={t.booking.preparing}
                  booking={booking}
                />
              ))}
              {confirm && !streaming && (
                <li className="ai-chat-booking">
                  <AiBookingCard
                    key={`${confirm.preview.session_id}-${confirm.preview.revision}`}
                    draft={previewDraft(confirm.preview)}
                    context={booking}
                    confirm={{ ...confirm, onUpdate: (preview) => setBooking((prev) => ({ preview, requestId: prev?.requestId ?? "" })) }}
                  />
                </li>
              )}
            </ol>
          )}

          {(error || truncated) && (
            <p className={error ? "ai-chat-notice ai-chat-notice-error" : "ai-chat-notice"} role="alert">
              {error ? t.errors[error] : t.truncated}
            </p>
          )}
        </div>

        <div className="ai-chat-bottom">
          {!empty && !atBottom && (
            <button type="button" className="ai-chat-down" onClick={scrollToBottom} aria-label={t.scrollDown}>
              <Icon name="arrowDown" size={18} />
            </button>
          )}
          {trip.picked.length > 0 && (
            <AiTripCard
              picked={trip.picked}
              kinds={kinds}
              locale={locale}
              labels={{
                title: dict.trip.chatTitle,
                hint: dict.trip.chatHint,
                remove: dict.trip.undo,
                show: dict.trip.chatShow,
                hide: dict.trip.chatHide,
                count: dict.trip.chatCount,
              }}
              onRemove={trip.remove}
            />
          )}
          {composer}
          {empty && <p className="ai-chat-disclaimer">{t.disclaimer}</p>}
        </div>
      </section>
    </div>
  );
}
