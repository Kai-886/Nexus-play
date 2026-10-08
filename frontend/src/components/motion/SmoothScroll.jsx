import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * SmoothScroll — Lenis inertia scrolling driven by GSAP's ticker,
 * so ScrollTrigger and the smooth scroll stay perfectly in sync.
 * Disabled entirely for prefers-reduced-motion users.
 *
 * Mounted once in App.jsx, wraps the whole route tree.
 */
export function SmoothScroll({ children }) {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) return undefined;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Sync ScrollTrigger with Lenis' animation frame
      // (canonical Lenis + GSAP integration)
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Expose for PageTransition's route-change scroll reset
    window.__lenis = lenis;

    const raf = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return children;
}

export default SmoothScroll;
