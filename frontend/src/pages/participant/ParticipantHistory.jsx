import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Gamepad2,
  Users,
  IndianRupee,
} from "lucide-react";
import { participantService } from "../../services/participantService";
import Badge from "../../components/ui/Badge";

export const ParticipantHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await participantService.getHistory();

      setHistoryData(res?.registrations || []);
    } catch (err) {
      console.error("Failed to load history:", err);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchHistory();
    };
    run();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTournamentType = (type) => {
    if (!type) return "N/A";

    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="theme-card border theme-border p-6 rounded-2xl shadow-xs w-full">
        <p className="np-eyebrow">Participant</p>

        <h1 className="font-display text-xl font-bold theme-text mt-1">
          Tournament History
        </h1>

        <p className="text-xs theme-subtext mt-1">
          View the tournaments you have participated in.
        </p>
      </div>


      {/* History */}
      <div className="theme-card border theme-border rounded-2xl overflow-hidden shadow-xs w-full">

        {/* Loading */}
        {loading ? (
          <div className="p-12 text-center text-xs theme-subtext">
            Fetching tournament history...
          </div>

        ) : historyData.length === 0 ? (

          /* Empty State */
          <div className="p-12 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] border border-[var(--np-accent)]/25 flex items-center justify-center mb-4">
              <Gamepad2
                size={24}
                className="text-[var(--np-accent-2)]"
              />
            </div>

            <h3 className="theme-text font-semibold text-sm">
              No Tournament History
            </h3>

            <p className="theme-subtext text-xs mt-1">
              You have not registered for any tournaments yet.
            </p>

          </div>

        ) : (

          /* Tournament List — row stagger (§8.3) */
          <div className="np-stagger divide-y theme-border">

            {historyData.map((registration) => {

              const tournament = registration.tournament;

              if (!tournament) return null;

              return (
                <div
                  key={registration._id}
                  className="p-5 sm:p-6 theme-hover transition"
                >

                  {/* Top Section */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    <div className="min-w-0">

                      <div className="flex items-start gap-3">

                        <div className="w-10 h-10 rounded-lg bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] border border-[var(--np-accent)]/25 flex items-center justify-center shrink-0">
                          <Gamepad2
                            size={19}
                            className="text-[var(--np-accent-2)]"
                          />
                        </div>

                        <div className="min-w-0">

                          <h2 className="theme-text font-bold text-sm sm:text-base truncate">
                            {tournament.title}
                          </h2>

                          <p className="theme-subtext text-xs mt-1">
                            {tournament.game}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* Tournament Status */}
                    <Badge
                      status={tournament.status}
                      className="self-start capitalize"
                    >
                      {tournament.status || "Unknown"}
                    </Badge>

                  </div>


                  {/* Tournament Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">

                    {/* Date */}
                    <div className="flex items-start gap-2.5">

                      <CalendarDays
                        size={16}
                        className="text-[var(--np-accent-2)] mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="theme-subtext text-[10px]">
                          Tournament Date
                        </p>

                        <p className="theme-text text-xs font-semibold mt-0.5">
                          {formatDate(tournament.startDate)}
                        </p>
                      </div>

                    </div>


                    {/* Type */}
                    <div className="flex items-start gap-2.5">

                      <Users
                        size={16}
                        className="text-[var(--np-accent-2)] mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="theme-subtext text-[10px]">
                          Tournament Type
                        </p>

                        <p className="theme-text text-xs font-semibold mt-0.5">
                          {formatTournamentType(
                            tournament.tournamentType
                          )}
                        </p>
                      </div>

                    </div>


                    {/* Venue */}
                    <div className="flex items-start gap-2.5">

                      <MapPin
                        size={16}
                        className="text-[var(--np-accent-2)] mt-0.5 shrink-0"
                      />

                      <div className="min-w-0">

                        <p className="theme-subtext text-[10px]">
                          Venue
                        </p>

                        <p className="theme-text text-xs font-semibold mt-0.5 truncate">
                          {tournament.venue || "Online"}
                        </p>

                      </div>

                    </div>


                    {/* Entry Fee */}
                    <div className="flex items-start gap-2.5">

                      <IndianRupee
                        size={16}
                        className="text-[var(--np-accent-2)] mt-0.5 shrink-0"
                      />

                      <div>

                        <p className="theme-subtext text-[10px]">
                          Entry Fee
                        </p>

                        <p className="theme-text text-xs font-semibold mt-0.5">
                          {tournament.entryFee > 0
                            ? `₹${Number(
                                tournament.entryFee
                              ).toLocaleString("en-IN")}`
                            : "Free"}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* Registration Information */}
                  <div className="mt-5 pt-4 border-t theme-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    <p className="theme-subtext text-[10px]">
                      Registered on{" "}
                      <span className="theme-text font-medium">
                        {formatDate(registration.createdAt)}
                      </span>
                    </p>

                    <span className="text-[10px] text-[var(--np-success)] font-semibold">
                      Registration Confirmed
                    </span>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default ParticipantHistory;