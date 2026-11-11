import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const uploadPhoto = vi.hoisted(() => vi.fn());
vi.mock("@/app/[lang]/admin/actions", () => ({ uploadPhoto }));

import { AdminPhoto } from "@/components/admin/admin-photo/AdminPhoto";

URL.createObjectURL ??= () => "blob:preview";
URL.revokeObjectURL ??= () => {};

afterEach(() => {
  cleanup();
  uploadPhoto.mockReset();
});

const file = new File(["x"], "yurt.jpg", { type: "image/jpeg" });
const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

describe("фото в админке без ссылок", () => {
  it("пусто — зона «перетащите или выберите»; выбранный файл загружается, в поле — адрес файла", async () => {
    uploadPhoto.mockResolvedValue({ ok: true, url: "https://cdn.example/yurt.webp" });
    const onChange = vi.fn();
    render(<AdminPhoto id="photo" value="" onChange={onChange} />);
    expect(screen.getByRole("button", { name: /Перетащите фото/ })).toBeTruthy();

    fireEvent.change(fileInput(), { target: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("https://cdn.example/yurt.webp"));
    expect((uploadPhoto.mock.calls[0][0] as FormData).get("file")).toBeInstanceOf(File);
  });

  it("ошибка загрузки — понятный текст, значение не меняется", async () => {
    uploadPhoto.mockResolvedValue({ ok: false, error: "auth" });
    const onChange = vi.fn();
    render(<AdminPhoto id="photo" value="" onChange={onChange} />);
    fireEvent.change(fileInput(), { target: { files: [file] } });
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("Сессия истекла");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("есть фото — превью с «Заменить», крестик убирает фото", () => {
    const onChange = vi.fn();
    render(<AdminPhoto id="photo" value="https://cdn.example/a.jpg" onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Заменить" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Убрать фото" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("не картинка — не загружаем", () => {
    render(<AdminPhoto id="photo" value="" onChange={vi.fn()} />);
    fireEvent.change(fileInput(), { target: { files: [new File(["x"], "a.pdf", { type: "application/pdf" })] } });
    expect(uploadPhoto).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("JPG");
  });
});
