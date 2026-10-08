import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { forgotPassword } from "../../services/authService.js";
import AuthShell from "../../components/auth/AuthShell";
import AuthInput from "../../components/auth/AuthInput";
import Button from "../../components/ui/Button";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const data = await forgotPassword(email);

      if (!data?.success) {
        toast.error(data?.message || "Unable to send reset email");
        return;
      }

      toast.success("Password reset email sent");
      setEmailSent(true);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to send password reset email";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a password reset link."
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
      {!emailSent ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <AuthInput
            label="Email"
            icon={Mail}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full rounded-xl py-3 shadow-lg shadow-indigo-600/20"
          >
            {loading ? "Sending reset link..." : "Send Reset Link"}
          </Button>
        </form>
      ) : (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--np-stroke)] bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)]">
            <Mail className="h-5 w-5 text-[var(--np-accent-2)]" aria-hidden="true" />
          </div>

          <h3 className="text-base font-bold">Check your email</h3>

          <p className="mt-2 text-sm leading-6 text-[var(--np-text-mute)]">
            If an account exists for{" "}
            <span className="font-medium text-[var(--np-text-hi)]">{email}</span>,
            a password reset link has been sent.
          </p>
        </div>
      )}
    </AuthShell>
  );
}
