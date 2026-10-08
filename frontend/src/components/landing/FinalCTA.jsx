import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../motion/Reveal";
import Lazy3D from "../three/Lazy3D";
import footerBanner from "../../assets/landing/footer-bg.webp";

export default function FinalCTA() {
  return (
    <Reveal>
      <section className="relative overflow-hidden border-y border-white/10">
        <img
          src={footerBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-[var(--np-bg-0)]/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--np-bg-0)]/80 via-transparent to-[var(--np-bg-0)]/80" />

        <div
          className="glow-orb left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-indigo-600/20"
          style={{ animationDelay: "-4s" }}
        />

        {/* Procedural portal ring — lazy 3D chunk behind the copy (PRD §7.3) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-70">
          <Lazy3D
            className="h-[340px] w-[340px] max-w-full"
            load={() => import("../three/PortalScene")}
          />
        </div>

        <div className="relative mx-auto flex min-h-[220px] max-w-7xl items-center justify-center px-5 py-12 text-center">
          <div data-reveal="scale">
            <h2 className="text-2xl font-black sm:text-4xl">
              Ready to enter the arena?
            </h2>

            <p className="mt-2 text-[10px] text-slate-300 sm:text-xs">
              Join thousands of players, organizers and sponsors on NexusPlay.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <a
                href="#tournaments"
                className="btn-press group inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-[10px] font-bold shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 sm:px-5 sm:py-2.5 sm:text-xs"
              >
                Explore Tournaments
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <Link
                to="/register"
                className="btn-press rounded-md border border-white/30 bg-black/20 px-4 py-2 text-[10px] font-semibold backdrop-blur-sm transition hover:border-white/50 hover:bg-white/10 sm:px-5 sm:py-2.5 sm:text-xs"
              >
                Join NexusPlay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
