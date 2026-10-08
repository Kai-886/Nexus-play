import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Trophy,
  Handshake,
  ArrowRight,
  Clock,
  UserPlus,
  FileCheck,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import StatCard from "../../components/layout/shell/StatCard";
import Badge from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentData, setRecentData] = useState({
    users: [],
    organizers: [],
    sponsors: [],
    tournaments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const response = await adminService.getDashboardStats();

        setStats(response.stats);

        setRecentData({
          users: response.recentUsers || [],
          organizers: response.recentOrganizers || [],
          sponsors: response.recentSponsors || [],
          tournaments: response.recentTournaments || [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs theme-subtext">
        Loading administration dashboard...
      </div>
    );
  }

  const recentActivities = [
    ...recentData.organizers.map((item) => ({
      id: `organizer-${item._id}`,
      title: "Organizer activity",
      description: item.organizationName,
      status: item.verificationStatus,
      date: item.createdAt,
      icon: Building2,
    })),
    ...recentData.sponsors.map((item) => ({
      id: `sponsor-${item._id}`,
      title: "Sponsor activity",
      description: item.companyName,
      status: item.status,
      date: item.createdAt,
      icon: Handshake,
    })),
    ...recentData.tournaments.map((item) => ({
      id: `tournament-${item._id}`,
      title: "Tournament activity",
      description: item.title,
      status: item.status,
      date: item.createdAt,
      icon: Trophy,
    })),
    ...recentData.users.map((item) => ({
      id: `user-${item._id}`,
      title: "User registered",
      description: item.name,
      status: item.role,
      date: item.createdAt,
      icon: UserPlus,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Command hero — flat card level with token gradient wash */}
      <section className="relative overflow-hidden rounded-2xl theme-card border theme-border p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-40"
          style={{
            background:
              "linear-gradient(115deg, transparent 0%, color-mix(in srgb, var(--np-accent) 14%, transparent) 60%, color-mix(in srgb, var(--np-accent-3) 10%, transparent) 100%)",
          }}
        />

        <div className="relative z-10 max-w-3xl">
          <p className="np-eyebrow">Super Admin</p>

          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight theme-text mt-1.5">
            NexusPlay <span className="np-display">Administration</span>
          </h1>

          <p className="text-xs md:text-sm theme-subtext mt-2 leading-relaxed max-w-xl">
            Manage platform users, review organizer and sponsor verification,
            monitor tournaments, and oversee NexusPlay governance.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <Button onClick={() => navigate("/superadmin/organizers")} iconRight={ArrowRight}>
              Review Organizers
            </Button>

            <Button variant="outline" onClick={() => navigate("/superadmin/sponsors")}>
              Review Sponsors
            </Button>

            <Button variant="outline" onClick={() => navigate("/superadmin/tournaments")}>
              View Tournaments
            </Button>
          </div>
        </div>
      </section>

      {/* Stats — canonical StatCard tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Users"
          icon={Users}
          value={stats?.totalUsers || 0}
          hint="Registered platform users"
          index={0}
        />

        <StatCard
          label="Organizers"
          icon={Building2}
          value={stats?.totalOrganizers || 0}
          hint={`${stats?.pendingOrganizers || 0} pending verification`}
          hintTone="accent"
          index={1}
        />

        <StatCard
          label="Sponsors"
          icon={Handshake}
          value={stats?.totalSponsors || 0}
          hint={`${stats?.pendingSponsors || 0} pending verification`}
          hintTone="accent"
          index={2}
        />

        <StatCard
          label="Tournaments"
          icon={Trophy}
          iconTone="amber"
          value={stats?.totalTournaments || 0}
          hint={`${stats?.activeTournaments || 0} ongoing`}
          hintTone="amber"
          index={3}
        />

        <StatCard
          label="Pending Actions"
          icon={Clock}
          iconTone="amber"
          value={stats?.pendingApprovals || 0}
          hint="Require review"
          hintTone="amber"
          index={4}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 theme-card border theme-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold theme-text">
                Pending Actions
              </h2>
              <p className="text-xs theme-subtext mt-1">
                Items requiring Superadmin attention
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border theme-border theme-icon-box">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
                  <Building2 className="w-4 h-4" />
                </div>

                <div>
                  <p className="text-sm font-bold theme-text">
                    Organizer Verification
                  </p>
                  <p className="text-[11px] theme-subtext">
                    {stats?.pendingOrganizers || 0} organizer
                    {stats?.pendingOrganizers === 1 ? "" : "s"} waiting for
                    review
                  </p>
                </div>
              </div>

              <Button size="sm" onClick={() => navigate("/superadmin/organizers")} iconRight={ArrowRight} className="shrink-0">
                Review
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border theme-border theme-icon-box">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
                  <Handshake className="w-4 h-4" />
                </div>

                <div>
                  <p className="text-sm font-bold theme-text">
                    Sponsor Verification
                  </p>
                  <p className="text-[11px] theme-subtext">
                    {stats?.pendingSponsors || 0} sponsor
                    {stats?.pendingSponsors === 1 ? "" : "s"} waiting for review
                  </p>
                </div>
              </div>

              <Button size="sm" onClick={() => navigate("/superadmin/sponsors")} iconRight={ArrowRight} className="shrink-0">
                Review
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border theme-border theme-icon-box">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--np-warning)_12%,transparent)] text-[var(--np-warning)]">
                  <Trophy className="w-4 h-4" />
                </div>

                <div>
                  <p className="text-sm font-bold theme-text">
                    Tournament Review
                  </p>
                  <p className="text-[11px] theme-subtext">
                    {stats?.pendingTournaments || 0} tournament
                    {stats?.pendingTournaments === 1 ? "" : "s"} currently in
                    draft
                  </p>
                </div>
              </div>

              <Button size="sm" onClick={() => navigate("/superadmin/tournaments")} iconRight={ArrowRight} className="shrink-0">
                Review
              </Button>
            </div>
          </div>
        </div>

        <div className="theme-card border theme-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold theme-text">
                Recent Activity
              </h2>
              <p className="text-xs theme-subtext mt-1">
                Latest platform records
              </p>
            </div>

            <Clock className="w-4 h-4 text-[var(--np-success)]" />
          </div>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-xs theme-subtext text-center py-8">
                No recent activity found.
              </p>
            ) : (
              recentActivities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg theme-icon-box border theme-border shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[var(--np-accent-2)]" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold theme-text">
                        {activity.title}
                      </p>

                      <p className="text-[11px] theme-subtext truncate">
                        {activity.description}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          status={activity.status}
                          className="!text-[9px] !px-2 !py-0.5"
                        >
                          <span className="capitalize">{activity.status}</span>
                        </Badge>

                        <span className="text-[10px] theme-subtext">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="theme-card border theme-border rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold theme-text">
              Platform Overview
            </h2>

            <p className="text-xs theme-subtext mt-1">
              Current distribution of NexusPlay platform activity
            </p>
          </div>

          <FileCheck className="w-5 h-5 text-[var(--np-accent-2)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl border theme-border theme-icon-box">
            <p className="text-[11px] uppercase font-bold tracking-wider theme-subtext">
              Verified Organizers
            </p>

            <p className="text-xl font-black theme-text mt-2 tabular-nums font-display">
              {stats?.verifiedOrganizers || 0}
            </p>
          </div>

          <div className="p-4 rounded-xl border theme-border theme-icon-box">
            <p className="text-[11px] uppercase font-bold tracking-wider theme-subtext">
              Verified Sponsors
            </p>

            <p className="text-xl font-black theme-text mt-2 tabular-nums font-display">
              {stats?.verifiedSponsors || 0}
            </p>
          </div>

          <div className="p-4 rounded-xl border theme-border theme-icon-box">
            <p className="text-[11px] uppercase font-bold tracking-wider theme-subtext">
              Completed Tournaments
            </p>

            <p className="text-xl font-black theme-text mt-2 tabular-nums font-display">
              {stats?.completedTournaments || 0}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SuperAdminDashboard;
