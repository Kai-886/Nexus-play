import { useEffect, useState } from "react";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Save,
  IndianRupee,
  UserRound,
  ShieldCheck,
  CreditCard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { sponsorService } from "../../services/sponsorService";
import { Button } from "../../components/ui/Button";

const initialProfile = {
  companyName: "",
  brandName: "",
  industry: "",
  website: "",
  contactEmail: "",
  contactPhone: "",
  budgetRange: "",
  description: "",
  representativeName: "",
  aadhaarNumber: "",
  panNumber: "",
  status: "pending",
};

export function SponsorProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await sponsorService.getProfile();

        const sponsor = response?.sponsor || response?.data || response;

        setProfile((previous) => ({
          ...initialProfile,
          ...previous,
          ...(sponsor || {}),
          // Support old API field names if present
          contactEmail: sponsor?.contactEmail || sponsor?.email || "",
          contactPhone: sponsor?.contactPhone || sponsor?.phone || "",
        }));
      } catch (error) {
        console.error("Failed to load sponsor profile:", error);

        toast.error(
          error.response?.data?.message || "Failed to load sponsor profile",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateProfile = () => {
    const aadhaarRegex = /^\d{12}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;

    if (!profile.companyName?.trim()) {
      toast.error("Company name is required");
      return false;
    }

    if (!profile.contactEmail?.trim()) {
      toast.error("Contact email is required");
      return false;
    }

    if (!profile.contactPhone?.trim()) {
      toast.error("Contact phone is required");
      return false;
    }

    if (!profile.aadhaarNumber?.trim()) {
      toast.error("Aadhaar number is required");
      return false;
    }

    if (!aadhaarRegex.test(profile.aadhaarNumber.trim())) {
      toast.error("Aadhaar number must contain exactly 12 digits");
      return false;
    }

    if (!profile.panNumber?.trim()) {
      toast.error("PAN number is required");
      return false;
    }

    if (!panRegex.test(profile.panNumber.trim().toUpperCase())) {
      toast.error("Please enter a valid PAN number");
      return false;
    }

    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validateProfile()) return;

    try {
      setSaving(true);

      const payload = {
        companyName: profile.companyName.trim(),
        brandName: profile.brandName?.trim() || "",
        industry: profile.industry?.trim() || "",
        website: profile.website?.trim() || "",
        contactEmail: profile.contactEmail.trim(),
        contactPhone: profile.contactPhone.trim(),
        budgetRange: profile.budgetRange?.trim() || "",
        description: profile.description?.trim() || "",
        representativeName: profile.representativeName?.trim() || "",
        aadhaarNumber: profile.aadhaarNumber.trim(),
        panNumber: profile.panNumber.trim().toUpperCase(),
      };

      const response = await sponsorService.updateProfile(payload);

      if (response?.success !== false) {
        toast.success("Sponsor profile updated successfully!");

        setProfile((previous) => ({
          ...previous,
          ...payload,
          status:
            response?.sponsor?.status ||
            response?.data?.status ||
            previous.status ||
            "pending",
        }));
      }
    } catch (error) {
      console.error("Failed to update sponsor profile:", error);

      toast.error(
        error.response?.data?.message || "Failed to update sponsor profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending:
        "border-[var(--np-warning)]/25 bg-[color-mix(in_srgb,var(--np-warning)_10%,transparent)] text-[var(--np-warning)]",

      verified:
        "border-[var(--np-success)]/25 bg-[color-mix(in_srgb,var(--np-success)_10%,transparent)] text-[var(--np-success)]",

      active:
        "border-[var(--np-accent)]/25 bg-[color-mix(in_srgb,var(--np-accent)_10%,transparent)] text-[var(--np-accent-2)]",

      rejected:
        "border-[var(--np-danger)]/20 bg-[color-mix(in_srgb,var(--np-danger)_10%,transparent)] text-[var(--np-danger)]",

      suspended:
        "border-[var(--np-danger)]/20 bg-[color-mix(in_srgb,var(--np-danger)_8%,transparent)] text-[var(--np-danger)]",
    };

    return (
      styles[status] ||
      "border theme-border theme-card theme-text"
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--np-accent-2)]" size={30} />
      </div>
    );
  }

  const currentStatus = profile.status || "pending";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <p className="np-eyebrow">Sponsor Verification</p>

        <h1 className="font-display text-2xl sm:text-3xl font-bold theme-text mt-1">
          Corporate Sponsor Profile
        </h1>

        <p className="theme-subtext mt-2 text-xs sm:text-sm">
          Manage your company information, contact details, and verification
          documents.
        </p>
      </div>

      {/* Verification Status */}
      <div
        className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${getStatusStyle(
          currentStatus,
        )}`}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-semibold">Verification Status</p>

            <p className="mt-1 text-xs opacity-80">
              {currentStatus === "verified"
                ? "Your sponsor profile has been verified."
                : currentStatus === "rejected"
                  ? "Your profile was rejected. Update your details and resubmit."
                  : currentStatus === "suspended"
                    ? "Your sponsor account is currently suspended."
                    : "Complete your profile and submit your details for verification."}
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full border border-current px-3 py-1 text-xs font-semibold capitalize">
          {currentStatus}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Information */}
        <section className="theme-card space-y-5 rounded-2xl border theme-border p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] p-2 text-[var(--np-accent-2)]">
              <Building2 size={19} />
            </div>

            <div>
              <h2 className="theme-text text-base font-bold">
                Company Information
              </h2>

              <p className="theme-subtext text-xs">
                Tell organizers about your business.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Company Name"
              name="companyName"
              value={profile.companyName}
              onChange={handleChange}
              placeholder="Your company name"
              required
            />

            <InputField
              label="Brand Name"
              name="brandName"
              value={profile.brandName}
              onChange={handleChange}
              placeholder="Your brand name"
            />

            <InputField
              label="Industry Sector"
              name="industry"
              value={profile.industry}
              onChange={handleChange}
              placeholder="Gaming, Software, Finance..."
            />

            <InputField
              label="Website URL"
              name="website"
              type="url"
              value={profile.website}
              onChange={handleChange}
              placeholder="https://yourbrand.com"
              icon={Globe}
            />

            <InputField
              label="Budget Range"
              name="budgetRange"
              value={profile.budgetRange}
              onChange={handleChange}
              placeholder="₹25,000 - ₹50,000"
              icon={IndianRupee}
            />
          </div>

          <TextAreaField
            label="Brand Bio & Mission"
            name="description"
            value={profile.description}
            onChange={handleChange}
            placeholder="Tell tournament organizers about your brand..."
          />
        </section>

        {/* Contact Information */}
        <section className="theme-card space-y-5 rounded-2xl border theme-border p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] p-2 text-[var(--np-accent-2)]">
              <UserRound size={19} />
            </div>

            <div>
              <h2 className="theme-text text-base font-bold">
                Contact Information
              </h2>

              <p className="theme-subtext text-xs">
                Details for partnership communication.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Partnership Work Email"
              name="contactEmail"
              type="email"
              value={profile.contactEmail}
              onChange={handleChange}
              placeholder="partnerships@company.com"
              icon={Mail}
              required
            />

            <InputField
              label="Phone Number"
              name="contactPhone"
              value={profile.contactPhone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              icon={Phone}
              required
            />

            <InputField
              label="Representative Name"
              name="representativeName"
              value={profile.representativeName}
              onChange={handleChange}
              placeholder="Authorized representative"
            />
          </div>
        </section>

        {/* KYC Details */}
        <section className="theme-card space-y-5 rounded-2xl border border-[var(--np-warning)]/20 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[color-mix(in_srgb,var(--np-warning)_12%,transparent)] p-2 text-[var(--np-warning)]">
              <CreditCard size={19} />
            </div>

            <div>
              <h2 className="theme-text text-base font-bold">
                Verification Documents
              </h2>

              <p className="theme-subtext mt-1 text-xs">
                Aadhaar and PAN are required for Superadmin verification.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--np-warning)]/20 bg-[color-mix(in_srgb,var(--np-warning)_8%,transparent)] p-3 text-xs leading-5 text-[var(--np-warning)]">
            Enter your details carefully. These documents are sensitive and
            should only be submitted through your trusted platform.
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="theme-subtext mb-1.5 block text-xs font-bold uppercase tracking-wider">
                Aadhaar Number
              </label>

              <input
                type="text"
                name="aadhaarNumber"
                value={profile.aadhaarNumber}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 12);

                  setProfile((previous) => ({
                    ...previous,
                    aadhaarNumber: value,
                  }));
                }}
                inputMode="numeric"
                maxLength={12}
                pattern="[0-9]{12}"
                placeholder="12-digit Aadhaar number"
                required
                className="theme-input w-full rounded-xl p-3 text-xs outline-none"
              />

              <p className="theme-subtext mt-1 text-[10px]">
                Must contain exactly 12 digits.
              </p>
            </div>

            <div>
              <label className="theme-subtext mb-1.5 block text-xs font-bold uppercase tracking-wider">
                PAN Number
              </label>

              <input
                type="text"
                name="panNumber"
                value={profile.panNumber}
                onChange={(event) => {
                  const value = event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 10);

                  setProfile((previous) => ({
                    ...previous,
                    panNumber: value,
                  }));
                }}
                maxLength={10}
                placeholder="ABCDE1234F"
                required
                className="theme-input w-full rounded-xl p-3 text-xs uppercase outline-none"
              />

              <p className="theme-subtext mt-1 text-[10px]">
                Format: 5 letters, 4 digits, 1 letter.
              </p>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            disabled={saving}
            loading={saving}
            icon={Save}
            size="lg"
            className="w-full sm:w-auto"
          >
            {saving ? "Saving Changes..." : "Save Profile Details"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* Reusable Input Component */
const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  required = false,
}) => (
  <div className="min-w-0">
    <label className="theme-subtext mb-1.5 block text-xs font-bold uppercase tracking-wider">
      {label}
    </label>

    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          className="theme-subtext absolute left-3 top-1/2 -translate-y-1/2"
        />
      )}

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`theme-input w-full rounded-xl p-3 text-xs outline-none ${
          Icon ? "pl-9" : ""
        }`}
      />
    </div>
  </div>
);

/* Reusable Textarea Component */
const TextAreaField = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="theme-subtext mb-1.5 block text-xs font-bold uppercase tracking-wider">
      {label}
    </label>

    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={3}
      placeholder={placeholder}
      className="theme-input w-full resize-none rounded-xl p-3 text-xs outline-none"
    />
  </div>
);
