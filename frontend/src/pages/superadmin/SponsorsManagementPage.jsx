import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  ShieldCheck,
  XCircle,
  Ban,
  Eye,
  RefreshCw,
  User,
  CreditCard,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import Badge from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

const formatStatus = (status) =>
  status
    ? status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "Unknown";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3">
    <div className="mt-0.5 text-[var(--np-accent-2)]">
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

export const SponsorsManagementPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSponsors = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await adminService.getSponsors();

      setSponsors(response?.sponsors || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sponsors");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchSponsors();
    };
    run();
  }, []);

  const filteredSponsors = useMemo(() => {
    const value = search.trim().toLowerCase();

    return sponsors.filter((sponsor) => {
      const matchesStatus =
        statusFilter === "all" || sponsor.status === statusFilter;

      const matchesSearch =
        !value ||
        sponsor.companyName?.toLowerCase().includes(value) ||
        sponsor.brandName?.toLowerCase().includes(value) ||
        sponsor.contactEmail?.toLowerCase().includes(value) ||
        sponsor.industry?.toLowerCase().includes(value) ||
        sponsor.representativeName?.toLowerCase().includes(value);

      return matchesStatus && matchesSearch;
    });
  }, [sponsors, search, statusFilter]);

  const handleAction = async (action) => {
    if (!selectedSponsor) return;

    try {
      setActionLoading(true);

      if (action === "verify") {
        await adminService.verifySponsor(selectedSponsor._id);
      }

      if (action === "reject") {
        await adminService.rejectSponsor(selectedSponsor._id);
      }

      if (action === "suspend") {
        await adminService.suspendSponsor(selectedSponsor._id);
      }

      await fetchSponsors();
      setSelectedSponsor(null);
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${action} sponsor`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="np-eyebrow">Sponsor KYC</p>

          <h1 className="font-display text-2xl font-bold theme-text mt-1">
            Corporate Sponsors
          </h1>

          <p className="mt-1 text-sm theme-subtext">
            Review sponsor profiles and manage verification status.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => fetchSponsors(true)}
          disabled={refreshing}
          icon={RefreshCw}
          className="shrink-0"
        >
          Refresh
        </Button>
      </div>

      {/* Status filter tiles — tactile press (§6.3) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["All", "all"],
          ["Pending", "pending"],
          ["Verified", "verified"],
          ["Rejected", "rejected"],
          ["Suspended", "suspended"],
        ].map(([label, value]) => {
          const count =
            value === "all"
              ? sponsors.length
              : sponsors.filter((sponsor) => sponsor.status === value).length;

          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`btn-press rounded-xl border p-4 text-left cursor-pointer ${
                statusFilter === value
                  ? "border-[var(--np-accent)]/60 bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)]"
                  : "theme-border theme-card theme-hover"
              }`}
            >
              <p className="text-xs theme-subtext">{label}</p>

              <p className="mt-1 text-xl font-bold theme-text tabular-nums">
                {count}
              </p>
            </button>
          );
        })}
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
            placeholder="Search company, brand, industry, email..."
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
          <p className="mt-3 text-sm theme-subtext">Loading sponsors...</p>
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="theme-card rounded-xl border theme-border p-10 text-center">
          <div className="w-12 h-12 rounded-xl theme-icon-box border theme-border flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 theme-subtext" />
          </div>

          <p className="font-medium theme-text">No sponsors found</p>

          <p className="mt-1 text-sm theme-subtext">
            Try changing the search or status filter.
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
                      Sponsor
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Industry
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="np-stagger">
                  {filteredSponsors.map((sponsor) => (
                    <tr
                      key={sponsor._id}
                      className="border-b theme-border last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
                            <Building2 size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold theme-text">
                              {sponsor.companyName}
                            </p>

                            <p className="truncate text-xs theme-subtext">
                              {sponsor.brandName || "No brand name"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm theme-text">
                          {sponsor.contactEmail || "—"}
                        </p>

                        <p className="mt-1 text-xs theme-subtext">
                          {sponsor.contactPhone || "No phone"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm theme-text">
                        {sponsor.industry || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <Badge status={sponsor.status} className="capitalize" />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSponsor(sponsor)}
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
            {filteredSponsors.map((sponsor) => (
              <div
                key={sponsor._id}
                className="theme-card rounded-xl border theme-border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
                      <Building2 size={18} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold theme-text">
                        {sponsor.companyName}
                      </h3>

                      <p className="truncate text-xs theme-subtext">
                        {sponsor.brandName || "No brand name"}
                      </p>
                    </div>
                  </div>

                  <Badge
                    status={sponsor.status}
                    className="shrink-0 capitalize"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={sponsor.contactEmail}
                  />

                  <InfoItem
                    icon={Building2}
                    label="Industry"
                    value={sponsor.industry}
                  />

                  <InfoItem
                    icon={User}
                    label="Representative"
                    value={sponsor.representativeName}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setSelectedSponsor(sponsor)}
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

      {selectedSponsor && (
        <div className="np-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="np-modal theme-card max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border theme-border">
            <div className="flex items-center justify-between border-b theme-border p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
                  <Building2 size={20} />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg font-bold theme-text">
                    {selectedSponsor.companyName}
                  </h2>

                  <p className="text-xs theme-subtext">
                    {selectedSponsor.brandName || "Corporate Sponsor"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSponsor(null)}
                className="rounded-lg p-2 theme-subtext transition theme-hover hover:theme-text"
                aria-label="Close sponsor details"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="max-h-[calc(90vh-150px)] overflow-y-auto p-5">
              <div className="space-y-6">
                <DetailSection title="Sponsor Information">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={Building2}
                      label="Company Name"
                      value={selectedSponsor.companyName}
                    />

                    <InfoItem
                      icon={Building2}
                      label="Brand Name"
                      value={selectedSponsor.brandName}
                    />

                    <InfoItem
                      icon={Building2}
                      label="Industry"
                      value={selectedSponsor.industry}
                    />

                    <InfoItem
                      icon={Globe}
                      label="Website"
                      value={selectedSponsor.website}
                    />

                    <InfoItem
                      icon={CreditCard}
                      label="Budget Range"
                      value={selectedSponsor.budgetRange}
                    />

                    <InfoItem
                      icon={Calendar}
                      label="Joined"
                      value={formatDate(selectedSponsor.createdAt)}
                    />
                  </div>

                  {selectedSponsor.description && (
                    <div className="mt-5">
                      <p className="text-xs theme-subtext">Description</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm theme-text">
                        {selectedSponsor.description}
                      </p>
                    </div>
                  )}
                </DetailSection>

                <DetailSection title="Contact Information">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={User}
                      label="Representative"
                      value={selectedSponsor.representativeName}
                    />

                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={selectedSponsor.contactEmail}
                    />

                    <InfoItem
                      icon={Phone}
                      label="Phone"
                      value={selectedSponsor.contactPhone}
                    />
                  </div>
                </DetailSection>

                <DetailSection title="Verification">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={CreditCard}
                      label="Aadhaar Number"
                      value={selectedSponsor.aadhaarNumber}
                    />

                    <InfoItem
                      icon={CreditCard}
                      label="PAN Number"
                      value={selectedSponsor.panNumber}
                    />

                    <InfoItem
                      icon={ShieldCheck}
                      label="Current Status"
                      value={formatStatus(selectedSponsor.status)}
                    />

                    <InfoItem
                      icon={Calendar}
                      label="Last Updated"
                      value={formatDate(selectedSponsor.updatedAt)}
                    />
                  </div>
                </DetailSection>

                {selectedSponsor.userId && (
                  <DetailSection title="Account">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InfoItem
                        icon={User}
                        label="Account Name"
                        value={selectedSponsor.userId.name}
                      />

                      <InfoItem
                        icon={Mail}
                        label="Account Email"
                        value={selectedSponsor.userId.email}
                      />
                    </div>
                  </DetailSection>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t theme-border p-5 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => setSelectedSponsor(null)}
              >
                Close
              </Button>

              {selectedSponsor.status !== "verified" &&
                selectedSponsor.status !== "active" && (
                  <Button
                    onClick={() => handleAction("verify")}
                    disabled={actionLoading}
                    loading={actionLoading}
                    icon={ShieldCheck}
                    className="!bg-[var(--np-success)] hover:!brightness-110"
                  >
                    Verify
                  </Button>
                )}

              {selectedSponsor.status !== "rejected" && (
                <Button
                  variant="danger"
                  onClick={() => handleAction("reject")}
                  disabled={actionLoading}
                  loading={actionLoading}
                  icon={XCircle}
                >
                  Reject
                </Button>
              )}

              {selectedSponsor.status !== "suspended" && (
                <Button
                  onClick={() => handleAction("suspend")}
                  disabled={actionLoading}
                  loading={actionLoading}
                  icon={Ban}
                  className="!bg-[var(--np-warning)] !text-black hover:!brightness-110"
                >
                  Suspend
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
