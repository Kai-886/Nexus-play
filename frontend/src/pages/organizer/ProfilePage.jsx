
import { useEffect, useState } from "react";
import {
  Save,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganizerProfile,
  updateOrganizerProfile,
} from "../../services/organizerService";
import { Button } from "../../components/ui/Button";

export function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    organizationName: "",
    organizationType: "",
    description: "",
    address: "",
    representativeName: "",
    contactEmail: "",
    contactPhone: "",
    aadhaarNumber: "",
    panNumber: "",
  });

  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fetch organizer profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOrganizerProfile();

        if (data.success && data.organizer) {
          const organizer = data.organizer;

          setProfile({
            organizationName: organizer.organizationName || "",
            organizationType: organizer.organizationType || "",
            description: organizer.description || "",
            address: organizer.address || "",
            representativeName: organizer.representativeName || "",
            contactEmail: organizer.contactEmail || user?.email || "",
            contactPhone: organizer.contactPhone || "",
            aadhaarNumber: "",
            panNumber: "",
          });

          setVerificationStatus(
            organizer.verificationStatus || "pending"
          );
        } else {
          setProfile((prev) => ({
            ...prev,
            contactEmail: user?.email || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch organizer profile:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load organizer profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update organizer profile
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSavedSuccess(false);

      const data = await updateOrganizerProfile(profile);

      if (data.success) {
        setSavedSuccess(true);

        if (data.organizer?.verificationStatus) {
          setVerificationStatus(
            data.organizer.verificationStatus
          );
        }
      }
    } catch (err) {
      console.error("Failed to update organizer profile:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update organizer profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusClasses = () => {
    switch (verificationStatus) {
      case "verified":
        return "bg-[color-mix(in_srgb,var(--np-success)_10%,transparent)] text-[var(--np-success)] border-[var(--np-success)]/25";

      case "rejected":
        return "bg-[color-mix(in_srgb,var(--np-danger)_10%,transparent)] text-[var(--np-danger)] border-[var(--np-danger)]/20";

      case "suspended":
        return "bg-[color-mix(in_srgb,var(--np-warning)_10%,transparent)] text-[var(--np-warning)] border-[var(--np-warning)]/25";

      default:
        return "bg-[color-mix(in_srgb,var(--np-warning)_10%,transparent)] text-[var(--np-warning)] border-[var(--np-warning)]/25";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 theme-text">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="np-eyebrow">Organizer</p>

        <h1 className="font-display text-2xl font-bold theme-text mt-1">
          Organizer Profile
        </h1>

        <p className="text-sm theme-subtext">
          Manage your organization details and verification information.
        </p>
      </div>

      {/* Success message */}
      {savedSuccess && (
        <div className="flex items-center gap-2 bg-[color-mix(in_srgb,var(--np-success)_10%,transparent)] border border-[var(--np-success)]/25 text-[var(--np-success)] text-xs px-4 py-3 rounded-xl font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Profile updated successfully!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-[color-mix(in_srgb,var(--np-danger)_10%,transparent)] border border-[var(--np-danger)]/20 text-[var(--np-danger)] text-xs px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Profile header */}
      <div className="theme-card rounded-2xl border p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[var(--np-accent)] to-[var(--np-accent-2)] text-white font-black flex items-center justify-center text-2xl shadow-md shadow-indigo-600/30 shrink-0">
          {user?.name?.slice(0, 2).toUpperCase() || "OR"}
        </div>

        <div className="text-center sm:text-left space-y-2">
          <h2 className="text-xl font-bold theme-text">
            {user?.name || "Organizer"}
          </h2>

          <p className="text-xs theme-subtext">
            {user?.email || profile.contactEmail}
          </p>

          <span
            className={`inline-flex items-center gap-1 border rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses()}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {verificationStatus}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleSave}
        className="theme-card rounded-2xl border p-6 shadow-xs space-y-6"
      >
        {/* Organization details */}
        <h2
          className="text-sm font-bold theme-text border-b pb-2"
         
        >
          Organization Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Organization name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold theme-subtext uppercase">
              Organization Name
            </label>

            <div className="relative">
              <Building className="w-4 h-4 theme-subtext absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                name="organizationName"
                value={profile.organizationName}
                onChange={handleChange}
                required
                className="theme-input w-full pl-9 pr-3.5 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-[var(--np-accent)]/20"
                placeholder="Nexus Gaming League"
              />
            </div>
          </div>

          {/* Organization type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold theme-subtext uppercase">
              Organization Type
            </label>

            <select
              name="organizationType"
              value={profile.organizationType}
              onChange={handleChange}
              required
              className="theme-input w-full px-3.5 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-[var(--np-accent)]/20"
            >
              <option value="">Select organization type</option>
              <option value="college">College</option>
              <option value="gaming_cafe">Gaming Cafe</option>
              <option value="company">Company</option>
              <option value="sports_club">Sports Club</option>
              <option value="esports_organization">
                Esports Organization
              </option>
              <option value="content_creator">Content Creator</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Representative name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold theme-subtext uppercase">
              Representative Name (Optional)
            </label>

            <div className="relative">
              <User className="w-4 h-4 theme-subtext absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                name="representativeName"
                value={profile.representativeName}
                onChange={handleChange}
                className="theme-input w-full pl-9 pr-3.5 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-[var(--np-accent)]/20"
                placeholder="Representative name"
              />
            </div>
          </div>

          {/* Contact email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold theme-subtext uppercase">
              Contact Email
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 theme-subtext absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type="email"
                name="contactEmail"
                value={profile.contactEmail}
                onChange={handleChange}
                required
                className="theme-input w-full pl-9 pr-3.5 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-[var(--np-accent)]/20"
                placeholder="contact@example.com"
              />
            </div>
          </div>

          {/* Contact phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold theme-subtext uppercase">
              Contact Phone
            </label>

            <div className="relative">
              <Phone className="w-4 h-4 theme-subtext absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type="tel"
                name="contactPhone"
                value={profile.contactPhone}
                onChange={handleChange}
                required
                className="theme-input w-full pl-9 pr-3.5 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-[var(--np-accent)]/20"
                placeholder="9876543210"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold theme-subtext uppercase">
            Organization Address
          </label>

          <div className="relative">
            <MapPin className="w-4 h-4 theme-subtext absolute left-3 top-3" />

            <textarea
              name="address"
              value={profile.address}
              onChange={handleChange}
              required
              rows="3"
              className="theme-input w-full pl-9 pr-3.5 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-[var(--np-accent)]/20"
              placeholder="Enter complete organization address"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold theme-subtext uppercase">
            Description
          </label>

          <textarea
            name="description"
            value={profile.description}
            onChange={handleChange}
            rows="3"
            className="theme-input w-full p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-[var(--np-accent)]/20"
            placeholder="Tell us about your organization..."
          />
        </div>

        {/* Verification details */}
        <h2
          className="text-sm font-bold theme-text border-b pb-2"
         
        >
          Verification Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Aadhaar */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold theme-subtext uppercase">
              Aadhaar Number
            </label>

            <input
              type="text"
              name="aadhaarNumber"
              value={profile.aadhaarNumber}
              onChange={handleChange}
              required
              maxLength="12"
              pattern="[0-9]{12}"
              className="theme-input w-full px-3.5 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-[var(--np-accent)]/20"
              placeholder="12-digit Aadhaar number"
            />
          </div>

          {/* PAN */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold theme-subtext uppercase">
              PAN Number
            </label>

            <input
              type="text"
              name="panNumber"
              value={profile.panNumber}
              onChange={handleChange}
              required
              maxLength="10"
              pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}"
              className="theme-input w-full px-3.5 py-2 text-sm border rounded-xl uppercase outline-none focus:ring-2 focus:ring-[var(--np-accent)]/20"
              placeholder="ABCDE1234F"
            />
          </div>
        </div>

        <p className="text-xs theme-subtext">
          Your Aadhaar and PAN details are used for organizer verification.
          They will not be displayed in the profile response.
        </p>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            loading={saving}
            icon={saving ? undefined : Save}
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}