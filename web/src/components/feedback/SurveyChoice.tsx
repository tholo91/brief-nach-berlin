"use client";

// Segmented-control tab for the "letter sent" radio group. Distinct from
// ChipToggle: this one sits in a 2-button bg-creme bar and uses transparent
// inactive state to keep the unselected side visually quiet.
export function SentTab({
  checked,
  onSelect,
  label,
  emoji,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={[
        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
        "text-sm cursor-pointer min-h-[44px]",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen",
        checked
          ? "bg-waldgruen text-creme font-semibold shadow-sm"
          : "text-warmgrau/60 font-light hover:text-warmgrau",
      ].join(" ")}
    >
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
      <span>{label}</span>
    </button>
  );
}

export function SurveyChoice({
  checked,
  onSelect,
  label,
  wide = false,
  multiple = false,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  wide?: boolean;
  multiple?: boolean;
}) {
  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={checked}
      onClick={onSelect}
      className={[
        "min-h-[44px] rounded-lg border px-3 py-2.5 font-body text-sm transition-colors",
        "cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen",
        wide ? "col-span-2" : "",
        checked
          ? "border-waldgruen bg-waldgruen text-creme font-semibold"
          : "border-warmgrau/20 bg-creme text-warmgrau hover:border-waldgruen/50 hover:text-waldgruen-dark",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

