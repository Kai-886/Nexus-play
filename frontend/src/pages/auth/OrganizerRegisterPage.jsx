import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User, Building2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";

export function OrganizerRegisterPage() {
  const navigate = useNavigate();
  const { registerOrganizerAccount } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      setShakeKey((k) => k + 1);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setShakeKey((k) => k + 1);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setShakeKey((k) => k + 1);
      return;
    }

    try {
      setLoading(true);

      const data = await registerOrganizerAccount({
        name,
        email,
        password,
      });

      if (!data?.success) {
        toast.error(data?.message || "Unable to create organizer account");
        setShakeKey((k) => k + 1);
        return;
      }

      toast.success("Account created. Complete your organization profile.");

      navigate("/register/organizer/profile", {
        replace: true,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to create organizer account";

      toast.error(message);
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Step 1 of 2 — Organizer"
      title="Account Details"
      subtitle="Create your organizer account to host tournaments on NexusPlay."
      shakeKey={shakeKey}
      footer={
        <div className="space-y-3">
          <p className="text-xs text-[var(--np-text-mute)]">
            Want to register as a player?{" "}
            <Link
              to="/register"
              className="font-semibold text-[var(--np-accent-2)] hover:text-[var(--np-accent-3)]"
            >
              User Registration
            </Link>
          </p>

          <p className="border-t border-[var(--np-stroke)] pt-3 text-sm text-[var(--np-text-mute)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[var(--np-accent-2)] hover:text-[var(--np-accent-3)]"
            >
              Login
            </Link>
          </p>
        </div>
      }
    >
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-[var(--np-accent)]" />
        <div className="h-1.5 flex-1 rounded-full bg-[var(--np-stroke)]" />
      </div>

      <div className="mb-6 flex items-center gap-2 text-[var(--np-accent-2)]">
        <Building2 className="h-5 w-5" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-[0.18em]">
          Organizer Account
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Full Name"
          icon={User}
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          autoComplete="name"
        />

        <AuthInput
          label="Email"
          icon={Mail}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          icon={Lock}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          autoComplete="new-password"
        />

        <AuthInput
          label="Confirm Password"
          icon={Lock}
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          autoComplete="new-password"
        />

        <Button
          type="submit"
          loading={loading}
          className="mt-1 w-full rounded-xl py-3 shadow-lg shadow-indigo-600/20"
        >
          {loading ? "Creating account..." : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}
