"use client";

// Pill-shaped tap-to-toggle chip. Filled green = selected.
// Generalized from SentTab — used for multi-select feedback chips and
// kept usable as a single-select segmented control via the role prop.

interface ChipToggleProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  emoji?: string;
  role?: "radio" | "checkbox";
  fullWidth?: boolean;
}

export function ChipToggle({
  checked,
  onToggle,
  label,
  emoji,
  role = "checkbox",
  fullWidth = false,
}: ChipToggleProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={checked}
      onClick={onToggle}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg",
        "px-4 py-3 text-sm cursor-pointer min-h-[44px]",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen",
        fullWidth ? "flex-1" : "",
        checked
          ? "bg-waldgruen text-creme font-semibold shadow-sm"
          : "bg-creme/60 border border-warmgrau/20 text-warmgrau/70 hover:text-warmgrau hover:border-warmgrau/40",
      ].join(" ")}
    >
      {emoji ? (
        <span
          aria-hidden="true"
          className={`inline-block transition-all duration-200 ${
            checked
              ? "opacity-100 scale-100 max-w-[1.25rem]"
              : "opacity-0 scale-75 max-w-0 overflow-hidden"
          }`}
        >
          {emoji}
        </span>
      ) : null}
      <span>{label}</span>
    </button>
  );
}
