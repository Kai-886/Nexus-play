import { useEffect, useState } from "react";
import {
  TrendingUp,
  Download,
  Printer,
  Users,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../../services/adminService";
import { Button } from "../../components/ui/Button";

export function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const data = await adminService.getReports();

        setReports(data?.data || data);
      } catch (error) {
        console.error("Failed to load reports:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load reports",
        );

        setReports(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(reports, null, 2));

    const link = document.createElement("a");

    link.setAttribute("href", dataStr);

    link.setAttribute(
      "download",
      `nexusplay_executive_report_${new Date().toISOString().split("T")[0]}.json`,
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Executive report exported in JSON format");
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs theme-subtext">
        Generating analytics report...
      </div>
    );
  }

  if (!reports) {
    return (
      <div className="space-y-6">
        <div>
          <p className="np-eyebrow">Executive Reports</p>

          <h1 className="font-display text-2xl font-bold theme-text mt-1">
            Platform Reports & Strategic Analytics
          </h1>
        </div>

        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl theme-icon-box border theme-border flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 theme-subtext" />
          </div>

          <h3 className="text-sm font-bold theme-text">
            Report unavailable
          </h3>

          <p className="text-xs theme-subtext max-w-md mx-auto mt-1">
            The analytics service could not be reached. Try again in a moment.
          </p>

          <Button size="sm" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const gameBreakdown = reports?.gameBreakdown || [];

  const userGrowth = reports?.userGrowth || [];

  const maxUsers = Math.max(...userGrowth.map((m) => m.users || 0), 1);

  const latestGrowth = userGrowth[userGrowth.length - 1]?.users || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="np-eyebrow">Executive Reports</p>

          <h1 className="font-display text-2xl font-bold theme-text mt-1">
            Platform Reports & Strategic Analytics
          </h1>

          <p className="text-xs md:text-sm theme-subtext">
            Comprehensive breakdown of user growth trajectory and game category
            distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint} icon={Printer}>
            Print Report
          </Button>

          <Button size="sm" onClick={handleExportJSON} icon={Download}>
            Export JSON
          </Button>
        </div>
      </div>

      {/* Headline metrics — bound to the reports payload, no placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="theme-card border theme-border rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider theme-subtext">
            Total Player Registrations
          </p>

          <p className="text-2xl font-black theme-text mt-2 tabular-nums font-display">
            {latestGrowth.toLocaleString("en-IN")}
          </p>

          <p className="text-[11px] text-[var(--np-success)] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {userGrowth.length > 1
              ? `${latestGrowth.toLocaleString("en-IN")} registered to date`
              : "Cumulative registered players"}
          </p>
        </div>

        <div className="theme-card border theme-border rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider theme-subtext">
            Platform Commission Earned
          </p>

          <p className="text-2xl font-black text-[var(--np-accent-2)] mt-2 tabular-nums font-display">
            ₹{(reports?.totalCommissionEarned || 0).toLocaleString("en-IN")}
          </p>

          <p className="text-[11px] theme-subtext mt-1">Net platform revenue</p>
        </div>

        <div className="theme-card border theme-border rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider theme-subtext">
            Tournament Categories Tracked
          </p>

          <p className="text-2xl font-black theme-text mt-2 tabular-nums font-display">
            {gameBreakdown.length}
          </p>

          <p className="text-[11px] text-[var(--np-success)] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {gameBreakdown.reduce((sum, g) => sum + (g.count || 0), 0)}{" "}
            tournaments total
          </p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Distribution */}
        <div className="theme-card border theme-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold theme-text">
                Tournament Category Share
              </h2>

              <p className="text-xs theme-subtext">
                Distribution of tournaments hosted by title
              </p>
            </div>

            <PieChart className="w-4 h-4 text-[var(--np-accent-2)]" />
          </div>

          <div className="space-y-3 pt-2">
            {gameBreakdown.length === 0 ? (
              <p className="text-xs theme-subtext py-6 text-center">
                No tournament category data yet.
              </p>
            ) : (
              gameBreakdown.map((g) => (
                <div key={g.game} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="theme-text">{g.game}</span>

                    <span className="theme-subtext tabular-nums">
                      {g.count} tournaments ({g.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${g.percentage}%`,
                        background:
                          "linear-gradient(90deg, var(--np-accent), var(--np-accent-3))",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="theme-card border theme-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold theme-text">
                Active User Expansion
              </h2>

              <p className="text-xs theme-subtext">
                Cumulative registered players by month
              </p>
            </div>

            <Users className="w-4 h-4 text-[var(--np-accent-2)]" />
          </div>

          {userGrowth.length === 0 ? (
            <p className="text-xs theme-subtext py-6 text-center">
              No user growth data yet.
            </p>
          ) : (
            <div className="grid grid-cols-5 gap-2 pt-6 items-end h-48">
              {userGrowth.map((m) => {
                const heightPercent = Math.round(((m.users || 0) / maxUsers) * 100);

                return (
                  <div
                    key={m.month}
                    className="flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <span className="text-[10px] font-bold theme-subtext tabular-nums">
                      {m.users}
                    </span>

                    <div
                      className="w-full rounded-t-lg"
                      style={{
                        height: `${heightPercent}%`,
                        background:
                          "linear-gradient(180deg, var(--np-accent), color-mix(in srgb, var(--np-accent) 35%, transparent))",
                      }}
                    />

                    <span className="text-xs font-bold theme-text mt-1">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
