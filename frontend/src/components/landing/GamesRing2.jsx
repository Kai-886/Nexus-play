import { useEffect, useRef, useState } from "react";
import GameArt from "./GameArt";
import { GAME_LIST } from "../../utils/gameTheme";

/**
 * GamesRing 2.0 — PRD §6.3 "3D marquee ring" (Phase 7 P3-rev).
 * The 8 games ride a tilted CSS 3D cylinder as GameArt banner plates:
 *
 *   - auto-rotates slowly; pauses while a plate is hovered/held
 *   - drag to spin with inertia (pointer + touch)
 *   - name + genre live on each plate (owner removed the center hub)
 *   - the front/hovered plate is highlighted
 *   - prefers-reduced-motion: static captioned row, no spin
 *
 * Plate size adapts: 280×180 desktop, 190×124 under 640px. The spin
 * loop reads refs only; React state is used solely for what renders.
 * Pure CSS transforms — no WebGL.
 */

const SPIN_SPEED = 4.2; // deg/s base auto-spin
const DRAG_FACTOR = 0.25;
const INERTIA_DECAY = 0.94;

export default function GamesRing2({ games = GAME_LIST }) {
  const [reduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const count = games.length;
  const step = count > 0 ? 360 / count : 360;

  /* Responsive plate size — the ring must fill its section without
     overflowing small screens. Re-measures on resize. */
  const [plate, setPlate] = useState(() => ({ w: 300, h: 188 }));
  useEffect(() => {
    const measure = () =>
      setPlate(
        window.innerWidth < 640 ? { w: 200, h: 130 } : { w: 300, h: 188 }
      );
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* Radius from plate width + small gap so the ring reads dense and
     full, not sparse — classic polygon formula. */
  const radius =
    count > 0 ? Math.round((plate.w / 2 + 24) / Math.tan(Math.PI / count)) : 420;

  /* Hovered plate (for the highlight); the spin loop pauses via ref. */
  const [hoverIdx, setHoverIdx] = useState(null);

  const angleRef = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const hovering = useRef(false);
  const lastX = useRef(0);
  const ringRef = useRef(null);
  const raf = useRef(0);

  /* ---------- spin loop (reads refs only) ---------- */
  useEffect(() => {
    if (reduced || count === 0) return undefined;

    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(now - last, 50);
      last = now;

      if (!dragging.current) {
        velocity.current *= INERTIA_DECAY;
        const base = hovering.current ? 0 : SPIN_SPEED;
        angleRef.current += (base + velocity.current) * (dt / 1000);
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translateZ(-${radius}px) rotateY(${angleRef.current.toFixed(2)}deg)`;
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [reduced, count, step, radius]);

  if (count === 0) return null;

  /* ---------- reduced motion: static plate row ---------- */
  if (reduced) {
    return (
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4" data-reveal>
        {games.map((game) => (
          <div
            key={game}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--np-bg-2)]"
          >
            <GameArt game={game} variant="showcase" className="aspect-[4/3] w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mt-12" data-reveal>
      {/* Stage — perspective + tilt; edges fade via mask */}
      <div
        className="np-ring2-stage"
        onPointerDown={(e) => {
          dragging.current = true;
          lastX.current = e.clientX;
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const dx = e.clientX - lastX.current;
          lastX.current = e.clientX;
          velocity.current = dx * DRAG_FACTOR * 1.4;
          angleRef.current += dx * DRAG_FACTOR;
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerLeave={() => {
          dragging.current = false;
          hovering.current = false;
          setHoverIdx(null);
        }}
      >
        {/* The 3D cylinder — plate size comes from JS (responsive) */}
        <div
          className="np-ring2"
          ref={ringRef}
          style={{ width: plate.w, height: plate.h }}
        >
          {games.map((game, i) => (
            <div
              key={game}
              className={`np-ring2-plate ${i === hoverIdx ? "is-active" : ""}`}
              style={{
                transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
              }}
              onPointerEnter={() => {
                hovering.current = true;
                setHoverIdx(i);
              }}
              onPointerLeave={() => {
                hovering.current = false;
                setHoverIdx(null);
              }}
            >
              {/* showcase variant = banner + name/genre caption on the plate */}
              <GameArt game={game} variant="showcase" className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Drag to spin
      </p>
    </div>
  );
}
