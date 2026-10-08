import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * useCountUp — PRD §6.3 animated count-up for stat numerals.
 *
 *   const { ref, display } = useCountUp({ value: 1284, duration: 1.2 });
 *   <span ref={ref} className="font-display tabular-nums">{display}</span>
 *
 * - Tweens from 0 (or previous value) to `value` when the element
 *   enters the viewport (IntersectionObserver, fires once)
 * - `display` is the pre-formatted string — pass `format` to
 *   control separators/suffixes (default: en-IN locale grouping)
 * - Static (no tween) when prefers-reduced-motion is set
 * - Re-tweens automatically if `value` changes (e.g. live data)
 */
/* Stable module-level default so `format` identity never churns the
   effect (an inline default param recreated per render used to
   kill/restart the tween every re-render, leaving StatCards stuck at
   0 depending on render timing). */
const DEFAULT_FORMAT = (n) => Math.round(n).toLocaleString("en-IN");

export function useCountUp({
  value = 0,
  duration = 1.2,
  format = DEFAULT_FORMAT,
} = {}) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(() => format(0));
  const playedRef = useRef(false);
  const tweenRef = useRef(null);
  /* Latest formatter via ref: inline `format` props (HeroSection)
     stay fresh without re-triggering the tween. */
  const formatRef = useRef(format);
  useEffect(() => {
    formatRef.current = format;
  }, [format]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const tweenTo = (target) => {
      tweenRef.current?.kill();
      if (reduce) {
        setDisplay(formatRef.current(target));
        return;
      }
      const state = { n: 0 };
      tweenRef.current = gsap.to(state, {
        n: target,
        duration,
        ease: "power2.out",
        onUpdate: () => setDisplay(formatRef.current(state.n)),
      });
    };

    // First play waits for viewport entry; later value changes tween immediately
    if (!playedRef.current) {
      let played = false;
      const play = () => {
        if (played) return;
        played = true;
        playedRef.current = true;
        observer.disconnect();
        clearTimeout(failsafe);
        tweenTo(value);
      };

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) play();
        },
        { threshold: 0.4 }
      );
      observer.observe(el);

      // Fail-open: if IO never delivers (background tab, embedder),
      // run the tween anyway — a number stuck at 0 is worse than
      // an unobserved animation.
      const failsafe = setTimeout(play, 1500);

      return () => {
        observer.disconnect();
        clearTimeout(failsafe);
        tweenRef.current?.kill();
      };
    }

    tweenTo(value);
    return () => tweenRef.current?.kill();
  }, [value, duration]);

  return { ref, display };
}

export default useCountUp;
