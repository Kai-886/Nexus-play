import useCountUp from "../../motion/useCountUp";
import useTilt from "../../motion/useTilt";

/**
 * StatCard — PRD §8.3 canonical dashboard stat tile.
 * Tilt + glare, count-up value, boot stagger via `index`.
 *
 *   <StatCard label="Total Users" icon={Users} value={stats.totalUsers}
 *             hint="Registered platform users" index={0} />
 *
 * `value` must be numeric for the count-up; anything else renders as-is.
 * `hintTone` / `iconTone`: accent | cyan | amber | emerald | rose | muted
 */

const TONE_TEXT = {
  accent: "text-[var(--np-accent-2)]",
  cyan: "text-[var(--np-accent-3)]",
  amber: "text-[var(--np-warning)]",
  emerald: "text-[var(--np-success)]",
  rose: "text-[var(--np-danger)]",
  muted: "text-[var(--np-text-mute)]",
};

const TONE_ICON = {
  accent: "text-[var(--np-accent-2)]",
  cyan: "text-[var(--np-accent-3)]",
  amber: "text-[var(--np-warning)]",
  emerald: "text-[var(--np-success)]",
  rose: "text-[var(--np-danger)]",
  muted: "text-[var(--np-text-mute)]",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  hintTone = "muted",
  iconTone = "accent",
  index = 0,
  format = (n) => Math.round(n).toLocaleString("en-IN"),
}) {
  const { tiltProps } = useTilt({ maxTilt: 5 });
  const numeric = typeof value === "number";
  const { ref, display } = useCountUp({ value: numeric ? value : 0, format });

  return (
    <div
      className={`np-boot tilt-card theme-card relative rounded-2xl border p-5 transition-shadow duration-300 theme-border hover:shadow-[var(--np-glow)]`}
      style={{ "--boot-delay": `${index * 70}ms` }}
      {...tiltProps}
    >
      <div className="tilt-glare" />

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider theme-subtext">
            {label}
          </p>

          {Icon && (
            <Icon
              className={`h-4 w-4 shrink-0 ${TONE_ICON[iconTone]}`}
              aria-hidden="true"
            />
          )}
        </div>

        <p
          ref={numeric ? ref : undefined}
          className="np-stat mt-2 font-display text-2xl font-black tabular-nums theme-text"
        >
          {numeric ? display : value}
        </p>

        {hint && (
          <p className={`mt-1 text-[10px] font-semibold ${TONE_TEXT[hintTone]}`}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;
