import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBackdropDismiss } from "@/utils/ui/use-backdrop-dismiss";

interface ProbeProps {
  onDismiss: () => void;
}

function Probe({ onDismiss }: ProbeProps) {
  const backdrop = useBackdropDismiss(onDismiss);
  return (
    <dialog open data-testid="dialog" {...backdrop}>
      <p data-testid="text">Удалить чат?</p>
    </dialog>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const BOX = { left: 100, top: 100, right: 500, bottom: 300, width: 400, height: 200, x: 100, y: 100 };
const OUTSIDE = { clientX: 20, clientY: 20 };
const INSIDE = { clientX: 200, clientY: 200 };

function setup() {
  const onDismiss = vi.fn();
  const view = render(<Probe onDismiss={onDismiss} />);
  const dialog = view.getByTestId("dialog");
  vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({ ...BOX, toJSON: () => BOX });
  return { onDismiss, dialog, text: view.getByTestId("text") };
}

describe("закрытие подтверждения по подложке", () => {
  it("нажали и отпустили на подложке — закрывается", () => {
    const { onDismiss, dialog } = setup();
    fireEvent.pointerDown(dialog, OUTSIDE);
    fireEvent.click(dialog, OUTSIDE);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("выделяли текст и отпустили над подложкой — остаётся открытым", () => {
    const { onDismiss, dialog, text } = setup();
    fireEvent.pointerDown(text, INSIDE);
    fireEvent.click(dialog, OUTSIDE);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("нажали на подложке и отпустили внутри окна — остаётся открытым", () => {
    const { onDismiss, dialog } = setup();
    fireEvent.pointerDown(dialog, OUTSIDE);
    fireEvent.click(dialog, INSIDE);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
