"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { InteractiveStars } from "./InteractiveStars";
import { PrivacyDisclosure } from "./PrivacyDisclosure";
import { ChipToggle } from "./ChipToggle";
import { FOUNDER_FEEDBACK_URL } from "@/lib/config";
import {
  NEGATIVE_FEEDBACK_TAGS,
  POSITIVE_FEEDBACK_TAGS,
  type FeedbackTagSlug,
} from "@/lib/feedback/feedbackTags";
import {
  submitReviewAction,
  type SubmitReviewResult,
} from "@/lib/actions/submitReview";

interface FeedbackFormProps {
  initialRating: number;
  token: string;
}

const COMMENT_MAX = 500;
const NAME_MAX = 80;
// Keep in sync with the .animate-progress keyframe duration in globals.css.
const REDIRECT_MS = 20000;

const RATING_HINTS: Record<number, string> = {
  1: "Die KI hat Mist gebaut.",
  2: "Verbesserungswürdig.",
  3: "Grundsolide.",
  4: "Richtig gut.",
  5: "Tippi toppi!",
};

type ChipPolarity = "negative" | "positive";

function getPolarity(rating: number): ChipPolarity {
  return rating >= 4 ? "positive" : "negative";
}

export function FeedbackForm({
  initialRating,
  token,
}: FeedbackFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(initialRating);
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  // Opt-in default (Art. 6 (1) lit. a DSGVO requires an active choice).
  const [consent, setConsent] = useState(false);
  // No default. The user picks one before submit; null blocks submission.
  const [letterSent, setLetterSent] = useState<boolean | null>(null);
  const [feedbackTags, setFeedbackTags] = useState<FeedbackTagSlug[]>([]);
  // Optional fields collapsed by default to keep the page lean.
  const [moreOpen, setMoreOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // True once the server flagged a rate-limit. The next submit click bypasses
  // the throttle; the warning becomes a soft "are you sure?" instead of a block.
  const [bypassRateLimit, setBypassRateLimit] = useState(false);
  const [pending, startTransition] = useTransition();

  const polarity = getPolarity(rating);

  // Reset selected chips when the polarity flips so a user who picked 5 stars
  // (positive chips), then changes to 1 (negative chips), doesn't smuggle stale
  // positive selections into a negative submission. React's documented
  // "store info from previous renders" pattern keeps this out of useEffect.
  const [previousPolarity, setPreviousPolarity] = useState(polarity);
  if (previousPolarity !== polarity) {
    setPreviousPolarity(polarity);
    setFeedbackTags([]);
  }

  // Strip the signed token from the URL after the server-component handed it
  // to us. Keeps it out of browser history, out of Referer headers on outbound
  // clicks, and out of any extension that snoops on location.href.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/feedback");
    }
  }, []);

  // Silent auto-submit: the click on a star in the email is itself the
  // signal — we persist `initialRating` for this token even if the user
  // closes the tab without engaging with the form. Bots that follow GET
  // links (Outlook Safe Links, Microsoft Defender, Gmail link preview,
  // Apple Mail link preview) do not execute JS, so this fires only for
  // real browsers. Server-side `mode: 'initial'` is a no-op on conflict,
  // so a later form-submit with full data cannot be overwritten by a
  // late-arriving initial request.
  const hasAutoSubmittedRef = useRef(false);
  useEffect(() => {
    if (hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
    // Fire-and-forget. No UI state changes — the form stays exactly as it
    // would have without this side effect.
    void submitReviewAction({
      mode: "initial",
      rating: initialRating,
      token,
    }).catch((err) => {
      console.warn("[FeedbackForm] initial auto-submit failed:", err);
    });
  }, [initialRating, token]);

  function toggleTag(slug: FeedbackTagSlug) {
    const isRemoving = feedbackTags.includes(slug);
    if (!isRemoving) setMoreOpen(true);
    setFeedbackTags((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setErrorMessage(null);

    if (rating < 1 || rating > 5) {
      setErrorMessage("Bitte wähle eine Bewertung von 1 bis 5 Sternen.");
      return;
    }
    if (letterSent === null) {
      setErrorMessage("Bitte beantworte noch, ob dein Brief rausgeht.");
      return;
    }

    startTransition(async () => {
      const result: SubmitReviewResult = await submitReviewAction({
        mode: "full",
        rating,
        body: body.trim(),
        displayName: displayName.trim(),
        consent,
        letterSent,
        feedbackTags: feedbackTags.length ? feedbackTags : undefined,
        token,
        bypassRateLimit,
      });
      if ("success" in result) {
        setSubmitted(true);
        return;
      }
      if (result.error === "rate_limited") {
        setBypassRateLimit(true);
      }
      setErrorMessage(result.message);
    });
  }

  if (submitted) {
    return <ThankYouCard onSkip={() => router.push("/")} rating={rating} />;
  }

  const chips =
    polarity === "negative" ? NEGATIVE_FEEDBACK_TAGS : POSITIVE_FEEDBACK_TAGS;
  const chipsLabel = polarity === "negative" ? "Was war's?" : "Was hat geklappt?";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-white border border-waldgruen/15 rounded-2xl px-6 py-8 sm:px-10 sm:py-10 shadow-sm space-y-7 animate-feedback-in"
    >
      <noscript>
        <div
          role="alert"
          className="rounded-lg border border-airmail-rot/30 bg-airmail-rot/5 px-4 py-3 text-sm text-airmail-rot mb-4"
        >
          Bitte aktiviere JavaScript, damit deine Bewertung gespeichert werden kann.
        </div>
      </noscript>
      <header>
        <p className="font-handwriting text-3xl text-waldgruen leading-none mb-1">
          Wie war’s?
        </p>
        <h1 className="font-typewriter text-2xl font-semibold text-waldgruen-dark leading-tight">
          Bewerte deinen Brief
        </h1>
        <p className="font-body text-sm text-warmgrau/70 mt-2">
          Wie war der Brief, den ich dir geschrieben habe?
        </p>

        <div className="flex items-start gap-3 mt-4 pt-4 border-t border-warmgrau/10">
          <Image
            src="/images/thomas-portrait.webp"
            alt="Thomas, Gründer von Brief nach Berlin"
            width={44}
            height={44}
            className="rounded-full object-cover flex-shrink-0 ring-2 ring-waldgruen/20 mt-0.5"
          />
          <p className="font-body text-sm text-warmgrau/80 leading-relaxed">
            Moin, ich bin Thomas. Ich hab das hier gebaut und lese jede Bewertung selbst. Sei gerne schonungslos direkt, gerade wenn was nervt. Lob nehm ich aber genau so ernst 😉{" "} Riesen Dank für deine Zeit!
          </p>
        </div>
      </header>

      {/* Sterne + dynamische Mikro-Copy */}
      <div className="flex flex-col items-center gap-3 py-2">
        <InteractiveStars value={rating} onChange={setRating} />
        <p
          key={rating}
          className="font-handwriting text-2xl text-waldgruen leading-none min-h-[1.5rem] animate-feedback-in text-center px-2"
        >
          {RATING_HINTS[rating] ?? ""}
        </p>
      </div>

      {/* Quick-Tap-Chips (Pilbert-Style) */}
      <fieldset key={polarity} className="animate-feedback-in">
        <legend className="block font-body text-sm font-semibold text-warmgrau mb-3">
          {chipsLabel}{" "}
          <span className="font-normal text-warmgrau/60">
            (optional, mehrfach möglich)
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {chips.map((tag) => (
            <ChipToggle
              key={tag.slug}
              checked={feedbackTags.includes(tag.slug)}
              onToggle={() => toggleTag(tag.slug)}
              label={tag.label}
            />
          ))}
        </div>
      </fieldset>

      {/* Verschickt-Frage (Pflichtfeld) */}
      <fieldset>
        <legend className="block font-body text-sm font-semibold text-warmgrau mb-1">
          Hast du deinen Brief schon verschickt oder verschickst ihn gleich?
        </legend>
        <p className="font-body text-xs text-warmgrau/60 mb-3">
          Hilft mir zu sehen, wie viele unserer Briefe wirklich bis in den Briefkasten kommen.
        </p>
        <div
          role="radiogroup"
          aria-label="Brief verschickt"
          className="flex w-full rounded-xl border border-warmgrau/20 bg-creme p-1 gap-1"
        >
          <SentTab
            checked={letterSent === true}
            onSelect={() => setLetterSent(true)}
            label="Ja, geht raus"
            emoji="✉️"
          />
          <SentTab
            checked={letterSent === false}
            onSelect={() => setLetterSent(false)}
            label="Eher nicht"
            emoji="🤷"
          />
        </div>
      </fieldset>

      {/* Optionale Felder hinter „Mehr sagen" einklappbar */}
      <div>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-waldgruen hover:text-waldgruen-dark cursor-pointer"
        >
          Mehr sagen
          <span
            aria-hidden="true"
            className={`text-[10px] transition-transform duration-300 ${moreOpen ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        <div
          className={`grid transition-all duration-300 ease-out ${
            moreOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-6 pt-1">
              {/* Kommentar */}
              <div>
                <label
                  htmlFor="body"
                  className="block font-body text-sm font-semibold text-warmgrau mb-2"
                >
                  Was hat dir gefallen, was nicht?{" "}
                  <span className="font-normal text-warmgrau/60">(optional)</span>
                </label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, COMMENT_MAX))}
                  maxLength={COMMENT_MAX}
                  rows={4}
                  placeholder="z.B. ‚Hat super geklappt, nur der Ton war etwas zu höflich für mein Anliegen.'"
                  className="bg-creme border border-warmgrau/25 rounded-lg px-4 py-3 text-base font-body text-warmgrau w-full focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen resize-y"
                />
                <p className="text-xs text-warmgrau/60 mt-1 text-right">
                  {body.length} / {COMMENT_MAX}
                </p>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="displayName"
                  className="block font-body text-sm font-semibold text-warmgrau mb-2"
                >
                  Dein Name oder Pseudonym{" "}
                  <span className="font-normal text-warmgrau/60">(optional)</span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value.slice(0, NAME_MAX))}
                  maxLength={NAME_MAX}
                  placeholder="z.B. Anna aus Bremen"
                  className="bg-creme border border-warmgrau/25 rounded-lg px-4 py-3 text-base font-body text-warmgrau w-full focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen"
                />
                <p className="text-xs text-warmgrau/60 mt-1">
                  Wird nur mit deiner Zustimmung gezeigt. Leer lassen = anonym.
                </p>
              </div>

              {/* Public-Display Consent */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-warmgrau/40 text-waldgruen focus:ring-waldgruen accent-waldgruen cursor-pointer"
                />
                <span className="font-body text-sm text-warmgrau leading-relaxed">
                  Meine Bewertung darf später anonymisiert auf brief-nach-berlin.de
                  gezeigt werden. Deine E-Mail-Adresse wird niemals öffentlich gezeigt.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-airmail-rot/30 bg-airmail-rot/5 px-4 py-3 text-sm text-airmail-rot"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={pending}
          className={[
            "bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
            "transition-all min-h-[44px] w-full",
            "inline-flex items-center justify-center gap-2",
            pending
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-waldgruen-dark hover:shadow-md cursor-pointer",
          ].join(" ")}
        >
          {pending ? (
            "Wird gesendet…"
          ) : (
            <>
              <span>{rating}/5</span>
              <span aria-hidden="true" className="text-[#D4A017]">★</span>
              <span>Bewertung absenden</span>
            </>
          )}
        </button>
        <p className="font-body text-xs text-warmgrau/60 text-center leading-relaxed">
          Thomas könnte dich bei Rückfragen zu deiner Bewertung per E-Mail kontaktieren.
        </p>
      </div>

      <PrivacyDisclosure />
    </form>
  );
}

// Segmented-control tab for the "letter sent" radio group. Distinct from
// ChipToggle: this one sits in a 2-button bg-creme bar and uses transparent
// inactive state to keep the unselected side visually quiet.
function SentTab({
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

function ThankYouCard({ onSkip, rating }: { onSkip: () => void; rating: number }) {
  // Pausable auto-redirect. Hovering or focusing either button stops the
  // countdown so users have time to read and decide; the bar visibly pauses
  // with them, then resumes from the same spot when they move away.
  const [paused, setPaused] = useState(false);
  const elapsedRef = useRef(0);
  // Set inside the effect to keep the render phase pure; the effect always
  // overwrites this on its first non-paused run anyway.
  const runStartRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      elapsedRef.current += Date.now() - runStartRef.current;
      return;
    }
    runStartRef.current = Date.now();
    const remaining = Math.max(0, REDIRECT_MS - elapsedRef.current);
    timeoutRef.current = setTimeout(onSkip, remaining);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [paused, onSkip]);

  return (
    <div className="relative bg-white border border-waldgruen/20 rounded-2xl px-6 py-14 sm:px-10 sm:py-16 text-center shadow-sm overflow-hidden animate-thank-you-in">
      <Sparkles />
      <div className="relative z-10">
        <p className="font-handwriting text-7xl sm:text-8xl text-waldgruen mb-4 leading-none animate-danke-pop">
          Danke!
        </p>
        <p className="font-body text-warmgrau mb-2 text-lg">
          Deine Bewertung ist gespeichert.
        </p>
        <p className="font-body text-sm text-warmgrau/70 max-w-sm mx-auto mb-6 leading-relaxed">
          Das hilft uns wirklich. Briefe wirken am stärksten, wenn mehrere
          Stimmen zum selben Thema zusammenkommen.
        </p>
        {rating <= 3 ? (
          <div
            className="rounded-lg border border-waldgruen/15 bg-creme/60 px-4 py-3 text-left max-w-sm mx-auto mb-8 animate-feedback-in"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <p className="font-body text-sm text-warmgrau leading-relaxed">
              Schade, dass der Briefentwurf nicht so überzeugt hat. Möchtest du es nochmal versuchen und dein Anliegen konkreter schildern? Am schnellsten geht das mit der Mikrofon-Funktion, einfach drauflosreden und danach um fehlende Punkte ergänzen.
            </p>
            <Link
              href="/app"
              className="inline-block mt-2 font-body text-sm font-semibold text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 decoration-waldgruen/40 hover:decoration-waldgruen transition-colors"
            >
              Neuen Brief schreiben →
            </Link>
            <p className="font-body text-xs text-warmgrau/60 mt-3">
              Danke dir - Thomas ✌️
            </p>
          </div>
        ) : null}
        <div
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <a
            href={FOUNDER_FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center bg-waldgruen text-creme font-semibold px-4 py-3 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer text-sm min-h-[44px]"
          >
            Generelles Feedback zum Tool
          </a>
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 inline-flex items-center justify-center border border-waldgruen/30 bg-white text-waldgruen-dark font-medium px-4 py-3 rounded-xl hover:bg-waldgruen/5 hover:border-waldgruen transition-colors cursor-pointer text-sm min-h-[44px]"
          >
            Zurück zur Startseite
          </button>
        </div>
        <p className="font-body text-xs text-warmgrau/50 mt-6">
          {paused
            ? "Pausiert. Nimm dir Zeit."
            : "Du wirst gleich automatisch weitergeleitet."}
        </p>
      </div>
      {/* Redirect progress: keyframe scaleX 0 → 1 over REDIRECT_MS. Pausing
          freezes the CSS animation at its current frame and resumes from
          there, mirroring the JS timer. */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-1 bg-waldgruen/10"
      >
        <div
          className="h-full bg-waldgruen origin-left animate-progress"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        />
      </div>
    </div>
  );
}

function Sparkles() {
  // Six absolutely-positioned stars at hand-picked offsets, each with its own
  // animation delay so the twinkle feels organic instead of metronomic.
  const positions: Array<{
    top: string;
    left?: string;
    right?: string;
    delay: string;
    size: string;
  }> = [
    { top: "10%", left: "10%", delay: "0s", size: "text-3xl" },
    { top: "18%", right: "12%", delay: "0.35s", size: "text-2xl" },
    { top: "55%", left: "6%", delay: "0.7s", size: "text-xl" },
    { top: "62%", right: "9%", delay: "0.2s", size: "text-3xl" },
    { top: "28%", left: "48%", delay: "1.0s", size: "text-sm" },
    { top: "78%", left: "42%", delay: "1.2s", size: "text-base" },
  ];
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      {positions.map((p, i) => (
        <span
          key={i}
          className={`absolute text-[#D4A017] ${p.size} animate-twinkle`}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            animationDelay: p.delay,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
