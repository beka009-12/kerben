import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.hoisted(() => vi.fn());
const saveRecord = vi.hoisted(() => vi.fn());
const deleteRecord = vi.hoisted(() => vi.fn());
const uploadPhoto = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push: vi.fn() }) }));
vi.mock("@/app/[lang]/admin/actions", () => ({ saveRecord, deleteRecord, uploadPhoto }));

import { AdminGallery } from "@/components/admin/admin-gallery/AdminGallery";
import { AdminToastProvider } from "@/components/admin/admin-toast/AdminToast";
import type { ChildDef } from "@/utils/admin/resources";

HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute("open");
};
URL.createObjectURL ??= () => "blob:preview";
URL.revokeObjectURL ??= () => {};

const child: ChildDef = { resource: "tourImages", foreignKey: "tour_id", tab: "Фото" };
const photo = (name: string) => new File(["x"], name, { type: "image/jpeg" });

function renderGallery(rows: Record<string, unknown>[] | null = []) {
  return render(
    <AdminToastProvider>
      <AdminGallery child={child} parentId={7} rows={rows as never} />
    </AdminToastProvider>,
  );
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("фото в админке", () => {
  it("загружает сразу несколько фото — каждое отдельной записью с порядком", async () => {
    let n = 0;
    uploadPhoto.mockImplementation(async () => ({ ok: true, url: `https://cdn.test/${++n}.webp` }));
    saveRecord.mockImplementation(async (_key, _id, values) => ({ ok: true, record: { id: 100 + Number(values.order) } }));
    const { container } = renderGallery();

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple).toBe(true);
    fireEvent.change(input, { target: { files: [photo("a.jpg"), photo("b.jpg"), photo("c.jpg")] } });

    await waitFor(() => expect(screen.getByText("Фото: 3")).toBeTruthy());
    await waitFor(() => expect(saveRecord).toHaveBeenCalledTimes(3));
    const orders = saveRecord.mock.calls.map((call) => call[2].order).sort();
    expect(orders).toEqual(["1", "2", "3"]);
    expect(saveRecord.mock.calls[0][2]).toMatchObject({ tour_id: "7" });
  });

  it("если backend не отдаёт список фото, показывает добавленные в этом браузере", async () => {
    uploadPhoto.mockResolvedValue({ ok: true, url: "https://cdn.test/1.webp" });
    saveRecord.mockResolvedValue({ ok: true, record: { id: 55 } });
    const first = renderGallery(null);
    fireEvent.change(first.container.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [photo("a.jpg")] } });
    await waitFor(() => expect(saveRecord).toHaveBeenCalled());
    first.unmount();

    renderGallery(null);
    expect(await screen.findByText("Фото: 1")).toBeTruthy();
    expect(screen.getByText("Показаны фото, добавленные в этом браузере")).toBeTruthy();
  });

  it("ошибку загрузки показывает на фото с кнопкой «Повторить»", async () => {
    uploadPhoto.mockResolvedValue({ ok: false, error: "network" });
    const { container } = renderGallery();
    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [photo("a.jpg")] } });
    expect(await screen.findByRole("button", { name: /Повторить/ })).toBeTruthy();
    expect(saveRecord).not.toHaveBeenCalled();
  });
});
