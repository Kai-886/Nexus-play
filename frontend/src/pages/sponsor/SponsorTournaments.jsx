import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Search,
  CalendarDays,
  Users,
  Handshake,
  DollarSign,
  Clock,
  MapPin,
  Gamepad2,
} from "lucide-react";

import { tournamentService } from "../../services/tournamentService";
import { SponsorModal } from "../../components/sponsor/SponsorModal";
import { toast } from "sonner";

export function SponsorTournaments() {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const games = [
    "all",
    "Valorant",
    "BGMI",
    "Counter-Strike 2",
    "Free Fire",
    "Apex Legends",
  ];

  // ============================================================
  // HELPERS
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "TBA";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return "Date TBA";

    const start = formatDate(startDate);

    if (!endDate) {
      return start;
    }

    return `${start} - ${formatDate(endDate)}`;
  };

  const formatAmount = (amount) => {
    const value = Number(amount || 0);

    if (!value) {
      return "Free";
    }

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const getPrizePool = (tournament) => {
    if (tournament.prizePool) {
      return Number(tournament.prizePool);
    }

    if (tournament.totalPrizePool) {
      return Number(tournament.totalPrizePool);
    }

    if (Array.isArray(tournament.prizePools)) {
      return tournament.prizePools.reduce((total, prize) => {
        if (typeof prize === "number") {
          return total + prize;
        }

        return (
          total + Number(prize?.amount || prize?.value || prize?.prize || 0)
        );
      }, 0);
    }

    return 0;
  };

  const getBanner = (tournament) => {
    return (
      tournament.banner?.url ||
      tournament.bannerImage?.url ||
      tournament.bannerImage ||
      tournament.bannerUrl ||
      tournament.image?.url ||
      tournament.image ||
      null
    );
  };

  const getOrganizerName = (tournament) => {
    if (typeof tournament.organizer === "string") {
      return tournament.organizer.organizationName;
    }

    return (
      tournament.organizer?.organizationName ||
      tournament.organizer?.name ||
      tournament.organizer?.organization ||
      "Verified Organizer"
    );
  };

  const getParticipantText = (tournament) => {
    const current = Number(tournament.currentParticipants || 0);

    const max = Number(tournament.maxParticipants || 0);

    if (!max) {
      return `${current} registered`;
    }

    return `${current}/${max} registered`;
  };

  // ============================================================
  // LOAD TOURNAMENTS
  // ============================================================

  const loadTournaments = async () => {
    try {
      setLoading(true);

      /*
       * Backend pagination defaults to a small number of results.
       * Request a large page so sponsors can browse all published
       * tournaments.
       */
      const res = await tournamentService.getAll();

      let list = [];

      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.tournaments)) {
        list = res.tournaments;
      } else if (Array.isArray(res?.data?.tournaments)) {
        list = res.data.tournaments;
      }

      // Only published tournaments are sponsorship opportunities
      list = list.filter((tournament) => tournament.status === "published");

      setTournaments(list);
    } catch (error) {
      console.error("Failed to fetch sponsor tournaments:", error);

      toast.error("Could not load tournaments");

      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await loadTournaments();
    };
    run();
  }, []);

  // ============================================================
  // SPONSOR MODAL
  // ============================================================

  const handleSponsorClick = (tournament) => {
    setSelectedTournament(tournament);
    setIsModalOpen(true);
  };

  const closeSponsorModal = () => {
    setSelectedTournament(null);
    setIsModalOpen(false);
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredTournaments = tournaments.filter((tournament) => {
    const title = (tournament.title || tournament.name || "").toLowerCase();

    const organizer = getOrganizerName(tournament).toLowerCase();

    const game = (tournament.game || "").toLowerCase();

    const search = searchQuery.toLowerCase().trim();

    const matchesSearch =
      title.includes(search) ||
      organizer.includes(search) ||
      game.includes(search);

    const matchesGame =
      selectedGame === "all" || game === selectedGame.toLowerCase();

    return matchesSearch && matchesGame;
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div>
        <p className="np-eyebrow">Sponsor Portal</p>

        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight theme-text mt-1">
          Browse Tournaments Seeking Sponsors
        </h1>

        <p className="text-xs md:text-sm theme-subtext mt-1.5">
          Explore published tournaments and submit sponsorship proposals
          directly to their organizers.
        </p>
      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}
      <div className="theme-card border theme-border rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 theme-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournament, game, or organizer..."
              className="theme-input w-full pl-10 pr-4 py-2.5 text-xs rounded-xl outline-none"
            />
          </div>

          {/* Game Filters — tactile press tabs (§6.3) */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 scrollbar-none">
            {games.map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`btn-press px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  selectedGame === game
                    ? "[background:var(--np-accent)] text-white shadow-sm"
                    : "theme-icon-box border theme-border theme-subtext theme-hover"
                }`}
              >
                {game === "all" ? "All Games" : game}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          RESULT COUNT
      ====================================================== */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-xs theme-subtext">
            Showing{" "}
            <span className="font-bold theme-text tabular-nums">
              {filteredTournaments.length}
            </span>{" "}
            tournament
            {filteredTournaments.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}
      {loading ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <p className="text-xs theme-subtext">
            Loading tournaments available for sponsorship...
          </p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        /* ====================================================
           EMPTY
        ===================================================== */
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl theme-icon-box border theme-border flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 theme-subtext" />
          </div>

          <h3 className="text-sm font-bold theme-text">
            No tournaments found
          </h3>

          <p className="text-xs theme-subtext max-w-sm mx-auto mt-1">
            Try adjusting your search query or selecting a different game.
          </p>
        </div>
      ) : (
        /* ====================================================
           TOURNAMENT GRID — row stagger (§8.3)
        ===================================================== */
        <div className="np-stagger grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTournaments.map((tournament) => {
            const tournamentId = tournament._id || tournament.id;

            const banner = getBanner(tournament);

            const prizePool = getPrizePool(tournament);

            const currentParticipants = Number(
              tournament.currentParticipants || 0,
            );

            const maxParticipants = Number(tournament.maxParticipants || 0);

            return (
              <div
                key={tournamentId}
                className="theme-card border theme-border rounded-2xl overflow-hidden flex flex-col group transition-all duration-200 hover:border-[var(--np-accent)]/40"
              >
                {/* ==================================================
                    BANNER
                =================================================== */}
                <div className="relative h-44 sm:h-48 overflow-hidden zoom-img">
                  {banner ? (
                    <img
                      src={banner}
                      alt={tournament.title || "Tournament banner"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--np-accent) 55%, var(--np-bg-1)) 0%, color-mix(in srgb, var(--np-accent-2) 28%, var(--np-bg-1)) 55%, var(--np-bg-0) 100%)",
                      }}
                    >
                      <Trophy className="w-14 h-14 text-white/20" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Game */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase">
                      <Gamepad2 className="w-3 h-3" />
                      {tournament.game || "Esports"}
                    </span>
                  </div>

                  {/* Prize Pool */}
                  <div className="absolute top-3 right-3">
                    <div className="px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10">
                      <p className="text-[9px] text-white/60 uppercase font-semibold">
                        Prize Pool
                      </p>

                      <p className="text-sm font-black text-[var(--np-warning)] tabular-nums">
                        ₹{Number(prizePool).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Tournament Type */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-semibold text-white/80">
                      {tournament.tournamentType === "team"
                        ? "Team Tournament"
                        : "Solo Tournament"}
                    </span>
                  </div>
                </div>

                {/* ==================================================
                    CONTENT
                =================================================== */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Title */}
                  <div>
                    <h3 className="text-base font-bold theme-text line-clamp-2 leading-snug">
                      {tournament.title || tournament.name}
                    </h3>

                    {/* Organizer */}
                    <p className="text-xs theme-subtext mt-1.5">
                      Organized by{" "}
                      <span className="font-semibold theme-text">
                        {getOrganizerName(tournament)}
                      </span>
                    </p>

                    {/* Description */}
                    <p className="text-xs theme-subtext mt-2 line-clamp-2 leading-relaxed">
                      {tournament.description ||
                        "Published esports tournament available for sponsorship."}
                    </p>
                  </div>

                  {/* ==================================================
                      INFORMATION GRID
                  =================================================== */}
                  <div className="grid grid-cols-2 gap-2.5 mt-5">
                    {/* Date */}
                    <div className="rounded-xl border theme-border theme-icon-box p-2.5">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-[var(--np-accent-2)]" />

                        <span className="text-[9px] theme-subtext uppercase font-bold">
                          Date
                        </span>
                      </div>

                      <p className="text-[10px] theme-text font-semibold mt-1">
                        {formatDateRange(
                          tournament.startDate,
                          tournament.endDate,
                        )}
                      </p>
                    </div>

                    {/* Venue */}
                    <div className="rounded-xl border theme-border theme-icon-box p-2.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--np-accent-2)]" />

                        <span className="text-[9px] theme-subtext uppercase font-bold">
                          Venue
                        </span>
                      </div>

                      <p className="text-[10px] theme-text font-semibold mt-1 truncate">
                        {tournament.venue || "Online"}
                      </p>
                    </div>

                    {/* Entry Fee */}
                    <div className="rounded-xl border theme-border theme-icon-box p-2.5">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[var(--np-success)]" />

                        <span className="text-[9px] theme-subtext uppercase font-bold">
                          Entry Fee
                        </span>
                      </div>

                      <p className="text-[10px] theme-text font-semibold mt-1 tabular-nums">
                        {formatAmount(tournament.entryFee)}
                      </p>
                    </div>

                    {/* Participants */}
                    <div className="rounded-xl border theme-border theme-icon-box p-2.5">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[var(--np-accent-2)]" />

                        <span className="text-[9px] theme-subtext uppercase font-bold">
                          Participants
                        </span>
                      </div>

                      <p className="text-[10px] theme-text font-semibold mt-1 tabular-nums">
                        {getParticipantText(tournament)}
                      </p>
                    </div>
                  </div>

                  {/* Registration Deadline */}
                  {tournament.registrationDeadline && (
                    <div className="flex items-center gap-2 mt-4 text-[10px] theme-subtext">
                      <Clock className="w-3.5 h-3.5 text-[var(--np-warning)] shrink-0" />

                      <span>
                        Registration closes{" "}
                        <span className="font-semibold theme-text">
                          {formatDate(tournament.registrationDeadline)}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Capacity */}
                  {maxParticipants > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] theme-subtext font-semibold">
                          Tournament Capacity
                        </span>

                        <span className="text-[9px] theme-subtext tabular-nums">
                          {currentParticipants}/{maxParticipants}
                        </span>
                      </div>

                      <div className="h-1.5 rounded-full bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              (currentParticipants / maxParticipants) * 100,
                              100,
                            )}%`,
                            background:
                              "linear-gradient(90deg, var(--np-accent), var(--np-accent-3))",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* ==================================================
                      ACTIONS
                  =================================================== */}
                  <div className="pt-4 mt-5 border-t theme-border flex items-center justify-between gap-3">
                    <button
                      onClick={() =>
                        navigate(`/sponsor/tournaments/${tournamentId}`)
                      }
                      className="text-xs font-semibold theme-subtext hover:theme-text cursor-pointer transition"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleSponsorClick(tournament)}
                      className="btn-press np-press flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer [background:var(--np-accent)] hover:[background:var(--np-accent-strong)] transition"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      Sponsor Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================
          SPONSOR MODAL
      ====================================================== */}
      {selectedTournament && (
        <SponsorModal
          tournament={selectedTournament}
          isOpen={isModalOpen}
          onClose={closeSponsorModal}
          onSuccess={() => {
            closeSponsorModal();
            loadTournaments();
          }}
        />
      )}
    </div>
  );
}

export default SponsorTournaments;
