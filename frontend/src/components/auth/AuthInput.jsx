import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

/**
 * AuthInput — PRD §8.2 tokenized auth input.
 *
 * - icon, label, focus glow (np-input), optional password reveal
 * - `error` swaps the border to danger and the label to danger text
 * - forwards all standard input props; id auto-derived for label
 */
export function AuthInput({
  label,
  icon: Icon,
  error,
  type = "text",
  className = "",
  ...props
}) {
  const autoId = useId();
  const id = props.id || autoId;
  const [reveal, setReveal] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword && reveal ? "text" : type;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className={`mb-1.5 block text-xs font-semibold ${error ? "text-[var(--np-danger)]" : "text-[var(--np-text-body)]"}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${error ? "text-[var(--np-danger)]" : "text-[var(--np-text-mute)]"}`}
            aria-hidden="true"
          />
        )}

        <input
          id={id}
          type={resolvedType}
          aria-invalid={Boolean(error) || undefined}
          className={`np-input w-full rounded-xl py-3 pr-11 text-sm text-[var(--np-text-hi)] outline-none transition placeholder:text-[var(--np-text-mute)]/70 ${
            Icon ? "pl-10" : "pl-4"
          } ${error ? "np-input-error" : ""}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--np-text-mute)] transition hover:text-[var(--np-text-body)]"
            aria-label={reveal ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {reveal ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-[var(--np-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthInput;
