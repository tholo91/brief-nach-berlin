"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

function useRadioTabStop(checked: boolean) {
  const ref = useRef<HTMLButtonElement>(null);
  const setRef = useCallback((node: HTMLButtonElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const group = ref.current?.closest('[role="radiogroup"]');
    if (!group) return;

    const radios = Array.from(
      group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
    );
    const tabStop = radios.find((radio) => radio.getAttribute("aria-checked") === "true") ?? radios[0];
    radios.forEach((radio) => {
      radio.tabIndex = radio === tabStop ? 0 : -1;
    });
  }, [checked]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const current = ref.current;
    const group = current?.closest('[role="radiogroup"]');
    if (!current || !group) return;

    const radios = Array.from(
      group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'),
    );
    const currentIndex = radios.indexOf(current);
    if (currentIndex < 0 || radios.length === 0) return;

    event.preventDefault();
    let nextIndex: number;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = radios.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % radios.length;
    } else {
      nextIndex = (currentIndex - 1 + radios.length) % radios.length;
    }

    const next = radios[nextIndex];
    next.focus();
    next.click();
  }

  return { setRef, onKeyDown };
}

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
  const { setRef, onKeyDown } = useRadioTabStop(checked);
  return (
    <button
      ref={setRef}
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={[
        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
        "text-sm cursor-pointer min-h-[44px]",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen",
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
  icon,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  wide?: boolean;
  multiple?: boolean;
  icon?: ReactNode;
}) {
  const { setRef, onKeyDown } = useRadioTabStop(multiple ? false : checked);
  return (
    <button
      ref={multiple ? undefined : setRef}
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={checked}
      tabIndex={multiple ? undefined : checked ? 0 : -1}
      onClick={onSelect}
      onKeyDown={multiple ? undefined : onKeyDown}
      className={[
        "flex min-h-[44px] items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left font-body text-sm",
        "cursor-pointer motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen",
        wide ? "col-span-2" : "",
        checked
          ? "border-waldgruen bg-waldgruen text-creme font-semibold"
          : "border-warmgrau/20 bg-creme text-warmgrau hover:border-waldgruen/50 hover:text-waldgruen-dark",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center border-[1.5px] motion-safe:transition-colors motion-safe:duration-200",
          multiple ? "rounded-[5px]" : "rounded-full",
          checked ? "border-creme bg-creme text-waldgruen" : "border-warmgrau/35 bg-white",
        ].join(" ")}
      >
        {multiple ? (
          <svg viewBox="0 0 16 16" className={`h-3 w-3 fill-none stroke-current motion-safe:transition-opacity motion-safe:duration-200 ${checked ? "opacity-100" : "opacity-0"}`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        ) : (
          <span className={`h-2 w-2 rounded-full bg-current motion-safe:transition-transform motion-safe:duration-200 ${checked ? "scale-100" : "scale-0"}`} />
        )}
      </span>
      {icon}
      <span>{label}</span>
    </button>
  );
}
