import { useEffect, useState } from "react";

/**
 * Preloader — the arena lights coming on.
 * The wordmark "charges up" with color as real assets load,
 * then a two-panel curtain wipes up to reveal the page.
 * Plays once per browser session (sessionStorage skip).
 * Fully skipped for prefers-reduced-motion users.
 */
/* Module-level so the mount effect can share the decision without
   adding it to the effect deps. */
const shouldSkipIntro = () =>
  Boolean(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      sessionStorage.getItem("nexus_preloaded")
  );

export function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro -> lift -> done
  const [skip] = useState(shouldSkipIntro);

  useEffect(() => {
    if (shouldSkipIntro()) {
      onDone?.();
      return undefined;
    }

    sessionStorage.setItem("nexus_preloaded", "1");

    let progressTimer;
    let loadDone = false;

    const bump = () => {
      setProgress((p) =>
        loadDone ? 100 : Math.min(p + 7 + Math.random() * 9, 92)
      );
    };

    progressTimer = setInterval(bump, 140);

    const finish = () => {
      if (loadDone) return;
      loadDone = true;
      clearInterval(progressTimer);
      setProgress(100);
      setTimeout(() => setPhase("lift"), 500);
      setTimeout(() => {
        setPhase("done");
        onDone?.();
      }, 1500);
    };

    const imgTargets = [...document.images];
    const allImages = imgTargets.length;

    if (allImages === 0) {
      const t = setTimeout(finish, 900);
      return () => {
        clearInterval(progressTimer);
        clearTimeout(t);
      };
    }

    let loaded = 0;
    imgTargets.forEach((img) => {
      const done = () => {
        loaded += 1;
        if (loaded >= allImages) finish();
      };
      if (img.complete) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });

    const failsafe = setTimeout(finish, 3500);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(failsafe);
    };
  }, [onDone]);

  if (skip || phase === "done") return null;

  const lifted = phase === "lift";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden="true"
    >
      {/* Curtain panels */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 bg-[var(--np-bg-0)] transition-transform duration-[900ms]"
        style={{
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
          transform: lifted ? "translateY(-101%)" : "translateY(0)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-[var(--np-bg-0)] transition-transform duration-[900ms]"
        style={{
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
          transform: lifted ? "translateY(101%)" : "translateY(0)",
        }}
      />

      {/* Centered wordmark + progress */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-8 transition-opacity duration-300 ${
          lifted ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="relative">
          {/* Base layer: white wordmark */}
          <span
            aria-hidden="true"
            className="font-display block bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.85)" }}
          >
            NexusPlay
          </span>

          {/* Charge layer: gradient fill wiping in with progress */}
          <span
            aria-hidden="true"
            className="font-display absolute inset-0 block bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl"
            style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
          >
            NexusPlay
          </span>

          {/* Accessible label */}
          <span className="sr-only">NexusPlay</span>
        </div>

        <div className="h-px w-48 overflow-hidden bg-white/10">
          <div
            className="h-full bg-indigo-500 transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          {progress < 100 ? "Warming up the arena" : "Ready"}
        </p>
      </div>
    </div>
  );
}

export default Preloader;
