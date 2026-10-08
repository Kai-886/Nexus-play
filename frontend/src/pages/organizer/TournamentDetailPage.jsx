import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tournamentService } from "../../services/tournamentService";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import Badge from "../../components/ui/Badge";

export function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (dateValue, timeValue) => {
    if (!dateValue) return "Not Set";

    try {
      const date = new Date(dateValue);

      if (isNaN(date.getTime())) {
        return "Not Set";
      }

      const formattedDate = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      // If a separate time is provided, use it.
      if (timeValue) {
        const [hours, minutes] = timeValue.split(":");

        const h = parseInt(hours, 10);

        if (!isNaN(h) && minutes !== undefined) {
          const ampm = h >= 12 ? "PM" : "AM";
          const formattedHours = h % 12 || 12;

          return `${formattedDate} at ${formattedHours}:${minutes} ${ampm}`;
        }
      }

      // If the backend Date already contains a time,
      // use the time from the Date object.
      const formattedTime = date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Not Set";
    }
  };

  const fetchDetail = useCallback(async () => {
    try {
      let data = null;

      // 1. Fetch from Backend API
      if (
        tournamentService &&
        typeof tournamentService.getById === "function"
      ) {
        try {
          const res = await tournamentService.getById(id);
          data = res?.data || res?.tournament || res;
        } catch (apiErr) {
          console.warn(
            "Backend API fetch failed, checking LocalStorage...",
            apiErr,
          );
        }
      }

      // 2. Fallback to LocalStorage
      if (!data || (!data._id && !data.id)) {
        const local1 = JSON.parse(
          localStorage.getItem("nexus_tournaments") || "[]",
        );
        const local2 = JSON.parse(
          localStorage.getItem("my_tournaments") || "[]",
        );
        data = [...local1, ...local2].find(
          (t) => String(t._id || t.id) === String(id),
        );
      }

      if (data) {
        setTournament(data);
      } else {
        toast.error("Failed to load tournament details");
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
      toast.error("Failed to load tournament details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const run = async () => {
      await fetchDetail();
    };
    run();
  }, [fetchDetail]);

  

  if (loading) {
    return (
      <div className="theme-card p-12 text-center rounded-2xl border">
        <p className="text-sm theme-subtext">
          Loading event management portal...
        </p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="theme-card p-12 text-center rounded-2xl border space-y-3">
        <h2 className="text-lg font-bold theme-text">Tournament Not Found</h2>
        <button
          type="button"
          onClick={() => navigate("/organizer/tournaments")}
          className="px-4 py-2 text-xs font-bold text-white [background:var(--np-accent)] rounded-lg cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const registeredSlots =
    tournament.currentParticipants||
    0;
  const maxSlots = tournament.maxParticipants || tournament.maxSlots || 16;
  const prizePoolAmount =
    Number(tournament.totalPrizePool) || Number(tournament.prizePool) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/organizer/tournaments")}
          className="theme-hover theme-text flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer"
         
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        
      </div>

      {/* Main Info Card */}
      <div className="theme-card p-6 rounded-2xl border shadow-xs space-y-6">
        {/* Banner Section */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6"
         
        >
          <div className="space-y-1.5">
            <Badge tone="accent">{tournament.game || "Esports"}</Badge>
            <span className="text-xs theme-subtext">
              •{" "}
              {Number(tournament.teamSize) > 1
                ? `Team (${tournament.teamSize} Players)`
                : "Solo (1v1)"}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold theme-text mt-1">
              {tournament.title || tournament.name}
            </h1>
            <p className="text-xs theme-subtext max-w-2xl">
              {tournament.description || "No description provided."}
            </p>
          </div>

          {/* Organizer Actions */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(`/organizer/tournaments/${id}/participants`)
              }
              className="px-4 py-2.5 text-xs font-bold text-white [background:var(--np-accent)] hover:[background:var(--np-accent-strong)] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> View Registered Teams (
              {registeredSlots})
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            className="p-3.5 rounded-xl border bg-[color-mix(in_srgb,var(--np-accent)_6%,transparent)]"
           
          >
            <span className="text-[10px] font-bold uppercase theme-subtext flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[var(--np-warning)]" /> Total Prize Pool
            </span>
            <p className="text-lg font-bold text-[var(--np-accent-2)] mt-1 tabular-nums">
              ₹{prizePoolAmount.toLocaleString("en-IN")}
            </p>
          </div>

          <div
            className="p-3.5 rounded-xl border bg-[color-mix(in_srgb,var(--np-accent)_6%,transparent)]"
           
          >
            <span className="text-[10px] font-bold uppercase theme-subtext flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[var(--np-accent-2)]" /> Total Slots
            </span>
            <p className="text-lg font-bold theme-text mt-1">
              {registeredSlots} / {maxSlots}
            </p>
          </div>

          <div
            className="p-3.5 rounded-xl border bg-[color-mix(in_srgb,var(--np-accent)_6%,transparent)]"
           
          >
            <span className="text-[10px] font-bold uppercase theme-subtext flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--np-success)]" /> Venue /
              Platform
            </span>
            <p className="text-sm font-bold theme-text mt-1 line-clamp-1">
              {tournament.venue || "Online"}
            </p>
          </div>

          <div
            className="p-3.5 rounded-xl border bg-[color-mix(in_srgb,var(--np-accent)_6%,transparent)]"
           
          >
            <span className="text-[10px] font-bold uppercase theme-subtext flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--np-danger)]" /> Registration Fee
            </span>
            <p className="text-sm font-bold theme-text mt-1">
              {Number(tournament.entryFee || tournament.registrationFee) > 0
                ? `₹${tournament.entryFee || tournament.registrationFee}`
                : "Free Entry"}
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div
          className="p-4 rounded-xl border space-y-3"
         
        >
          <h3 className="text-xs font-bold uppercase tracking-wider theme-subtext flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[var(--np-accent-2)]" /> Event Schedule &
            Timelines
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div
              className="p-2.5 rounded-lg border bg-[color-mix(in_srgb,var(--np-text-mute)_6%,transparent)]"
             
            >
              <span className="theme-subtext block text-[10px] uppercase font-bold">
                Registration Deadline
              </span>
              <span className="theme-text font-bold text-[var(--np-danger)]">
                {formatDateTime(
                  tournament.registrationDeadline,
                  tournament.registrationDeadlineTime || "23:59",
                )}
              </span>
            </div>

            <div
              className="p-2.5 rounded-lg border bg-[color-mix(in_srgb,var(--np-text-mute)_6%,transparent)]"
             
            >
              <span className="theme-subtext block text-[10px] uppercase font-bold">
                Event Start Date
              </span>
              <span className="theme-text font-bold">
                {formatDateTime(tournament.startDate, tournament.startTime)}
              </span>
            </div>

            <div
              className="p-2.5 rounded-lg border bg-[color-mix(in_srgb,var(--np-text-mute)_6%,transparent)]"
             
            >
              <span className="theme-subtext block text-[10px] uppercase font-bold">
                Event End Date
              </span>
              <span className="theme-text font-bold">
                {formatDateTime(tournament.endDate, tournament.endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Prize Pool Breakdown */}
        <div>
          <h3 className="text-sm font-bold theme-text mb-3">
            Configured Prize Breakdown
          </h3>
          {tournament.prizes && tournament.prizes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tournament.prizes.map((p, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 rounded-lg border text-xs"
                 
                >
                  <span className="font-semibold theme-text">
                    Rank {p.position || idx + 1}
                  </span>
                  <span className="font-bold text-[var(--np-success)]">
                    ₹{(Number(p.amount) || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs theme-subtext">No breakdown configured.</p>
          )}
        </div>

        {/* Rules & Regulations Section */}
        <div>
          <h3 className="text-sm font-bold theme-text mb-2 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-[var(--np-accent-2)]" /> Event Rules &
            Regulations
          </h3>
          <div
            className="p-3.5 rounded-xl border text-xs theme-subtext space-y-1.5"
           
          >
            {typeof tournament.rules === "string" ? (
              tournament.rules
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .map((r, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <span className="select-none">•</span>
                    <span>{r.replace(/^[•\-*\d+.]\s*/, "")}</span>
                  </p>
                ))
            ) : Array.isArray(tournament.rules) ? (
              tournament.rules.map((r, i) => (
                <p key={i} className="flex items-start gap-1.5">
                  <span className="select-none">•</span>
                  <span>{String(r).replace(/^[•\-*\d+.]\s*/, "")}</span>
                </p>
              ))
            ) : (
              <p>Standard fair play rules apply.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
