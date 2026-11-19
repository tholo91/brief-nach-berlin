"use client";

import { useId, useState, type KeyboardEvent } from "react";
import {
  CAMPAIGN_ALTERNATIVE_MAX,
  CAMPAIGN_ALTERNATIVE_MIN,
  CAMPAIGN_PERSONAL_HOOK_MAX,
  CAMPAIGN_PERSONAL_HOOK_MIN,
} from "@/lib/campaigns/issueVariants";

const MAX_ALTERNATIVES = 2;
const MAX_HOOKS = 3;

const labelClass = "font-typewriter text-sm font-bold text-waldgruen-dark";
const helpClass = "font-body text-sm leading-relaxed text-warmgrau/70";
const errorClass = "font-body text-sm text-airmail-rot";
const secondaryButtonClass =
  "min-h-11 rounded-md border border-waldgruen/25 px-4 py-2 font-body text-sm font-semibold text-waldgruen-dark transition-colors hover:border-waldgruen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen disabled:cursor-not-allowed disabled:opacity-50";
const quietButtonClass =
  "min-h-11 rounded-md px-3 py-2 font-body text-sm font-semibold text-warmgrau/75 underline-offset-2 transition-colors hover:text-airmail-rot hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Varianten des Anliegens und Satzanfänge für die persönliche Zeile.
 * Schickt über das umgebende Formular `issueTextAlternative` (je Variante),
 * `personalHook` (je Satzanfang) und `variantsSubmitted=1`.
 */
export function CampaignVariantsEditor({
  initialAlternatives,
  initialHooks,
  issueTextChanged,
  disabled,
  alternativesError,
  hooksError,
}: {
  initialAlternatives: string[];
  initialHooks: string[];
  issueTextChanged: boolean;
  disabled: boolean;
  alternativesError?: string;
  hooksError?: string;
}) {
  const baseId = useId();
  const [alternatives, setAlternatives] = useState<string[]>(initialAlternatives);
  const [hooks, setHooks] = useState<string[]>(initialHooks);
  const [draft, setDraft] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const hasAlternatives = alternatives.some((text) => text.trim().length > 0);
  const hookLimitReached = editIndex === null && hooks.length >= MAX_HOOKS;

  function changeAlternative(index: number, value: string) {
    setAlternatives((current) => current.map((text, i) => (i === index ? value : text)));
  }

  function removeAlternative(index: number) {
    setAlternatives((current) => current.filter((_, i) => i !== index));
  }

  function commitHook() {
    const text = draft.trim();
    if (text.length < CAMPAIGN_PERSONAL_HOOK_MIN) {
      setDraftError(`Bitte schreib mindestens ${CAMPAIGN_PERSONAL_HOOK_MIN} Zeichen.`);
      return;
    }
    if (hooks.some((hook, i) => hook === text && i !== editIndex)) {
      setDraftError("Diesen Satzanfang gibt es schon.");
      return;
    }
    setHooks((current) =>
      editIndex === null
        ? [...current, text]
        : current.map((hook, i) => (i === editIndex ? text : hook))
    );
    setDraft("");
    setEditIndex(null);
    setDraftError(null);
  }

  function startEdit(index: number) {
    setEditIndex(index);
    setDraft(hooks[index]);
    setDraftError(null);
  }

  function cancelEdit() {
    setEditIndex(null);
    setDraft("");
    setDraftError(null);
  }

  function removeHook(index: number) {
    setHooks((current) => current.filter((_, i) => i !== index));
    if (editIndex !== null) cancelEdit();
  }

  function onDraftKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!hookLimitReached) commitHook();
    } else if (event.key === "Escape" && editIndex !== null) {
      cancelEdit();
    }
  }

  return (
    <>
      <input type="hidden" name="variantsSubmitted" value="1" />

      <fieldset
        className="grid gap-3 rounded-md border border-warmgrau/15 bg-surface/55 p-4"
        disabled={disabled}
      >
        <legend className={`px-1 ${labelClass}`}>Varianten des Anliegens</legend>
        <p className={helpClass}>
          Damit Büros nicht lauter gleiche Briefe bekommen, nimmt der Briefassistent zufällig
          einen dieser Texte. Gleiche Forderung, anderer Wortlaut.
        </p>

        {issueTextChanged && hasAlternatives && (
          <p
            role="status"
            className="rounded-md border border-airmail-rot/20 bg-airmail-rot/5 px-3 py-2 font-body text-sm leading-relaxed text-warmgrau/85"
          >
            Du hast das Anliegen geändert. Passen die Varianten noch?
          </p>
        )}

        {alternatives.map((text, index) => {
          const id = `${baseId}-alt-${index}`;
          const length = text.trim().length;
          const tooShort = length > 0 && length < CAMPAIGN_ALTERNATIVE_MIN;
          return (
            <div key={index} className="grid gap-2">
              <label className="font-body text-sm font-semibold text-waldgruen-dark" htmlFor={id}>
                Variante {index + 1}
              </label>
              <textarea
                id={id}
                name="issueTextAlternative"
                rows={6}
                maxLength={CAMPAIGN_ALTERNATIVE_MAX}
                minLength={CAMPAIGN_ALTERNATIVE_MIN}
                value={text}
                onChange={(event) => changeAlternative(index, event.target.value)}
                aria-describedby={`${id}-count`}
                className="rounded-md border border-warmgrau/20 bg-surface px-4 py-3 font-body text-base leading-relaxed outline-none focus:border-waldgruen disabled:opacity-60"
              />
              <div className="flex items-center justify-between gap-3">
                <p
                  id={`${id}-count`}
                  className={`font-body text-xs tabular-nums ${tooShort ? "text-airmail-rot" : "text-warmgrau/60"}`}
                >
                  {length} Zeichen
                  {tooShort ? `, mindestens ${CAMPAIGN_ALTERNATIVE_MIN}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => removeAlternative(index)}
                  className={quietButtonClass}
                >
                  Entfernen
                  <span className="sr-only"> Variante {index + 1}</span>
                </button>
              </div>
            </div>
          );
        })}

        {alternativesError && <p className={errorClass}>{alternativesError}</p>}

        {alternatives.length < MAX_ALTERNATIVES && (
          <div>
            <button
              type="button"
              onClick={() => setAlternatives((current) => [...current, ""])}
              className={secondaryButtonClass}
            >
              Variante hinzufügen
            </button>
          </div>
        )}
      </fieldset>

      <fieldset
        className="grid gap-3 rounded-md border border-warmgrau/15 bg-surface/55 p-4"
        disabled={disabled}
      >
        <legend className={`px-1 ${labelClass}`}>Satzanfänge für die persönliche Zeile</legend>
        <p className={helpClass}>
          Schreibende sehen diese Anfänge als Vorschläge und können damit eine eigene Zeile
          beginnen.
        </p>

        {hooks.length === 0 ? (
          <p className="font-body text-sm leading-relaxed text-warmgrau/60">
            Ohne eigene Satzanfänge erscheinen allgemeine Vorschläge, zum Beispiel „Ich bin selbst
            betroffen:“.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label="Satzanfänge">
            {hooks.map((hook, index) => (
              <li
                key={hook}
                className={[
                  "inline-flex max-w-full min-h-[44px] items-center rounded-full border font-body text-sm leading-5",
                  editIndex === index
                    ? "border-waldgruen/50 bg-waldgruen/10"
                    : "border-warmgrau/25 bg-creme/60",
                ].join(" ")}
              >
                <input type="hidden" name="personalHook" value={hook} />
                <button
                  type="button"
                  onClick={() => startEdit(index)}
                  title="Bearbeiten"
                  aria-label={`Satzanfang bearbeiten: ${hook}`}
                  className="min-h-[44px] min-w-0 rounded-l-full py-2 pl-4 pr-2 text-left text-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
                >
                  <span className="block truncate">{hook}</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeHook(index)}
                  aria-label={`Satzanfang entfernen: ${hook}`}
                  className="grid min-h-[44px] min-w-[44px] place-items-center rounded-r-full text-warmgrau/65 transition-colors hover:text-airmail-rot focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {hookLimitReached ? (
          <p className="font-body text-sm text-warmgrau/60">
            Mehr als {MAX_HOOKS} Satzanfänge sind nicht möglich. Entferne einen, um Platz zu schaffen.
          </p>
        ) : (
          <div className="grid gap-2">
            <label
              className="font-body text-sm font-semibold text-waldgruen-dark"
              htmlFor={`${baseId}-hook`}
            >
              {editIndex === null ? "Neuer Satzanfang" : "Satzanfang bearbeiten"}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={`${baseId}-hook`}
                value={draft}
                maxLength={CAMPAIGN_PERSONAL_HOOK_MAX}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setDraftError(null);
                }}
                onKeyDown={onDraftKeyDown}
                placeholder="z. B. Ich pendle täglich:"
                aria-describedby={draftError ? `${baseId}-hook-error` : undefined}
                aria-invalid={Boolean(draftError)}
                className="min-h-11 min-w-0 flex-1 rounded-md border border-warmgrau/20 bg-surface px-4 py-2 font-body text-base outline-none focus:border-waldgruen disabled:opacity-60"
              />
              <div className="flex gap-2">
                <button type="button" onClick={commitHook} className={secondaryButtonClass}>
                  {editIndex === null ? "Hinzufügen" : "Übernehmen"}
                </button>
                {editIndex !== null && (
                  <button type="button" onClick={cancelEdit} className={quietButtonClass}>
                    Abbrechen
                  </button>
                )}
              </div>
            </div>
            {draftError && (
              <p id={`${baseId}-hook-error`} className={errorClass}>
                {draftError}
              </p>
            )}
          </div>
        )}

        {hooksError && <p className={errorClass}>{hooksError}</p>}
      </fieldset>
    </>
  );
}
