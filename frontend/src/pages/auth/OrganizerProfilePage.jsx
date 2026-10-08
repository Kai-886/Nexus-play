import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";

export function OrganizerProfilePage() {
  const navigate = useNavigate();

  const { createOrganizerProfileData } = useAuth();

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    description: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      organizationName,
      organizationType,
      description,
      address,
      contactEmail,
      contactPhone,
    } = formData;

    if (
      !organizationName ||
      !organizationType ||
      !description ||
      !address ||
      !contactEmail ||
      !contactPhone
    ) {
      toast.error("Please fill in all fields");
      setShakeKey((k) => k + 1);
      return;
    }

    try {
      setLoading(true);

      const data = await createOrganizerProfileData(formData);

      console.log("Organizer profile response:", data);

      if (!data?.success) {
        toast.error(data?.message || "Unable to create organization profile");
        setShakeKey((k) => k + 1);
        return;
      }

      toast.success("Organization profile completed successfully");

      navigate("/organizer/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Organizer profile error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to create organization profile",
      );
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      width="max-w-2xl"
      eyebrow="Step 2 of 2 — Organizer"
      title="Organization Details"
      subtitle="Tell us about your organization to complete registration."
      shakeKey={shakeKey}
    >
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-[var(--np-accent)]" />
        <div className="h-1.5 flex-1 rounded-full bg-[var(--np-accent)]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Organization Name"
          icon={Building2}
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          placeholder="e.g. Nexus Gaming Cafe"
        />

        {/* Organization Type — native select styled to tokens */}
        <div>
          <label
            htmlFor="organizationType"
            className="mb-1.5 block text-xs font-semibold text-[var(--np-text-body)]"
          >
            Organization Type
          </label>

          <select
            id="organizationType"
            name="organizationType"
            value={formData.organizationType}
            onChange={handleChange}
            className="np-input w-full rounded-xl px-4 py-3 text-sm text-[var(--np-text-hi)] outline-none"
          >
            <option value="">Select organization type</option>
            <option value="college">College</option>
            <option value="gaming_cafe">Gaming Cafe</option>
            <option value="company">Company</option>
            <option value="sports_club">Sports Club</option>
            <option value="content_creator">Content Creator</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description — textarea on the token input style */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-xs font-semibold text-[var(--np-text-body)]"
          >
            Description
          </label>

          <div className="relative">
            <FileText
              className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[var(--np-text-mute)]"
              aria-hidden="true"
            />

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us briefly about your organization"
              rows={4}
              className="np-input w-full resize-none rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--np-text-hi)] outline-none transition placeholder:text-[var(--np-text-mute)]/70"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label
            htmlFor="address"
            className="mb-1.5 block text-xs font-semibold text-[var(--np-text-body)]"
          >
            Address
          </label>

          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[var(--np-text-mute)]"
              aria-hidden="true"
            />

            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Organization address"
              rows={3}
              className="np-input w-full resize-none rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--np-text-hi)] outline-none transition placeholder:text-[var(--np-text-mute)]/70"
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthInput
            label="Contact Email"
            icon={Mail}
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="contact@example.com"
          />

          <AuthInput
            label="Contact Phone"
            icon={Phone}
            name="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full rounded-xl py-3 shadow-lg shadow-indigo-600/20"
        >
          {loading ? "Creating profile..." : "Complete Organizer Registration"}
        </Button>
      </form>
    </AuthShell>
  );
}
