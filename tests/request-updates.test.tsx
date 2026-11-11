import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({ items: [] as { id: string; title: string; status: string }[], calls: 0 }));

vi.mock("@/utils/requests", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  loadRequests: async () => {
    server.calls += 1;
    return { items: server.items.map((item) => ({ ...item })), signedIn: true };
  },
}));

import { RequestToast } from "@/components/requests/request-toast/RequestToast";
import { shortTitle } from "@/utils/requests/use-request-toast";
import ru from "@/dictionaries/ru.json";
import type { Dictionary } from "@/utils/i18n/dictionaries";
import { I18nProvider } from "@/utils/i18n/I18nProvider";
import { cancelledByMe, REQUESTS_CHANGED } from "@/utils/requests";
import { useAuth } from "@/utils/store/auth";

function renderToast() {
  return render(
    <I18nProvider locale="ru" dict={ru as unknown as Dictionary}>
      <RequestToast />
    </I18nProvider>,
  );
}

/** Менеджер поменял статус в backend — сайт видит это при следующей сверке */
async function push(status: string, id = "r1") {
  server.items = server.items.map((item) => (item.id === id ? { ...item, status } : item));
  const before = server.calls;
  await act(async () => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await waitFor(() => expect(server.calls).toBeGreaterThan(before));
}

beforeEach(() => {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
  server.calls = 0;
  server.items = [
    { id: "r1", title: "Ала-Арча", status: "new" },
    { id: "r2", title: "Сон-Куль", status: "new" },
  ];
  useAuth.setState({ status: "user", user: { id: "u1", email: "a@b.kg", name: "Айгуль", phone: "" } });
});

afterEach(() => {
  cleanup();
  useAuth.setState({ status: "guest", user: null });
});

describe("статус заявки: сверка с backend", () => {
  it("админ подтвердил — уведомление сразу, без перезагрузки, и событие для «Моих поездок»", async () => {
    const events: unknown[] = [];
    const onChange = (event: Event) => events.push((event as CustomEvent).detail);
    window.addEventListener(REQUESTS_CHANGED, onChange);
    renderToast();
    await waitFor(() => expect(server.calls).toBe(1));

    await push("completed");
    await waitFor(() => expect(screen.getByText(ru.requests.toast.completed)).toBeTruthy());
    expect(screen.getByText("Ала-Арча")).toBeTruthy();
    expect(events).toEqual([{ id: "r1", title: "Ала-Арча", status: "completed" }]);
    window.removeEventListener(REQUESTS_CHANGED, onChange);
  });

  it("свою отмену клиент не получает как ответ менеджера", async () => {
    renderToast();
    await waitFor(() => expect(server.calls).toBe(1));
    cancelledByMe.add("r2");
    await push("cancelled", "r2");
    expect(screen.queryByText(ru.requests.toast.cancelled)).toBeNull();
  });

  it("длинная заявка — коротко: первое без «Тур:» и сколько ещё", () => {
    const labels = ["Тур", "Отель", "Транспорт"];
    expect(shortTitle("Тур: ТЕСТ: Маршрут 03 · Отель: ТЕСТ: Отель 03 · Транспорт: ТЕСТ: Транспорт 04", labels, "+ ещё {n}")).toBe(
      "ТЕСТ: Маршрут 03 + ещё 2",
    );
    expect(shortTitle("Ала-Арча", labels, "+ ещё {n}")).toBe("Ала-Арча");
  });

  it("гость не опрашивает backend", async () => {
    useAuth.setState({ status: "guest", user: null });
    renderToast();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(server.calls).toBe(0);
  });
});
