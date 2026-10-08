import { Trophy, Clock } from "lucide-react";

/**
 * HistoryPage — placeholder route in the PRD §8.4 scope. The records
 * feature is not built yet, so this renders a designed empty state
 * (anti-slop rule: no blank pages) instead of a bare heading.
 */
export function HistoryPage() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="theme-card border theme-border p-6 rounded-2xl w-full">
        <p className="np-eyebrow">Organizer</p>

        <h1 className="font-display text-xl font-bold theme-text mt-1">
          Tournament History
        </h1>

        <p className="text-xs theme-subtext mt-1">
          Past tournament records, results, and prize distributions.
        </p>
      </div>

      {/* Designed empty state */}
      <div className="theme-card border theme-border rounded-2xl p-12 w-full text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[color-mix(in_srgb,var(--np-accent)_12%,transparent)] border border-[var(--np-accent)]/25 flex items-center justify-center mb-4">
          <Trophy size={24} className="text-[var(--np-accent-2)]" />
        </div>

        <h3 className="theme-text font-bold text-sm">
          No Tournament Records Yet
        </h3>

        <p className="theme-subtext text-xs mt-1 max-w-sm mx-auto">
          Completed tournaments and their results will appear here once you
          finish running events.
        </p>

        <p className="text-[10px] theme-subtext mt-4 inline-flex items-center gap-1.5 opacity-70">
          <Clock className="w-3.5 h-3.5" />
          Coming in a future release
        </p>
      </div>
    </div>
  );
}

export default HistoryPage;
