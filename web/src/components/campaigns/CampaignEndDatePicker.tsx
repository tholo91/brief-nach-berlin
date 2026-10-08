"use client";

import {
  berlinDateKey,
  campaignEndsAtFromDate,
  endDateForChoice,
  formatCampaignEndDate,
  type CampaignEndChoice,
} from "@/lib/campaigns/endDate";

export type CampaignEndPickerValue = {
  choice: CampaignEndChoice;
  customDate: string;
};

const CHOICE_LABELS: Record<CampaignEndChoice, string> = {
  none: "Kein Enddatum",
  "2w": "2 Wochen",
  "1m": "1 Monat",
  "3m": "3 Monate",
  custom: "Eigenes Datum",
};

const CHOICES: CampaignEndChoice[] = ["none", "2w", "1m", "3m", "custom"];

export const DEFAULT_END_PICKER_VALUE: CampaignEndPickerValue = {
  choice: "none",
  customDate: "",
};

export function pickerValueFromEndsAt(
  endsAt: string | null | undefined,
): CampaignEndPickerValue {
  if (!endsAt) return DEFAULT_END_PICKER_VALUE;
  return { choice: "custom", customDate: berlinDateKey(new Date(endsAt)) };
}

/** Datum (YYYY-MM-DD) oder leerer String für "kein Enddatum". */
export function resolvePickerDateKey(
  value: CampaignEndPickerValue,
  now: Date = new Date(),
): string {
  if (value.choice === "none") return "";
  if (value.choice === "custom") return value.customDate;
  return endDateForChoice(value.choice, now);
}

type CampaignEndDatePickerProps = {
  value: CampaignEndPickerValue;
  onChange: (next: CampaignEndPickerValue) => void;
  idPrefix: string;
  disabled?: boolean;
  error?: string;
};

export function CampaignEndDatePicker({
  value,
  onChange,
  idPrefix,
  disabled = false,
  error,
}: CampaignEndDatePickerProps) {
  const dateKey = resolvePickerDateKey(value);
  const previewId = `${idPrefix}-preview`;
  const errorId = `${idPrefix}-error`;
  const customId = `${idPrefix}-custom-date`;

  const preview =
    value.choice === "none"
      ? "Die Kampagne läuft, bis du sie selbst beendest."
      : dateKey
        ? `Endet am ${formatCampaignEndDate(campaignEndsAtFromDate(dateKey))} um 23:59 Uhr.`
        : "Wähle den letzten Tag der Kampagne.";

  return (
    <fieldset className="grid gap-3" disabled={disabled}>
      <legend className="font-typewriter text-sm font-bold text-waldgruen-dark">
        Enddatum
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {CHOICES.map((choice) => {
          const id = `${idPrefix}-${choice}`;
          return (
            <div key={choice} className={choice === "none" ? "relative col-span-2" : "relative"}>
              <input
                id={id}
                type="radio"
                name={`${idPrefix}-choice`}
                value={choice}
                checked={value.choice === choice}
                onChange={() => onChange({ ...value, choice })}
                aria-describedby={previewId}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-warmgrau/20 bg-white px-4 py-2 font-body text-sm font-semibold text-warmgrau/80 transition-colors hover:border-waldgruen/40 peer-checked:border-waldgruen peer-checked:bg-waldgruen/8 peer-checked:text-waldgruen-dark peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-waldgruen peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
              >
                {CHOICE_LABELS[choice]}
              </label>
            </div>
          );
        })}
      </div>
      {value.choice === "custom" && (
        <div className="grid gap-2 sm:max-w-xs">
          <label
            htmlFor={customId}
            className="font-body text-sm font-semibold text-waldgruen-dark"
          >
            Letzter Tag der Kampagne
          </label>
          <input
            id={customId}
            type="date"
            min={berlinDateKey(new Date())}
            value={value.customDate}
            onChange={(event) =>
              onChange({ ...value, customDate: event.target.value })
            }
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : previewId}
            className="rounded-md border border-warmgrau/20 bg-white px-4 py-3 font-body text-base outline-none focus:border-waldgruen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen disabled:opacity-60"
          />
        </div>
      )}
      <p
        id={previewId}
        aria-live="polite"
        className="font-body text-sm leading-relaxed text-warmgrau/70"
      >
        {preview}
      </p>
      {error && (
        <p id={errorId} className="font-body text-sm text-airmail-rot">
          {error}
        </p>
      )}
      <input type="hidden" name="endDate" value={dateKey} />
    </fieldset>
  );
}
