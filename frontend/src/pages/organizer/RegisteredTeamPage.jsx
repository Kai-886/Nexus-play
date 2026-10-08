import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserCheck,
  Mail,
  Phone,
  Gamepad2,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { tournamentService } from "../../services/tournamentService";

export function RegisteredTeamsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegisteredTeams = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await tournamentService.getRegisteredTeams(id);

      const data =
        response?.registrations ||
        response?.data?.registrations ||
        response?.data ||
        [];

      setRegistrations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Failed to fetch registered teams:",
        error
      );

      const message =
        error?.response?.data?.message ||
        "Failed to load registered teams.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTournament = useCallback(async () => {
    try {
      const response = await tournamentService.getById(id);

      const data =
        response?.data ||
        response?.tournament ||
        response;

      if (data) {
        setTournament(data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch tournament:",
        error
      );
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const run = async () => {
        await Promise.all([fetchTournament(), fetchRegisteredTeams()]);
      };
      run();
    }
  }, [id, fetchTournament, fetchRegisteredTeams]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--np-accent-2)] mx-auto mb-3" />

          <p className="theme-subtext text-sm">
            Loading registered teams...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <button
          type="button"
          onClick={() =>
            navigate(`/organizer/tournaments/${id}`)
          }
          className="theme-text flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border theme-border theme-hover cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />

          Back to Tournament
        </button>

        <div className="flex items-center gap-2 text-sm theme-subtext">
          <Users className="w-4 h-4 text-[var(--np-accent-2)]" />

          <span>
            Registered Teams:{" "}
            <strong className="theme-text">
              {registrations.length}
            </strong>
          </span>
        </div>
      </div>

      {/* Tournament Header */}
      <div className="theme-card border theme-border rounded-2xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <p className="np-eyebrow">Registered Participants</p>

            <h1 className="font-display text-2xl font-extrabold theme-text mt-1">
              {tournament?.title ||
                tournament?.name ||
                "Tournament"}
            </h1>

            <p className="text-xs theme-subtext mt-1">
              {tournament?.game || "Esports"}{" "}
              •{" "}
              {tournament?.tournamentType === "team"
                ? "Team Tournament"
                : "Solo Tournament"}
            </p>
          </div>

          <div className="px-4 py-3 rounded-xl border theme-border bg-[color-mix(in_srgb,var(--np-accent)_6%,transparent)] text-center">
            <p className="text-[10px] uppercase font-bold theme-subtext">
              Current Entries
            </p>

            <p className="text-2xl font-extrabold text-[var(--np-accent-2)]">
              {registrations.length}
            </p>
          </div>

        </div>
      </div>

      {/* Empty State */}
      {registrations.length === 0 ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">

          <div className="w-14 h-14 rounded-full bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-[var(--np-accent-2)]" />
          </div>

          <h2 className="text-lg font-bold theme-text">
            No Registered Teams Yet
          </h2>

          <p className="text-sm theme-subtext mt-2">
            No participants have registered for this
            tournament yet.
          </p>

        </div>
      ) : (
        /* Registration List — row stagger (§8.3) */
        <div className="np-stagger space-y-4">

          {registrations.map((registration, index) => {

            const players = Array.isArray(
              registration.players
            )
              ? registration.players
              : [];

            const captain =
              players.find((player) => player.user) ||
              players[0];

            return (
              <div
                key={
                  registration._id ||
                  registration.id ||
                  index
                }
                className="theme-card border theme-border rounded-2xl overflow-hidden"
              >

                {/* Registration Header */}
                <div className="p-5 border-b theme-border bg-[color-mix(in_srgb,var(--np-accent)_6%,transparent)]">

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-[var(--np-accent-2)]" />
                      </div>

                      <div>
                        <h2 className="font-bold theme-text">
                          {registration.teamName ||
                            `Registration #${index + 1}`}
                        </h2>

                        <p className="text-[11px] theme-subtext">
                          {registration.registrationType ===
                          "team"
                            ? "Team Registration"
                            : "Solo Registration"}
                        </p>
                      </div>

                    </div>

                    <div className="text-left md:text-right">

                      <p className="text-[10px] uppercase font-bold theme-subtext">
                        Registered On
                      </p>

                      <p className="text-xs font-semibold theme-text">
                        {formatDate(
                          registration.createdAt
                        )}
                      </p>

                    </div>

                  </div>
                </div>

                {/* Captain */}
                <div className="p-5 border-b theme-border">

                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="w-4 h-4 text-[var(--np-accent-2)]" />

                    <h3 className="text-xs font-bold uppercase theme-text">
                      Captain
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                    <div>
                      <p className="text-[10px] theme-subtext uppercase font-bold">
                        Name
                      </p>

                      <p className="text-sm font-semibold theme-text mt-1">
                        {captain?.fullName ||
                          registration.user?.name ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] theme-subtext uppercase font-bold">
                        Email
                      </p>

                      <p className="text-sm theme-text mt-1 flex items-center gap-1.5 break-all">
                        <Mail className="w-3.5 h-3.5 text-[var(--np-accent-2)] shrink-0" />

                        {captain?.email ||
                          registration.user?.email ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] theme-subtext uppercase font-bold">
                        WhatsApp
                      </p>

                      <p className="text-sm theme-text mt-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[var(--np-success)]" />

                        {captain?.phone ||
                          registration.captainContact?.whatsapp ||
                          "Not available"}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Players */}
                <div className="p-5">

                  <div className="flex items-center justify-between mb-3">

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--np-accent-2)]" />

                      <h3 className="text-xs font-bold uppercase theme-text">
                        Players
                      </h3>
                    </div>

                    <span className="text-[11px] theme-subtext">
                      {players.length}{" "}
                      {players.length === 1
                        ? "Player"
                        : "Players"}
                    </span>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {players.map((player, playerIndex) => (
                      <div
                        key={
                          player._id ||
                          playerIndex
                        }
                        className="border theme-border rounded-xl p-4 bg-black/5 dark:bg-white/5"
                      >

                        <div className="flex items-center justify-between mb-3">

                          <span className="text-[10px] uppercase font-bold text-[var(--np-accent-2)]">
                            Player {playerIndex + 1}
                          </span>

                          {playerIndex === 0 && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)] font-bold">
                              CAPTAIN
                            </span>
                          )}

                        </div>

                        <p className="text-sm font-bold theme-text">
                          {player.fullName ||
                            "Name not provided"}
                        </p>

                        <div className="mt-2 space-y-1.5">

                          <p className="text-[11px] theme-subtext flex items-center gap-2">
                            <Gamepad2 className="w-3.5 h-3.5 text-[var(--np-accent-2)] shrink-0" />

                            {player.gameUid ||
                              "IGN not provided"}
                          </p>

                          <p className="text-[11px] theme-subtext flex items-center gap-2 break-all">
                            <Mail className="w-3.5 h-3.5 text-[var(--np-accent-2)] shrink-0" />

                            {player.email ||
                              "Email not provided"}
                          </p>

                          <p className="text-[11px] theme-subtext flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[var(--np-success)] shrink-0" />

                            {player.phone ||
                              "Phone not provided"}
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>
                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}