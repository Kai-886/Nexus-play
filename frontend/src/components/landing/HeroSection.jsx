import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroBg from "../../assets/landing/hero.webp";
import Lazy3D from "../three/Lazy3D";
import useCountUp from "../motion/useCountUp";

gsap.registerPlugin(ScrollTrigger);

const words = ["Compete.", "Connect.", "Conquer."];

const stats = [
  { value: 10000, suffix: "+", label: "Active Players" },
  { value: 500, suffix: "+", label: "Tournaments" },
  { value: 100, suffix: "+", label: "Organizers" },
  { value: 50, suffix: "+", label: "Sponsors" },
];

/* Animated stat numeral (PRD §6.3 useCountUp) */
function StatValue({ value, suffix }) {
  const { ref, display } = useCountUp({
    value,
    format: (n) => `${Math.round(n).toLocaleString("en-IN")}${suffix}`,
  });

  return (
    <p ref={ref} className="font-display text-lg font-semibold tabular-nums lg:text-2xl">
      {display}
    </p>
  );
}

/* Static fallback content for the WebGL-off case (rendered as poster layer) */
function Hero3DFallback() {
  return null;
}

export default function HeroSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return undefined;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) return undefined;

    const ctx = gsap.context(() => {
      /* 1. Split headline into characters for kinetic entry.
            Preserves any inner styled span (e.g. the gradient
            word) by carrying its className onto each char. */
      const headline = root.querySelector("[data-headline]");
      const chars = [];
      if (headline) {
        headline.querySelectorAll("[data-word]").forEach((word) => {
          const text = word.textContent;
          word.setAttribute("aria-label", text);

          // Find an inner styled span (gradient etc.), if any
          const styledInner = word.querySelector("span[class]");
          const carryClass = styledInner ? styledInner.className : null;

          word.textContent = "";
          [...text].forEach((ch) => {
            const span = document.createElement("span");
            span.textContent = ch;
            span.setAttribute("aria-hidden", "true");
            span.style.display = "inline-block";
            if (carryClass) span.className = carryClass;
            word.appendChild(span);
            chars.push(span);
          });
        });
      }

      /* 2. Load-in: chars rise + rotate in, then UI fades up */
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.from(chars, {
        opacity: 0,
        y: 64,
        rotateX: -80,
        duration: 0.9,
        stagger: 0.028,
      })
        .from(
          "[data-hero-eyebrow]",
          { opacity: 0, y: 18, duration: 0.6 },
          0.1
        )
        .from(
          "[data-hero-sub]",
          { opacity: 0, y: 24, duration: 0.7 },
          "-=0.55"
        )
        .from(
          "[data-hero-cta]",
          { opacity: 0, y: 24, duration: 0.7 },
          "-=0.5"
        )
        .from(
          "[data-hero-stats]",
          { opacity: 0, y: 28, duration: 0.8 },
          "-=0.45"
        );

      /* 3. Scroll: pin the hero; bg scales, headline lifts away,
            stats slide up as the next section arrives */
      /* Phase 7 P2 (round 2): the owner still saw an empty band
         between the hero and the bento — the pin window kept the
         hero on screen with its copy already faded out. Keep the
         copy on stage for the WHOLE pin (small lift, one late
         subtle dim), shorten the pin to +=40%, and let the next
         section cover the hero instead of revealing bare backdrop.
         Round 3: scrub 0.8 → true. Smoothed scrub keeps easing
         toward the scroll position AFTER the pin releases, which
         read as a lag right at the hero→bento handoff; with Lenis
         already smoothing the wheel, 1:1 scrub stays silky and
         perfectly in sync. */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=40%",
            pin: true,
            scrub: true,
            anticipatePin: 1,
          },
        })
        .to("[data-hero-bg]", { scale: 1.14, yPercent: 9, ease: "none" }, 0)
        .to(
          "[data-hero-orbs]",
          { yPercent: 18, ease: "none" },
          0
        )
        .to(
          "[data-hero-inner]",
          { yPercent: -6, ease: "none" },
          0
        )
        .to(
          "[data-hero-inner]",
          { opacity: 0.55, ease: "none", duration: 0.28 },
          0.72
        );

      /* Keep images from breaking pin measurements */
      const imgs = root.querySelectorAll("img");
      imgs.forEach((img) => {
        if (!img.complete) {
          img.addEventListener(
            "load",
            () => ScrollTrigger.refresh(),
            { once: true }
          );
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--np-bg-0)]"
    >
      {/* LAYER 1 — background */}
      <div
        data-hero-bg
        className="absolute inset-0 will-change-transform"
      >
        <img
          src={heroBg}
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[var(--np-bg-0)] via-[var(--np-bg-0)]/75 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--np-bg-0)] via-transparent to-[var(--np-bg-0)]/30" />
      </div>

        {/* LAYER 1b — procedural 3D scene (lazy chunk, WebGL-gated;
            the image + gradients above stay as the no-WebGL backdrop) */}
        <Lazy3D
          className="absolute inset-0"
          load={() => import("../three/HeroScene")}
          fallback={<Hero3DFallback />}
          placeholder={null}
        />

      {/* LAYER 2 — glow orbs */}
      <div data-hero-orbs className="absolute inset-0 will-change-transform">
        <div
          className="glow-orb left-[8%] top-[18%] h-72 w-72 bg-indigo-600/25"
          style={{ animationDelay: "-3s" }}
        />
        <div
          className="glow-orb bottom-[8%] right-[14%] h-80 w-80 bg-violet-600/20"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      {/* LAYER 3 — content */}
      <div
        data-hero-inner
        className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-10 pt-28 sm:px-8 lg:px-10 lg:pb-16"
      >
        <div className="max-w-xl lg:max-w-2xl">
          <p
            data-hero-eyebrow
            className="mb-4 inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-300"
          >
            India's Esports Tournament Platform
          </p>

          <h1
            data-headline
            className="font-display text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-tight"
            style={{ perspective: "800px" }}
          >
            {words.map((word) => (
              <span key={word} className="block overflow-visible" data-word>
                {word === "Conquer." ? (
                  <span className="text-gradient">{word}</span>
                ) : (
                  word
                )}
              </span>
            ))}
          </h1>

          <p
            data-hero-sub
            className="mt-5 max-w-lg text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6 lg:text-base lg:leading-7"
          >
            Discover and participate in exciting esports tournaments. Connect
            with players, organizers and sponsors, all in one platform.
          </p>

          <div data-hero-cta className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#tournaments"
              className="btn-press group inline-flex items-center gap-2 rounded-full bg-indigo-600 py-2 pl-5 pr-2 text-xs font-bold shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 sm:py-2.5 sm:pl-6 sm:pr-2.5 lg:text-sm"
            >
              Explore Tournaments
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>

            <Link
              to="/register"
              className="btn-press rounded-full border border-white/20 bg-black/20 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10 sm:text-sm"
            >
              Create an Account
            </Link>
          </div>
        </div>

        {/* Stats strip — count-up on viewport entry (useCountUp) */}
        <div
          data-hero-stats
          className="mt-10 grid max-w-3xl grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-4 lg:mt-12 lg:max-w-4xl lg:gap-8 lg:pt-6"
        >
          {stats.map(({ value, suffix, label }) => (
            <div key={label}>
              <StatValue value={value} suffix={suffix} />
              <p className="text-[9px] uppercase tracking-wider text-slate-500 sm:text-[10px] lg:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
