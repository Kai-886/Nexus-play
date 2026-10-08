import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Users,
  Wallet,
  ArrowRight,
  CalendarDays,
  Gamepad2,
  UserCheck,
} from "lucide-react";

import { participantService } from "../../services/participantService";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/layout/shell/StatCard";
import { Button } from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export const ParticipantDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);

  // ---------------------------------------------------------
  // Fetch user's registrations
  // ---------------------------------------------------------
  const fetchRegistrations = async () => {
    try {
      setLoading(true);

      const response =
        await participantService.getMyRegistrations();

      const data =
        response?.registrations ||
        [];

      setRegistrations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Failed to fetch participant registrations:",
        error
      );

      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchRegistrations();
    };
    run();
  }, []);

  // ---------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------

  const getTournament = (registration) => {
    if (!registration?.tournament) {
      return null;
    }

    // If tournament is populated
    if (typeof registration.tournament === "object") {
      return registration.tournament;
    }

    return null;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Date not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTournamentId = (registration) => {
    if (!registration?.tournament) {
      return null;
    }

    if (typeof registration.tournament === "object") {
      return (
        registration.tournament._id ||
        registration.tournament.id
      );
    }

    return registration.tournament;
  };

  // ---------------------------------------------------------
  // Dashboard statistics
  // ---------------------------------------------------------

  const tournamentsJoined = registrations.length;

  const activeRegistrations = registrations.filter(
    (registration) => {
      const status =
        registration?.status?.toLowerCase();

      return (
        status !== "cancelled" &&
        status !== "rejected"
      );
    }
  ).length;

  // Earnings will remain 0 until tournament
  // results / prize distribution are implemented.
  const totalEarnings = 0;

  // Show only a few registrations on dashboard.
  const recentRegistrations = registrations.slice(0, 3);

  return (
    <div className="w-full space-y-6">

      {/* =====================================================
          WELCOME
      ====================================================== */}
      <div className="theme-card border theme-border rounded-2xl p-6">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>
            <p className="np-eyebrow">Participant Dashboard</p>

            <h1 className="font-display text-2xl md:text-3xl font-black tracking-tight theme-text mt-1.5">
              Welcome back,{" "}
              <span className="text-[var(--np-accent-2)]">
                {user?.fullName || user?.name || "Player"}
              </span>
            </h1>

            <p className="text-xs md:text-sm theme-subtext mt-2">
              Manage your tournament registrations and
              explore upcoming competitions.
            </p>
          </div>

          <Link to="/participant/tournaments" className="shrink-0">
            <Button iconRight={ArrowRight}>Explore Tournaments</Button>
          </Link>

        </div>
      </div>

      {/* =====================================================
          STATS
      ====================================================== */}      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Tournaments Joined"
          icon={Trophy}
          value={loading ? "..." : tournamentsJoined}
          hint="Total tournament registrations"
          index={0}
        />

        <StatCard
          label="Active Registrations"
          icon={UserCheck}
          iconTone="emerald"
          value={loading ? "..." : activeRegistrations}
          hint="Current active tournament entries"
          index={1}
        />

        <StatCard
          label="Total Earnings"
          icon={Wallet}
          iconTone="emerald"
          value={totalEarnings}
          format={(n) => `₹${Math.round(n).toLocaleString("en-IN")}`}
          hint="Prize earnings from completed tournaments"
          index={2}
        />
      </div>

      {/* =====================================================
          REGISTERED TOURNAMENTS
      ====================================================== */}
      <div className="theme-card border theme-border rounded-2xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b theme-border pb-4">

          <div>
            <h2 className="text-base font-bold theme-text">
              My Registered Tournaments
            </h2>

            <p className="text-xs theme-subtext mt-1">
              Tournaments you have registered for.
            </p>
          </div>

          <Link
            to="/participant/tournaments"
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--np-accent-2)] transition hover:text-[var(--np-accent-3)]"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

        </div>

        {/* Loading */}
        {loading ? (
          <div className="py-12 text-center text-xs theme-subtext">
            Loading your registrations...
          </div>
        ) : recentRegistrations.length === 0 ? (

          /* Empty State */
          <div className="py-12 text-center">

            <div className="w-12 h-12 rounded-xl theme-icon-box border theme-border flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 theme-subtext" />
            </div>

            <h3 className="text-sm font-bold theme-text">
              No Tournament Registrations
            </h3>

            <p className="text-xs theme-subtext mt-1 max-w-sm mx-auto">
              You haven't registered for any tournament
              yet. Explore available tournaments and join
              one to get started.
            </p>

            <Link to="/participant/tournaments" className="mt-4 inline-block">
              <Button size="sm" iconRight={ArrowRight}>
                Explore Tournaments
              </Button>
            </Link>

          </div>

        ) : (

          /* Registration List — row stagger (§8.3) */
          <div className="np-stagger space-y-3 mt-4">

            {recentRegistrations.map(
              (registration, index) => {

                const tournament =
                  getTournament(registration);

                const tournamentId =
                  getTournamentId(registration);

                const tournamentTitle =
                  tournament?.title ||
                  registration?.tournamentTitle ||
                  "Tournament";

                const game =
                  tournament?.game ||
                  registration?.game ||
                  "Esports";

                const tournamentType =
                  tournament?.tournamentType ||
                  registration?.registrationType ||
                  "solo";

                const teamName =
                  registration?.teamName;

                return (
                  <div
                    key={
                      registration?._id ||
                      registration?.id ||
                      index
                    }
                    className="theme-icon-box border theme-border rounded-xl p-4"
                  >

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                      {/* Tournament Info */}
                      <div className="min-w-0">

                        <div className="flex items-center gap-2 flex-wrap">

                          <Badge tone="accent">{game}</Badge>

                          <Badge tone="muted">{tournamentType}</Badge>

                        </div>

                        <h3 className="text-sm font-bold theme-text mt-2 truncate">
                          {tournamentTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">

                          {teamName && (
                            <p className="text-[11px] theme-subtext flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[var(--np-accent-2)]" />
                              {teamName}
                            </p>
                          )}

                          <p className="text-[11px] theme-subtext flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-[var(--np-accent-2)]" />
                            Registered{" "}
                            {formatDate(
                              registration?.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                      {/* Status + Action */}
                      <div className="flex items-center gap-3 shrink-0">

                        <Badge tone="success">Registered</Badge>

                        {tournamentId && (
                          <Link
                            to={`/participant/tournaments/${tournamentId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border theme-border theme-text text-[11px] font-bold theme-hover transition"
                          >
                            View
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Link
          to="/participant/tournaments"
          className="theme-card border theme-border rounded-2xl p-5 theme-hover transition group"
        >
          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] border border-[var(--np-accent)]/25 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-[var(--np-accent-2)]" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-bold theme-text">
                Explore Tournaments
              </h3>

              <p className="text-[11px] theme-subtext mt-1">
                Find tournaments and register your team.
              </p>
            </div>

            <ArrowRight className="w-4 h-4 text-[var(--np-accent-2)] group-hover:translate-x-1 transition-transform" />

          </div>
        </Link>

        <Link
          to="/participant/profile"
          className="theme-card border theme-border rounded-2xl p-5 theme-hover transition group"
        >
          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-[color-mix(in_srgb,var(--np-success)_12%,transparent)] border border-[var(--np-success)]/25 flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--np-success)]" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-bold theme-text">
                Manage Profile
              </h3>

              <p className="text-[11px] theme-subtext mt-1">
                Update your player information.
              </p>
            </div>

            <ArrowRight className="w-4 h-4 text-[var(--np-success)] group-hover:translate-x-1 transition-transform" />

          </div>
        </Link>

      </div>

    </div>
  );
};