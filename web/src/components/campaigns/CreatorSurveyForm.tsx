"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { ChipToggle } from "@/app/(site)/feedback/ChipToggle";
import { CampaignLogo } from "@/components/campaigns/CampaignLogo";
import { submitCreatorSurveyAction } from "@/lib/actions/submitCreatorSurvey";
import {
  CREATOR_SURVEY_CONCERNS,
  CREATOR_SURVEY_HELP_OFFERS,
  CREATOR_SURVEY_QUOTE_MAX,
  CREATOR_SURVEY_REASONS,
  CREATOR_SURVEY_STATEMENTS,
  CREATOR_SURVEY_STATEMENT_ANSWERS,
  toggleConcern,
  type CreatorSurveyAnswers,
  type CreatorSurveyHelpOfferSlug,
  type CreatorSurveyReasonSlug,
  type CreatorSurveyStatementAnswer,
  type CreatorSurveyStatementKey,
} from "@/lib/campaigns/creatorSurvey";
import { DONATION_PROVIDER_URL } from "@/lib/config";

type CreatorSurveyFormProps = {
  campaignId: string;
  displayName: string;
  logoPath: string | null;
  initial: CreatorSurveyAnswers | null;
};

type Notice = { code: "session_expired" | "invalid" | "forbidden" | "error"; message: string };

const EMPTY_ANSWERS: CreatorSurveyAnswers = {
  reasons: [],
  concerns: [],
  statements: {
    einfacherEinstieg: null,
    handschriftWirkt: null,
    schnellEingerichtet: null,
    wiederKampagne: null,
  },
  quote: null,
  consentQuote: false,
  consentAggregate: false,
  helpOffers: [],
};

const AIRMAIL_EDGE =
  "repeating-linear-gradient(-45deg, #C1121F, #C1121F 8px, #FAF8F5 8px, #FAF8F5 12px, #1D3557 12px, #1D3557 20px, #FAF8F5 20px, #FAF8F5 24px)";

const blockClasses = "grid gap-4 border-t border-warmgrau/10 pt-8";
const legendClasses =
  "font-typewriter text-base font-bold leading-snug text-waldgruen-dark md:text-lg";
const fieldsetClasses = "min-w-0 border-x-0 border-b-0 border-t border-warmgrau/10 p-0 pt-8";
const fieldsetLegend = `${legendClasses} float-left mb-4 w-full`;
const linkFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen";

function toggleIn<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

function CheckRow({
  checked,
  disabled = false,
  onChange,
  children,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex items-start gap-3 font-body text-base leading-relaxed ${
        disabled ? "cursor-not-allowed text-warmgrau/45" : "cursor-pointer text-warmgrau/85"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1.5 h-4 w-4 shrink-0 accent-waldgruen"
      />
      <span>{children}</span>
    </label>
  );
}

export function CreatorSurveyForm({
  campaignId,
  displayName,
  logoPath,
  initial,
}: CreatorSurveyFormProps) {
  const start = initial ?? EMPTY_ANSWERS;
  const [reasons, setReasons] = useState(start.reasons);
  const [concerns, setConcerns] = useState(start.concerns);
  const [statements, setStatements] = useState(start.statements);
  const [quote, setQuote] = useState(start.quote ?? "");
  const [consentQuote, setConsentQuote] = useState(start.consentQuote);
  const [consentAggregate, setConsentAggregate] = useState(start.consentAggregate);
  const [helpOffers, setHelpOffers] = useState(start.helpOffers);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  const trimmedQuote = quote.trim();
  const hasQuote = trimmedQuote.length > 0;
  const quoteConsentGiven = consentQuote && hasQuote;

  useEffect(() => {
    // Move focus to the heading when the view switches between form and thanks.
    if (mounted.current) headingRef.current?.focus();
    mounted.current = true;
  }, [done]);

  function setStatement(key: CreatorSurveyStatementKey, answer: CreatorSurveyStatementAnswer) {
    setStatements((current) => ({
      ...current,
      [key]: current[key] === answer ? null : answer,
    }));
  }

  function handleQuoteChange(value: string) {
    setQuote(value.slice(0, CREATOR_SURVEY_QUOTE_MAX));
    if (value.trim() === "") setConsentQuote(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setNotice(null);
    startTransition(async () => {
      try {
        const result = await submitCreatorSurveyAction(campaignId, {
          reasons,
          concerns,
          statements,
          quote: hasQuote ? trimmedQuote : null,
          consentQuote: quoteConsentGiven,
          consentAggregate,
          helpOffers,
        });
        if (result.ok) {
          setDone(true);
          return;
        }
        setNotice({ code: result.code, message: result.message });
      } catch {
        setNotice({
          code: "error",
          message: "Das hat gerade nicht geklappt. Versuch es bitte gleich noch einmal.",
        });
      }
    });
  }

  if (done) {
    return (
      <div className="mt-6 rounded-md border border-warmgrau/12 bg-white/75 p-6 shadow-sm md:p-8">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-typewriter text-2xl font-bold leading-tight text-waldgruen-dark outline-none md:text-3xl"
        >
          Danke, dein Feedback ist angekommen.
        </h1>
        {helpOffers.length > 0 && (
          <p className="mt-4 font-body text-base leading-relaxed text-warmgrau/80">
            Ich melde mich persönlich bei dir.
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/kampagne/verwalten#creator-survey"
            className={`inline-flex min-h-11 items-center justify-center rounded-md bg-waldgruen px-5 py-2.5 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark motion-reduce:transition-none ${linkFocus}`}
          >
            Zurück zur Kampagne
          </Link>
          <button
            type="button"
            onClick={() => setDone(false)}
            className={`min-h-11 font-body text-sm font-semibold text-waldgruen-dark underline underline-offset-2 hover:text-waldgruen ${linkFocus}`}
          >
            Antworten ändern
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 grid gap-8 rounded-md border border-warmgrau/12 bg-white/75 p-5 shadow-sm md:p-8"
    >
      <header>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-balance font-typewriter text-2xl font-bold leading-tight text-waldgruen-dark outline-none md:text-3xl"
        >
          Wie lief eure Kampagne?
        </h1>
        <p className="mt-3 font-body text-base leading-relaxed text-warmgrau/80">
          Ein paar kurze Fragen, etwa 90 Sekunden. Jede Angabe ist freiwillig.
        </p>
      </header>

      <fieldset className="min-w-0 border-0 p-0">
        <legend className={fieldsetLegend}>Was hat euch überzeugt, es zu wagen?</legend>
        <div className="clear-both flex flex-wrap gap-2">
          {CREATOR_SURVEY_REASONS.map((option) => (
            <ChipToggle
              key={option.slug}
              label={option.label}
              checked={reasons.includes(option.slug)}
              onToggle={() =>
                setReasons((current) =>
                  toggleIn<CreatorSurveyReasonSlug>(current, option.slug),
                )
              }
            />
          ))}
        </div>
      </fieldset>

      <fieldset className={fieldsetClasses}>
        <legend className={fieldsetLegend}>
          Welche Bedenken hattet ihr vorher?
        </legend>
        <div className="clear-both flex flex-wrap gap-2">
          {CREATOR_SURVEY_CONCERNS.map((option) => (
            <ChipToggle
              key={option.slug}
              label={option.label}
              checked={concerns.includes(option.slug)}
              onToggle={() => setConcerns((current) => toggleConcern(current, option.slug))}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className={fieldsetClasses}>
        <legend className={fieldsetLegend}>Was davon stimmt für euch?</legend>
        <div className="clear-both grid gap-6">
          {CREATOR_SURVEY_STATEMENTS.map((statement) => {
            const labelId = `statement-${statement.key}`;
            return (
              <div key={statement.key} className="grid gap-3">
                <p id={labelId} className="font-body text-base leading-relaxed text-warmgrau/90">
                  {statement.label}
                </p>
                <div
                  role="radiogroup"
                  aria-labelledby={labelId}
                  className="flex flex-wrap gap-2"
                >
                  {CREATOR_SURVEY_STATEMENT_ANSWERS.map((answer) => (
                    <ChipToggle
                      key={answer.slug}
                      role="radio"
                      label={answer.label}
                      checked={statements[statement.key] === answer.slug}
                      onToggle={() => setStatement(statement.key, answer.slug)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className={blockClasses}>
        <div className="grid gap-1">
          <label
            htmlFor="creator-survey-quote"
            className="font-typewriter text-base font-bold leading-snug text-waldgruen-dark md:text-lg"
          >
            Ein Satz an andere Initiativen (optional)
          </label>
          <p id="creator-survey-quote-hint" className="font-body text-sm leading-relaxed text-warmgrau/70">
            Was würdest du einer Initiative sagen, die überlegt, eine Briefkampagne zu starten?
          </p>
        </div>
        <textarea
          id="creator-survey-quote"
          value={quote}
          onChange={(event) => handleQuoteChange(event.target.value)}
          maxLength={CREATOR_SURVEY_QUOTE_MAX}
          rows={4}
          aria-describedby="creator-survey-quote-hint creator-survey-quote-count"
          className="w-full resize-y rounded-lg border border-warmgrau/25 bg-creme px-4 py-3 font-body text-base text-warmgrau focus:border-waldgruen focus:outline-none focus:ring-2 focus:ring-waldgruen"
        />
        <p
          id="creator-survey-quote-count"
          className="-mt-2 text-right font-body text-xs tabular-nums text-warmgrau/60"
        >
          {quote.length}/{CREATOR_SURVEY_QUOTE_MAX}
        </p>
      </div>

      <fieldset className={fieldsetClasses}>
        <legend className={fieldsetLegend}>Was ich zeigen darf</legend>
        <div className="clear-both grid gap-5">
          <div className="overflow-hidden rounded-md border border-waldgruen/15 bg-creme shadow-sm">
            <div aria-hidden="true" className="h-2" style={{ background: AIRMAIL_EDGE }} />
            <div className="p-5">
              <p className="font-body text-xs text-warmgrau/60">
                So würde dein Satz auf brief-nach-berlin.de aussehen:
              </p>
              <div className="mt-3 flex items-center gap-3">
                <CampaignLogo logoPath={logoPath} name={displayName} size="sm" />
                <p className="font-typewriter text-sm font-bold leading-snug text-waldgruen-dark">
                  Anliegen von {displayName}
                </p>
              </div>
              <p
                className={`mt-4 whitespace-pre-line break-words font-handwriting text-2xl leading-snug ${
                  hasQuote ? "text-warmgrau" : "text-warmgrau/40"
                }`}
              >
                {hasQuote ? trimmedQuote : "Hier erscheint dein Satz."}
              </p>
            </div>
          </div>

          <CheckRow
            checked={quoteConsentGiven}
            disabled={!hasQuote}
            onChange={setConsentQuote}
          >
            Unser Satz darf mit Logo und Name auf brief-nach-berlin.de erscheinen.
          </CheckRow>
          <CheckRow checked={consentAggregate} onChange={setConsentAggregate}>
            Unsere Antworten dürfen anonym in Zahlen einfließen.
          </CheckRow>
          <p className="font-body text-sm leading-relaxed text-warmgrau/65">
            Du kannst beides jederzeit hier ändern oder per Mail an Thomas zurücknehmen.
          </p>
        </div>
      </fieldset>

      <fieldset className={fieldsetClasses}>
        <legend className={fieldsetLegend}>
          Was mir gerade am meisten hilft
        </legend>
        <div className="clear-both grid gap-4">
          <p className="font-body text-base leading-relaxed text-warmgrau/80">
            Mir geht es nicht darum, selbst bekannt zu werden. Je mehr Menschen über Brief nach
            Berlin sprechen, desto mehr schreiben ihren ersten Brief und merken: Ich kann etwas
            bewegen. Wenn ihr Lust habt, kreuzt an, wobei ihr helfen könnt. Ich melde mich dann
            persönlich.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {CREATOR_SURVEY_HELP_OFFERS.map((option) => (
              <ChipToggle
                key={option.slug}
                fullWidth
                label={option.label}
                checked={helpOffers.includes(option.slug)}
                onToggle={() =>
                  setHelpOffers((current) =>
                    toggleIn<CreatorSurveyHelpOfferSlug>(current, option.slug),
                  )
                }
              />
            ))}
          </div>
          <p className="font-body text-xs leading-relaxed text-warmgrau/60">
            Du willst Brief nach Berlin unterstützen?{" "}
            <a
              href={DONATION_PROVIDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold text-waldgruen-dark underline underline-offset-2 hover:text-waldgruen ${linkFocus}`}
            >
              Hier geht&apos;s zur Spende.
            </a>
          </p>
        </div>
      </fieldset>

      <div className="grid gap-4 border-t border-warmgrau/10 pt-8">
        {notice && (
          <p
            role={notice.code === "session_expired" ? "status" : "alert"}
            className={`rounded-md border px-4 py-3 font-body text-sm leading-relaxed ${
              notice.code === "session_expired"
                ? "border-bernstein/40 bg-bernstein/10 text-warmgrau"
                : "border-airmail-rot/25 bg-airmail-rot/5 text-airmail-rot"
            }`}
          >
            {notice.message}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={pending}
            className={`inline-flex min-h-12 w-full items-center justify-center rounded-md bg-waldgruen px-6 py-3 font-body text-base font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none sm:w-auto ${linkFocus}`}
          >
            {pending ? "Wird gesendet …" : "Feedback senden"}
          </button>
        </div>
      </div>
    </form>
  );
}
