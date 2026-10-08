import { Gamepad2, CalendarDays, Handshake, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import useTilt from "../../components/motion/useTilt";

const roles = [
  {
    title: "Player",
    description: "Compete in tournaments and showcase your skills.",
    icon: Gamepad2,
    path: "/register/player",
  },
  {
    title: "Organizer",
    description: "Host and manage esports tournaments.",
    icon: CalendarDays,
    path: "/register/organizer",
  },
  {
    title: "Sponsor",
    description: "Support tournaments and connect with the community.",
    icon: Handshake,
    path: "/register/sponsor",
  },
];

function RoleCard({ role, index }) {
  const { tiltProps } = useTilt({ maxTilt: 6 });
  const Icon = role.icon;

  return (
    <div
      className="np-boot tilt-card np-glass relative rounded-2xl p-5 transition-shadow duration-300 hover:shadow-[var(--np-glow)] md:p-6"
      style={{ "--boot-delay": `${200 + index * 110}ms` }}
      {...tiltProps}
    >
      <div className="tilt-glare" />

      <div className="relative flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--np-stroke)] bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] text-[var(--np-accent-2)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-center text-base font-bold">{role.title}</h2>

        <p className="mt-2 min-h-[42px] text-center text-xs leading-5 text-[var(--np-text-mute)]">
          {role.description}
        </p>

        <Link
          to={role.path}
          className="btn-press np-press mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-transparent bg-[var(--np-accent)] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[var(--np-accent-strong)]"
        >
          Register as {role.title}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function RegisterPage() {
  return (
    <AuthShell
      width="max-w-3xl"
      eyebrow="Join the arena"
      title="Join NexusPlay"
      subtitle="How do you want to participate?"
      footer={
        <p className="text-xs text-[var(--np-text-mute)] sm:text-sm">
          Already have an account?
          <Link
            to="/login"
            className="ml-1 font-semibold text-[var(--np-accent-2)] hover:text-[var(--np-accent-3)]"
          >
            Sign In
          </Link>
        </p>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role, index) => (
          <RoleCard key={role.title} role={role} index={index} />
        ))}
      </div>
    </AuthShell>
  );
}

export default RegisterPage;