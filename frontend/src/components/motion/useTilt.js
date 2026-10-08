import { useCallback, useRef } from "react";

/**
 * useTilt — PRD §6.3 pointer-reactive 3D tilt + specular glare.
 *
 * Attach to a card surface:
 *
 *   const { ref, tiltProps } = useTilt({ maxTilt: 8 });
 *   <div ref={ref} className="tilt-card" {...tiltProps}>
 *     <div className="tilt-glare" />
 *     ...content...
 *   </div>
 *
 * - rotateX/Y max ±maxTilt degrees, tracked to the pointer position
 * - glare follows the pointer via --glare-x/--glare-y CSS variables
 *   (put `<div className="tilt-glare" />` inside the card; CSS lights
 *   it up on hover)
 * - disabled on touch/coarse pointers and when the user prefers
 *   reduced motion — the card simply stays flat
 * - hover = one response rule (PRD §5.4): tilt + glare is ONE
 *   response; don't also add card-lift or shine to the same element
 */
export function useTilt({ maxTilt = 8 } = {}) {
  const frame = useRef(0);

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isTouch = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const onPointerMove = useCallback(
    (event) => {
      if (prefersReduced() || isTouch()) return;

      const el = event.currentTarget;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // normalized -0.5..0.5 from center
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${(
          -py * maxTilt
        ).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg)`;
        el.style.setProperty("--glare-x", `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty("--glare-y", `${((py + 0.5) * 100).toFixed(1)}%`);
      });
    },
    [maxTilt]
  );

  const onPointerLeave = useCallback((event) => {
    const el = event?.currentTarget;
    if (!el) return;

    cancelAnimationFrame(frame.current);
    el.style.transform = "";
  }, []);

  const tiltProps = {
    onPointerMove,
    onPointerLeave,
  };

  return { tiltProps };
}

export default useTilt;
