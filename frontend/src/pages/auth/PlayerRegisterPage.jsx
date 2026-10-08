import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";

export function PlayerRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

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

      const data = await register({
        name,
        email,
        password,
      });

      if (!data?.success) {
        toast.error(data?.message || "Registration failed");
        setShakeKey((k) => k + 1);
        return;
      }

      toast.success("Account created successfully");

      navigate("/participant/dashboard", {
        replace: true,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to create account";

      toast.error(message);
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Player registration"
      title="Create your account"
      subtitle="Register as a player on NexusPlay"
      shakeKey={shakeKey}
      footer={
        <p className="text-sm text-[var(--np-text-mute)]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[var(--np-accent-2)] hover:text-[var(--np-accent-3)]"
          >
            Login
          </Link>
        </p>
      }
    >
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
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
