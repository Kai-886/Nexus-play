import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Gamepad2,
  Lock,
  MapPin,
  ShieldCheck,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { tournamentService } from "../../services/tournamentService";
import { participantService } from "../../services/participantService";
import { ParticipantRegistrationModal } from "../../components/participant/ParticipantRegistrationModal";
import { Button } from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import usePressFeedback from "../../components/motion/usePressFeedback";
import { gameTheme } from "../../utils/gameTheme";

const fmtDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "TBA";

const fmtDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "TBA";

/* ------------------------------------------------------------------ */
/*  Page — /participant/tournaments/:id                                */
/*  Live API: GET /tournaments/:id (detail) + GET /tournaments/:id/    */
/*  registration (my spot) + DELETE (withdraw). The CTA region swaps   */
/*  between four states (open / full / closed / registered) and each   */
/*  swap re-enters via np-boot so state changes read as arrival, not   */
/*  flicker.                                                           */
/* ------------------------------------------------------------------ */
export function ParticipantTournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [slots, setSlots] = useState(0);

  const [registration, setRegistration] = useState(null);
  const [regChecked, setRegChecked] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  /* Two-phase withdraw confirmation (auto-resets, no second modal) */
  const [confirming, setConfirming] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const confirmTimerRef = useRef(null);
  useEffect(
    () => () => clearTimeout(confirmTimerRef.current),
    [],
  );

  const { className: pressClass, ...pressRest } = usePressFeedback();

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await tournamentService.getById(id);
      if (!data?.tournament) throw new Error("missing tournament");
      setTournament(data.tournament);
      setSlots(Number(data.tournament.currentParticipants) || 0);
    } catch (error) {
      console.error("Failed to load tournament:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadRegistration = useCallback(async () => {
    setRegChecked(false);
    try {
      const data = await participantService.getMyRegistration(id);
      setRegistration(data?.registration || null);
    } catch (error) {
      /* 404 = not registered (the normal path for open tournaments);
         anything else still leaves the page usable via the open CTA. */
      if (error?.response?.status !== 404) {
        console.error("Failed to check registration:", error);
      }
      setRegistration(null);
    } finally {
      setRegChecked(true);
    }
  }, [id]);

  useEffect(() => {
    const run = async () => {
      await loadDetail();
    };
    run();
  }, [loadDetail]);

  useEffect(() => {
    const run = async () => {
      await loadRegistration();
    };
    run();
  }, [loadRegistration]);

  const startConfirm = () => {
    clearTimeout(confirmTimerRef.current);
    setConfirming(true);
    confirmTimerRef.current = setTimeout(() => setConfirming(false), 6000);
  };

  const cancelConfirm = () => {
    clearTimeout(confirmTimerRef.current);
    setConfirming(false);
  };

  const handleWithdraw = async () => {
    if (withdrawing) return;
    setWithdrawing(true);
    try {
      await participantService.cancelRegistration(id);
      setRegistration(null);
      setConfirming(false);
      setSlots((s) => Math.max(0, s - 1));
      toast.success("Registration withdrawn — your spot has been released.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Could not withdraw right now. Please try again.";
      toast.error(message);
      /* If the server says there is nothing to cancel, sync the UI. */
      if (error?.response?.status === 404) {
        setRegistration(null);
        setConfirming(false);
      }
    } finally {
      setWithdrawing(false);
    }
  };

  /* ------------------------------ states ------------------------------ */

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 theme-subtext">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--np-accent)] border-t-transparent" />
          <span className="text-sm font-medium">Loading tournament…</span>
        </div>
      </div>
    );
  }

  if (notFound || !tournament) {
    return (
      <div className="np-boot mx-auto max-w-md py-16 text-center">
        <div className="theme-card theme-border space-y-4 rounded-2xl border p-10">
          <Gamepad2 className="mx-auto h-8 w-8 theme-subtext" />
          <h2 className="theme-text text-lg font-bold">Tournament not found</h2>
          <p className="text-xs theme-subtext">
            It may have been removed, unpublished, or the link is out of date.
          </p>
          <Button onClick={() => navigate("/participant/tournaments")}>
            Back to Tournaments
          </Button>
        </div>
      </div>
    );
  }

  const game = gameTheme(tournament.game);
  const isTeam = (tournament.tournamentType || "").toLowerCase() === "team";
  const teamSize = Number(tournament.teamSize) || 0;
  const maxParticipants = Number(tournament.maxParticipants) || 0;
  const fillPct = maxParticipants
    ? Math.min(100, Math.round((slots / maxParticipants) * 100))
    : 0;

  const regOpen =
    (tournament.status || "").toLowerCase() === "published" &&
    (!tournament.registrationDeadline ||
      new Date(tournament.registrationDeadline) > new Date());
  const slotsFull = maxParticipants > 0 && slots >= maxParticipants;

  const organizerName =
    tournament.organizer?.organizationName || "Official Arena";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/participant/tournaments")}
        className="theme-hover theme-card theme-border flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold theme-subtext transition hover:theme-text"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Tournaments
      </button>

      {/* Hero */}
      <div className="theme-card theme-border relative overflow-hidden rounded-2xl border shadow-xs">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: game.gradient }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: game.accentSoft }}
        />

        <div className="relative space-y-6 p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{tournament.game}</Badge>
                <Badge status={tournament.status} />
                {isTeam && teamSize > 0 && (
                  <span className="theme-icon-box theme-subtext rounded-md border theme-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
                    Squad of {teamSize}
                  </span>
                )}
              </div>

              <h1 className="theme-text font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {tournament.title}
              </h1>

              <p className="text-xs leading-relaxed theme-subtext sm:text-sm">
                {tournament.description ||
                  "Official tournament hosted on NexusPlay. Compete for top positions."}
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-[11px] font-medium theme-subtext">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {fmtDateTime(tournament.startDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {tournament.venue || tournament.cityRegion || "Online"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Gamepad2 className="h-3.5 w-3.5" />
                  {isTeam ? "Team" : "Solo"} · {tournament.tournamentMode || "Online"}
                </span>
              </div>
            </div>

            {/* CTA — one region, four states, aria-live announces swaps */}
            <div
              aria-live="polite"
              className="w-full shrink-0 md:w-64"
              key={registration ? "registered" : regChecked ? "cta" : "checking"}
            >
              {registration ? (
                <RegisteredPanel
                  confirming={confirming}
                  withdrawing={withdrawing}
                  onStartConfirm={startConfirm}
                  onCancelConfirm={cancelConfirm}
                  onWithdraw={handleWithdraw}
                  pressClass={pressClass}
                  pressRest={pressRest}
                />
              ) : !regChecked ? (
                <div className="theme-icon-box theme-border rounded-xl border px-5 py-3.5 text-center text-xs font-semibold theme-subtext">
                  Checking your spot…
                </div>
              ) : regOpen && !slotsFull ? (
                <div className="np-boot space-y-2.5">
                  <Button onClick={() => setModalOpen(true)} className="w-full">
                    <UserPlus className="h-4 w-4" /> Register Now
                  </Button>
                  {tournament.registrationDeadline && (
                    <p className="text-center text-[10px] theme-subtext">
                      Closes {fmtDateTime(tournament.registrationDeadline)}
                    </p>
                  )}
                </div>
              ) : slotsFull ? (
                <LockedPill icon={<Users className="h-4 w-4" />}>
                  Slots Filled
                </LockedPill>
              ) : (
                <LockedPill icon={<Lock className="h-4 w-4" />}>
                  Registration Closed
                </LockedPill>
              )}
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
            <StatTile
              icon={<Trophy className="h-4 w-4 text-[var(--np-warning,#f59e0b)]" />}
              label="Prize Pool"
            >
              <p className="theme-text mt-0.5 text-base font-black tabular-nums">
                ₹
                {(Number(tournament.prizePool) || 0).toLocaleString("en-IN")}
              </p>
            </StatTile>

            <StatTile
              icon={<Clock className="h-4 w-4 text-[var(--np-success)]" />}
              label="Entry Fee"
            >
              <p className="theme-text mt-0.5 text-sm font-bold tabular-nums">
                {Number(tournament.entryFee) > 0
                  ? `₹${tournament.entryFee}`
                  : "Free Entry"}
              </p>
            </StatTile>

            <StatTile
              icon={<Users className="h-4 w-4 text-[var(--np-accent)]" />}
              label="Format"
            >
              <p className="theme-text mt-0.5 text-sm font-bold">
                {isTeam
                  ? `Squad (${teamSize || "—"} players)`
                  : "Solo (1v1)"}
              </p>
            </StatTile>

            <StatTile
              icon={<ShieldCheck className="h-4 w-4 text-[var(--np-accent-2,#8b5cf6)]" />}
              label="Slots Filled"
            >
              <p className="theme-text mt-0.5 text-sm font-bold tabular-nums">
                {slots} / {maxParticipants || "—"}
              </p>
              <SlotBar pct={fillPct} />
            </StatTile>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="theme-card theme-border space-y-4 rounded-2xl border p-6 md:col-span-2">
          <h3 className="theme-text flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <Gamepad2 className="h-4 w-4 text-[var(--np-accent)]" /> Rules &amp;
            Schedule
          </h3>
          <div className="space-y-3 text-xs leading-relaxed theme-subtext">
            {formatRules(tournament.rules).map((rule, i) => (
              <p key={i}>{rule}</p>
            ))}
          </div>
        </div>

        <div className="theme-card theme-border space-y-4 rounded-2xl border p-6">
          <h3 className="theme-text flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-[var(--np-success)]" /> Event
            Info
          </h3>
          <div className="space-y-2.5 text-xs theme-subtext">
            <InfoRow label="Organizer" value={organizerName} />
            <InfoRow label="Starts" value={fmtDateTime(tournament.startDate)} />
            <InfoRow label="Ends" value={fmtDateTime(tournament.endDate)} />
            <InfoRow
              label="Registration"
              value={`Closes ${fmtDate(tournament.registrationDeadline)}`}
            />
            <InfoRow
              label="Fair Play"
              value="Anti-cheat protocol enforced"
            />
          </div>
        </div>
      </div>

      {/* Registration modal (real API flow) */}
      {modalOpen && (
        <ParticipantRegistrationModal
          tournament={tournament}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            loadRegistration();
            loadDetail();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------ pieces ------------------------------ */

function StatTile({ icon, label, children }) {
  return (
    <div className="theme-icon-box theme-border space-y-1 rounded-xl border p-4">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide theme-subtext">
        {icon} {label}
      </span>
      {children}
    </div>
  );
}

/* Slot bar grows on mount (450ms expo-out); the global reduced-motion
   kill-switch flattens the transition for vestibular safety. */
function SlotBar({ pct }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setWidth(pct)),
    );
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  return (
    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
      <div
        className="h-full rounded-full bg-[var(--np-accent)]"
        style={{
          width: `${width}%`,
          transition: "width 0.45s var(--ease-out-expo)",
        }}
      />
    </div>
  );
}

function LockedPill({ icon, children }) {
  return (
    <div className="np-boot flex items-center justify-center gap-2 rounded-xl border theme-border bg-black/5 px-5 py-3.5 text-xs font-bold theme-subtext dark:bg-white/5">
      {icon}
      {children}
    </div>
  );
}

function RegisteredPanel({
  confirming,
  withdrawing,
  onStartConfirm,
  onCancelConfirm,
  onWithdraw,
  pressClass,
  pressRest,
}) {
  if (confirming) {
    return (
      <div className="np-boot space-y-2">
        <p className="text-center text-[11px] font-semibold theme-subtext">
          Release your spot? This can&rsquo;t be undone.
        </p>
        <Button
          type="button"
          disabled={withdrawing}
          onClick={onWithdraw}
          className={`w-full border border-[var(--np-danger,#f43f5e)] bg-[color-mix(in_srgb,var(--np-danger,#f43f5e)_14%,transparent)] font-bold text-[var(--np-danger,#f43f5e)] hover:bg-[color-mix(in_srgb,var(--np-danger,#f43f5e)_22%,transparent)] ${pressClass}`}
          {...pressRest}
        >
          {withdrawing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Withdrawing…
            </>
          ) : (
            "Confirm Withdrawal"
          )}
        </Button>
        <button
          type="button"
          onClick={onCancelConfirm}
          disabled={withdrawing}
          className="theme-hover w-full cursor-pointer rounded-xl px-5 py-2.5 text-xs font-bold theme-subtext transition hover:theme-text disabled:opacity-50"
        >
          Keep my spot
        </button>
      </div>
    );
  }

  return (
    <div className="np-boot space-y-2.5">
      <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--np-success)]/30 bg-[color-mix(in_srgb,var(--np-success)_10%,transparent)] px-5 py-3.5 text-xs font-bold text-[var(--np-success)]">
        <CheckCircle2 className="h-4 w-4" /> You&rsquo;re Registered
      </div>
      <p className="text-center text-[10px] leading-relaxed theme-subtext">
        Room credentials appear on your dashboard 15 minutes before start.
      </p>
      <button
        type="button"
        onClick={onStartConfirm}
        className="theme-hover w-full cursor-pointer rounded-xl border theme-border px-5 py-2.5 text-xs font-bold theme-subtext transition hover:border-[var(--np-danger,#f43f5e)]/40 hover:text-[var(--np-danger,#f43f5e)]"
      >
        Withdraw from tournament
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <p>
      <span className="font-bold theme-text">{label}:</span> {value}
    </p>
  );
}

function formatRules(rules) {
  if (Array.isArray(rules)) return rules.filter(Boolean);
  if (typeof rules === "string" && rules.trim()) {
    return rules
      .split(/\n+/)
      .map((r) => r.trim())
      .filter(Boolean);
  }
  return [
    "All team members must enter their verified Game UIDs and IGNs.",
    "Room credentials are provided 15 minutes prior to start in your dashboard.",
    "Emulators, hacks, or third-party tools result in an immediate ban.",
  ];
}

export default ParticipantTournamentDetailPage;
