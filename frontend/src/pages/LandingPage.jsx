import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturedTournaments from "../components/landing/FeaturedTournaments";
import GamesRing2 from "../components/landing/GamesRing2";
import FinalCTA from "../components/landing/FinalCTA";
import Preloader from "../components/landing/Preloader";
import Reveal from "../components/motion/Reveal";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MessageCircle,
  Camera,
  AtSign,
  MonitorPlay,
  Gamepad2,
  Trophy,
  Handshake,
  Search,
  ClipboardList,
  ShieldCheck,
  Zap,
} from "lucide-react";

const aboutCards = [
  {
    icon: Gamepad2,
    title: "Players",
    body: "Discover tournaments, register and compete in games you love.",
    tone: "accent-border",
    glow: "bg-indigo-600/15",
  },
  {
    icon: Trophy,
    title: "Organizers",
    body: "Create tournaments, manage registrations and organize esports events.",
    glow: "bg-violet-600/15",
  },
  {
    icon: Handshake,
    title: "Sponsors",
    body: "Connect your brand with tournaments and support the esports ecosystem.",
    glow: "bg-violet-600/10",
  },
];

const steps = [
  {
    num: "01",
    title: "Create Account",
    body: "Join NexusPlay as a player, organizer or sponsor.",
  },
  {
    num: "02",
    title: "Find Your Opportunity",
    body: "Discover tournaments, players and esports opportunities.",
  },
  {
    num: "03",
    title: "Compete & Connect",
    body: "Register, compete, organize or support the esports community.",
  },
];

const features = [
  { icon: Gamepad2, label: "Multiple Games" },
  { icon: Search, label: "Tournament Discovery" },
  { icon: ClipboardList, label: "Easy Registration" },
  { icon: ShieldCheck, label: "Verified Organizers" },
  { icon: Handshake, label: "Sponsor Opportunities" },
  { icon: Zap, label: "Centralized Management" },
];

export function LandingPage() {
  const [, setReady] = useState(false);

  /* Smooth anchor scrolling: Lenis intercepts native anchor jumps, so
     delegate all in-page #anchor clicks through its scrollTo. */
  useEffect(() => {
    const handleAnchorClick = (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return undefined;

      const id = anchor.getAttribute("href").slice(1);
      if (!id) return undefined;

      const target = document.getElementById(id);
      if (!target) return undefined;

      event.preventDefault();

      /* NOTE: index.css sets html { scroll-padding-top: 96px } and Lenis
         honors it, so no extra offset is needed here — adding one
         double-compensates and overshoots the section. */
      if (window.__lenis) {
        window.__lenis.scrollTo(target);
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
      return undefined;
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <div className="np-dark-surface min-h-screen bg-[var(--np-bg-0)] text-white">
      <Preloader onDone={() => setReady(true)} />

      <LandingNavbar />

      <main>
        <HeroSection />

        <FeaturedTournaments />

        {/* Supported games — 3D ring with live info hub (Phase 7 P3-rev, owner-approved) */}
        <section
          id="games"
          aria-label="Supported games"
          className="relative overflow-hidden border-b border-white/10 bg-[var(--np-bg-1)] py-16 lg:py-24"
        >
          <div className="glow-orb left-[-8%] top-[-12%] h-80 w-80 bg-indigo-600/10" />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            {/* Header — eyebrow motif + display heading (§5.2) */}
            <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
              <div className="max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400 sm:text-xs lg:text-sm">
                  Supported Games
                </p>
                <h2 className="font-display mt-2 text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
                  Pick your battleground.
                </h2>
                <p className="mt-3 max-w-[60ch] text-xs leading-6 text-slate-400 sm:text-sm lg:text-base lg:leading-7">
                  From tactical shooters to battle royales — every title on
                  NexusPlay ships with its own tournament kit, brackets and                  prize pool support.
                </p>
              </div>

              <a
                href="#tournaments"
                className="btn-press accent-text-bright link-underline flex items-center gap-1 text-xs font-semibold lg:text-sm"
              >
                Browse tournaments
              </a>
            </div>

            <GamesRing2 />

            {/* Footer strip — closes the section */}
            <div
              className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[var(--np-bg-2)]/60 px-4 py-3.5 sm:px-6"
              data-reveal
            >
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
                <Gamepad2 className="h-4 w-4 accent-text-bright" aria-hidden="true" />
                More games added every season
              </p>
              <a
                href="#tournaments"
                className="btn-press rounded-full bg-[var(--np-accent)] px-4 py-1.5 text-[10px] font-bold text-white transition hover:bg-[var(--np-accent-strong)] sm:text-xs"
              >
                Compete now
              </a>
            </div>
          </div>
        </section>

        {/* About */}
        <Reveal>
          <section
            id="about"
            className="relative overflow-hidden border-b border-white/10 bg-[var(--np-bg-1)] py-14 lg:py-20"
          >
            <div className="glow-orb right-[-6%] top-[-10%] h-80 w-80 bg-indigo-600/10" />

            <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="max-w-3xl" data-reveal>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400 sm:text-xs lg:text-sm">
                  About NexusPlay
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                  One platform for the esports ecosystem.
                </h2>

                <p className="mt-3 max-w-[65ch] text-xs leading-6 text-slate-400 sm:text-sm sm:leading-6 lg:text-base lg:leading-7">
                  NexusPlay is an esports tournament management platform
                  connecting players, tournament organizers and sponsors in one
                  unified ecosystem.
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3 lg:mt-10 lg:gap-5">
                {aboutCards.map((card, index) => (
                  <div
                    key={card.title}
                    data-reveal
                    className={`card-lift group relative overflow-hidden rounded-xl border bg-[var(--np-bg-2)] p-5 lg:p-6 ${card.tone}`}
                    style={{ "--reveal-delay": `${index * 110}ms` }}
                  >
                    <div
                      className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${card.glow} opacity-0`}
                    />

                    <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-[var(--np-bg-1)] accent-text-bright">
                      <card.icon className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <h3 className="relative text-sm font-bold lg:text-lg">
                      {card.title}
                    </h3>

                    <p className="relative mt-2 text-[10px] leading-5 text-slate-400 lg:text-sm lg:leading-6">
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* How it works */}
        <Reveal>
          <section
            id="how-it-works"
            className="border-b border-white/10 bg-[var(--np-bg-0)] py-14 lg:py-20"
          >
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div data-reveal>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400 sm:text-xs lg:text-sm">
                  Simple Process
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                  How NexusPlay Works
                </h2>

                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-slate-400 sm:text-xs lg:text-sm lg:leading-6">
                  A simple and seamless experience for everyone in the esports
                  ecosystem.
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3 lg:mt-10 lg:gap-5">
                {steps.map((step, index) => (
                  <div
                    key={step.num}
                    data-reveal
                    className="group relative rounded-xl border border-white/10 bg-[var(--np-bg-2)] p-5 transition-colors duration-300 hover:border-[color-mix(in_srgb,var(--np-accent)_45%,transparent)] lg:p-6"
                    style={{ "--reveal-delay": `${index * 110}ms` }}
                  >
                    <span className="text-2xl font-black text-indigo-500/30 transition-colors duration-300 group-hover:text-indigo-500/70 lg:text-3xl">
                      {step.num}
                    </span>

                    <h3 className="mt-4 text-sm font-bold lg:text-lg">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-[10px] leading-5 text-slate-400 lg:text-sm lg:leading-6">
                      {step.body}
                    </p>

                    {index < steps.length - 1 && (
                      <span className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-indigo-500/50 to-transparent md:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Feature strip */}
        <Reveal>
          <section className="bg-[var(--np-bg-1)] py-10 lg:py-14">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
                {features.map((item, index) => (
                  <div
                    key={item.label}
                    data-reveal
                    className="btn-press flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-[var(--np-bg-2)] px-3 py-3 text-center transition-colors hover:border-[color-mix(in_srgb,var(--np-accent)_45%,transparent)] lg:px-4 lg:py-4"
                    style={{ "--reveal-delay": `${index * 70}ms` }}
                  >
                    <item.icon className="h-4 w-4 accent-text-bright" aria-hidden="true" />
                    <span className="text-[9px] font-semibold text-slate-300 lg:text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <FinalCTA />
      </main>

      <footer className="border-t border-white/10 bg-[var(--np-bg-0)]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-12">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-base font-bold sm:text-lg">
                Nexus<span className="text-indigo-500">Play</span>
              </p>

              <p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">
                Compete. Connect. Conquer.
              </p>

              <p className="mt-4 max-w-xs text-[9px] leading-5 text-slate-600 sm:text-[10px]">
                A unified esports platform connecting players, organizers and
                sponsors.
              </p>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold text-white sm:text-xs lg:text-sm">
                Platform
              </h3>

              <div className="mt-3 space-y-2.5">
                <a
                  href="#tournaments"
                  className="link-underline block w-fit text-[9px] text-slate-500 transition hover:text-slate-300 sm:text-[10px] lg:text-xs"
                >
                  Tournaments
                </a>

                <a
                  href="#about"
                  className="link-underline block w-fit text-[9px] text-slate-500 transition hover:text-slate-300 sm:text-[10px] lg:text-xs"
                >
                  About
                </a>

                <a
                  href="#how-it-works"
                  className="link-underline block w-fit text-[9px] text-slate-500 transition hover:text-slate-300 sm:text-[10px] lg:text-xs"
                >
                  How It Works
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold text-white sm:text-xs lg:text-sm">
                Support
              </h3>

              <div className="mt-3 space-y-2.5">
                <Link
                  to="/unauthorized"
                  className="link-underline block w-fit text-[9px] text-slate-500 transition hover:text-slate-300 sm:text-[10px] lg:text-xs"
                >
                  Help Center
                </Link>

                <Link
                  to="/unauthorized"
                  className="link-underline block w-fit text-[9px] text-slate-500 transition hover:text-slate-300 sm:text-[10px] lg:text-xs"
                >
                  Contact Us
                </Link>

                <Link
                  to="/unauthorized"
                  className="link-underline block w-fit text-[9px] text-slate-500 transition hover:text-slate-300 sm:text-[10px] lg:text-xs"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold text-white sm:text-xs lg:text-sm">
                Follow Us
              </h3>

              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href="#"
                  aria-label="Discord"
                  className="text-slate-500 transition hover:-translate-y-0.5 hover:text-indigo-400"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="text-slate-500 transition hover:-translate-y-0.5 hover:text-indigo-400"
                >
                  <Camera className="h-5 w-5" />
                </a>

                <a
                  href="#"
                  aria-label="X (Twitter)"
                  className="text-slate-500 transition hover:-translate-y-0.5 hover:text-indigo-400"
                >
                  <AtSign className="h-5 w-5" />
                </a>

                <a
                  href="#"
                  aria-label="YouTube"
                  className="text-slate-500 transition hover:-translate-y-0.5 hover:text-indigo-400"
                >
                  <MonitorPlay className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-[9px] text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:text-[10px] lg:text-xs">
            <p>© {new Date().getFullYear()} NexusPlay. All rights reserved.</p>

            <p className="flex flex-col gap-0.5 sm:items-end">
              <span>Built for the Esports Community.</span>
              <span>
                3D ring model by Poly by Google (CC-BY 3.0) via{" "}
                <a
                  href="https://poly.pizza/m/5jiuuz7sOV_"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-dotted transition hover:text-indigo-400"
                >
                  poly.pizza
                </a>
                {" "}· arena kit by{" "}
                <a
                  href="https://kenney.nl/assets/mini-arena"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-dotted transition hover:text-indigo-400"
                >
                  Kenney
                </a>{" "}
                (CC0)
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
