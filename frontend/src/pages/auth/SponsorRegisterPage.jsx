import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Lock,
  Mail,
  User,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";

export function SponsorRegisterPage() {
  const navigate = useNavigate();
  const { registerSponsorAccount } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    industry: "",
    website: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, companyName, email, password, confirmPassword } = formData;

    if (!name || !companyName || !email || !password) {
      toast.error("Please fill in required fields");
      setShakeKey((k) => k + 1);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setShakeKey((k) => k + 1);
      return;
    }

    try {
      setLoading(true);
      // Register with backend /auth/sponsor/register
      const data = await registerSponsorAccount({
        name,
        companyName,
        industry: formData.industry,
        website: formData.website,
        email,
        password,
      });

      if (data?.success) {
        toast.success("Sponsor account created successfully!");
        navigate("/sponsor/dashboard", { replace: true });
      } else {
        toast.error(data?.message || "Failed to create sponsor account");
        setShakeKey((k) => k + 1);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create sponsor account";
      toast.error(msg);
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      width="max-w-lg"
      eyebrow="Corporate Sponsor & Brand Partner"
      title="Register your brand"
      subtitle="Partner with NexusPlay tournaments and reach the esports community."
      shakeKey={shakeKey}
      footer={
        <p className="text-xs text-[var(--np-text-mute)]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[var(--np-accent-2)] hover:underline"
          >
            Sign In
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthInput
            label="Contact Person Name *"
            icon={User}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            required
          />

          <AuthInput
            label="Company / Brand Name *"
            icon={Building2}
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Razer, Red Bull, etc."
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthInput
            label="Industry / Sector"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="Gaming Hardware, Beverages"
          />

          <AuthInput
            label="Company Website"
            icon={Globe}
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://brand.com"
          />
        </div>

        <AuthInput
          label="Work Email Address *"
          icon={Mail}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="partnerships@brand.com"
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthInput
            label="Password *"
            icon={Lock}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <AuthInput
            label="Confirm Password *"
            icon={Lock}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="mt-1 w-full rounded-xl py-3 text-xs font-bold uppercase tracking-wide shadow-lg shadow-indigo-600/20"
        >
          {loading ? "Creating Brand Account..." : "Register Corporate Sponsor Account"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default SponsorRegisterPage;
