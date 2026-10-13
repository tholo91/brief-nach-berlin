"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";

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
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  wide?: boolean;
  multiple?: boolean;
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
        "min-h-[44px] rounded-lg border px-3 py-2.5 font-body text-sm transition-colors",
        "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen",
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

