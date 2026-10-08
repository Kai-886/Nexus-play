import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, Search } from "lucide-react";
import { toast } from "sonner";
import { participantService } from "../../services/participantService";
import { ParticipantRegistrationModal } from "../../components/participant/ParticipantRegistrationModal";
import { Button } from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import useTilt from "../../components/motion/useTilt";
import usePressFeedback from "../../components/motion/usePressFeedback";
import { gameTheme } from "../../utils/gameTheme";

/* TournamentCard — one motion response per element: the card tilts;
   buttons inside carry the press ripple. The top edge carries the
   game's theme gradient (gameTheme, PRD §5.1) so dashboard cards
   read as the same system as the landing GameArt plates. */
function TournamentCard({ tournament, isRegistered, onRegister }) {
  const { tiltProps } = useTilt({ maxTilt: 4 });
  const game = gameTheme(tournament.game);
  const navigate = useNavigate();
  const detailPath = `/participant/tournaments/${tournament._id || tournament.id}`;

  return (
    <div
      className="tilt-card theme-card theme-border relative overflow-hidden rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-xs transition-shadow duration-300 hover:shadow-[var(--np-glow)]"
      {...tiltProps}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: game.gradient }}
      />

      <div className="tilt-glare" />

      <div className="relative space-y-3">
        {/* Game and Status */}
        <div className="flex items-center justify-between gap-2">
          <Badge tone="accent">{tournament.game}</Badge>

          <Badge status={tournament.status} />
        </div>

        {/* Tournament Information — title navigates to the detail page */}
        <div>
          <h3
            onClick={() => navigate(detailPath)}
            className="theme-hover w-fit cursor-pointer text-sm font-bold theme-text transition line-clamp-1 hover:text-[var(--np-accent-2)]"
            title="View tournament details"
          >
            {tournament.title}
          </h3>

          <p className="text-[11px] theme-subtext mt-1">
            Organizer:{" "}
            <span className="theme-text font-medium">
              {tournament.organizerName || "Official Arena"}
            </span>
          </p>
        </div>

        {/* Tournament Details */}
        <div className="grid grid-cols-2 gap-2 theme-icon-box border theme-border p-3 rounded-xl text-xs">
          <div>
            <p className="text-[10px] theme-subtext font-medium">Prize Pool</p>

            <p className="font-bold text-[var(--np-success)] mt-0.5 tabular-nums">
              ₹
              {(Number(tournament.prizePool) || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-[10px] theme-subtext font-medium">Entry Fee</p>

            <p className="font-bold theme-text mt-0.5 tabular-nums">
              {tournament.entryFee ? `₹${tournament.entryFee}` : "Free"}
            </p>
          </div>

          <div>
            <p className="text-[10px] theme-subtext font-medium">Date &amp; Time</p>

            <p className="font-bold theme-text mt-0.5 text-[11px] tabular-nums">
              {tournament.startDate
                ? new Date(tournament.startDate).toLocaleDateString("en-IN")
                : "TBA"}
            </p>
          </div>

          <div>
            <p className="text-[10px] theme-subtext font-medium">Slots Filled</p>

            <p className="font-bold theme-text mt-0.5 text-[11px] tabular-nums">
              {tournament.filledSlots} / {tournament.maxSlots}
            </p>
          </div>
        </div>
      </div>

      {/* Registration Button */}
      <div className="relative">
        {isRegistered ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--np-success)]/30 bg-[color-mix(in_srgb,var(--np-success)_10%,transparent)] px-5 py-3 font-semibold text-[var(--np-success)]">
            <CheckCircle2 className="h-5 w-5" />
            Already Registered
          </div>
        ) : (tournament.status || "").toLowerCase() !== "published" ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border theme-border bg-black/5 dark:bg-white/5 px-5 py-3 font-semibold theme-subtext">
            <Lock className="h-5 w-5" />
            Registration Closed
          </div>
        ) : (
          <Button
            onClick={() => onRegister(tournament)}
            className="w-full"
          >
            Register Now
          </Button>
        )}
      </div>
    </div>
  );
}

export const ParticipantTournaments = () => {
  /* One shared ripple driver for the filter tabs (spawn point is
     per-click via event.currentTarget, so reuse is safe). */
  const { className: tabPressClass, ...tabPressRest } = usePressFeedback();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [registeredTournamentIds, setRegisteredTournamentIds] = useState(
    new Set(),
  );

  // Controls the Register Form Modal
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMyRegistrations = async () => {
    try {
      const response = await participantService.getMyRegistrations();

      const registrations = response?.data || response?.registrations || [];

      const ids = new Set(
        registrations
          .map((registration) => {
            const tournament =
              registration.tournament?._id ||
              registration.tournament?.id ||
              registration.tournament;

            return tournament?.toString();
          })
          .filter(Boolean),
      );

      setRegisteredTournamentIds(ids);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);

      let list = [];

      // 1. Fetch tournaments from backend API
      try {
        if (
          participantService &&
          typeof participantService.getTournaments === "function"
        ) {
          const res = await participantService.getTournaments();
          list = res?.tournaments || [];
        }
      } catch (backendErr) {
        console.warn(
          "Backend fetch failed. Retrieving tournaments from local storage:",
          backendErr,
        );
      }

      // 2. Read local storage arrays
      const readArray = (key) => {
        try {
          return JSON.parse(localStorage.getItem(key) || "[]");
        } catch {
          return [];
        }
      };

      const localTournaments = readArray("nexus_tournaments");
      const myTournaments = readArray("my_tournaments");
      const localRegistrations = readArray("participant_registrations");
      const myRegistrations = readArray("my_registrations");

      // 3. Collect registered tournament IDs
      const allRegisteredIds = [
        ...localRegistrations,
        ...myRegistrations.map(
          (registration) =>
            registration.tournamentId || registration.id || registration._id,
        ),
      ].map(String);

      // 4. Deduplicate and normalize tournaments
      const combinedMap = new Map();

      [...list, ...localTournaments, ...myTournaments].forEach((item) => {
        const key = String(item._id || item.id || item.title || item.name);

        if (!key) return;

        const isRegistered =
          allRegisteredIds.includes(key) ||
          item.isRegistered ||
          item.status === "registered" ||
          false;

        combinedMap.set(key, {
          ...item,
          _id: key,
          id: key,
          title: item.title || item.name || "Untitled Tournament",
          game: item.game || "Esports",
          prizePool: item.prizePool || item.totalPrizePool || 0,
          maxSlots:
            item.maxSlots || item.maxParticipants || item.maxTeams || 16,
          filledSlots:
            item.filledSlots ||
            item.currentParticipants ||
            (isRegistered ? 1 : 0),
          isRegistered,
          status: item.status || "published",
        });
      });

      setTournaments(Array.from(combinedMap.values()));
    } catch (error) {
      console.error("Failed to process tournaments list:", error);

      toast.error("Failed to load tournaments list");
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await Promise.all([fetchTournaments(), fetchMyRegistrations()]);
    };
    run();
  }, []);

  const handleOpenRegisterModal = (tournament) => {
    setSelectedTournament(tournament);
    setIsModalOpen(true);
  };

  // Filter tournaments
  const filteredTournaments = tournaments.filter((item) => {
    const status = item.status?.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.game?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Hide completed tournaments
    if (status === "completed") return false;

    const tournamentId = (item._id || item.id)?.toString();
    const isRegistered =
      item.isRegistered || registeredTournamentIds.has(tournamentId);

    // My registrations
    if (filter === "registered") {
      return isRegistered;
    }

    // Live tournaments
    if (filter === "live") {
      return status === "live" || status === "ongoing";
    }

    // Upcoming and published tournaments
    if (filter === "upcoming") {
      return status === "upcoming" || status === "published";
    }

    // All other non-completed tournaments
    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Header and Search */}
      <div className="theme-card border theme-border p-6 rounded-2xl shadow-xs w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold theme-text">
            Esports Arena Tournaments
          </h1>

          <p className="text-xs theme-subtext mt-1">
            Browse available tournaments, register your squad, and compete for
            prize pools.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search game or event..."
            className="w-full theme-card border theme-border rounded-xl px-3.5 py-2 text-xs theme-text focus:outline-none focus:border-[var(--np-accent)] pl-9"
          />

          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 theme-subtext" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Tournaments" },
          { id: "registered", label: "My Registrations" },
          { id: "upcoming", label: "Upcoming / Open" },
          { id: "live", label: "Live Now" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`btn-press ${tabPressClass} px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filter === tab.id
                ? "[background:var(--np-accent)] text-white shadow-sm"
                : "theme-card border theme-border theme-subtext theme-hover"
            }`}
            {...tabPressRest}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="p-12 text-center text-xs theme-subtext theme-card border theme-border rounded-2xl">
          Fetching available tournaments...
        </div>
      ) : filteredTournaments.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center text-xs theme-subtext theme-card border theme-border rounded-2xl">
          No tournaments found matching your criteria.
        </div>
      ) : (
        /* Tournament Cards — row stagger on the grid (§8.3) */
        <div className="np-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredTournaments.map((tournament) => {
            const tournamentId = (tournament._id || tournament.id)?.toString();
            const isRegistered =
              tournament.isRegistered ||
              registeredTournamentIds.has(tournamentId);

            return (
              <TournamentCard
                key={tournament._id || tournament.id}
                tournament={tournament}
                isRegistered={isRegistered}
                onRegister={handleOpenRegisterModal}
              />
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      {selectedTournament && (
        <ParticipantRegistrationModal
          tournament={selectedTournament}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTournament(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedTournament(null);
            fetchTournaments();
            fetchMyRegistrations();
          }}
        />
      )}
    </div>
  );
};

export default ParticipantTournaments;