import * as React from "react";

/**
 * Handles arrow-key navigation within a grid of focusable elements.
 * Pass the containerRef to the container element and onKeyDown to handle key events.
 */
export function useGridKeyboardNav(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: {
    /** Number of columns (for ArrowUp/Down if needed). Default 7 for week view. */
    columns?: number;
    /** Allow ArrowUp/Down. Default true for date grid (single row). */
    vertical?: boolean;
  } = {},
) {
  const { columns = 7, vertical = false } = options;

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const moves = ["ArrowLeft", "ArrowRight"];
      if (vertical) moves.push("ArrowUp", "ArrowDown");

      if (!moves.includes(e.key)) return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex="0"]',
        ),
      );
      const currentIndex = focusable.indexOf(
        document.activeElement as HTMLElement,
      );
      if (currentIndex === -1) return;

      e.preventDefault();

      let nextIndex: number;
      const total = focusable.length;

      switch (e.key) {
        case "ArrowLeft":
          nextIndex = Math.max(0, currentIndex - 1);
          break;
        case "ArrowRight":
          nextIndex = Math.min(total - 1, currentIndex + 1);
          break;
        case "ArrowUp":
          nextIndex = Math.max(0, currentIndex - columns);
          break;
        case "ArrowDown":
          nextIndex = Math.min(total - 1, currentIndex + columns);
          break;
        default:
          return;
      }

      focusable[nextIndex]?.focus();
    },
    [columns, vertical],
  );

  return { onKeyDown: handleKeyDown };
}
