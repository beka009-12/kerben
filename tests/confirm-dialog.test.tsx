import { cleanup, createEvent, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/ConfirmDialog";

afterEach(cleanup);

describe("общий диалог подтверждения", () => {
  it("Esc отменяет только подтверждение, а не родительский dialog редактора", () => {
    const onCancel = vi.fn();
    const onParentCancel = vi.fn();
    const view = render(
      <dialog onCancel={onParentCancel}>
        <ConfirmDialog
          open={false}
          title="Удалить фото?"
          text="Фото пропадёт с сайта."
          cancelLabel="Отмена"
          confirmLabel="Да, удалить"
          onConfirm={() => {}}
          onCancel={onCancel}
        />
      </dialog>,
    );
    const confirm = view.container.querySelector(".confirm-dialog");
    if (!confirm) throw new Error("confirm dialog is not rendered");
    const cancel = createEvent("cancel", confirm, { cancelable: true });
    fireEvent(confirm, cancel);

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onParentCancel).not.toHaveBeenCalled();
    expect(cancel.defaultPrevented).toBe(true);
  });

  it("пока идёт удаление, кнопка заблокирована и подписана", () => {
    const view = render(
      <ConfirmDialog
        open={false}
        title="Удалить запись?"
        text="Запись пропадёт с сайта."
        cancelLabel="Отмена"
        confirmLabel="Да, удалить"
        busy
        busyLabel="Удаляем…"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    const button = view.getByRole("button", { hidden: true, name: "Удаляем…" });
    expect(button).toHaveProperty("disabled", true);
  });
});
