import { useEffect, useRef, useState } from "react";

/**
 * LiveWallpaper — Phase 7 P4-rev. Replaces the removed Kenney diorama
 * on the auth side panel with a downloaded live-wallpaper video loop
 * (owner-supplied "Omen Valorant" wallpaper, transcoded 77 MB → 5.4 MB
 * 720p H.264, audio stripped, faststart — served from /public so it
 * streams instead of entering the bundle).
 *
 * Cursor effect ("live wallpaper" feel): the video layer drifts a few
 * px opposite the pointer (parallax) and a soft radial spotlight
 * follows the cursor. Both are rAF-throttled and disabled under
 * prefers-reduced-motion (which also disables autoplay — poster shows).
 *
 * Sits BEHIND the gradient scrims, so text legibility and the np-glass
 * form card are unaffected.
 */

export default function LiveWallpaper() {
  const layerRef = useRef(null);
  const spotRef = useRef(null);
  const raf = useRef(0);

  /* Reduced motion: no cursor drift, no spotlight, video stays on its
     poster frame (no autoplay). */
  const [reduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layer = layerRef.current;
    const spot = spotRef.current;
    if (reduce || !layer || !spot) return undefined;

    let px = 0.5;
    let py = 0.5; // normalized pointer (-0.5..0.5 from center)
    let tx = 0;
    let ty = 0;
    let sx = 0;
    let sy = 0;

    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      px = nx;
      py = ny;
    };

    const tick = () => {
      // Parallax: video drifts opposite the pointer (max ~14px)
      tx += (px * -14 - tx) * 0.06;
      ty += (py * -10 - ty) * 0.06;
      // Spotlight: follows the pointer a touch faster
      sx += (px - sx) * 0.09;
      sy += (py - sy) * 0.09;

      layer.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(1.06)`;
      spot.style.background = `radial-gradient(340px circle at ${(
        (sx + 0.5) * 100
      ).toFixed(1)}% ${((sy + 0.5) * 100).toFixed(1)}%, rgba(99,102,241,0.16), transparent 62%)`;

      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Video layer — scaled slightly so the parallax drift never
          reveals edges. Poster = frame grab; loop repeats seamlessly
          enough behind the scrims. */}
      <video
        ref={layerRef}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        src="/wallpapers/auth-loop.mp4"
        poster="/wallpapers/auth-loop-poster.jpg"
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
      />

      {/* Cursor spotlight */}
      <div ref={spotRef} className="absolute inset-0" />

      {/* Legibility scrims — full-page variant: uniform dim + top/bottom
          gradients so the glass form card reads over any frame. */}
      <div className="absolute inset-0 bg-[var(--np-bg-0)]/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--np-bg-0)] via-transparent to-[var(--np-bg-0)]/35" />
    </div>
  );
}
