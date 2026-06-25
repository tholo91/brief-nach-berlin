"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { VoiceRecorder, type VoiceRecorderState } from "@/components/audio/VoiceRecorder";

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
          <span className="sm:hidden">Je konkreter, desto wirksamer</span>
          <span className="hidden sm:inline">
            Je konkreter dein Anliegen, desto wirksamer der Brief
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
            <p className="font-semibold text-waldgruen-dark mb-0.5">Stichpunkte genügen.</p>
            <p>Was siehst du, was nervt dich, was schlägst du vor? Daraus baut das Tool die Sätze.</p>
          </div>
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">Sag kurz, wer du bist.</p>
            <p>
              Beruf, Familie, Verein: solche Details geben Gewicht und verhindern, dass
              Annahmen über dich getroffen werden, die nicht stimmen.
            </p>
          </div>
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">Eine konkrete Bitte reicht.</p>
            <p>
              Was sollen die Abgeordneten <em>tun</em>? Ein präziser Satz schlägt eine
              lange Wunschliste.
            </p>
          </div>
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">
              Sag auch, was du <em>nicht meinst</em>.
            </p>
            <p>
              Wenn etwas missverstanden werden könnte (&bdquo;ich bin für X, aber gegen Y&ldquo;),
              schreib&rsquo;s explizit dazu.
            </p>
          </div>
          <div className="mt-3 rounded-md bg-creme/70 border border-warmgrau/15 px-3 py-2 font-typewriter text-[13px] text-warmgrau/85 italic">
            Beispiel: &bdquo;Ich wohne in der Bremer Neustadt. Letzten Mittwoch stand ich morgens
            am Hauptbahnhof und habe gesehen, wie...&ldquo;
          </div>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_EXAMPLES: string[] = [
  "z.B. Radwege bei uns kaputt, Schlaglöcher überall, gefährlich für Schulkinder",
  "z.B. Miete explodiert in unserem Viertel, Familien ziehen weg, was kann man tun?",
  "z.B. Die Radwege in meiner Stadt sind in einem katastrophalen Zustand. Als Vater von zwei Kindern fahre ich täglich...",
  "z.B. Die Mieten in meiner Nachbarschaft sind in den letzten Jahren massiv gestiegen. Junge Familien können sich die Stadt nicht mehr leisten...",
  "z.B. An der Grundschule meines Kindes teilen sich 340 Kinder zwölf Tablets. Der Digitalpakt Schule kommt nicht an...",
  "z.B. Ich mache mir Sorgen um ein menschenunfreundliches Klima und vermisse echten Klimaschutz vor Ort...",
  "z.B. In unserer Region wird eine Waldfläche für ein Logistikzentrum gerodet, obwohl Alternativstandorte existieren...",
  "z.B. In meinem Landkreis gibt es keinen freien Kinderarzt mehr. Die nächste Praxis mit Kapazität ist 45 Kilometer entfernt...",
  "z.B. Ich mache mir Sorgen um den Umgangston in politischen Debatten und den wachsenden Vertrauensverlust in demokratische Institutionen...",
];

// Terse, one-line variants for the slim landing bar (the long examples above
// would wrap and get clipped on mobile). Same topics, condensed.
const LANDING_PLACEHOLDER_EXAMPLES: string[] = [
  "z.B. kaputte Radwege bei uns",
  "z.B. Sorge um unser Klima",
  "z.B. explodierende Mieten",
  "z.B. kein Kinderarzt vor Ort",
  "z.B. Schule ohne Tablets",
  "z.B. Waldrodung im Ort",
  "z.B. der Ton in der Politik",
];

// iPad/desktop have room for a full one-line prompt, so the landing bar shows
// these richer examples there; phones keep the terse set above (which would
// otherwise wrap and clip on a narrow screen). Kept short enough to stay on
// one line at the hero field's width.
const LANDING_PLACEHOLDER_EXAMPLES_WIDE: string[] = [
  "z.B. Radwege bei uns kaputt, gefährlich für Schulkinder",
  "z.B. Mache mir Sorgen um ein menschenunfreundliches Klima",
  "z.B. Mieten explodieren, Familien ziehen weg",
  "z.B. Kein freier Kinderarzt mehr in unserem Landkreis",
  "z.B. 340 Kinder an der Schule teilen sich zwölf Tablets",
  "z.B. Bei uns soll Wald für ein Logistikzentrum weichen",
  "z.B. Mir macht der raue Ton in der Politik Sorgen",
];

const PLACEHOLDER_ROTATE_MS = 4000;
const MIN_CHARS = 50;

// Cut text to fit a pixel width, appending an ellipsis. Textarea placeholders
// ignore CSS `text-overflow: ellipsis` (it computes to `clip`), so on the slim
// landing field we measure with a canvas and trim in JS to avoid the
// placeholder wrapping to a second line on narrow phones.
let _phMeasureCtx: CanvasRenderingContext2D | null = null;
function ellipsize(text: string, maxWidth: number, font: string): string {
  if (typeof document === "undefined" || maxWidth <= 0 || !font) return text;
  if (!_phMeasureCtx) _phMeasureCtx = document.createElement("canvas").getContext("2d");
  if (!_phMeasureCtx) return text;
  _phMeasureCtx.font = font;
  if (_phMeasureCtx.measureText(text).width <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (_phMeasureCtx.measureText(text.slice(0, mid) + "…").width <= maxWidth) lo = mid;
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

const TONE_LABELS = ["freundlich", "höflich", "sachlich", "bestimmt", "nachdrücklich"] as const;

interface Step2IssueProps {
  onSubmit: (issueText: string, toneLevel: number, usedSpeechToText: boolean, tipsOpened: boolean) => void;
  defaultValue?: string;
  defaultToneLevel?: number;
  /** "landing" hides the heading/intro/tips and renders a slim, auto-growing
   *  hero field. "wizard" (default) is the full step-1 layout. */
  variant?: "wizard" | "landing";
  /** Focus the field on mount, but only on hover/fine-pointer (desktop)
   *  devices so we never force the on-screen keyboard open on touch. */
  autoFocus?: boolean;
  /** Reports the trimmed character count upward so the hero can react to
   *  typing (e.g. swap the tagline above the field). */
  onCharCountChange?: (count: number) => void;
}

export function Step2Issue({
  onSubmit,
  defaultValue,
  defaultToneLevel,
  variant = "wizard",
  autoFocus = false,
  onCharCountChange,
}: Step2IssueProps) {
  const isLanding = variant === "landing";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [issueText, setIssueText] = useState(defaultValue ?? "");
  const [voiceState, setVoiceState] = useState<VoiceRecorderState>("idle");
  const usedVoiceRef = useRef(false);
  // Tracks whether the user opened the tips disclosure (wizard variant only;
  // on the landing the disclosure lives in Hero, which tracks it separately).
  const tipsOpenedRef = useRef(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [toneLevel, setToneLevel] = useState(defaultToneLevel ?? 3);
  // Auto-grow bookkeeping. fieldHeight lets the in-field mic center itself on
  // the textarea; micCentered flips off the moment the text wraps to a second
  // line (landing only) so the mic snaps to the top-right corner.
  const [fieldHeight, setFieldHeight] = useState(52);
  const [micCentered, setMicCentered] = useState(isLanding);
  const [showHint, setShowHint] = useState(false);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // From small tablets up (>=640px, so all iPads incl. the 744px mini) the
  // landing bar shows the longer placeholders; phones keep the terse copy.
  // Tracked in state so it updates on resize/rotation.
  const [isWide, setIsWide] = useState(false);
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  }, []);
  // Live placeholder fit (landing only): the field's available text width + font,
  // used to ellipsize the placeholder so it never wraps on narrow phones.
  const [phWidth, setPhWidth] = useState(0);
  const [phFont, setPhFont] = useState("");

  const charCount = issueText.trim().length;
  const tooShort = charCount < MIN_CHARS;
  const placeholderExamples = isLanding
    ? isWide
      ? LANDING_PLACEHOLDER_EXAMPLES_WIDE
      : LANDING_PLACEHOLDER_EXAMPLES
    : PLACEHOLDER_EXAMPLES;
  const placeholder =
    voiceState === "recording"
      ? "Sprich jetzt, dein Text erscheint hier..."
      : voiceState === "processing"
        ? "Transkribiere deine Aufnahme..."
        : placeholderExamples[placeholderIndex % placeholderExamples.length];
  const displayPlaceholder =
    isLanding && phWidth > 0 ? ellipsize(placeholder, phWidth, phFont) : placeholder;

  const handleVoiceStateChange = useCallback((state: VoiceRecorderState) => {
    setVoiceState(state);
  }, []);

  const triggerHint = useCallback(() => {
    if (!tooShort) return;
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    setShowHint(true);
    hintTimeoutRef.current = setTimeout(() => setShowHint(false), 2000);
  }, [tooShort]);

  useEffect(() => {
    return () => { if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current); };
  }, []);

  // Rotate placeholder every few seconds while textarea is empty, so users
  // get a sense of the kinds of issues that work without a category picker.
  useEffect(() => {
    if (issueText.length > 0) return;
    if (voiceState === "recording" || voiceState === "processing") return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholderExamples.length);
    }, PLACEHOLDER_ROTATE_MS);
    return () => clearInterval(interval);
  }, [issueText, voiceState, placeholderExamples]);

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
    // Landing starts exactly one line tall (single line = vertically centered);
    // the wizard keeps its roomy paragraph box. Empty stays one line so a long
    // rotating placeholder can't inflate the bar.
    const min = isLanding ? oneLine : HEIGHT_MIN_WIZARD;
    const contentHeight = el.value.length > 0 ? el.scrollHeight : oneLine;
    const next = Math.min(HEIGHT_MAX, Math.max(min, contentHeight));
    el.style.height = `${next}px`;
    setFieldHeight(next);
    // Center the mic while the content fits on one line (landing only); once it
    // wraps, hand it back to the top-right corner of the now-taller box.
    setMicCentered(isLanding && contentHeight <= oneLine + 1);
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

  // Report typing progress upward (the hero swaps its tagline at 20 chars).
  useEffect(() => {
    onCharCountChange?.(charCount);
  }, [charCount, onCharCountChange]);

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIssueText(e.target.value);
  };

  const handleTranscription = (text: string) => {
    usedVoiceRef.current = true;
    setIssueText((prev) => (prev ? prev + "\n" + text : text));
  };

  const handleSubmit = () => {
    if (!tooShort) {
      onSubmit(issueText, toneLevel, usedVoiceRef.current, tipsOpenedRef.current);
    }
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
            Was beschäftigt dich gerade?
          </h1>
          <p className="font-body text-sm text-warmgrau/70 mb-4">
            Sprich drauflos und passe deinen Text danach an. Oder nenne ein paar Stichpunkte, du musst keine ganzen Sätze schreiben. Daraus wird dein Briefentwurf formuliert.
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
            placeholder={displayPlaceholder}
            rows={1}
            className={[
              "w-full font-body text-warmgrau bg-creme resize-none overflow-y-auto scrollbar-hide",
              "focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen",
              isLanding
                ? "block rounded-xl border border-warmgrau/30 p-3.5 pr-24 text-base md:text-lg shadow-sm leading-snug placeholder-truncate"
                : "rounded-lg border border-warmgrau/30 px-4 py-3 pr-14 text-base",
            ].join(" ")}
            aria-label={isLanding ? "Dein Anliegen" : undefined}
            aria-describedby="issueText-counter"
          />
          <VoiceRecorder
            hasText={charCount > 0}
            charCount={charCount}
            centered={micCentered}
            fieldHeight={fieldHeight}
            controlRightClass={isLanding ? "right-14" : "right-2.5"}
            forceSubtle={isLanding}
            minChars={MIN_CHARS}
            keyboardHint={!tooShort ? (isMac ? "⌘↵" : "Ctrl+↵") : undefined}
            onTranscription={handleTranscription}
            onStateChange={handleVoiceStateChange}
          />
          {/* Landing: ChatGPT-style round submit CTA next to the mic. Always
              green; under MIN_CHARS a tap/hover shows a "write a bit more" hint
              instead of advancing. Vertically tracks the field like the mic. */}
          {isLanding && (
            <>
              <div
                aria-hidden="true"
                className={[
                  "absolute left-1/2 -translate-x-1/2 -top-9 whitespace-nowrap z-10",
                  "bg-waldgruen-dark text-creme font-body text-xs px-3 py-1.5 rounded-lg",
                  "transition-opacity duration-200 pointer-events-none",
                  showHint && tooShort ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                Schreib noch etwas mehr
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-waldgruen-dark" />
              </div>
              <button
                type="button"
                aria-label="Weiter zum Brief"
                onMouseEnter={triggerHint}
                onClick={tooShort ? triggerHint : handleSubmit}
                className={[
                  // Single line: vertically centered. Multi-line: pinned to the
                  // textarea's bottom so it rides down with the newest line.
                  // Positioned via translateY off the field height (not bottom-*)
                  // so the counter row below doesn't push it down.
                  "absolute right-2.5 top-0 flex h-9 w-9 items-center justify-center rounded-full",
                  "bg-waldgruen text-creme shadow-sm hover:bg-waldgruen-dark transition-colors cursor-pointer",
                ].join(" ")}
                style={{
                  transform: `translateY(${
                    micCentered
                      ? Math.max(0, (fieldHeight - 36) / 2)
                      : Math.max(0, fieldHeight - 36 - 8)
                  }px)`,
                }}
              >
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
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tone slider — wizard only. Removed from the landing to keep the hero
          calm; landing visitors choose the tone here in the wizard. It appears
          softly once enough is typed to make a tone choice meaningful. */}
      {!isLanding && (
      <div
        aria-hidden={tooShort}
        className={[
          "overflow-hidden transition-all duration-500 ease-out",
          tooShort
            ? "opacity-0 max-h-0 mt-0 pointer-events-none"
            : "opacity-100 max-h-40 mt-4 md:mt-6",
        ].join(" ")}
      >
        <label className="block font-body text-sm font-semibold text-waldgruen-dark mb-3">
          Tonalität des finalen Briefes
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={toneLevel}
          onChange={(e) => setToneLevel(Number(e.target.value))}
          className="w-full accent-waldgruen cursor-pointer disabled:opacity-50"
          aria-label="Tonlage des finalen Briefes"
          tabIndex={tooShort ? -1 : 0}
        />
        <div className="flex justify-between mt-1">
          {TONE_LABELS.map((label, i) => (
            <span
              key={label}
              className={[
                "font-body text-xs transition-colors",
                toneLevel === i + 1 ? "text-waldgruen font-semibold" : "text-warmgrau/40",
              ].join(" ")}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      )}

      {/* Submit button — wizard only. On the landing the submit lives as a round
          CTA inside the field (next to the mic), so there's no full-width button
          there. Stays visible (disabled until MIN_CHARS) so the path is clear. */}
      {!isLanding && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={tooShort}
            className={[
              "bg-waldgruen text-creme font-semibold text-base py-4 rounded-xl px-8",
              "hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full",
              tooShort ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}
