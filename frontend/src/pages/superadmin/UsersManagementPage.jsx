import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Eye,
  RefreshCw,
  XCircle,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  CreditCard,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import Badge from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name) => {
  if (!name) return "P";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3">
    <div className="mt-0.5 shrink-0 text-[var(--np-accent-2)]">
      <Icon size={17} />
    </div>

    <div className="min-w-0">
      <p className="text-xs theme-subtext">{label}</p>

      <p className="mt-1 break-words text-sm theme-text">{value || "—"}</p>
    </div>
  </div>
);

const DetailSection = ({ title, children }) => (
  <div className="border-b theme-border pb-5 last:border-0 last:pb-0">
    <h3 className="mb-4 text-sm font-semibold theme-text">{title}</h3>

    {children}
  </div>
);

export const UsersManagementPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchPlayers = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await adminService.getPlayers();

      setPlayers(response?.players || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load players");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchPlayers();
    };
    run();
  }, []);

  const openPlayerDetails = async (player) => {
    try {
      setDetailsLoading(true);

      const response = await adminService.getPlayer(player._id);

      setSelectedPlayer(response?.player || player);
    } catch {
      setSelectedPlayer(player);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredPlayers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return players;
    }

    return players.filter((player) => {
      const name = player?.name?.toLowerCase() || "";
      const email = player?.email?.toLowerCase() || "";
      const mobile = player?.mobileNumber?.toLowerCase() || "";
      const college = player?.college?.toLowerCase() || "";
      const collegeId = player?.collegeId?.toLowerCase() || "";

      return (
        name.includes(value) ||
        email.includes(value) ||
        mobile.includes(value) ||
        college.includes(value) ||
        collegeId.includes(value)
      );
    });
  }, [players, search]);

  const completedProfiles = players.filter(
    (player) => player.isProfileComplete,
  ).length;

  const incompleteProfiles = players.length - completedProfiles;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="np-eyebrow">Player Governance</p>

          <h1 className="font-display text-2xl font-bold theme-text mt-1">
            Players
          </h1>

          <p className="mt-1 text-sm theme-subtext">
            View registered players and their profile information.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => fetchPlayers(true)}
          disabled={refreshing}
          icon={RefreshCw}
          className="shrink-0"
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="theme-card rounded-xl border theme-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs theme-subtext">Total Players</p>

            <Users size={17} className="text-[var(--np-accent-2)]" />
          </div>

          <p className="mt-2 text-xl font-bold theme-text tabular-nums">
            {players.length}
          </p>
        </div>

        <div className="theme-card rounded-xl border theme-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs theme-subtext">Complete Profiles</p>

            <ShieldCheck size={17} className="text-[var(--np-success)]" />
          </div>

          <p className="mt-2 text-xl font-bold theme-text tabular-nums">
            {completedProfiles}
          </p>
        </div>

        <div className="theme-card rounded-xl border theme-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs theme-subtext">Incomplete Profiles</p>

            <UserRound size={17} className="text-[var(--np-warning)]" />
          </div>

          <p className="mt-2 text-xl font-bold theme-text tabular-nums">
            {incompleteProfiles}
          </p>
        </div>
      </div>

      <div className="theme-card rounded-xl border theme-border p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 theme-subtext"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, college, college ID..."
            className="theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--np-danger)]/20 bg-[color-mix(in_srgb,var(--np-danger)_10%,transparent)] px-4 py-3 text-sm text-[var(--np-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="theme-card rounded-xl border theme-border p-10 text-center">
          <RefreshCw size={22} className="mx-auto animate-spin theme-subtext" />

          <p className="mt-3 text-sm theme-subtext">Loading players...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="theme-card rounded-xl border theme-border p-10 text-center">
          <div className="w-12 h-12 rounded-xl theme-icon-box border theme-border flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 theme-subtext" />
          </div>

          <p className="font-medium theme-text">No players found</p>

          <p className="mt-1 text-sm theme-subtext">
            Try changing your search.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border theme-border lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b theme-border">
                  <tr>
                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Player
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      College
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      College ID
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Profile
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="np-stagger">
                  {filteredPlayers.map((player) => (
                    <tr
                      key={player._id}
                      className="border-b theme-border last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {player.avatar?.url ? (
                            <img
                              src={player.avatar.url}
                              alt={player.name}
                              className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[var(--np-accent)] to-[var(--np-accent-2)] text-sm font-bold text-white">
                              {getInitials(player.name)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate text-sm font-semibold theme-text">
                              {player.name}
                            </p>

                            <p className="max-w-[180px] truncate text-xs theme-subtext">
                              {player._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[220px] truncate text-sm theme-text">
                          {player.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[180px] truncate text-sm theme-text">
                          {player.college || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm theme-text">
                          {player.collegeId || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          tone={
                            player.isProfileComplete ? "success" : "warning"
                          }
                        >
                          {player.isProfileComplete ? "Complete" : "Incomplete"}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm theme-text">
                          {formatDate(player.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPlayerDetails(player)}
                          disabled={detailsLoading}
                          icon={Eye}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:hidden np-stagger">
            {filteredPlayers.map((player) => (
              <div
                key={player._id}
                className="theme-card rounded-xl border theme-border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {player.avatar?.url ? (
                      <img
                        src={player.avatar.url}
                        alt={player.name}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[var(--np-accent)] to-[var(--np-accent-2)] text-sm font-bold text-white">
                        {getInitials(player.name)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold theme-text">
                        {player.name}
                      </h3>

                      <p className="truncate text-xs theme-subtext">
                        {player.email}
                      </p>
                    </div>
                  </div>

                  <Badge
                    tone={player.isProfileComplete ? "success" : "warning"}
                    className="shrink-0"
                  >
                    {player.isProfileComplete ? "Complete" : "Incomplete"}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={GraduationCap}
                    label="College"
                    value={player.college}
                  />

                  <InfoItem
                    icon={CreditCard}
                    label="College ID"
                    value={player.collegeId}
                  />

                  <InfoItem
                    icon={Phone}
                    label="Mobile"
                    value={player.mobileNumber}
                  />

                  <InfoItem
                    icon={Calendar}
                    label="Joined"
                    value={formatDate(player.createdAt)}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => openPlayerDetails(player)}
                  icon={Eye}
                  className="mt-4 w-full"
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedPlayer && (
        <div className="np-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="np-modal theme-card max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border theme-border">
            <div className="flex items-center justify-between border-b theme-border p-5">
              <div className="flex min-w-0 items-center gap-3">
                {selectedPlayer.avatar?.url ? (
                  <img
                    src={selectedPlayer.avatar.url}
                    alt={selectedPlayer.name}
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--np-accent)] to-[var(--np-accent-2)] text-sm font-bold text-white">
                    {getInitials(selectedPlayer.name)}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold theme-text">
                    {selectedPlayer.name}
                  </h2>

                  <p className="truncate text-xs theme-subtext">Player</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlayer(null)}
                className="rounded-lg p-2 theme-subtext transition theme-hover hover:theme-text"
                aria-label="Close player details"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">
              <div className="space-y-6">
                <DetailSection title="Personal Information">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={UserRound}
                      label="Full Name"
                      value={selectedPlayer.name}
                    />

                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={selectedPlayer.email}
                    />

                    <InfoItem
                      icon={Phone}
                      label="Mobile Number"
                      value={selectedPlayer.mobileNumber}
                    />

                    <InfoItem icon={ShieldCheck} label="Role" value="Player" />
                  </div>
                </DetailSection>

                <DetailSection title="College Information">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={GraduationCap}
                      label="College"
                      value={selectedPlayer.college}
                    />

                    <InfoItem
                      icon={CreditCard}
                      label="College ID"
                      value={selectedPlayer.collegeId}
                    />
                  </div>
                </DetailSection>

                <DetailSection title="Account Information">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={UserRound}
                      label="Player ID"
                      value={selectedPlayer._id}
                    />

                    <InfoItem
                      icon={ShieldCheck}
                      label="Profile Status"
                      value={
                        selectedPlayer.isProfileComplete
                          ? "Complete"
                          : "Incomplete"
                      }
                    />

                    <InfoItem
                      icon={Calendar}
                      label="Joined"
                      value={formatDateTime(selectedPlayer.createdAt)}
                    />

                    <InfoItem
                      icon={Calendar}
                      label="Last Updated"
                      value={formatDateTime(selectedPlayer.updatedAt)}
                    />
                  </div>
                </DetailSection>

                <DetailSection title="Payment Information">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={CreditCard}
                      label="UPI ID"
                      value={selectedPlayer.upiId}
                    />
                  </div>
                </DetailSection>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
