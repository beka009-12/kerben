"use client";

import { Avatar } from "@/components/ui/avatar/Avatar";
import { Icon } from "@/components/ui/icon/Icon";
import type { AiConversation } from "@/utils/hooks/useAssistant";
import type { AuthUser } from "@/utils/store/auth";
import { useAiSidebar } from "@/utils/ai/use-ai-sidebar";
import "./ai-sidebar.css";

export function AiSidebar({
  conversations,
  activeId,
  user,
  open,
  labels,
  onNew,
  onOpen,
  onDelete,
  onClear,
  onClose,
  onLogout,
}: {
  conversations: AiConversation[];
  activeId: string | null;
  user: AuthUser;
  open: boolean;
  labels: {
    newChat: string;
    history: string;
    empty: string;
    deleteChat: string;
    deleteConfirm: string;
    clear: string;
    clearConfirm: string;
    cancel: string;
    logout: string;
    close: string;
  };
  onNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  const { sheet, setSheet, suppressClick, cancelPress, openChatSheet, onPointerDown, onPointerMove, confirm } = useAiSidebar({ onDelete, onClear });

  return (
    <>
      <aside className={open ? "ai-sidebar ai-sidebar-open" : "ai-sidebar"}>
        <div className="ai-sidebar-top">
          <button type="button" className="ai-sidebar-new" onClick={onNew}>
            <Icon name="chat" size={18} />
            {labels.newChat}
          </button>
          <button type="button" className="ai-sidebar-close" onClick={onClose} aria-label={labels.close}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="ai-sidebar-head">
          <p className="ai-sidebar-heading">{labels.history}</p>
          {conversations.length > 0 && (
            <button type="button" className="ai-sidebar-clear" onClick={() => setSheet({ kind: "all" })}>
              <Icon name="trash" size={14} />
              {labels.clear}
            </button>
          )}
        </div>

        {conversations.length === 0 ? (
          <p className="ai-sidebar-empty">{labels.empty}</p>
        ) : (
          <ul className="ai-sidebar-list">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="ai-sidebar-row">
                <button
                  type="button"
                  className={conversation.id === activeId ? "ai-sidebar-item ai-sidebar-item-active" : "ai-sidebar-item"}
                  onClick={() => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    onOpen(conversation.id);
                  }}
                  onPointerDown={(event) => onPointerDown(event, conversation)}
                  onPointerMove={onPointerMove}
                  onPointerUp={cancelPress}
                  onPointerCancel={cancelPress}
                  onPointerLeave={cancelPress}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    openChatSheet(conversation);
                  }}
                  aria-current={conversation.id === activeId ? "page" : undefined}
                >
                  {conversation.title || "…"}
                </button>
                <button
                  type="button"
                  className="ai-sidebar-delete"
                  onClick={() => setSheet({ kind: "chat", id: conversation.id, title: conversation.title || "…" })}
                  aria-label={labels.deleteChat}
                  title={labels.deleteChat}
                >
                  <Icon name="trash" size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="ai-sidebar-account">
          <Avatar id={user.id} name={user.name} size="sm" />
          <span className="ai-sidebar-name">{user.name}</span>
          <button type="button" className="ai-sidebar-logout" onClick={onLogout}>
            {labels.logout}
          </button>
        </div>

        {sheet && (
          <div className="ai-sheet-layer">
            <button type="button" className="ai-sheet-backdrop" onClick={() => setSheet(null)} aria-label={labels.cancel} />
            <div className="ai-sheet" role="alertdialog" aria-modal="true" aria-labelledby="ai-sheet-title">
              <span className="ai-sheet-grip" aria-hidden="true" />
              <p id="ai-sheet-title" className="ai-sheet-title">
                {sheet.kind === "chat" ? sheet.title : labels.clear}
              </p>
              <p className="ai-sheet-text">{sheet.kind === "chat" ? labels.deleteConfirm : labels.clearConfirm}</p>
              <button type="button" className="ai-sheet-danger" onClick={confirm} autoFocus>
                <Icon name="trash" size={18} />
                {sheet.kind === "chat" ? labels.deleteChat : labels.clear}
              </button>
              <button type="button" className="ai-sheet-cancel" onClick={() => setSheet(null)}>
                {labels.cancel}
              </button>
            </div>
          </div>
        )}
      </aside>
      {open && <button type="button" className="ai-sidebar-backdrop" onClick={onClose} aria-label={labels.close} />}
    </>
  );
}
