"use client";

import { useRef, type MouseEvent, type PointerEvent } from "react";

interface BackdropPoint {
  target: EventTarget;
  currentTarget: HTMLDialogElement;
  clientX: number;
  clientY: number;
}

interface BackdropHandlers {
  onPointerDown: (event: PointerEvent<HTMLDialogElement>) => void;
  onClick: (event: MouseEvent<HTMLDialogElement>) => void;
}

// ::backdrop — псевдоэлемент самого dialog, поэтому «вне окна» проверяем по координатам, а не по target
function onBackdrop({ target, currentTarget, clientX, clientY }: BackdropPoint): boolean {
  if (target !== currentTarget) return false;
  const box = currentTarget.getBoundingClientRect();
  return clientX < box.left || clientX > box.right || clientY < box.top || clientY > box.bottom;
}

/**
 * Закрывает modal dialog по клику на подложку, только если нажатие и началось, и закончилось на ней.
 * Иначе выделение текста, отпущенное над подложкой, закрывает окно: браузер шлёт click общему предку — dialog.
 */
export function useBackdropDismiss(onDismiss: () => void): BackdropHandlers {
  const pressed = useRef(false);

  return {
    onPointerDown: (event) => {
      pressed.current = onBackdrop(event);
    },
    onClick: (event) => {
      const dismiss = pressed.current && onBackdrop(event);
      pressed.current = false;
      if (dismiss) onDismiss();
    },
  };
}
