import { useEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";

/**
 * PageTransition — PRD §6.2 route change = scene change.
 *
 * Two-beat choreography on every route change:
 *   1. COVER  — two gradient panels wipe in from top/bottom (300ms)
 *   2. SWAP   — under the covered screen, the new route mounts and
 *               scroll resets to top (Lenis-aware)
 *   3. REVEAL — panels wipe away (600ms), new scene enters with
 *               the pageIn animation
 *
 * Skipped entirely for prefers-reduced-motion users — they get a
 * plain instant swap with scroll reset (no wipe, no delay).
 *
 * Variant: dashboard trees (/participant, /organizer, /sponsor,
 * /superadmin) are high-frequency internal navigation, so they use
 * the `np-wipe--fast` variant — a single 180ms scrim over the swap
 * instead of the full cinematic cover/reveal (§6.1 frequency gate).
 *
 * Rendered once inside the Router in App.jsx. Also drives the
 * scroll progress bar via the --scroll-progress CSS variable on a
 * rAF loop for browsers without CSS scroll-driven timelines.
 */
export function PageTransition({ children }) {
  const { pathname } = useLocation();
  const outlet = useOutlet() || children;

  /* High-frequency dashboard navigation → light wipe variant. */
  const isFastWipe =
    /^\/(participant|organizer|sponsor|superadmin)(\/|$)/.test(pathname);

  const [wipeClass, setWipeClass] = useState("");
  const [displayed, setDisplayed] = useState(outlet);
  const [enterKey, setEnterKey] = useState(0);
  const firstRender = useRef(true);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    // First mount: no wipe, just show the initial route.
    if (firstRender.current) {
      firstRender.current = false;
      setDisplayed(outlet);
      return undefined;
    }

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scrollReset = () => {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };

    if (reduce) {
      const apply = () => {
        setDisplayed(outlet);
      };
      apply();
      scrollReset();
      return undefined;
    }

    // Beat 1: cover the old scene
    const cover = () => {
      setWipeClass("is-covering");
    };
    cover();

    timers.current.push(
      setTimeout(() => {
        // Beat 2: swap content under cover + reset scroll
        setDisplayed(outlet);
        scrollReset();

        // Beat 3: reveal — bumping enterKey replays the pageIn
        // "boot-up" exactly as the panels start leaving
        setWipeClass("is-revealing");
        setEnterKey((key) => key + 1);
        timers.current.push(
          setTimeout(() => setWipeClass(""), 620)
        );
      }, 320)
    );

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return undefined;

    const supportsScrollTimeline =
      typeof CSS !== "undefined" &&
      CSS.supports &&
      CSS.supports("animation-timeline: scroll()");

    if (supportsScrollTimeline) return undefined;

    let rafId = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      bar.style.setProperty("--scroll-progress", String(progress));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div key={enterKey} className="page-enter">
        {displayed}
      </div>

      <div
        className={`np-wipe ${isFastWipe ? "np-wipe--fast" : ""} ${wipeClass}`}
        aria-hidden="true"
      >
        <div className="np-wipe-panel" />
        <div className="np-wipe-panel" />
      </div>
    </>
  );
}

export default PageTransition;
