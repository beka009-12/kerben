import { cleanup, render } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

let search = new URLSearchParams();
const mounts = vi.hoisted(() => ({ count: 0 }));
vi.mock("next/navigation", () => ({ useSearchParams: () => search, useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/utils/store/auth", () => ({ useAuth: () => ({ status: "user", user: { id: "u", name: "A", email: "a@b.kg", phone: "" } }) }));
vi.mock("@/components/ai/ai-chat/AiChat", () => ({
  AiChat: () => {
    useEffect(() => {
      mounts.count += 1;
    }, []);
    return null;
  },
}));

import { AiChatPage } from "@/components/ai/ai-chat-page/AiChatPage";
import ru from "@/dictionaries/ru.json";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import type { Dictionary } from "@/utils/i18n/dictionaries";

const page = () => (
  <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
    <AiChatPage tours={[]} />
  </I18nProvider>
);

afterEach(() => {
  cleanup();
  mounts.count = 0;
});

describe("один чат на всё", () => {
  it("смена адреса (новый диалог, вопрос) не пересоздаёт чат", () => {
    search = new URLSearchParams({ ask: "Сон-Куль" });
    const { rerender } = render(page());
    expect(mounts.count).toBe(1);
    search = new URLSearchParams({ c: "chat-1" });
    rerender(page());
    search = new URLSearchParams({ c: "chat-1", ask: "Отель" });
    rerender(page());
    expect(mounts.count).toBe(1);
  });
});
