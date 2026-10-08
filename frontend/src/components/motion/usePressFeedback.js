import { useCallback } from "react";

/**
 * usePressFeedback — PRD §6.3 tactile press.
 *
 * Attach to any interactive element to get:
 *  - the `.np-press` positioning wrapper (enables overflow clip)
 *  - a radial ripple spawned at the click point (cyan accent)
 *
 * Pair with the existing `.btn-press` class for the scale-down.
 * Ripple is CSS-driven; prefers-reduced-motion kills it globally
 * via the index.css animation kill-switch.
 *
 *   const { onPointerDown, className } = usePressFeedback();
 *   <button className={`btn-press ${className}`} {...{ onPointerDown }}>Go</button>
 *
 * Options:
 *   - maxRipples: cap concurrent ripples (default 3)
 */
export function usePressFeedback({ maxRipples = 3 } = {}) {
  const onPointerDown = useCallback(
    (event) => {
      const target = event.currentTarget;
      if (!target || typeof target.getBoundingClientRect !== "function") return;

      // Never exceed the cap — remove the oldest ripple first
      const existing = target.querySelectorAll(".np-ripple");
      if (existing.length >= maxRipples) {
        existing[0].remove();
      }

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;

      const ripple = document.createElement("span");
      ripple.className = "np-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;

      target.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), {
        once: true,
      });
    },
    [maxRipples]
  );

  // .np-press provides position:relative + overflow:hidden for the ripple
  const pressProps = {
    onPointerDown,
    className: "np-press",
  };

  return pressProps;
}

export default usePressFeedback;
