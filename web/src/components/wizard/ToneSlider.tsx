"use client";

interface ToneSliderProps {
  value: number;
  labels: readonly string[];
  ariaLabel: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ToneSlider({ value, labels, ariaLabel, onChange, disabled = false }: ToneSliderProps) {
  const currentLabel = labels[value - 1] ?? labels[2] ?? "";

  return (
    <div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        className="w-full accent-waldgruen cursor-pointer disabled:cursor-not-allowed"
        aria-label={ariaLabel}
        aria-valuetext={currentLabel}
      />
      <div className="mt-2 grid grid-cols-5 gap-1">
        {labels.map((label, index) => (
          <div key={label} className="flex min-w-0 flex-col items-center text-center">
            <span className="h-4 whitespace-nowrap text-xs leading-4" aria-hidden="true">
              {value === index + 1 && index === 3 && "🌶️"}
              {value === index + 1 && index === 4 && "🌶️🌶️"}
            </span>
            <span
              className={`w-full hyphens-auto wrap-anywhere text-xs leading-tight transition-colors ${
                value === index + 1 ? "font-semibold text-waldgruen" : "text-warmgrau/55"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
