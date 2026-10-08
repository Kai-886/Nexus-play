import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, ArrowRight, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "../motion/Reveal";
import GameArt from "./GameArt";
import { tournamentService } from "../../services/tournamentService";

/* ---------- helpers ---------- */

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "TBD";

const formatPrize = (num) =>
  typeof num === "number"
    ? `₹${num.toLocaleString("en-IN")}`
    : null;

function Countdown({ target }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = new Date(target).getTime() - now;
  if (!target || diff <= 0) return null;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const cell = (v, label) => (
    <div className="flex flex-col items-center rounded-lg border border-white/10 bg-black/30 px-2 py-1 backdrop-blur-sm">
      <span className="font-display text-sm font-semibold text-white">
        {String(v).padStart(2, "0")}
      </span>
      <span className="text-[8px] uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex gap-1.5" data-countdown>
      {cell(days, "d")}
      {cell(hours, "h")}
      {cell(mins, "m")}
      {cell(secs, "s")}
    </div>
  );
}

/* ---------- skeleton ---------- */

function SkeletonCard() {
  return (
    <div className="skeleton overflow-hidden rounded-2xl border border-white/5 bg-[var(--np-bg-2)]/60">
      <div className="h-44 w-full bg-white/5" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="h-5 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
      </div>
    </div>
  );
}

/* ---------- card ---------- */

function TournamentCard({ tournament, featured = false, delay = 0 }) {

  return (
    <div
      data-reveal="scale"
      className={`card-lift shine zoom-img group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--np-bg-2)] ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {/* Media — per-game GameArt plate (Phase 7 P1, gameTheme §5.1) */}
      <div
        className={`relative overflow-hidden ${
          featured ? "h-56 sm:h-full sm:min-h-[420px]" : "h-40"
        }`}
      >
        <GameArt
          game={tournament.game}
          className="absolute inset-0 h-full w-full"
        />

        {/* Legacy radial wash kept for generic/unknown games */}
        {!tournament.game && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.25),transparent_55%)]" />
        )}

        {/* Game chip */}
        {tournament.game && (
          <span className="float-soft absolute left-4 top-4 z-10 rounded-md border border-white/15 bg-[var(--np-bg-0)]/70 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white backdrop-blur-sm">
            {tournament.game}
          </span>
        )}

        {/* Countdown on the featured tile */}
        {featured && tournament.startDate && (
          <div className="absolute bottom-4 left-4">
            <Countdown target={tournament.startDate} />
          </div>
        )}

        {featured && (
          <div className="absolute bottom-4 right-4 flex flex-col items-end">
            <Trophy className="mb-1 h-4 w-4 text-amber-400" aria-hidden="true" />
            <span className="text-[9px] uppercase tracking-widest text-slate-400">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`p-4 lg:p-5 ${featured ? "sm:absolute sm:inset-x-0 sm:bottom-0 sm:bg-gradient-to-t sm:from-[var(--np-bg-0)] sm:via-[var(--np-bg-0)]/85 sm:to-transparent sm:p-6" : ""}`}>
        <h3
          className={`font-display font-semibold leading-tight ${
            featured ? "text-lg sm:text-2xl" : "text-sm"
          }`}
        >
          {tournament.title || "Untitled tournament"}
        </h3>

        <div
          className={`mt-3 space-y-1.5 text-[10px] text-slate-400 lg:text-xs ${
            featured ? "sm:text-sm" : ""
          }`}
        >
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-indigo-400" aria-hidden="true" />
            {[tournament.venue, tournament.cityRegion]
              .filter(Boolean)
              .join(", ") || "Online"}
          </div>

          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3 text-indigo-400" aria-hidden="true" />
            {formatDate(tournament.startDate)}
          </div>

          {typeof tournament.currentParticipants === "number" &&
            typeof tournament.maxParticipants === "number" && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-indigo-400" aria-hidden="true" />
                {tournament.currentParticipants}/{tournament.maxParticipants}{" "}
                teams
              </div>
            )}
        </div>

        <div
          className={`mt-4 flex items-center justify-between border-t border-white/5 pt-3 ${
            featured ? "sm:pt-4" : ""
          }`}
        >
          <div>
            <p className="text-[8px] uppercase tracking-widest text-slate-500 lg:text-[9px]">
              Prize Pool
            </p>
            <p
              className={`font-display font-semibold text-amber-400 ${
                featured ? "text-lg sm:text-2xl" : "text-xs"
              }`}
            >
              {formatPrize(tournament.prizePool) || "Announcing soon"}
            </p>
          </div>

          <Link
            to="/login"
            className="btn-press accent-border accent-soft-bg accent-text-bright rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-colors lg:px-4 lg:py-2 lg:text-xs"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- section ---------- */

export default function FeaturedTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    tournamentService
      .getLanding()
      .then((data) => {
        if (cancelled) return;
        setTournaments(data?.tournaments || []);
      })
      .catch(() => {
        /* silently degrade to the empty state */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* Featured = nearest upcoming; 4 standard tiles follow */
  const [featured, ...rest] = useMemo(() => tournaments, [tournaments]);
  const standard = rest.slice(0, 4);

  return (
    <Reveal>
      <section
        id="tournaments"
        className="border-b border-white/10 bg-[var(--np-bg-0)] py-14 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* Header — one focused message, display type */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              data-reveal
              className="font-display max-w-xl text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl"
            >
              Featured Tournaments
            </h2>

            <Link
              to="/login"
              data-reveal
              className="link-underline flex items-center gap-1 text-xs font-semibold text-indigo-400 lg:text-sm"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Bento: featured tile (2x2) + 4 standard tiles = 6 cells, no gaps */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {loading ? (
              <>
                <div className="sm:col-span-2 sm:row-span-2">
                  <SkeletonCard />
                </div>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : tournaments.length === 0 ? (
              <div
                data-reveal
                className="col-span-full rounded-2xl border border-dashed border-white/15 bg-[var(--np-bg-2)]/50 p-10 text-center"
              >
                <Trophy className="mx-auto mb-3 h-6 w-6 text-indigo-400" aria-hidden="true" />
                <p className="font-display text-lg font-semibold">
                  No tournaments live yet
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
                  Organizers are setting up the arena. Registered organizers can
                  publish the first tournament.
                </p>
                <Link
                  to="/register/organizer"
                  className="btn-press mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--np-accent)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--np-accent-strong)]"
                >
                  Become an organizer
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <>
                <TournamentCard
                  key={featured?._id || featured?.title || "featured"}
                  tournament={featured}
                  featured
                  delay={0}
                />
                {standard.map((t, i) => (
                  <TournamentCard key={t._id || t.title} tournament={t} delay={(i + 1) * 90} />
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
