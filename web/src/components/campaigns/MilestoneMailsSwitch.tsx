type MilestoneMailsSwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  labelId: string;
  descriptionId: string;
};

export function MilestoneMailsSwitch({
  checked,
  onChange,
  disabled = false,
  labelId,
  descriptionId,
}: MilestoneMailsSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group inline-flex min-h-11 min-w-14 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 rounded-full transition-colors motion-reduce:transition-none ${
          checked ? "bg-waldgruen" : "bg-warmgrau/25"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
