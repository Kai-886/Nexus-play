import { memo } from "react";
import { gameTheme } from "../../utils/gameTheme";
import bannerValorant from "../../assets/landing/tournament-valorant.webp";
import bannerBgmi from "../../assets/landing/tournament-bgmi.webp";
import bannerCs2 from "../../assets/landing/tournament-cs2.webp";
import bannerFreeFire from "../../assets/landing/tournament-free-fire.webp";
import bannerRocketLeague from "../../assets/landing/tournament-rocket-league.webp";
import bannerApex from "../../assets/landing/tournament-apex-legends.webp";
import bannerCod from "../../assets/landing/tournament-call-of-duty.webp";
import bannerDota from "../../assets/landing/tournament-dota.webp";

/**
 * GameArt — procedural per-game "3D-style" media plate (PRD Phase 7 P1).
 *
 * Deep-space accent gradient + perspective neon grid floor + a large
 * game emblem drawn as glowing SVG line-art (abstract geometry per game
 * — no emoji, no external images, zero payload). Reduced motion renders
 * the static composition.
 *
 * Props:
 *  - game:     title matched by gameTheme()
 *  - variant:  "card" | "showcase" (bigger emblem + name + genre)
 *  - className: passthrough sizing
 */

/* ---------------------------------------------------------------
   Emblems — stroke-based SVG line art in the game's accent color.
   Shared stroke props keep each emblem to one accent-driven <g>.
   --------------------------------------------------------------- */
function Emblem({ game, color }) {
  const stroke = {
    fill: "none",
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (game) {
    case "valorant":
      // Angular V under a sight bar
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" className="np-gameart-emblem">
          <g {...stroke}>
            <path d="M20 26 L48 78 L76 26" />
            <path d="M31 26 L48 58 L65 26" opacity="0.5" />
            <path d="M38 14 h20 M48 14 v8" opacity="0.8" />
          </g>
        </svg>
      );

    case "bgmi":
      // Combat helmet
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" className="np-gameart-emblem">
          <g {...stroke}>
            <path d="M22 56 a26 26 0 0 1 52 0 v8 h-52 z" />
            <path d="M22 64 h52" opacity="0.6" />
            <path d="M40 30 h16 M44 26 h8" opacity="0.5" />
            <path d="M34 48 h28" opacity="0.35" />
          </g>
        </svg>
      );

    case "counter-strike":
      // Crosshair over a center dot
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" className="np-gameart-emblem">
          <g {...stroke}>
            <circle cx="48" cy="48" r="20" />
            <path d="M48 16 v12 M48 68 v12 M16 48 h12 M68 48 h12" />
            <circle cx="48" cy="48" r="3.5" fill={color} />
            <path d="M48 30 a18 18 0 0 1 18 18" opacity="0.45" />
          </g>
        </svg>
      );

    case "free fire":
      // Flame
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" className="np-gameart-emblem">
          <g {...stroke}>
            <path d="M48 14 C58 28 70 36 70 54 a22 22 0 0 1 -44 0 C26 40 36 34 38 22 C42 30 46 32 48 26 Z" />
            <path d="M48 52 c6 4 8 8 8 12 a8 8 0 0 1 -16 0 c0 -4 2 -8 8 -12 Z" opacity="0.55" />
          </g>
        </svg>
      );

    case "rocket league":
      // Ball over a speed arc
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" className="np-gameart-emblem">
          <g {...stroke}>
            <circle cx="48" cy="46" r="18" />
            <path d="M30 46 a18 18 0 0 1 36 0" opacity="0.45" />
            <path d="M20 78 C34 66 62 66 76 78" />
            <path d="M28 84 C38 76 58 76 68 84" opacity="0.5" />
          </g>
        </svg>
      );

    case "apex legends":
      // Winged chevron
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" className="np-gameart-emblem">
          <g {...stroke}>
            <path d="M48 20 L72 44 L48 76 L24 44 Z" />
            <path d="M48 34 L62 48 L48 64 L34 48 Z" opacity="0.5" />
            <path d="M48 20 v56" opacity="0.3" />
          </g>
        </svg>
      );

    case "call of duty":
      // Dog-tag shield with star notch
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" className="np-gameart-emblem">
          <g {...stroke}>
            <path d="M30 20 h36 v34 a18 18 0 0 1 -18 20 a18 18 0 0 1 -18 -20 Z" />
            <path d="M48 32 l4.5 9 h10 l-8 6.5 3 10 -9.5 -6 -9.5 6 3 -10 -8 -6.5 h10 Z" opacity="0.55" />
            <path d="M30 30 h36" opacity="0.35" />
          </g>
        </svg>
      );

    case "dota":
      // Ancient sigil — diamond crest
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" className="np-gameart-emblem">
          <g {...stroke}>
            <path d="M48 16 L80 48 L48 80 L16 48 Z" />
            <path d="M48 32 L64 48 L48 64 L32 48 Z" opacity="0.5" />
            <path d="M16 48 h-6 M80 48 h6" opacity="0.6" />
          </g>
        </svg>
      );

    default:
      // Trophy
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" className="np-gameart-emblem">
          <g {...stroke}>
            <path d="M34 20 h28 v18 a14 14 0 0 1 -28 0 Z" />
            <path d="M34 26 h-8 a8 8 0 0 0 8 10 M62 26 h8 a8 8 0 0 1 -8 10" opacity="0.6" />
            <path d="M48 52 v10 M38 70 h20 M42 62 h12 l3 8 h-18 Z" />
          </g>
        </svg>
      );
  }
}

/* Perspective grid floor — pure CSS (accent-tinted lines receding to
   the horizon), reused on every plate so the set reads as one system. */
function GridFloor({ accent }) {
  return (
    <div
      aria-hidden="true"
      className="np-gameart-grid"
      style={{
        "--np-gameart-accent": accent,
      }}
    />
  );
}

/* Shipped photographic game banners (Phase 1 assets, compressed
   WebP). Keyed by the same lowercase slug the emblem switch uses.
   Games without art fall back to the procedural plate. */
const BANNERS = {
  valorant: bannerValorant,
  bgmi: bannerBgmi,
  "counter-strike": bannerCs2,
  "free fire": bannerFreeFire,
  "rocket league": bannerRocketLeague,
  "apex legends": bannerApex,
  "call of duty": bannerCod,
  dota: bannerDota,
};

function GameArtBase({ game = "", variant = "card", className = "" }) {
  const theme = gameTheme(game);
  const isShowcase = variant === "showcase";
  /* Emblem switch is keyed by lowercase slug — normalize once so
     both "VALORANT" and "Valorant Champions Cup" resolve. */
  const g = String(game).toLowerCase();
  const emblemKey =
    g.includes("valorant") ? "valorant"
    : g.includes("bgmi") || g.includes("pubg") ? "bgmi"
    : g.includes("counter") || g.includes("cs2") ? "counter-strike"
    : g.includes("free fire") ? "free fire"
    : g.includes("rocket league") ? "rocket league"
    : g.includes("apex") ? "apex legends"
    : g.includes("call of duty") || g.includes("codm") ? "call of duty"
    : g.includes("dota") ? "dota"
    : "default";
  const banner = BANNERS[emblemKey];

  return (
    <div
      className={`np-gameart ${isShowcase ? "np-gameart--showcase" : ""} ${className}`}
      style={{
        "--np-gameart-accent": theme.accent,
        "--np-gameart-accent-soft": theme.accentSoft,
        background: theme.gradient,
      }}
      role="img"
      aria-label={`${theme.name || "Tournament"} artwork`}
    >
      {/* Photographic game banner — full-bleed art with a dark scrim
          for caption legibility. Used by cards AND the ring plates;
          the procedural emblem remains the no-art fallback. */}
      {banner ? (
        <>
          <img
            src={banner}
            alt=""
            loading="lazy"
            draggable={false}
            className="np-gameart-photo"
          />
          <div className="np-gameart-scrim" aria-hidden="true" />
        </>
      ) : (
        <>
          {/* Horizon glow */}
          <div className="np-gameart-horizon" aria-hidden="true" />

          {/* Perspective grid floor */}
          <GridFloor accent={theme.accent} />

          {/* Emblem — floats subtly (static under reduced motion) */}
          <div className="np-gameart-figure" aria-hidden="true">
            <Emblem game={emblemKey} color={theme.accent} />
          </div>
        </>
      )}

      {/* Specular sheen on hover (CSS-only, one motion response) */}
      <div className="np-gameart-sheen" aria-hidden="true" />

      {isShowcase && (
        <div className="np-gameart-caption">
          <p className="np-gameart-name">{theme.name || "Tournament"}</p>
          <p className="np-gameart-genre">{theme.genre}</p>
        </div>
      )}
    </div>
  );
}

const GameArt = memo(GameArtBase);
export default GameArt;
