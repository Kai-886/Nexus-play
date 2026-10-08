import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tournamentService } from "../../services/tournamentService.js";
import { useTournaments } from "../../context/TournamentContext.jsx";
import { Trophy, Users, Calendar, Plus, ChevronRight, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getOrganizerProfile } from "../../services/organizerService";
import { X, ShieldAlert } from "lucide-react";
import StatCard from "../../components/layout/shell/StatCard";
import { Button } from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export function DashboardPage() {
  const navigate = useNavigate();

  // NOTE: hooks must be unconditional — this context may legitimately
  // be missing data, but calling it conditionally breaks rules-of-hooks.
  const context = useTournaments();
  const contextTournaments = context?.tournaments;

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const [organizerProfile, setOrganizerProfile] = useState(null);
  const [showVerificationPopup, setShowVerificationPopup] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizerProfile = async () => {
      try {
        setProfileLoading(true);

        const data = await getOrganizerProfile();

        if (data.success && data.organizer) {
          setOrganizerProfile(data.organizer);
        }
      } catch (error) {
        console.error("Failed to fetch organizer profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user?.role === "organizer") {
      fetchOrganizerProfile();
    } else {
      const settle = () => {
        setProfileLoading(false);
      };
      settle();
    }
  }, [user?.role]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let apiData = [];

        if (tournamentService) {
          // Fetch organizer-specific tournaments strictly from backend API
          const fetchFn =
            tournamentService.getMy ||
            tournamentService.getOrganizerTournaments ||
            tournamentService.getAll;
          const response = await fetchFn();

          if (Array.isArray(response)) {
            apiData = response;
          } else if (Array.isArray(response?.data)) {
            apiData = response.data;
          } else if (Array.isArray(response?.tournaments)) {
            apiData = response.tournaments;
          } else if (Array.isArray(response?.data?.tournaments)) {
            apiData = response.data.tournaments;
          }
        }

        setTournaments(apiData);
      } catch (err) {
        console.error("Failed to load tournaments:", err);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const sourceList =
    Array.isArray(contextTournaments) && contextTournaments.length > 0
      ? contextTournaments
      : tournaments;

  const sortedTournaments = [...sourceList].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.startDate || 0);
    const dateB = new Date(b.createdAt || b.startDate || 0);
    return dateB - dateA;
  });

  const totalPrize = sortedTournaments.reduce((acc, curr) => {
    const pool =
      Number(curr.prizePool) ||
      Number(curr.totalPrizePool) ||
      Number(curr.entryFee) ||
      0;
    return acc + pool;
  }, 0);

  const activeCount = sortedTournaments.filter((t) => {
    const status = (t.status || "published").toLowerCase();
    return (
      status === "published" || status === "ongoing" || status === "upcoming"
    );
  }).length;

  const formatDate = (tournament) => {
    const dateVal =
      tournament?.startDate || tournament?.startTime || tournament?.createdAt;
    if (!dateVal) return "TBA";
    try {
      const parsed = new Date(dateVal);
      return isNaN(parsed.getTime()) ? "TBA" : parsed.toLocaleDateString();
    } catch {
      return "TBA";
    }
  };

  const handleCardClick = (tournamentId) => {
    if (tournamentId) {
      navigate(`/organizer/tournaments/${tournamentId}`);
    }
  };

  return (
    <div className="space-y-6">
      {!profileLoading &&
        user?.role === "organizer" &&
        (!organizerProfile ||
          organizerProfile.verificationStatus !== "verified") && (
          <div className="relative rounded-2xl border border-[var(--np-warning)]/25 bg-[color-mix(in_srgb,var(--np-warning)_10%,transparent)] p-5">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowVerificationPopup(false)}
              className="absolute right-4 top-4 theme-subtext hover:theme-text"
              aria-label="Close verification popup"
            >
              <X className="w-4 h-4" />
            </button>

            {showVerificationPopup && (
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="w-11 h-11 rounded-xl bg-[color-mix(in_srgb,var(--np-warning)_14%,transparent)] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-[var(--np-warning)]" />
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-bold theme-text">
                    Complete Organizer Verification
                  </h3>

                  <p className="text-xs theme-subtext">
                    {organizerProfile
                      ? "Your organizer profile is awaiting verification. Make sure all required details are submitted."
                      : "Please complete your organizer profile to proceed with verification."}
                  </p>

                  {organizerProfile?.verificationStatus && (
                    <p className="text-xs font-semibold text-[var(--np-warning)] capitalize">
                      Status: {organizerProfile.verificationStatus}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate("/organizer/profile")}
                    className="btn-press np-press mt-3 [background:var(--np-accent)] hover:[background:var(--np-accent-strong)] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="np-eyebrow">Organizer</p>

          <h1 className="font-display text-2xl font-bold theme-text mt-1">
            Organizer Dashboard
          </h1>

          <p className="text-sm theme-subtext">
            Manage active events, track registrations, and monitor prize pools.
          </p>
        </div>

        <Button type="button" onClick={() => navigate("/organizer/tournaments/create")} icon={Plus}>
          Create Tournament
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Tournaments"
          icon={Trophy}
          value={sortedTournaments.length}
          index={0}
        />

        <StatCard
          label="Active / Published"
          icon={Zap}
          iconTone="emerald"
          value={activeCount}
          index={1}
        />

        <StatCard
          label="Total Prize Pool"
          icon={Trophy}
          iconTone="amber"
          value={totalPrize}
          format={(n) => `₹${Math.round(n).toLocaleString("en-IN")}`}
          index={2}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold theme-text">Recent Tournaments</h2>
          <button
            type="button"
            onClick={() => navigate("/organizer/tournaments")}
            className="text-xs font-bold text-[var(--np-accent-2)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="theme-card p-8 text-center rounded-2xl border">
            <p className="text-sm theme-subtext">Loading dashboard events...</p>
          </div>
        ) : sortedTournaments.length === 0 ? (
          <div className="theme-card p-12 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] border border-[var(--np-accent)]/25 text-[var(--np-accent-2)] flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="theme-text font-bold text-base">
              No Tournaments Created Yet
            </h3>
            <p className="theme-subtext text-xs max-w-sm">
              Get started by creating your first esports tournament to manage
              matches and prize distribution.
            </p>
            <Button size="sm" icon={Plus} onClick={() => navigate("/organizer/tournaments/create")} className="mt-2">
              Create Now
            </Button>
          </div>
        ) : (
          <div className="np-stagger grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedTournaments.slice(0, 4).map((t) => {
              const tournamentId = t._id || t.id;

              return (
                <div
                  key={tournamentId}
                  onClick={() => handleCardClick(tournamentId)}
                  className="theme-card p-5 rounded-2xl border shadow-xs hover:border-[var(--np-accent)]/40 cursor-pointer transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge tone="accent">{t.game || "Esports"}</Badge>

                      <h3 className="text-base font-bold theme-text mt-1.5">
                        {t.title || t.name || "Untitled Tournament"}
                      </h3>
                    </div>

                    <Badge status={t.status || "published"} className="capitalize" />
                  </div>

                  <div
                    className="grid grid-cols-2 gap-2 text-xs theme-subtext pt-2 border-t"
                   
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(t)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {t.maxParticipants
                          ? `${t.maxParticipants} Teams`
                          : "Open"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
