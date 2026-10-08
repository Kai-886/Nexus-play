import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { resetPassword } from "../../services/authService";
import AuthShell from "../../components/auth/AuthShell";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
//   const { login } = useAuth();

  const [formData, setFormData] = useState({
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

    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields");
      setShakeKey((k) => k + 1);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setShakeKey((k) => k + 1);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setShakeKey((k) => k + 1);
      return;
    }

    if (!token) {
      toast.error("Invalid password reset link");
      setShakeKey((k) => k + 1);
      return;
    }

    try {
      setLoading(true);

      const data = await resetPassword(token, password, confirmPassword);

      if (!data?.success) {
        toast.error(data?.message || "Unable to reset password");
        setShakeKey((k) => k + 1);
        return;
      }

      toast.success("Password reset successfully");

      /*
       * Backend sends a new JWT after resetting the password.
       * Since it is stored in an HTTP-only cookie, the browser
       * handles it automatically.
       */

    //   if (data.user) {
    //     // Keep AuthContext in sync with the newly authenticated user
    //     await login({
    //       email: data.user.email,
    //       password,
    //     });
    //   }

      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to reset password";

      toast.error(message);
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="Create a new password for your NexusPlay account."
      shakeKey={shakeKey}
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--np-accent-2)] transition hover:text-[var(--np-accent-3)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="New Password"
          icon={Lock}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter new password"
          autoComplete="new-password"
        />

        <AuthInput
          label="Confirm Password"
          icon={Lock}
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm new password"
          autoComplete="new-password"
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full rounded-xl py-3 shadow-lg shadow-indigo-600/20"
        >
          {loading ? "Resetting password..." : "Reset Password"}
        </Button>
      </form>
    </AuthShell>
  );
}
