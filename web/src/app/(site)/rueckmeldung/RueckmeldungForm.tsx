"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { SurveyChoice } from "@/components/feedback/SurveyChoice";
import { submitOutcomeAction } from "@/lib/actions/submitOutcome";
import type { OutcomeAnswers, OutcomeEntryChoice } from "@/lib/rueckmeldung/schema";
import {
  POLITICAL_SELF_EFFICACY_LABELS,
  POLITICAL_SELF_EFFICACY_VALUES,
} from "@/lib/feedback/politicalActivation";

const VOICE_URL = "https://www.heyspeak.io/l/_AkL8g0mlosEDTMU6vDxuA";
const EMPTY_ANSWERS: OutcomeAnswers = {
  letterSent: null, notSentReason: null, replyChannels: [], replyAddressed: null,
  issueScope: null, expectation: null, politicalSelfEfficacy: null, writeAgain: null,
};

const ICON_PATHS = {
  letter: "M4 6h16v12H4z M4 7l8 6 8-6",
  email: "M3 8l9-5 9 5v11H3z M3 8l9 6 9-6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
  callback: "M15 4h5v5 M20 4l-6 6 M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
  meeting: "M4 6h16v14H4z M4 11h16 M8 3v4 M16 3v4",
  acknowledgement: "M4 12l5 5L20 6",
  none: "M12 3a9 9 0 100 18 9 9 0 000-18z M8 12h8",
} as const;

function ChoiceIcon({ name }: { name: keyof typeof ICON_PATHS }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={ICON_PATHS[name]} /></svg>;
}

export function RueckmeldungLinkCleanup() {
  useEffect(() => { window.history.replaceState(window.history.state, "", "/rueckmeldung"); }, []);
  return null;
}

export function RueckmeldungForm({ token, entryChoice }: { token: string; entryChoice: OutcomeEntryChoice }) {
  const [answers, setAnswers] = useState<OutcomeAnswers>({
    ...EMPTY_ANSWERS,
    letterSent: entryChoice === "not_sent" ? "not_sent" : null,
    replyChannels: entryChoice === "no" ? ["none"] : [],
  });
  const [showSentQuestion, setShowSentQuestion] = useState(entryChoice !== "not_sent");
  const [processingConsent, setProcessingConsent] = useState(false);
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [consent, setConsent] = useState(false);
  const [callOk, setCallOk] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [initialStatus, setInitialStatus] = useState<"saving" | "saved" | "error">("saving");
  const [error, setError] = useState("");
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const initialSent = useRef(false);
  const thanksRef = useRef<HTMLDivElement>(null);

  const saveInitial = useCallback(async () => {
    try {
      const result = await submitOutcomeAction({ mode: "initial", token, entryChoice });
      setInitialStatus("success" in result ? "saved" : "error");
    } catch {
      setInitialStatus("error");
    }
  }, [entryChoice, token]);

  useEffect(() => {
    if (initialSent.current) return;
    initialSent.current = true;
    queue.current = saveInitial();
  }, [saveInitial]);

  function retryInitial() {
    setInitialStatus("saving");
    queue.current = queue.current.catch(() => undefined).then(saveInitial);
  }

  useEffect(() => {
    if (submitted) {
      thanksRef.current?.scrollIntoView({ behavior: "instant", block: "center" });
      thanksRef.current?.focus();
    }
  }, [submitted]);

  function change(patch: Partial<OutcomeAnswers>, lastStep: string) {
    const next = { ...answers, ...patch };
    if (next.letterSent === "not_sent") {
      next.replyChannels = [];
      next.replyAddressed = null;
    } else {
      next.notSentReason = null;
      if (next.replyChannels.includes("none") || !next.replyChannels.length) next.replyAddressed = null;
    }
    setAnswers(next);
    setError("");
    setSaveStatus("Auswahl wird gespeichert…");
    queue.current = queue.current.catch(() => undefined).then(async () => {
      try {
        const result = await submitOutcomeAction({ mode: "progress", token, entryChoice, answers: next, lastStep, processingConsent: true });
        if ("success" in result) setInitialStatus("saved");
        setSaveStatus("success" in result ? "Auswahl gespeichert." : "Zwischenspeichern hat nicht geklappt. Mit Absenden versuchst du es erneut.");
      } catch {
        setSaveStatus("Zwischenspeichern hat nicht geklappt. Mit Absenden versuchst du es erneut.");
      }
    });
  }

  function toggleChannel(channel: OutcomeAnswers["replyChannels"][number]) {
    const selected = answers.replyChannels;
    const replyChannels = channel === "none" ? [channel]
      : selected.includes(channel) ? selected.filter((item) => item !== channel)
      : [...selected.filter((item) => item !== "none"), channel];
    change({ replyChannels }, "reply_channels");
  }

  const notSent = answers.letterSent === "not_sent";
  const hasReply = answers.replyChannels.length > 0 && !answers.replyChannels.includes("none");
  const replyReady = answers.replyChannels.length > 0 && (!hasReply || answers.replyAddressed !== null);
  const showScope = notSent ? answers.notSentReason !== null : answers.letterSent !== null && replyReady;
  const showExpectation = showScope && answers.issueScope !== null;
  const showEfficacy = showExpectation && answers.expectation !== null;
  const showAgain = showEfficacy && answers.politicalSelfEfficacy !== null;
  const complete = showAgain && answers.writeAgain !== null;
  const questionCount = notSent ? (showSentQuestion ? 6 : 5) : hasReply ? 7 : 6;
  const answered = [showSentQuestion && answers.letterSent !== null,
    notSent ? answers.notSentReason !== null : answers.replyChannels.length > 0,
    !notSent && hasReply && answers.replyAddressed !== null,
    answers.issueScope !== null, answers.expectation !== null,
    answers.politicalSelfEfficacy !== null, answers.writeAgain !== null].filter(Boolean).length;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    if (!complete || !processingConsent) { setError("Bitte beantworte noch die offenen Fragen."); return; }
    setPending(true);
    setError("");
    await queue.current.catch(() => undefined);
    try {
      const result = await submitOutcomeAction({ mode: "full", token, entryChoice, answers, processingConsent,
        body: body.trim(), consent, displayName: consent ? displayName.trim() : "", callOk, lastStep: "completed" });
      if ("success" in result) setSubmitted(true);
      else setError(result.message);
    } catch { setError("Das hat gerade nicht geklappt. Deine Eingaben sind noch da. Versuch es bitte nochmal."); }
    setPending(false);
  }

  if (submitted) return (
    <div ref={thanksRef} tabIndex={-1} className="rounded-2xl border border-waldgruen/20 bg-white px-6 py-12 text-center outline-none sm:px-10">
      <p className="mb-5 font-handwriting text-6xl text-waldgruen">Danke dir!</p>
      <h1 className="mb-4 font-typewriter text-xl font-bold text-waldgruen-dark">Deine Rückmeldung ist angekommen.</h1>
      <p className="mb-8 leading-relaxed">Du hilfst mir zu verstehen, was nach dem Brief passiert. Auch wenn keine Antwort kam.</p>
      {callOk && <p className="mb-8 text-sm">Du bist offen für ein Gespräch. Wenn ich dazu eine Rückfrage habe, melde ich mich per E-Mail bei dir.</p>}
      <Link href="/" className="inline-flex min-h-11 items-center rounded-xl bg-waldgruen px-6 py-3 font-semibold text-creme hover:bg-waldgruen-dark">Zur Startseite</Link>
      <p className="mt-6 text-sm"><Link href="/datenschutz#rueckmeldungen" className="text-waldgruen underline">Datenschutz und Löschung</Link></p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-waldgruen/15 bg-white shadow-sm">
      <RueckmeldungLinkCleanup />
      <div aria-hidden="true" className="h-1 bg-[repeating-linear-gradient(-45deg,#C1121F_0px,#C1121F_8px,#FAF8F5_8px,#FAF8F5_12px,#1D3557_12px,#1D3557_20px,#FAF8F5_20px,#FAF8F5_24px)]" />
      <header className="px-6 pb-6 pt-8 sm:px-9">
        <p className="mb-3 font-handwriting text-4xl text-waldgruen">{entryChoice === "yes" ? "Wie schön, dass etwas kam." : entryChoice === "no" ? "Danke, dass du auch das erzählst." : "Danke für die ehrliche Antwort."}</p>
        <h1 className="mb-4 font-typewriter text-2xl font-bold leading-snug text-waldgruen-dark">Wie ist es mit deinem Brief gelaufen?</h1>
        <p className="leading-relaxed">Dauert ca. 2 Minuten. Jede Antwort zählt, auch „nichts gehört“.</p>
        <p className="mt-4 text-sm leading-relaxed text-warmgrau/80">Dein Klick aus der Mail wird mit deiner E-Mail-Adresse gespeichert. Weitere Antworten sind freiwillig. Deine Auswahl wird nach jedem Klick gespeichert. Freitext und Häkchen erst mit „Rückmeldung absenden“.</p>
      </header>
      <form onSubmit={onSubmit} className="px-6 pb-8 sm:px-9">
        {initialStatus === "saving" && <p role="status" className="mb-4 text-sm">Dein Klick wird gespeichert…</p>}
        {initialStatus === "error" && <div className="mb-6 rounded-xl border border-airmail-rot/30 bg-airmail-rot/5 p-4">
          <p role="alert" className="text-sm leading-relaxed">Dein Klick konnte noch nicht gespeichert werden. Du kannst es erneut versuchen oder das Formular trotzdem ausfüllen.</p>
          <button type="button" onClick={retryInitial} disabled={pending} className="mt-3 min-h-11 rounded-lg border border-waldgruen px-4 py-2 text-sm font-semibold text-waldgruen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen">Klick erneut speichern</button>
        </div>}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-creme p-4 text-sm leading-relaxed">
          <input type="checkbox" checked={processingConsent} disabled={pending} onChange={(event) => setProcessingConsent(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-waldgruen" />
          <span>Ich willige ausdrücklich ein, dass Thomas meine Umfrageantworten, auch mögliche Angaben zu politischen Meinungen, zusammen mit meiner E-Mail-Adresse auswertet. Ich kann meine Einwilligung jederzeit widerrufen und meine Daten löschen lassen. <Link href="/datenschutz#rueckmeldungen" className="text-waldgruen underline">Mehr zum Datenschutz</Link></span>
        </label>
        {!processingConsent && <p className="mt-4 text-sm leading-relaxed text-warmgrau/80">Du entscheidest, ob du mehr erzählen möchtest. Du kannst diese Seite auch einfach schließen.</p>}
        {processingConsent && <fieldset disabled={pending} className="mt-8 min-w-0 space-y-9 disabled:opacity-70">
          <legend className="sr-only">Deine Erfahrungen mit dem Brief</legend>
          <div>
            <p className="mb-2 text-sm text-warmgrau/70" role="status">{answered} von {questionCount} Fragen beantwortet</p>
            <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-waldgruen/10"><div className="h-full rounded-full bg-waldgruen motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out" style={{ width: `${Math.min(100, (answered / questionCount) * 100)}%` }} /></div>
          </div>
          {!showSentQuestion && <p className="flex items-center justify-between gap-4 rounded-lg bg-creme p-4 text-sm"><span>Du hast deinen Brief nicht abgeschickt.</span><button type="button" onClick={() => setShowSentQuestion(true)} className="min-h-11 font-semibold text-waldgruen underline">Ändern</button></p>}
          {showSentQuestion && <Question title="Hast du deinen Brief abgeschickt?" mark="abgeschickt">
            <Choices label="Brief abgeschickt" values={[["handwritten", "Von Hand geschrieben"], ["typed", "Getippt oder ausgedruckt"], ["not_sent", "Nein"]]} value={answers.letterSent} onSelect={(letterSent) => change({ letterSent }, "letter_sent")} />
          </Question>}
          {notSent && <Question title="Was hat dich gebremst?" mark="gebremst">
            <Choices label="Grund fürs Nichtabschicken" values={[["no_time", "Keine Zeit"], ["postage_or_address", "Briefmarke oder Adresse"], ["doubt", "Zweifel, ob es was bringt"], ["forgot", "Vergessen"], ["other", "Anderes"]]} value={answers.notSentReason} onSelect={(notSentReason) => change({ notSentReason }, "not_sent_reason")} />
          </Question>}
          {answers.letterSent !== null && !notSent && <Question title="Kam eine Reaktion?" mark="Reaktion" hint="Du kannst mehrere Antworten auswählen.">
            <div role="group" aria-label="Art der Reaktion" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {([["letter", "Brief"], ["email", "E-Mail"], ["phone", "Anruf"], ["callback", "Bitte um Rückruf"], ["meeting", "Termin oder Einladung"], ["acknowledgement", "Nur Eingangsbestätigung"], ["none", "Noch nichts"]] as const).map(([value, label]) => <SurveyChoice key={value} multiple icon={<ChoiceIcon name={value} />} checked={answers.replyChannels.includes(value)} label={label} onSelect={() => toggleChannel(value)} />)}
            </div>
          </Question>}
          {!notSent && hasReply && <Question title="Wurde auf dein Anliegen eingegangen?" mark="Anliegen">
            <Choices label="Auf das Anliegen eingegangen" values={[["concrete", "Ja, konkret"], ["partly", "Teilweise"], ["generic", "Eher allgemein"]]} value={answers.replyAddressed} onSelect={(replyAddressed) => change({ replyAddressed }, "reply_addressed")} />
          </Question>}
          {showScope && <Question title="Wie war dein Anliegen?" mark="Anliegen">
            <Choices label="Art des Anliegens" values={[["local", "Konkret vor Ort lösbar"], ["big", "Größeres politisches Thema"]]} value={answers.issueScope} onSelect={(issueScope) => change({ issueScope }, "issue_scope")} />
          </Question>}
          {showExpectation && <Question title="Was hast du dir vorher erwartet?" mark="erwartet">
            <Choices label="Erwartung vor dem Brief" values={[["answer", "Eine Antwort"], ["read", "Dass es gelesen wird"], ["said_it", "Es einmal gesagt zu haben"], ["nothing_specific", "Nichts Bestimmtes"]]} value={answers.expectation} onSelect={(expectation) => change({ expectation }, "expectation")} />
          </Question>}
          {showEfficacy && <Question title="Wie fühlst du dich jetzt damit?" mark="fühlst" hint="Hast du durch den Brief eher das Gefühl, dich politisch einbringen zu können?">
            <Choices label="Politische Handlungsfähigkeit" values={POLITICAL_SELF_EFFICACY_VALUES.map((value) => [value, POLITICAL_SELF_EFFICACY_LABELS[value]])} value={answers.politicalSelfEfficacy} onSelect={(politicalSelfEfficacy) => change({ politicalSelfEfficacy }, "political_self_efficacy")} />
          </Question>}
          {showAgain && <Question title="Würdest du wieder einen Brief schreiben?" mark="wieder">
            <Choices label="Noch einen Brief schreiben" values={[["already_did", "Hab ich schon"], ["yes", "Ja, gern"], ["maybe", "Vielleicht"], ["rather_not", "Eher nicht"]]} value={answers.writeAgain} onSelect={(writeAgain) => change({ writeAgain }, "write_again")} />
          </Question>}
          {complete && <div className="space-y-6 border-t border-waldgruen/15 pt-6">
            <div>
              <label htmlFor="outcome-body" className="mb-3 block font-typewriter text-lg font-bold text-waldgruen-dark">Erzähl mir gern mehr <span className="font-body text-sm font-normal text-warmgrau/70">(optional)</span></label>
              <textarea id="outcome-body" rows={5} maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Was ist dir mit deinem Brief passiert? Wie ging es dir damit?" className="w-full rounded-xl border border-warmgrau/25 bg-creme p-4 text-base leading-relaxed focus:outline-2 focus:outline-waldgruen" />
              <p className="mt-1 text-right text-xs text-warmgrau/65">{body.length}/2000</p>
              <p className="mt-3 text-sm leading-relaxed">Ein Foto vom Antwortbrief kannst du mir an <a href="mailto:Brief-nach-Berlin@posteo.de" className="break-words text-waldgruen underline">Brief-nach-Berlin@posteo.de</a> schicken. Decke persönliche Angaben bitte vorher ab.</p>
              <a href={VOICE_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-waldgruen px-4 py-2 text-sm font-semibold text-waldgruen hover:bg-creme">Lieber eine Sprachnachricht?</a>
            </div>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-waldgruen" />
              <span>Meine Geschichte darf ohne persönliche Details auf brief-nach-berlin.de gezeigt werden. Mit Namen nur, wenn ich unten einen angebe.</span>
            </label>
            {consent && <div>
              <label htmlFor="outcome-name" className="mb-2 block text-sm">Name für die Veröffentlichung (optional, leer = anonym)</label>
              <input id="outcome-name" type="text" maxLength={80} autoComplete="given-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="min-h-11 w-full rounded-lg border border-warmgrau/25 bg-creme px-3 focus:outline-2 focus:outline-waldgruen" />
            </div>}
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <input type="checkbox" checked={callOk} onChange={(event) => setCallOk(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-waldgruen" />
              <span>Ich wär offen für ein kurzes Gespräch. Thomas darf mich dazu per E-Mail kontaktieren.</span>
            </label>
          </div>}
          <p role="status" aria-live="polite" className="text-sm text-warmgrau/75">{saveStatus}</p>
          {error && <p role="alert" className="rounded-lg border border-airmail-rot/30 bg-airmail-rot/5 p-4 text-sm text-airmail-rot">{error}</p>}
          <button type="submit" disabled={!complete || pending} className="min-h-12 w-full rounded-xl bg-waldgruen px-6 py-4 font-semibold text-creme hover:bg-waldgruen-dark disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Wird gesendet…" : "Rückmeldung absenden"}</button>
        </fieldset>}
        <p className="mt-6 text-xs leading-relaxed text-warmgrau/70">Die Angaben sind mit deiner E-Mail-Adresse verknüpft und werden spätestens nach 24 Monaten gelöscht. Deinen Brieftext speichere ich nicht. Im persönlichen Löschlink in der Mail kannst du deine Rückmeldung ansehen und löschen. <Link href="/datenschutz#rueckmeldungen" className="text-waldgruen underline">Datenschutz</Link></p>
      </form>
    </div>
  );
}

function Question({ title, mark, hint, children }: { title: string; mark: string; hint?: string; children: ReactNode }) {
  const [before, after] = title.split(mark);
  return <div><h2 className="mb-3 font-typewriter text-lg font-bold leading-snug text-waldgruen-dark">{before}<span className="underline decoration-bernstein/70 decoration-[3px] underline-offset-[6px] [text-decoration-skip-ink:none]">{mark}</span>{after}</h2>{hint && <p className="mb-3 text-sm leading-relaxed text-warmgrau/80">{hint}</p>}{children}</div>;
}

function Choices<T extends string>({ label, values, value, onSelect }: {
  label: string; values: ReadonlyArray<readonly [T, string]>; value: T | null; onSelect: (value: T) => void;
}) {
  return <div role="radiogroup" aria-label={label} className="grid grid-cols-1 gap-2 sm:grid-cols-2">{values.map(([key, text]) => <SurveyChoice key={key} checked={value === key} onSelect={() => onSelect(key)} label={text} />)}</div>;
}
