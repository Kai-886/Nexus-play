/**
 * Badge — canonical status pill (PRD §5.1, Phase 0).
 *
 * Tone is driven by the token classes in index.css (.np-badge-*).
 * `tone` overrides `status` when you already know the semantic;
 * otherwise status maps by known tournament/platform states.
 */
export function Badge({ status, tone, children, className = "" }) {
  const label = children ?? status;

  const statusTones = {
    live: "success",
    ongoing: "accent",
    published: "success",
    active: "success",
    verified: "success",
    completed: "muted",
    upcoming: "accent",
    registered: "accent",
    approved: "success",
    pending: "warning",
    review: "warning",
    draft: "warning",
    cancelled: "danger",
    rejected: "danger",
    suspended: "danger",
    banned: "danger",
    failed: "danger",
  };

  const resolved =
    tone || statusTones[String(status || "").toLowerCase()] || "muted";

  return (
    <span className={`np-badge np-badge-${resolved} ${className}`}>
      {label}
    </span>
  );
}

export default Badge;
