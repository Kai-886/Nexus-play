import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CreditCard,
  Eye,
  RefreshCw,
  XCircle,
  Building2,
  Trophy,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import Badge from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

/* Payment ledger status → canonical Badge tone (PRD §5.1) */
const paymentStatusTones = {
  not_required: "muted",
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "accent",
};

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

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "—";

  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const getSponsorName = (payment) => {
  if (payment.sponsorId?.companyName) {
    return payment.sponsorId.companyName;
  }

  if (payment.sponsorId?.brandName) {
    return payment.sponsorId.brandName;
  }

  return payment.sponsorUserId?.name || "Unknown Sponsor";
};

const getTournamentName = (payment) => {
  return (
    payment.tournamentId?.title ||
    payment.tournamentTitle ||
    "Unknown Tournament"
  );
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

export const PaymentsManagementPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchPayments = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await adminService.getPayments();

      setPayments(response?.payments || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await fetchPayments();
    };
    run();
  }, []);

  const openPaymentDetails = async (payment) => {
    try {
      setDetailsLoading(true);

      const response = await adminService.getPayment(payment._id);

      setSelectedPayment(response?.payment || payment);
    } catch {
      setSelectedPayment(payment);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const value = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const sponsorName = getSponsorName(payment).toLowerCase();
      const tournamentName = getTournamentName(payment).toLowerCase();
      const transactionId = payment.transactionId?.toLowerCase() || "";

      const matchesSearch =
        !value ||
        sponsorName.includes(value) ||
        tournamentName.includes(value) ||
        transactionId.includes(value);

      const matchesStatus =
        statusFilter === "all" || payment.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const totalAmount = useMemo(
    () =>
      payments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0,
      ),
    [payments],
  );

  const paidAmount = useMemo(
    () =>
      payments
        .filter((payment) => payment.paymentStatus === "paid")
        .reduce((total, payment) => total + Number(payment.amount || 0), 0),
    [payments],
  );

  const statusFilters = [
    ["All", "all"],
    ["Pending", "pending"],
    ["Paid", "paid"],
    ["Failed", "failed"],
    ["Refunded", "refunded"],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="np-eyebrow">Payments Ledger</p>

          <h1 className="font-display text-2xl font-bold theme-text mt-1">
            Payments
          </h1>

          <p className="mt-1 text-sm theme-subtext">
            Monitor sponsorship payments, transactions and payment status across
            the platform.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => fetchPayments(true)}
          disabled={refreshing}
          icon={RefreshCw}
          className="shrink-0"
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="theme-card rounded-xl border theme-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs theme-subtext">Total Payments</p>
            <CreditCard size={17} className="text-[var(--np-accent-2)]" />
          </div>

          <p className="mt-2 text-xl font-bold theme-text tabular-nums">
            {payments.length}
          </p>
        </div>

        <div className="theme-card rounded-xl border theme-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs theme-subtext">Pending</p>
            <Clock3 size={17} className="text-[var(--np-warning)]" />
          </div>

          <p className="mt-2 text-xl font-bold theme-text tabular-nums">
            {
              payments.filter((payment) => payment.paymentStatus === "pending")
                .length
            }
          </p>
        </div>

        <div className="theme-card rounded-xl border theme-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs theme-subtext">Paid</p>
            <CheckCircle2 size={17} className="text-[var(--np-success)]" />
          </div>

          <p className="mt-2 text-xl font-bold theme-text tabular-nums">
            {
              payments.filter((payment) => payment.paymentStatus === "paid")
                .length
            }
          </p>
        </div>

        <div className="theme-card rounded-xl border theme-border p-4">
          <p className="text-xs theme-subtext">Total Amount</p>

          <p className="mt-2 text-xl font-bold theme-text tabular-nums">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        <div className="theme-card rounded-xl border theme-border p-4">
          <p className="text-xs theme-subtext">Paid Amount</p>

          <p className="mt-2 text-xl font-bold text-[var(--np-success)] tabular-nums">
            {formatCurrency(paidAmount)}
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
            placeholder="Search sponsor, tournament, transaction..."
            className="theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
          />
        </div>
      </div>

      {/* Status filter pills — tactile press (§6.3) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map(([label, value]) => {
          const count =
            value === "all"
              ? payments.length
              : payments.filter((payment) => payment.paymentStatus === value)
                  .length;

          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`btn-press shrink-0 rounded-xl border px-4 py-2 text-sm cursor-pointer ${
                statusFilter === value
                  ? "border-[var(--np-accent)]/60 bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]"
                  : "theme-border theme-subtext theme-hover"
              }`}
            >
              {label} <span className="tabular-nums">({count})</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--np-danger)]/20 bg-[color-mix(in_srgb,var(--np-danger)_10%,transparent)] px-4 py-3 text-sm text-[var(--np-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="theme-card rounded-xl border theme-border p-10 text-center">
          <RefreshCw size={22} className="mx-auto animate-spin theme-subtext" />

          <p className="mt-3 text-sm theme-subtext">Loading payments...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="theme-card rounded-xl border theme-border p-10 text-center">
          <div className="w-12 h-12 rounded-xl theme-icon-box border theme-border flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-6 h-6 theme-subtext" />
          </div>

          <p className="font-medium theme-text">No payments found</p>

          <p className="mt-1 text-sm theme-subtext">
            Try changing the search or payment status filter.
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
                      Tournament
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Transaction
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Paid At
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] uppercase tracking-wider font-bold theme-subtext">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="np-stagger">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b theme-border last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
                            <Building2 size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate text-sm font-semibold theme-text">
                              {getSponsorName(payment)}
                            </p>

                            <p className="max-w-[180px] truncate text-xs theme-subtext">
                              {payment.sponsorId?.industry ||
                                "Corporate Sponsor"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[200px] truncate text-sm theme-text">
                          {getTournamentName(payment)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium theme-text tabular-nums">
                          {formatCurrency(payment.amount)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[160px] truncate text-xs theme-subtext">
                          {payment.transactionId || "Not available"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          status={payment.paymentStatus}
                          tone={paymentStatusTones[payment.paymentStatus]}
                          className="capitalize"
                        >
                          {formatStatus(payment.paymentStatus)}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm theme-text">
                          {formatDate(payment.paidAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPaymentDetails(payment)}
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
            {filteredPayments.map((payment) => (
              <div
                key={payment._id}
                className="theme-card rounded-xl border theme-border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
                      <CreditCard size={18} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold theme-text">
                        {getSponsorName(payment)}
                      </h3>

                      <p className="truncate text-xs theme-subtext">
                        {getTournamentName(payment)}
                      </p>
                    </div>
                  </div>

                  <Badge
                    status={payment.paymentStatus}
                    tone={paymentStatusTones[payment.paymentStatus]}
                    className="shrink-0 capitalize"
                  >
                    {formatStatus(payment.paymentStatus)}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={IndianRupee}
                    label="Amount"
                    value={formatCurrency(payment.amount)}
                  />

                  <InfoItem
                    icon={Calendar}
                    label="Paid At"
                    value={formatDate(payment.paidAt)}
                  />

                  <InfoItem
                    icon={Trophy}
                    label="Tournament"
                    value={getTournamentName(payment)}
                  />

                  <InfoItem
                    icon={CreditCard}
                    label="Transaction"
                    value={payment.transactionId || "Not available"}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => openPaymentDetails(payment)}
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

      {selectedPayment && (
        <div className="np-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="np-modal theme-card max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border theme-border">
            <div className="flex items-center justify-between border-b theme-border p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
                  <CreditCard size={20} />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg font-bold theme-text">
                    {getSponsorName(selectedPayment)}
                  </h2>

                  <p className="truncate text-xs theme-subtext">
                    {getTournamentName(selectedPayment)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg p-2 theme-subtext transition theme-hover hover:theme-text"
                aria-label="Close payment details"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">
              <div className="space-y-6">
                <DetailSection title="Payment Information">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={Building2}
                      label="Sponsor"
                      value={getSponsorName(selectedPayment)}
                    />

                    <InfoItem
                      icon={Trophy}
                      label="Tournament"
                      value={getTournamentName(selectedPayment)}
                    />

                    <InfoItem
                      icon={IndianRupee}
                      label="Amount"
                      value={formatCurrency(selectedPayment.amount)}
                    />

                    <InfoItem
                      icon={CreditCard}
                      label="Payment Status"
                      value={formatStatus(selectedPayment.paymentStatus)}
                    />

                    <InfoItem
                      icon={FileText}
                      label="Transaction ID"
                      value={selectedPayment.transactionId || "Not available"}
                    />

                    <InfoItem
                      icon={Calendar}
                      label="Paid At"
                      value={formatDateTime(selectedPayment.paidAt)}
                    />
                  </div>
                </DetailSection>

                <DetailSection title="Sponsor">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={Building2}
                      label="Company"
                      value={selectedPayment.sponsorId?.companyName}
                    />

                    <InfoItem
                      icon={Building2}
                      label="Brand"
                      value={selectedPayment.sponsorId?.brandName}
                    />

                    <InfoItem
                      icon={Building2}
                      label="Industry"
                      value={selectedPayment.sponsorId?.industry}
                    />

                    <InfoItem
                      icon={Building2}
                      label="Contact Email"
                      value={selectedPayment.sponsorId?.contactEmail}
                    />
                  </div>
                </DetailSection>

                <DetailSection title="Sponsorship Details">
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText size={17} className="text-[var(--np-accent-2)]" />

                        <p className="text-xs theme-subtext">Requirements</p>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm theme-text">
                        {selectedPayment.requirements ||
                          "No requirements provided"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <FileText size={17} className="text-[var(--np-accent-2)]" />

                        <p className="text-xs theme-subtext">Message</p>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm theme-text">
                        {selectedPayment.message || "No message provided"}
                      </p>
                    </div>
                  </div>
                </DetailSection>

                {selectedPayment.rejectionReason && (
                  <DetailSection title="Rejection">
                    <p className="whitespace-pre-wrap text-sm text-[var(--np-danger)]">
                      {selectedPayment.rejectionReason}
                    </p>
                  </DetailSection>
                )}

                <DetailSection title="Timeline">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      icon={Calendar}
                      label="Created"
                      value={formatDateTime(selectedPayment.createdAt)}
                    />

                    <InfoItem
                      icon={Calendar}
                      label="Last Updated"
                      value={formatDateTime(selectedPayment.updatedAt)}
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
