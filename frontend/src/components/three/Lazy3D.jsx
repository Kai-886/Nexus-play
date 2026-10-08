import { Suspense, useEffect, useRef, useState } from "react";
import { supportsWebGL } from "./supportsWebGL";

/**
 * Lazy3D — PRD §7.1 gate for every 3D scene.
 *
 * - Renders nothing 3D-related until the scene scrolls near the
 *   viewport (IntersectionObserver, rootMargin preloads early)
 * - WebGL unavailable -> renders `fallback` permanently
 * - Scene chunk loads via React.lazy + Suspense with a `placeholder`
 *   that already occupies the final layout size (no layout shift)
 * - No 3D payload ever reaches the initial bundle (PRD perf budget)
 *
 *   <Lazy3D load={() => import("./HeroScene")} fallback={<HeroPoster />} />
 *
 * The default export of the lazy chunk is rendered once loaded;
 * `sceneProps` are passed through to it. Never statically import
 * the scene component — that would defeat the code-split.
 */
export function Lazy3D({ load, fallback = null, placeholder = null, sceneProps, className = "" }) {
  const [nearViewport, setNearViewport] = useState(false);
  const [Scene, setScene] = useState(null);
  const [failed, setFailed] = useState(false);
  const holder = useRef(null);

  useEffect(() => {
    if (!supportsWebGL()) return undefined;

    const el = holder.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return undefined;
    }

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      setNearViewport(true);
      observer.disconnect();
      clearTimeout(failsafe);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) settle();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);

    // Fail-open: some environments (background tabs, embedders,
    // exotic webviews) never deliver IO callbacks. The scene is
    // decorative — loading it unrequested beats never loading it.
    const failsafe = setTimeout(settle, 1200);

    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    if (!nearViewport || Scene || failed) return undefined;

    let cancelled = false;
    load()
      .then((mod) => {
        if (!cancelled) setScene(() => mod.default);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [nearViewport, Scene, failed, load]);

  // No WebGL or chunk failure -> static fallback
  if (!supportsWebGL() || failed) return fallback;

  // NOTE: the holder must render a real box (not display:contents) or
  // IntersectionObserver can never report intersection and the scene
  // would never load.
  return (
    <div ref={holder} className={className}>
      {Scene ? (
        <Suspense fallback={placeholder}>
          <Scene {...sceneProps} />
        </Suspense>
      ) : (
        placeholder
      )}
    </div>
  );
}

export default Lazy3D;
