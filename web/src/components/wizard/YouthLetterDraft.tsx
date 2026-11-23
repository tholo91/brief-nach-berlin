"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CopyTextButton } from "@/components/CopyTextButton";
import { useUiCopy } from "@/components/i18n/LocaleProvider";
import { LetterPdfButton } from "@/components/schule/LetterPdfButton";
import type { Recipient } from "@/lib/lookup/rathausRecipient";
import { recipientEnvelope } from "@/lib/lookup/recipientEnvelope";
import { RathausAdresseButton } from "./RathausAdresseButton";

type VersionKey = "first" | "improved";

const PDF_DEBOUNCE_MS = 600;

// Ungefähre Zeilenzahl, damit das Textfeld ohne inneres Scrollen den ganzen Brief zeigt.
function rowsFor(text: string): number {
  const lines = text.split("\n").reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 58)), 0);
  return Math.max(10, lines + 1);
}

export function YouthLetterDraft({
  letterText,
  recipient = null,
  pdfDelivery = false,
  classToken,
}: {
  letterText: string;
  recipient?: Recipient | null;
  pdfDelivery?: boolean;
  classToken?: string;
}) {
  const copy = useUiCopy().youth.draft;
  const envelope = useMemo(() => (recipient ? recipientEnvelope(recipient) : null), [recipient]);
  const textareaId = useId();
  const requestId = useId();

  const [versions, setVersions] = useState<{ first: string; improved?: string }>({ first: letterText });
  const [active, setActive] = useState<VersionKey>("first");
  const [changeRequest, setChangeRequest] = useState("");
  const [improveState, setImproveState] = useState<"idle" | "loading" | "error">("idle");
  const [improveError, setImproveError] = useState("");

  const activeText = versions[active] ?? versions.first;
  const improved = versions.improved !== undefined;

  // Das PDF wird erst nach einer kurzen Tipp-Pause neu gebaut, nicht bei jedem Zeichen.
  const [pdfText, setPdfText] = useState(activeText);
  useEffect(() => {
    const timer = window.setTimeout(() => setPdfText(activeText), PDF_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [activeText]);

  function editActive(value: string) {
    setVersions((current) => ({ ...current, [active]: value }));
  }

  function addChip(chip: string) {
    setChangeRequest((current) => {
      const trimmed = current.trim();
      if (trimmed.toLowerCase().includes(chip.toLowerCase())) return current;
      return trimmed ? `${trimmed}\n${chip}` : chip;
    });
  }

  async function improve() {
    if (improved || improveState === "loading") return;
    if (changeRequest.trim().length < 5) {
      setImproveState("error");
      setImproveError(copy.tooShort);
      return;
    }
    setImproveState("loading");
    setImproveError("");
    try {
      const res = await fetch("/api/generate-letter-variant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "youth",
          originalLetter: activeText,
          changeRequest: changeRequest.trim(),
          ...(classToken ? { classToken } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { letter?: string; error?: string };
      if (!res.ok || !data.letter) {
        setImproveState("error");
        setImproveError(data.error ?? copy.fallbackError);
        return;
      }
      setVersions((current) => ({ ...current, improved: data.letter }));
      setActive("improved");
      setImproveState("idle");
    } catch {
      setImproveState("error");
      setImproveError(copy.fallbackError);
    }
  }

  const tabs: { key: VersionKey; label: string }[] = [
    { key: "first", label: copy.tabFirst },
    { key: "improved", label: copy.tabImproved },
  ];

  return (
    <section aria-labelledby="youth-draft-heading" className="mt-6">
      <h2 id="youth-draft-heading" className="font-typewriter text-xl font-bold text-waldgruen-dark m-0">
        {copy.heading}
      </h2>
      <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau">
        {copy.intro}
        {!pdfDelivery && ` ${copy.mailNote}`}
      </p>

      {improved && (
        <div role="tablist" aria-label={copy.versionsLabel} className="mt-4 flex gap-1">
          {tabs.map((tab) => {
            const selected = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={textareaId}
                onClick={() => setActive(tab.key)}
                className={`rounded-t-md border border-b-0 px-4 py-2 font-body text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen ${
                  selected
                    ? "border-warmgrau/20 bg-white text-waldgruen-dark"
                    : "border-transparent bg-waldgruen/5 text-warmgrau hover:bg-waldgruen/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        className={`theme-day overflow-hidden rounded-sm border border-warmgrau/15 bg-white shadow-[0_20px_50px_-30px_rgba(27,67,50,0.45)] ${
          improved ? "rounded-tl-none" : "mt-3"
        }`}
      >
        <div
          aria-hidden="true"
          className="h-2 w-full"
          style={{
            background:
              "repeating-linear-gradient(-45deg, #c1121f 0 10px, #faf8f5 10px 15px, #1d3557 15px 25px, #faf8f5 25px 30px)",
          }}
        />
        <label htmlFor={textareaId} className="sr-only">
          {copy.textareaLabel}
        </label>
        <textarea
          id={textareaId}
          role={improved ? "tabpanel" : undefined}
          value={activeText}
          onChange={(event) => editActive(event.target.value)}
          rows={rowsFor(activeText)}
          spellCheck
          className="block w-full max-w-prose resize-y border-0 bg-transparent p-5 text-left font-body text-[17px] leading-[1.75] text-warmgrau outline-none focus-visible:bg-bernstein/5 sm:p-7"
          style={{ fieldSizing: "content" } as React.CSSProperties}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <CopyTextButton text={activeText} label={copy.copyButton} copiedLabel={copy.copied} />
        <span className="font-body text-sm text-warmgrau/80">{copy.editHint}</span>
      </div>

      <aside className="mt-6 rounded-xl border border-waldgruen/20 bg-waldgruen/5 p-4">
        <h3 className="m-0 font-body text-base font-semibold text-waldgruen-dark">{copy.tipsHeading}</h3>
        <ul className="mt-2 mb-0 list-disc space-y-1 pl-5 font-body text-sm leading-relaxed text-warmgrau">
          {copy.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </aside>

      {!improved && (
        <div className="mt-4 rounded-xl border border-warmgrau/25 bg-creme/70 p-4">
          <h3 className="m-0 font-body text-base font-semibold text-waldgruen-dark">{copy.improveHeading}</h3>
          <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau">
            {copy.improveIntro}
          </p>
          <label htmlFor={requestId} className="mt-3 block font-body text-sm font-semibold text-waldgruen-dark">
            {copy.improveLabel}
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {copy.chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => addChip(chip)}
                className="rounded-full border border-waldgruen/30 bg-white px-3 py-1 font-body text-sm text-waldgruen-dark transition-colors hover:bg-waldgruen/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
              >
                {chip}
              </button>
            ))}
          </div>
          <textarea
            id={requestId}
            value={changeRequest}
            onChange={(event) => setChangeRequest(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder={copy.improvePlaceholder}
            className="mt-2 block w-full rounded-lg border border-warmgrau/30 bg-white p-3 font-body text-base leading-relaxed text-warmgrau focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
          />
          {improveState === "error" && improveError && (
            <p role="alert" className="mt-2 mb-0 font-body text-sm text-airmail-rot">
              {improveError}
            </p>
          )}
          <button
            type="button"
            onClick={improve}
            disabled={improveState === "loading"}
            aria-busy={improveState === "loading"}
            className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-waldgruen px-4 py-2.5 font-body text-base font-bold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
          >
            {improveState === "loading" ? copy.improveLoading : copy.improveIdle}
          </button>
        </div>
      )}

      {recipient?.kind === "rathaus" ? (
        <RathausAdresseButton recipient={recipient} className="mt-4" />
      ) : (
        envelope && (
          <div className="mt-4 rounded-xl border border-warmgrau/25 bg-creme/70 p-4">
            <h3 className="m-0 font-body text-sm font-semibold text-waldgruen-dark">{copy.envelopeHeading}</h3>
            <address className="mt-1 font-body text-base not-italic leading-relaxed text-warmgrau">
              {envelope.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        )
      )}
      {pdfDelivery && envelope && <LetterPdfButton letterText={pdfText} envelope={envelope} />}
    </section>
  );
}
