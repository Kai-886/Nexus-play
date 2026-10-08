import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Clock,
  ShieldCheck,
  Trophy,
  ArrowRight,
  Handshake,
  Search,
} from "lucide-react";
import { sponsorService } from "../../services/sponsorService";
import StatCard from "../../components/layout/shell/StatCard";
import { Button } from "../../components/ui/Button";

export function SponsorDashboard() {
  const navigate = useNavigate();

  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await sponsorService.getMySponsorships();

      const deals = response?.data || [];

      setSponsorships(deals);
    } catch (error) {
      console.error("Failed to load sponsor dashboard:", error);

      setSponsorships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await loadDashboardData();
    };
    run();
  }, [loadDashboardData]);

  const pendingCount = sponsorships.filter(
    (deal) => deal.status === "pending",
  ).length;

  const approvedCount = sponsorships.filter(
    (deal) => deal.status === "approved",
  ).length;

  const activeCount = sponsorships.filter(
    (deal) => deal.status === "active",
  ).length;

  const totalPaid = sponsorships
    .filter((deal) => deal.paymentStatus === "paid")
    .reduce((total, deal) => total + Number(deal.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Hero panel — flat card level, brand gradient edge (§5.3) */}
      <div className="relative overflow-hidden rounded-2xl theme-card border theme-border p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-40"
          style={{
            background:
              "linear-gradient(115deg, transparent 0%, color-mix(in srgb, var(--np-accent) 14%, transparent) 60%, color-mix(in srgb, var(--np-accent-3) 10%, transparent) 100%)",
          }}
        />

        <div className="relative max-w-2xl">
          <p className="np-eyebrow">Sponsor Portal</p>

          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight theme-text mt-1.5">
            Manage Your{" "}
            <span className="np-display">Sponsorships</span>
          </h1>

          <p className="text-xs md:text-sm theme-subtext mt-2 leading-relaxed max-w-xl">
            Discover published tournaments, submit sponsorship proposals, and
            manage your approved sponsorships from one place.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <Button onClick={() => navigate("/sponsor/tournaments")} icon={Search} iconRight={ArrowRight}>
              Explore Tournaments
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/sponsor/sponsorships")}
              icon={Handshake}
            >
              My Sponsorships
            </Button>
          </div>
        </div>
      </div>

      {/* Stats — canonical StatCard tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Paid"
          icon={DollarSign}
          iconTone="emerald"
          value={totalPaid}
          format={(n) => `₹${Math.round(n).toLocaleString("en-IN")}`}
          hint="Successfully paid sponsorships"
          index={0}
        />

        <StatCard
          label="Pending"
          icon={Clock}
          iconTone="amber"
          value={pendingCount}
          hint="Awaiting organizer review"
          index={1}
        />

        <StatCard
          label="Approved"
          icon={ShieldCheck}
          value={approvedCount}
          hint="Waiting for payment"
          index={2}
        />

        <StatCard
          label="Active"
          icon={Trophy}
          value={activeCount}
          hint="Active sponsorships"
          index={3}
        />
      </div>

      {/* Opportunities */}
      <div className="theme-card border theme-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] border border-[var(--np-accent)]/25 flex items-center justify-center shrink-0">
              <Handshake className="w-5 h-5 text-[var(--np-accent-2)]" />
            </div>

            <div>
              <h2 className="text-lg font-bold theme-text">
                Sponsorship Opportunities
              </h2>

              <p className="text-xs theme-subtext mt-1">
                Published tournaments available for sponsorship
              </p>
            </div>
          </div>

          <Button variant="secondary" onClick={() => navigate("/sponsor/tournaments")} iconRight={ArrowRight} className="shrink-0">
            Browse Tournaments
          </Button>
        </div>
      </div>

      {/* Process */}
      <div className="theme-card border theme-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold theme-text">
              Sponsorship Process
            </h2>

            <p className="text-xs theme-subtext mt-1">
              How sponsorship works on NexusPlay
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="theme-icon-box border theme-border rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] flex items-center justify-center text-[var(--np-accent-2)] font-bold text-xs">
              1
            </div>

            <h3 className="text-sm font-bold theme-text mt-4">
              Submit Proposal
            </h3>

            <p className="text-xs theme-subtext mt-1.5 leading-relaxed">
              Select a published tournament and submit your sponsorship amount,
              requirements, and message.
            </p>
          </div>

          <div className="theme-icon-box border theme-border rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] flex items-center justify-center text-[var(--np-accent-2)] font-bold text-xs">
              2
            </div>

            <h3 className="text-sm font-bold theme-text mt-4">
              Organizer Review
            </h3>

            <p className="text-xs theme-subtext mt-1.5 leading-relaxed">
              The tournament organizer reviews your proposal and decides whether
              to approve or reject it.
            </p>
          </div>

          <div className="theme-icon-box border theme-border rounded-xl p-5">
            <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--np-success)_12%,transparent)] flex items-center justify-center text-[var(--np-success)] font-bold text-xs">
              3
            </div>

            <h3 className="text-sm font-bold theme-text mt-4">Payment</h3>

            <p className="text-xs theme-subtext mt-1.5 leading-relaxed">
              Once approved, payment becomes available and the sponsorship can
              move toward activation.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-[11px] theme-subtext text-center">
          Updating sponsorship information...
        </p>
      )}
    </div>
  );
}

export default SponsorDashboard;
