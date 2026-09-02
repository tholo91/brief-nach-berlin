"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { VoiceRecorder, type VoiceRecorderState } from "@/components/audio/VoiceRecorder";
import { useLocale, useUiCopy } from "@/components/i18n/LocaleProvider";
import { readLandingDraft, writeLandingDraft } from "@/lib/landing-draft";
import { ISSUE_TEXT_MAX } from "@/lib/validation/wizardSchemas";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";

// SSR-safe layout effect: avoids the "useLayoutEffect does nothing on the
// server" warning while still running before paint on the client (so the
// auto-grow height is correct on the first frame, no flicker).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Self-contained so it can be reused both in the wizard step and in the
// landing hero (where it appears once the visitor starts writing).
export function TipsDisclosure({
  onOpen,
  variant = "wizard",
}: { onOpen?: () => void; variant?: "landing" | "wizard" } = {}) {
  const copy = useUiCopy();
  const isLandingTips = variant === "landing";
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(true);
  // Fire onOpen only the first time the disclosure is opened (used to track
  // "tips ever opened" for the debug payload).
  const openedRef = useRef(false);

  // Subtle pulse for ~3s on first mount to draw attention without being noisy.
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const toggle = () => {
    if (!open && !openedRef.current) {
      openedRef.current = true;
      onOpen?.();
    }
    setOpen((o) => !o);
    setHint(false);
  };

  return (
    <div
      id="tips-disclosure"
      className={[
        "mb-4 overflow-hidden scroll-mt-4",
        // Landing: a flat, calm info box (no shadow, no left stripe) so it
        // doesn't read as a button. A faint border + lightly frosted creme keep
        // it legible over the busy hero video. Wizard: the original accent-
        // stripe style on its calm creme background.
        isLandingTips
          ? "rounded-lg border border-waldgruen/20 bg-creme/70 backdrop-blur-sm"
          : "border-l-4 border-waldgruen bg-waldgruen/5 rounded-r-lg",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="tips-content"
        className={[
          "w-full flex items-center justify-between gap-3 px-4 py-3 text-left",
          "font-body text-sm font-semibold text-waldgruen-dark",
          "hover:bg-waldgruen/[0.12] transition-colors cursor-pointer",
          // Open state clearly set apart: tinted header + hairline to the body.
          open ? "bg-waldgruen/[0.06] border-b border-waldgruen/10" : "",
          hint && !open ? "animate-pulse" : "",
        ].join(" ")}
      >
        <span className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
          </svg>
          {/* Phones keep the terse line; from small tablets up (>=640px, so
              all iPads incl. the 744px mini) there's room for the fuller,
              more motivating version. */}
          <span className="sm:hidden">{copy.issue.tipsSummary}</span>
          <span className="hidden sm:inline">
            {copy.issue.tipsSummary}
          </span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id="tips-content"
        className={`transition-all duration-300 ease-out overflow-hidden ${
          open ? "max-h-[680px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-1 font-body text-sm text-warmgrau leading-relaxed space-y-3.5">
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">{copy.issue.tipsPoint1Title}</p>
            <p>{copy.issue.tipsPoint1Text}</p>
          </div>
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">{copy.issue.tipsPoint2Title}</p>
            <p>{copy.issue.tipsPoint2Text}</p>
          </div>
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">{copy.issue.tipsPoint3Title}</p>
            <p>{copy.issue.tipsPoint3Text}</p>
          </div>
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">{copy.issue.tipsPoint4Title}</p>
            <p>{copy.issue.tipsPoint4Text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_ROTATE_MS = 4000;
const TYPEWRITER_TYPE_MS = 42;
const TYPEWRITER_HOLD_MS = 1200;
const TYPEWRITER_DELETE_MS = 24;
const TYPEWRITER_NEXT_MS = 350;
const MIN_CHARS = 50;
const ISSUE_TEXT_MAX_HINT = 4500;

// Clamp the landing placeholder to at most two lines, appending an ellipsis if
// it would overflow. Textarea placeholders ignore CSS line-clamp, so we simulate
// the field's word-wrap with a canvas: count how many lines the text needs at
// the field's text width and, if it exceeds two, binary-search the longest
// prefix (plus "…") that still fits within two lines. A pure pixel budget isn't
// enough — word-wrap slack can push a "1.9 lines wide" string onto a third line.
let _phMeasureCtx: CanvasRenderingContext2D | null = null;
function wrappedLineCount(
  text: string,
  lineWidth: number,
  ctx: CanvasRenderingContext2D
): number {
  let lines = 1;
  let cur = "";
  for (const word of text.split(" ")) {
    const trial = cur ? cur + " " + word : word;
    if (ctx.measureText(trial).width <= lineWidth || !cur) cur = trial;
    else {
      lines++;
      cur = word;
    }
  }
  return lines;
}
function clampToTwoLines(text: string, lineWidth: number, font: string): string {
  if (typeof document === "undefined" || lineWidth <= 0 || !font) return text;
  if (!_phMeasureCtx) _phMeasureCtx = document.createElement("canvas").getContext("2d");
  if (!_phMeasureCtx) return text;
  _phMeasureCtx.font = font;
  if (wrappedLineCount(text, lineWidth, _phMeasureCtx) <= 2) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    const cand = text.slice(0, mid).trimEnd() + "…";
    if (wrappedLineCount(cand, lineWidth, _phMeasureCtx) <= 2) lo = mid;
    else hi = mid - 1;
  }
  return text.slice(0, lo).trimEnd() + "…";
}

// Auto-grow height bounds (px). The field follows its content up to a shared
// max, then scrolls. The landing variant has no fixed min height: it starts
// exactly one line tall (so a single line of text sits vertically centered)
// and grows line by line. The wizard variant keeps a roomy min so it reads
// as a paragraph box from the start.
const HEIGHT_MAX = 320;
const HEIGHT_MIN_WIZARD = 160;

interface Step2IssueProps {
  onSubmit: (issueText: string, usedSpeechToText: boolean, tipsOpened: boolean) => void;
  defaultValue?: string;
  /** "landing" hides the heading/intro/tips and renders a slim, auto-growing
   *  hero field. "wizard" (default) is the full step-1 layout. */
  variant?: "wizard" | "landing";
  /** Focus the field on mount, but only on hover/fine-pointer (desktop)
   *  devices so we never force the on-screen keyboard open on touch. */
  autoFocus?: boolean;
  isCampaign?: boolean;
}

export function Step2Issue({
  onSubmit,
  defaultValue,
  variant = "wizard",
  autoFocus = false,
  isCampaign = false,
}: Step2IssueProps) {
  const { locale } = useLocale();
  const copy = useUiCopy();
  const isLanding = variant === "landing";
  const voiceUnavailable = locale === "tr";
  const transcriptionLanguage = locale === "en" ? "en" : "de";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [issueText, setIssueText] = useState(defaultValue ?? "");
  const lastDefaultValueRef = useRef(defaultValue);
  const [voiceState, setVoiceState] = useState<VoiceRecorderState>("idle");
  const usedVoiceRef = useRef(false);
  // Tracks whether the user opened the tips disclosure (wizard variant only;
  // on the landing the disclosure lives in Hero, which tracks it separately).
  const tipsOpenedRef = useRef(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // Auto-grow bookkeeping. fieldHeight lets the in-field mic + submit pin
  // themselves to the bottom-right corner of the (always multi-line) landing
  // field, riding down as the box grows with each new line.
  const [fieldHeight, setFieldHeight] = useState(52);
  const [showHint, setShowHint] = useState(false);
  const [hintKind, setHintKind] = useState<"short" | "long" | null>(null);
  const [stopVoiceRequestKey, setStopVoiceRequestKey] = useState(0);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // From small tablets up (>=640px, so all iPads incl. the 744px mini) the
  // landing bar shows the longer placeholders; phones keep the terse copy.
  // Tracked in state so it updates on resize/rotation.
  const [isWide, setIsWide] = useState(false);
  // Lazy initializer instead of an effect: navigator is unavailable during SSR
  // (defaults to Mac there), read once on the client. isMac only picks the
  // keyboard-hint glyph (⌘↵ vs Ctrl+↵), which is hidden until text is typed, so
  // the SSR/client default can't cause a visible hydration mismatch.
  const [isMac] = useState(() =>
    typeof navigator !== "undefined"
      ? /Mac|iPhone|iPad|iPod/.test(navigator.platform)
      : true
  );
  // Live placeholder fit (landing only): the field's available text width + font,
  // used to ellipsize the placeholder so it never wraps on narrow phones.
  const [phWidth, setPhWidth] = useState(0);
  const [phFont, setPhFont] = useState("");

  const charCount = issueText.trim().length;
  const tooShort = charCount < MIN_CHARS;
  const tooLong = charCount > ISSUE_TEXT_MAX;
  const showMaxCounter = charCount > ISSUE_TEXT_MAX_HINT;
  const canProceed = !tooShort && !tooLong;
  const showExpandedLandingCta = isLanding && canProceed;
  const placeholderExamples = isLanding
    ? isWide
      ? copy.issue.placeholdersWide
      : copy.issue.placeholders
    : copy.issue.placeholders;
  const placeholder =
    voiceState === "requesting"
      ? copy.issue.placeholderPreparingMic
      : voiceState === "recording"
      ? copy.issue.placeholderRecording
      : voiceState === "processing"
        ? copy.issue.placeholderTranscribing
        : placeholderExamples[placeholderIndex % placeholderExamples.length];
  // Two-line field: let the example wrap to a second line, clamping it (with an
  // ellipsis) only if it would spill onto a third.
  const displayPlaceholder =
    isLanding && phWidth > 0
      ? clampToTwoLines(placeholder, phWidth, phFont)
      : placeholder;
  const displayAnimatedPlaceholder =
    isLanding && phWidth > 0
      ? clampToTwoLines(animatedPlaceholder, phWidth, phFont)
      : animatedPlaceholder;
  const keyboardHint = canProceed ? (isMac ? "⌘↵" : "Ctrl+↵") : undefined;
  const maxCharsLabel = ISSUE_TEXT_MAX.toLocaleString("de-DE");
  const charCountLabel = charCount.toLocaleString("de-DE");

  useEffect(() => {
    if (defaultValue === lastDefaultValueRef.current) return;
    lastDefaultValueRef.current = defaultValue;
    setIssueText(defaultValue ?? "");
  }, [defaultValue]);

  const handleVoiceStateChange = useCallback((state: VoiceRecorderState) => {
    setVoiceState(state);
  }, []);

  const triggerHint = useCallback((kind: "short" | "long") => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    setHintKind(kind);
    setShowHint(true);
    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(false);
      setHintKind(null);
    }, 2500);
  }, []);

  useEffect(() => {
    return () => { if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current); };
  }, []);

  // Rotate the wizard placeholder every few seconds. The landing variant uses
  // the typewriter effect below instead.
  useEffect(() => {
    if (isLanding) return;
    if (issueText.length > 0) return;
    if (
      voiceState === "requesting" ||
      voiceState === "recording" ||
      voiceState === "processing"
    ) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholderExamples.length);
    }, PLACEHOLDER_ROTATE_MS);
    return () => clearInterval(interval);
  }, [isLanding, issueText, voiceState, placeholderExamples]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  // Landing placeholder: type, hold, delete, then continue with the next
  // example while the field remains empty, including while it is focused.
  useEffect(() => {
    if (!isLanding || issueText.length > 0 || voiceState !== "idle" || prefersReducedMotion) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const animate = (index: number) => {
      const fullText = placeholderExamples[index % placeholderExamples.length] ?? "";
      let visibleCharacters = 0;

      const typeNext = () => {
        if (cancelled) return;
        visibleCharacters += 1;
        setAnimatedPlaceholder(fullText.slice(0, visibleCharacters));
        if (visibleCharacters < fullText.length) {
          timeout = setTimeout(typeNext, TYPEWRITER_TYPE_MS);
        } else {
          timeout = setTimeout(deleteNext, TYPEWRITER_HOLD_MS);
        }
      };

      const deleteNext = () => {
        if (cancelled) return;
        visibleCharacters -= 1;
        setAnimatedPlaceholder(fullText.slice(0, visibleCharacters));
        if (visibleCharacters > 0) {
          timeout = setTimeout(deleteNext, TYPEWRITER_DELETE_MS);
        } else {
          timeout = setTimeout(() => animate(index + 1), TYPEWRITER_NEXT_MS);
        }
      };

      timeout = setTimeout(() => {
        if (cancelled) return;
        setAnimatedPlaceholder("");
        timeout = setTimeout(typeNext, TYPEWRITER_TYPE_MS);
      }, 0);
    };

    animate(0);
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [isLanding, issueText, voiceState, prefersReducedMotion, placeholderExamples]);

  // Auto-grow: the field follows its content (ChatGPT-style) instead of being a
  // fixed box with a drag handle. On the landing variant it starts slim and
  // opens up once the visitor has typed enough to mean it.
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // One natural text line incl. padding, measured live so it stays correct
    // across breakpoints (the landing field uses a larger font on desktop).
    const cs = window.getComputedStyle(el);
    const oneLine =
      parseFloat(cs.lineHeight) +
      parseFloat(cs.paddingTop) +
      parseFloat(cs.paddingBottom);
    // Landing starts two lines tall to invite more than a one-liner; the wizard
    // keeps its roomy paragraph box. Empty stays at the two-line floor so the
    // rotating placeholder (now up to two lines) can't inflate the bar further.
    const twoLines = oneLine + parseFloat(cs.lineHeight);
    const min = isLanding ? twoLines : HEIGHT_MIN_WIZARD;
    const contentHeight =
      el.value.length > 0 ? el.scrollHeight : isLanding ? twoLines : oneLine;
    const next = Math.min(HEIGHT_MAX, Math.max(min, contentHeight));
    el.style.height = `${next}px`;
    setFieldHeight(next);
  }, [isLanding]);

  useIsoLayoutEffect(() => {
    resize();
  }, [resize, issueText]);

  // Re-measure on viewport changes: the landing font (and thus one-line
  // height) differs between mobile and desktop, so a rotation/resize must
  // recompute the height and the centered state.
  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  // Track the small-tablet breakpoint (>=640px) for the longer placeholders.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Landing: measure the field's available text width + font so the placeholder
  // can be ellipsized to one line (see ellipsize()). Re-measures on resize.
  useEffect(() => {
    if (!isLanding) return;
    const measure = () => {
      const el = textareaRef.current;
      if (!el) return;
      const cs = window.getComputedStyle(el);
      setPhWidth(
        el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      );
      setPhFont(`${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isLanding]);

  // Desktop-only autofocus: gate on a hover/fine-pointer device so phones (and
  // tablets without a keyboard) don't get an unwanted keyboard popup on load.
  // Focus after the first paint (rAF) so it lands reliably even if the field
  // mounts behind the autoplaying hero video / late layout.
  useEffect(() => {
    if (!autoFocus || typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const raf = requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [autoFocus]);

  // Landing only: einen zuvor getippten Entwurf beim Mount wiederherstellen,
  // damit die Rückkehr zur Startseite (z.B. per Browser-"Zurück" aus dem
  // Wizard) das Feld nicht leert. Als Layout-Effect, also erst nach der
  // Hydration und nur clientseitig -> kein SSR/Client-Mismatch durch das Lesen
  // von sessionStorage während des Renderns.
  useIsoLayoutEffect(() => {
    if (!isLanding) return;
    const saved = readLandingDraft();
    if (saved) setIssueText(saved);
    // Nur einmal beim Mount; isLanding ist stabil.
  }, [isLanding]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setIssueText(value);
    // Nur bei echter Nutzereingabe persistieren (nie beim Mount), damit der
    // Restore-Effect oben nicht überschrieben wird.
    if (isLanding) writeLandingDraft(value);
  };

  const handleTranscription = (text: string) => {
    usedVoiceRef.current = true;
    setIssueText((prev) => {
      // Funktionale Form unverändert (wird auch im Wizard genutzt); für die
      // Landing zusätzlich den maßgeblichen neuen Wert persistieren.
      const next = prev ? prev + "\n" + text : text;
      if (isLanding) writeLandingDraft(next);
      return next;
    });
  };

  const handleSubmit = () => {
    if (canProceed) {
      onSubmit(issueText, usedVoiceRef.current, tipsOpenedRef.current);
    }
  };

  const handleLandingSubmitClick = () => {
    if (voiceState === "recording") {
      setStopVoiceRequestKey((key) => key + 1);
      return;
    }

    if (tooShort) {
      triggerHint("short");
      return;
    }

    if (tooLong) {
      triggerHint("long");
      return;
    }

    handleSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      {/* Heading, intro and tips belong to the committed wizard step. On the
          landing hero the big H1 already sets the frame, so we drop them and
          let the field be the focal point. */}
      {!isLanding && (
        <>
          <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
            {isCampaign ? copy.issue.campaignHeading : copy.issue.heading}
          </h1>
          <p className="font-body text-sm text-warmgrau/70 mb-4">
            {isCampaign ? copy.issue.campaignIntro : copy.issue.intro}
          </p>

          {/* Tips disclosure — subtle nudge toward effective writing */}
          <TipsDisclosure onOpen={() => { tipsOpenedRef.current = true; }} />
        </>
      )}

      {/* Textarea with inline mic — voice is the easy path, typing the fallback */}
      <div>
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="issueText"
            value={issueText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={isLanding && voiceState === "idle" ? "" : displayPlaceholder}
            rows={1}
            className={[
              "w-full font-body text-warmgrau bg-creme resize-none overflow-y-auto scrollbar-hide",
              "focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen",
              "placeholder:text-warmgrau/40",
              isLanding
                ? "block rounded-xl border border-warmgrau/30 px-3.5 pt-3.5 pb-12 text-base md:text-lg shadow-sm leading-snug placeholder-truncate"
                : "rounded-lg border border-warmgrau/30 px-4 pt-3 pb-12 pr-14 text-base",
            ].join(" ")}
            aria-label={isLanding ? copy.issue.textareaAriaLabel : undefined}
            aria-describedby="issueText-counter"
          />
          {isLanding && issueText.length === 0 && voiceState === "idle" && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 right-3.5 top-3.5 overflow-hidden text-left font-body text-base leading-snug text-warmgrau/40 md:text-lg"
            >
              {prefersReducedMotion ? displayPlaceholder : displayAnimatedPlaceholder}
            </div>
          )}
          <VoiceRecorder
            key={locale}
            language={transcriptionLanguage}
            hidden={voiceUnavailable}
            hasText={charCount > 0}
            charCount={charCount}
            fieldHeight={fieldHeight}
            controlRightClass={
              isLanding
                ? showExpandedLandingCta
                  ? "right-[6.2rem] md:right-[6.2rem]"
                  : "right-11"
                : "right-2.5"
            }
            forceSubtle={isLanding}
            minChars={MIN_CHARS}
            keyboardHint={keyboardHint}
            hideVoiceStatus={isLanding}
            hideMetaRow={isLanding}
            hideCounter={!isLanding}
            pinToBottom={!isLanding}
            stopRequestKey={stopVoiceRequestKey}
            onTranscription={handleTranscription}
            onStateChange={handleVoiceStateChange}
          />
          <div
            className={[
              "absolute flex items-center overflow-hidden",
              "text-left text-xs md:text-sm text-warmgrau/40 pointer-events-none",
              isLanding
                ? showExpandedLandingCta
                  ? "bottom-3.5 left-3.5 right-[9.5rem] md:right-[10rem]"
                  : "bottom-3.5 left-3.5 right-24 md:right-44"
                : "top-0 left-4 right-20 h-8 translate-y-[var(--counter-y)] md:right-32",
            ].join(" ")}
            style={
              isLanding
                ? undefined
                : ({ "--counter-y": `${Math.max(0, fieldHeight - 32 - 12)}px` } as React.CSSProperties)
            }
          >
            <p
              id="issueText-counter"
              aria-live="polite"
              className={[
                "truncate",
                charCount > 0
                  ? tooLong
                    ? "rounded-md border border-airmail-rot/40 bg-airmail-rot/10 px-2 py-0.5 text-airmail-rot"
                    : "rounded-md border border-warmgrau/20 bg-creme/80 px-2 py-0.5"
                  : "sr-only",
              ].join(" ")}
            >
              {charCount > 0
                ? tooShort
                  ? `${charCountLabel} von mind. ${MIN_CHARS} Zeichen`
                  : showMaxCounter
                    ? `${charCountLabel} / ${maxCharsLabel} Zeichen`
                    : `${charCountLabel} Zeichen`
                : ""}
            </p>
          </div>
          {keyboardHint && (
            <div
              className={[
                "absolute hidden items-center whitespace-nowrap md:flex",
                "text-xs md:text-sm text-warmgrau/40 pointer-events-none",
                isLanding
                  ? showExpandedLandingCta
                    ? "bottom-3.5 right-[9.5rem]"
                    : "bottom-3.5 right-24"
                  : "top-0 right-16 h-8 translate-y-[var(--counter-y)]",
              ].join(" ")}
              style={
                isLanding
                  ? undefined
                  : ({ "--counter-y": `${Math.max(0, fieldHeight - 32 - 12)}px` } as React.CSSProperties)
              }
              aria-hidden="true"
            >
              {keyboardHint} starten
            </div>
          )}
          {/* Landing: ChatGPT-style round submit CTA next to the mic. Always
              green; under MIN_CHARS a tap/hover shows a "write a bit more" hint
              instead of advancing. Vertically tracks the field like the mic. */}
          {isLanding && (
            <>
              {showHint && hintKind === "short" && (
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2 -top-9 whitespace-nowrap z-10 bg-waldgruen-dark text-creme font-body text-xs px-3 py-1.5 rounded-lg transition-opacity duration-200 pointer-events-none"
                >
                  {copy.issue.writeMore}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-waldgruen-dark" />
                </div>
              )}
              {showHint && hintKind === "long" && (
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2 -top-9 whitespace-nowrap z-10 bg-airmail-rot text-creme font-body text-xs px-3 py-1.5 rounded-lg transition-opacity duration-200 pointer-events-none"
                >
                  {copy.issue.shortenIssue}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-airmail-rot" />
                </div>
              )}
              <button
                type="button"
                aria-label={
                  voiceState === "recording"
                    ? copy.issue.stopRecordingAriaLabel
                    : copy.issue.startIssueAriaLabel
                }
                onMouseEnter={() => {
                  if (tooShort) triggerHint("short");
                  else if (tooLong) triggerHint("long");
                }}
                onClick={handleLandingSubmitClick}
                className={[
                  // Pinned to the textarea's bottom-right corner so it rides
                  // down with the newest line. Positioned via translateY off the
                  // field height (not bottom-*) so the counter row below doesn't
                  // push it down.
                  "absolute right-2.5 top-0 flex h-8 items-center justify-center overflow-hidden rounded-full",
                  "bg-waldgruen text-creme shadow-sm hover:bg-waldgruen-dark transition-[width,padding,background-color] duration-300 ease-out cursor-pointer",
                  showExpandedLandingCta ? "w-[5.45rem] pl-1.5 pr-1" : "w-8 px-0",
                ].join(" ")}
                style={{
                  transform: `translateY(${Math.max(0, fieldHeight - 32 - 12)}px)`,
                }}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-200",
                    showExpandedLandingCta
                      ? "mr-0.5 max-w-16 opacity-100"
                      : "mr-0 max-w-0 opacity-0",
                  ].join(" ")}
                >
                  {copy.issue.start}
                </span>
                <WizardForwardIcon className="shrink-0" />
              </button>
            </>
          )}
        </div>
        {voiceUnavailable && (
          <p className="mt-2 font-body text-xs leading-snug text-warmgrau/65">
            {copy.language.turkishTypingNotice}
          </p>
        )}
      </div>

      {/* Submit button — wizard only. On the landing the submit lives as a round
          CTA inside the field (next to the mic), so there's no full-width button
          there. Stays visible (disabled until MIN_CHARS) so the path is clear. */}
      {!isLanding && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canProceed}
            className={[
              "relative bg-waldgruen text-creme font-semibold text-base py-4 rounded-xl px-8 pr-14 whitespace-nowrap",
              "hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full",
              canProceed ? "cursor-pointer" : "opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            {copy.issue.start}
            <WizardForwardIcon className="absolute right-5 top-1/2 -translate-y-1/2" />
          </button>
        </div>
      )}
    </div>
  );
}
