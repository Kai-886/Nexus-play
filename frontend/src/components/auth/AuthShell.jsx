import LiveWallpaper from "../landing/LiveWallpaper";
import useTilt from "../motion/useTilt";
import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * AuthShell — PRD §8.2. One cinematic frame for every auth screen:
 *
 *  - ≥ lg: split-screen. Left = parallax arena backdrop + procedural
 *    diorama (lazy, WebGL-gated) + brand panel. Right = form column.
 *  - < lg: single centered column, form only (diorama skipped —
 *    mobile keeps the cheap static backdrop).
 *  - The form card gets a boot-up entrance (np-boot) and, when
 *    `tilt` is enabled, pointer-reactive tilt + glare.
 *  - `shakeKey` bumps trigger the np-shake error animation on the card
 *    (parents call it on failed submit; reduced-motion kills it in CSS).
 *
 * Props:
 *   eyebrow, title, subtitle — copy block (inside the card)
 *   children                — form content (inside the card)
 *   footer                  — below-card slot (fine print / copyright)
 *   width                   — card max-width class (default max-w-md)
 *   tilt                    — enable card tilt (default true)
 *   shakeKey                — change to trigger card shake
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  width = "max-w-md",
  tilt = true,
  shakeKey = 0,
}) {
  const { tiltProps } = useTilt({ maxTilt: 3 });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--np-bg-0)] text-white">
      {/* FULL-PAGE live wallpaper (owner-supplied loop, cursor parallax
          + spotlight) behind the entire auth screen — every breakpoint. */}
      <div className="fixed inset-0">
        <LiveWallpaper />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* LEFT — cinematic copy panel (desktop only) */}
        <div className="relative hidden flex-col justify-end p-10 lg:flex xl:p-14">
          <p className="np-eyebrow">NexusPlay Arena</p>

          <h2 className="np-display mt-2 font-display text-3xl font-bold leading-tight xl:text-4xl">
            Where champions
            <br />
            are forged.
          </h2>
        </div>

        {/* RIGHT — form column */}
        <div className="relative flex items-center justify-center px-4 py-10 sm:px-8">
          <div className={`relative w-full ${width}`}>
            {/* Brand mark */}
            <Link
              to="/"
              className="np-boot mb-7 flex items-center justify-center gap-2.5 lg:justify-start"
              style={{ "--boot-delay": "0ms" }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--np-accent)] shadow-lg shadow-indigo-600/30">
                <Gamepad2 className="h-5 w-5 text-white" />
              </span>

              <span className="font-display text-xl font-bold tracking-tight">
                Nexus
                <span className="text-[var(--np-accent-2)]">Play</span>
              </span>
            </Link>

            {/* Form card — tilt + entrance. First mount boots up;
                bumping shakeKey remounts with the error shake
                (mutually exclusive — both set `animation`). */}
            <div
              key={shakeKey}
              className={`${shakeKey > 0 ? "np-shake" : "np-boot"} ${tilt ? "tilt-card np-glass rounded-2xl" : "np-glass rounded-2xl"} relative overflow-hidden p-6 sm:p-8`}
              style={{ "--boot-delay": "90ms" }}
              {...(tilt ? tiltProps : {})}
            >
              {tilt && <div className="tilt-glare" />}

              <div className="relative">
                {eyebrow && (
                  <p className="np-eyebrow mb-2" style={{ "--boot-delay": "160ms" }}>
                    {eyebrow}
                  </p>
                )}

                <h1
                  className="np-boot font-display text-2xl font-bold tracking-tight"
                  style={{ "--boot-delay": "150ms" }}
                >
                  {title}
                </h1>

                {subtitle && (
                  <p
                    className="np-boot mt-1.5 text-sm leading-6 text-[var(--np-text-mute)]"
                    style={{ "--boot-delay": "210ms" }}
                  >
                    {subtitle}
                  </p>
                )}

                <div className="mt-7">{children}</div>
              </div>
            </div>

            {footer && (
              <div
                className="np-boot mt-6 text-center"
                style={{ "--boot-delay": "300ms" }}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
