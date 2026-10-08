import usePressFeedback from "../motion/usePressFeedback";

/**
 * Button — canonical tokenized button (PRD §5, Phase 0).
 *
 * Variants map to tokens: primary (accent), secondary (surface),
 * outline (stroke + text), danger, ghost.
 * Every press gets the tactile ripple via usePressFeedback —
 * hover = one response rule: the variant owns hover, the ripple
 * owns press.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  onClick,
  className = "",
  disabled,
  ...props
}) {
  // press.className must MERGE, not clobber — spread order matters
  const { className: pressClass, ...pressRest } = usePressFeedback();

  const base =
    "btn-press np-press inline-flex items-center justify-center font-semibold rounded-xl border cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "border-transparent text-white shadow-sm [background:var(--np-accent)] hover:[background:var(--np-accent-strong)]",
    secondary: "theme-card theme-border theme-text hover:theme-hover",
    outline:
      "border-[var(--np-stroke)] bg-transparent theme-text hover:border-[var(--np-accent)]/40 hover:bg-[color-mix(in_srgb,var(--np-accent)_10%,transparent)]",
    danger:
      "border-transparent text-white [background:var(--np-danger)] hover:brightness-110",
    ghost:
      "border-transparent bg-transparent theme-subtext hover:theme-text hover:theme-hover",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${pressClass} ${className}`}
      {...pressRest}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {IconRight && (
        <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}

export default Button;
