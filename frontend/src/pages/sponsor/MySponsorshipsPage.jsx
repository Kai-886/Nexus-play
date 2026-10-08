import { useEffect, useState } from "react";
import {
  Handshake,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Calendar,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { sponsorService } from "../../services/sponsorService";
import { toast } from "sonner";
import Badge from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export function MySponsorshipsPage() {
  const [sponsorships, setSponsorships] = useState([]);

  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD
  // ============================================================

  const loadSponsorships = async () => {
    try {
      setLoading(true);

      const response = await sponsorService.getMySponsorships();

      setSponsorships(response?.data || []);
    } catch (error) {
      console.error("Failed to load sponsorships:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load sponsorships.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await loadSponsorships();
    };
    run();
  }, []);

  // ============================================================
  // STATUS — canonical Badge tones (PRD §5.1)
  // ============================================================

  const getStatusTone = (status) => {
    switch (status) {
      case "pending":
        return "warning";

      case "approved":
        return "accent";

      case "active":
      case "completed":
        return "success";

      case "rejected":
        return "danger";

      default:
        return "muted";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;

      case "approved":
      case "active":
        return <CheckCircle className="w-4 h-4" />;

      case "rejected":
        return <XCircle className="w-4 h-4" />;

      default:
        return <Handshake className="w-4 h-4" />;
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="np-eyebrow">Sponsor Portal</p>

          <h1 className="font-display text-2xl font-bold theme-text mt-1">
            My Sponsorships
          </h1>

          <p className="text-xs md:text-sm theme-subtext mt-1">
            Track your sponsorship proposals, approvals, and payment status.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={loadSponsorships}
          disabled={loading}
          icon={RefreshCw}
          className={loading ? "shrink-0" : "shrink-0"}
        >
          Refresh
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <p className="text-xs theme-subtext">Loading your sponsorships...</p>
        </div>
      ) : sponsorships.length === 0 ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl theme-icon-box border theme-border flex items-center justify-center mx-auto mb-4">
            <Handshake className="w-6 h-6 theme-subtext" />
          </div>

          <h3 className="text-sm font-bold theme-text">
            No sponsorships yet
          </h3>

          <p className="text-xs theme-subtext max-w-md mx-auto mt-1">
            Once you submit a sponsorship proposal, it will appear here.
          </p>
        </div>
      ) : (
        <div className="np-stagger space-y-4">
          {sponsorships.map((sponsorship) => {
            const tournament = sponsorship.tournamentId;

            const tournamentTitle =
              tournament?.title || sponsorship.tournamentTitle || "Tournament";

            const game = tournament?.game || sponsorship.game || "Esports";

            return (
              <div
                key={sponsorship._id}
                className="theme-card border theme-border rounded-2xl p-5"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={getStatusTone(sponsorship.status)}>
                        <span className="inline-flex items-center gap-1.5 capitalize">
                          {getStatusIcon(sponsorship.status)}
                          {sponsorship.status}
                        </span>
                      </Badge>

                      <span className="text-[10px] theme-subtext">
                        Payment:{" "}
                        <span className="font-semibold theme-text capitalize">
                          {sponsorship.paymentStatus || "not_required"}
                        </span>
                      </span>
                    </div>

                    <h2 className="text-lg font-bold theme-text mt-3">
                      {tournamentTitle}
                    </h2>

                    <p className="text-xs theme-subtext mt-1">{game}</p>
                  </div>

                  {/* Amount */}
                  <div className="shrink-0">
                    <p className="text-[10px] theme-subtext uppercase tracking-wider">
                      Sponsorship Amount
                    </p>

                    <p className="text-xl font-black text-[var(--np-accent-2)] mt-1 tabular-nums">
                      ₹{Number(sponsorship.amount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
                  <div className="theme-icon-box border theme-border rounded-xl p-3">
                    <p className="text-[10px] theme-subtext uppercase">
                      Submitted
                    </p>

                    <p className="text-xs font-semibold theme-text mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--np-accent-2)]" />

                      {sponsorship.createdAt
                        ? new Date(sponsorship.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  <div className="theme-icon-box border theme-border rounded-xl p-3">
                    <p className="text-[10px] theme-subtext uppercase">
                      Tournament
                    </p>

                    <p className="text-xs font-semibold theme-text mt-1 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-[var(--np-accent-2)]" />

                      {tournament?.startDate
                        ? new Date(tournament.startDate).toLocaleDateString()
                        : "TBA"}
                    </p>
                  </div>

                  <div className="theme-icon-box border theme-border rounded-xl p-3">
                    <p className="text-[10px] theme-subtext uppercase">
                      Payment
                    </p>

                    <p className="text-xs font-semibold theme-text mt-1 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[var(--np-accent-2)]" />

                      {sponsorship.paymentStatus || "Not required"}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mt-4 theme-icon-box border theme-border rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider theme-subtext">
                    Sponsorship Requirements
                  </p>

                  <p className="text-xs theme-text mt-2 leading-relaxed">
                    {sponsorship.requirements || "No requirements provided."}
                  </p>
                </div>

                {/* Message */}
                {sponsorship.message && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider theme-subtext">
                      Message to Organizer
                    </p>

                    <p className="text-xs theme-subtext mt-1 leading-relaxed">
                      {sponsorship.message}
                    </p>
                  </div>
                )}

                {/* Rejection */}
                {sponsorship.status === "rejected" &&
                  sponsorship.rejectionReason && (
                    <div className="mt-4 border border-[var(--np-danger)]/20 bg-[color-mix(in_srgb,var(--np-danger)_6%,transparent)] rounded-xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--np-danger)]">
                        Rejection Reason
                      </p>

                      <p className="text-xs theme-subtext mt-1">
                        {sponsorship.rejectionReason}
                      </p>
                    </div>
                  )}

                {/* Approved / Payment */}
                {sponsorship.status === "approved" &&
                  sponsorship.paymentStatus === "pending" && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[var(--np-accent)]/20 bg-[color-mix(in_srgb,var(--np-accent)_6%,transparent)] rounded-xl p-4">
                      <div>
                        <p className="text-xs font-bold theme-text">
                          Sponsorship Approved
                        </p>

                        <p className="text-[11px] theme-subtext mt-1">
                          Your proposal has been approved by the organizer.
                          Payment can be completed here once the NexusPlay
                          payment system is connected.
                        </p>
                      </div>

                      <Button size="sm" disabled className="shrink-0">
                        Payment Coming Soon
                      </Button>
                    </div>
                  )}

                {/* Paid */}
                {sponsorship.paymentStatus === "paid" && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-[var(--np-success)] font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Payment completed
                    {sponsorship.paidAt
                      ? ` on ${new Date(
                          sponsorship.paidAt,
                        ).toLocaleDateString()}`
                      : ""}
                  </div>
                )}

                {/* Transaction */}
                {sponsorship.transactionId && (
                  <div className="mt-3 text-[11px] theme-subtext">
                    Transaction ID:{" "}
                    <span className="font-semibold theme-text">
                      {sponsorship.transactionId}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MySponsorshipsPage;
