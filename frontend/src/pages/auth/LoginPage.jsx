import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, Trophy, Users, Swords } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";
import catLogo from "../../assets/cat-logo.jpg";

const perks = [
  { icon: Trophy, title: "Discover tournaments", body: "Explore exciting esports events." },
  { icon: Users, title: "Compete with players", body: "Join a growing esports community." },
  { icon: Swords, title: "Build your esports journey", body: "Track your progress and achievements." },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const cardRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter your email and password");
      setShakeKey((k) => k + 1);
      return;
    }

    try {
      setLoading(true);

      const data = await login(formData);

      if (!data?.success) {
        toast.error(data?.message || "Login failed");
        setShakeKey((k) => k + 1);
        return;
      }

      toast.success("Login successful");

      const role = data.user?.role;

      if (role === "organizer") {
        navigate("/organizer/dashboard", { replace: true });
      } else if (role === "superadmin" || role === "admin") {
        navigate("/superadmin/dashboard", { replace: true });
      } else if (role === "sponsor") {
        navigate("/sponsor/dashboard", { replace: true });
      } else {
        navigate("/participant/dashboard", { replace: true });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to login. Please check your credentials.";

      toast.error(message);
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      width="max-w-md"
      shakeKey={shakeKey}
      brandLogo={catLogo}
      eyebrow="Welcome back"
      title="Sign In"
      subtitle="Enter your credentials to continue."
      footer={
        <p className="text-sm text-[var(--np-text-mute)]">
          Don't have an account?
          <Link
            to="/register"
            className="ml-1 font-semibold text-[var(--np-accent-2)] transition hover:text-[var(--np-accent-3)]"
          >
            Create Account
          </Link>
        </p>
      }
    >
      {/* Perk list — desktop side panel flavor, compact on mobile */}
      <div className="mb-7 hidden gap-3 lg:grid">
        {perks.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--np-stroke)] bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold text-[var(--np-text-hi)]">{title}</p>
              <p className="text-[11px] text-[var(--np-text-mute)]">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" ref={cardRef}>
        <AuthInput
          label="Email Address"
          icon={Mail}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div>
          <AuthInput
            label="Password"
            icon={Lock}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          <div className="mt-2 flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-[var(--np-accent-2)] transition hover:text-[var(--np-accent-3)]"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full rounded-xl py-3 shadow-lg shadow-indigo-600/25"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
