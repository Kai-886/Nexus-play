import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VARIANT_FROM = {
  default: { opacity: 0, y: 32 },
  left: { opacity: 0, x: -40 },
  right: { opacity: 0, x: 40 },
  scale: { opacity: 0, scale: 0.92 },
};

/**
 * Reveal — GSAP ScrollTrigger reveal for all descendants carrying
 * [data-reveal]. Same API as the previous CSS system:
 *
 *   <Reveal>
 *     <div data-reveal>...</div>
 *     <div data-reveal="left" style={{ "--reveal-delay": "120ms" }}>...</div>
 *   </Reveal>
 *
 * Elements are visible in the static markup (good for no-JS/SEO);
 * GSAP sets the hidden state via .from() and animates in.
 * Honors prefers-reduced-motion by skipping all animation.
 */
export function Reveal({ children, className = "", as: Tag = "div", ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return undefined;

    const targets = root.querySelectorAll("[data-reveal]");
    if (targets.length === 0) return undefined;

    const ctx = gsap.context(() => {
      targets.forEach((el) => {
        const variant =
          el.getAttribute("data-reveal") || "default";

        const from = {
          ...(VARIANT_FROM[variant] || VARIANT_FROM.default),
          duration: 0.85,
          ease: "power3.out",
        };

        const delayVar = el.style.getPropertyValue("--reveal-delay");
        if (delayVar) from.delay = parseFloat(delayVar) / 1000 || 0;

        gsap.from(el, {
          ...from,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}

export default Reveal;
