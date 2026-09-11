"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WIZARD_PATH } from "@/lib/config";
import {
  SCHREIB_MERZ_CAMPAIGN,
  toggleSpecialCampaignTopic,
} from "@/lib/campaigns/specialCampaigns";
import { saveHandoff } from "@/lib/wizard-handoff";

const DRAFT_KEY = "special-campaign-draft:schreib-merz:v2";
const MAX_TOPICS = 2;
const MIN_ISSUE_LENGTH = 20;
const MAX_ISSUE_LENGTH = 5000;

type CampaignDraft = {
  selectedTopicIds: string[];
  issueText: string;
  topicInsertions: Record<string, string>;
};

function readDraft(): CampaignDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Partial<CampaignDraft>;
    if (!Array.isArray(candidate.selectedTopicIds)) return null;

    return {
      selectedTopicIds: candidate.selectedTopicIds.filter(
        (id): id is string => typeof id === "string",
      ),
      issueText: typeof candidate.issueText === "string" ? candidate.issueText : "",
      topicInsertions:
        candidate.topicInsertions && typeof candidate.topicInsertions === "object"
          ? candidate.topicInsertions
          : {},
    };
  } catch {
    return null;
  }
}

function appendText(current: string, addition: string) {
  const trimmedCurrent = current.trim();
  return trimmedCurrent ? `${trimmedCurrent}\n\n${addition}` : addition;
}

function removeInsertedText(current: string, insertion: string) {
  const start = current.indexOf(insertion);
  if (start === -1) return { text: current, removed: false };

  const before = current.slice(0, start).trimEnd();
  const after = current.slice(start + insertion.length).trimStart();
  return {
    text: [before, after].filter(Boolean).join("\n\n"),
    removed: true,
  };
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 20 20">
      <path
        d="m4 10 3.5 3.5L16 5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function SchreibMerzExperienceV2() {
  const router = useRouter();
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [issueText, setIssueText] = useState("");
  const [topicInsertions, setTopicInsertions] = useState<Record<string, string>>({});
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    router.prefetch(WIZARD_PATH);
    const saved = readDraft();
    const frame = requestAnimationFrame(() => {
      if (saved) {
        const validTopicIds = saved.selectedTopicIds
          .filter((id) => SCHREIB_MERZ_CAMPAIGN.topics.some((topic) => topic.id === id))
          .slice(0, MAX_TOPICS);
        const insertionEntries: Array<[string, string]> = [];
        for (const id of validTopicIds) {
          const insertion = saved.topicInsertions[id];
          if (typeof insertion === "string") insertionEntries.push([id, insertion]);
        }
        const validInsertions = Object.fromEntries(insertionEntries);
        setSelectedTopicIds(validTopicIds);
        setTopicInsertions(validInsertions);
        setIssueText(saved.issueText.slice(0, MAX_ISSUE_LENGTH));
      }
      setDraftHydrated(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [router]);

  useEffect(() => {
    if (!draftHydrated) return;
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ selectedTopicIds, issueText, topicInsertions } satisfies CampaignDraft),
      );
    } catch {
      // Der Entwurf bleibt privat im Tab; ohne sessionStorage funktioniert der Flow weiter.
    }
  }, [draftHydrated, issueText, selectedTopicIds, topicInsertions]);

  function toggleTopic(topicId: string) {
    const wasSelected = selectedTopicIds.includes(topicId);
    const nextIds = toggleSpecialCampaignTopic(selectedTopicIds, topicId, MAX_TOPICS);

    if (!wasSelected && nextIds.length === selectedTopicIds.length) {
      setStatusMessage("Du kannst höchstens zwei Startpunkte auswählen.");
      return;
    }

    setSelectedTopicIds(nextIds);

    if (wasSelected) {
      const insertion = topicInsertions[topicId];
      const result = insertion ? removeInsertedText(issueText, insertion) : null;
      if (result?.removed) {
        setIssueText(result.text);
        setStatusMessage("Startbaustein entfernt.");
      } else {
        setStatusMessage("Thema entfernt. Deinen bearbeiteten Text habe ich stehen lassen.");
      }
      setTopicInsertions((current) => {
        const next = { ...current };
        delete next[topicId];
        return next;
      });
      return;
    }

    const topic = SCHREIB_MERZ_CAMPAIGN.topics.find((candidate) => candidate.id === topicId);
    if (!topic) return;

    setIssueText((current) => appendText(current, topic.issueText));
    setTopicInsertions((current) => ({ ...current, [topicId]: topic.issueText }));
    setStatusMessage(
      nextIds.length === MAX_TOPICS
        ? "Zwei Startpunkte eingefügt. Du kannst sie im Text anpassen."
        : "Startbaustein eingefügt. Du kannst ihn direkt verändern.",
    );
  }

  function continueToWizard() {
    const trimmedIssueText = issueText.trim();
    if (trimmedIssueText.length < MIN_ISSUE_LENGTH) {
      setStatusMessage("Schreib noch ein paar Worte zu deinem Anliegen.");
      document.getElementById("anliegen")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (trimmedIssueText.length > MAX_ISSUE_LENGTH) {
      setStatusMessage("Dein Anliegen ist zu lang. Bitte kürze es etwas.");
      return;
    }

    saveHandoff({
      issueText: trimmedIssueText,
      source: "campaign",
      campaignSlug: SCHREIB_MERZ_CAMPAIGN.slug,
      campaignTitle: SCHREIB_MERZ_CAMPAIGN.title,
      campaignCreatorName: SCHREIB_MERZ_CAMPAIGN.creatorName,
      campaignTargetLevel: SCHREIB_MERZ_CAMPAIGN.targetLevel,
    });
    router.push(WIZARD_PATH);
  }

  const selectionLimitReached = selectedTopicIds.length >= MAX_TOPICS;

  return (
    <div className="relative isolate overflow-hidden bg-creme">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[43rem] bg-[radial-gradient(circle_at_78%_18%,rgba(45,106,79,0.16),transparent_32rem)]"
      />

      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-20">
        <div className="relative z-10">
          <div className="inline-flex -rotate-1 items-center gap-2 border border-waldgruen/20 bg-white/75 px-3 py-1.5 font-typewriter text-xs font-bold uppercase tracking-[0.16em] text-waldgruen shadow-sm">
            <span aria-hidden="true">✉</span>
            Für 16- bis 25-Jährige
          </div>
          <h1 className="mt-6 max-w-2xl text-balance font-typewriter text-[2.55rem] font-bold leading-[1.02] tracking-[-0.035em] text-waldgruen-dark sm:text-6xl lg:text-7xl">
            Was ist dir und deiner Generation in der Politik wichtig?
          </h1>
          <p className="mt-6 max-w-xl text-pretty font-body text-lg leading-relaxed text-warmgrau/80 sm:text-xl">
            Schreib dein Anliegen in deinen eigenen Worten. Wenn ein Thema passt,
            fügt die Auswahl einen Startbaustein ein – den du verändern oder mit
            einem Klick wieder entfernen kannst.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-body text-sm font-semibold text-waldgruen">
            {["Kostenlos", "Kein Account", "Deine eigenen Worte"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckIcon />
                {item}
              </span>
            ))}
          </div>
          <a
            href="#anliegen"
            className="mt-9 inline-flex min-h-12 items-center gap-3 rounded-lg bg-waldgruen px-6 py-3 font-body text-base font-bold text-creme shadow-[0_14px_35px_-16px_rgba(27,67,50,0.8)] transition hover:-translate-y-0.5 hover:bg-waldgruen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-4 motion-reduce:transform-none"
          >
            Anliegen schreiben
            <ArrowRightIcon />
          </a>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div aria-hidden="true" className="absolute -left-5 top-10 h-[76%] w-8 -rotate-3 rounded-sm bg-airmail-rot/75" />
          <div aria-hidden="true" className="absolute -right-4 top-20 h-[68%] w-8 rotate-3 rounded-sm bg-airmail-blau/80" />
          <div className="relative aspect-[9/10] overflow-hidden rounded-[0.35rem] border border-warmgrau/15 bg-[#efe8dc] shadow-[0_28px_70px_-34px_rgba(27,67,50,0.55)]">
            <Image
            src="/images/schreib-merz-editorial-clean.webp"
              alt="Redaktionelle Illustration von Friedrich Merz mit der blanken Rückseite eines Briefs"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 44vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-waldgruen-dark/90 via-waldgruen-dark/55 to-transparent px-5 pb-5 pt-20 text-creme sm:px-7 sm:pb-7">
              <p className="mt-3 inline-flex rounded-full border border-creme/30 bg-waldgruen-dark/35 px-2.5 py-1 font-body text-xs font-medium text-creme/90">
                KI-generierte Illustration
              </p>
            </div>
          </div>
          <div className="absolute -bottom-5 right-5 rotate-2 rounded-sm border border-warmgrau/15 bg-white px-4 py-3 shadow-lg sm:right-9">
            <p className="font-handwriting text-xl text-waldgruen-dark">Demokratie ist kein Zuschauersport.</p>
          </div>
        </div>
      </section>

      <section id="anliegen" aria-labelledby="anliegen-heading" className="relative border-y border-waldgruen/15 bg-white/45 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="font-typewriter text-xs font-bold uppercase tracking-[0.18em] text-waldgruen/65">Schritt 1 · dein Anliegen</p>
            <h2 id="anliegen-heading" className="mt-3 text-balance font-body text-3xl font-bold tracking-tight text-waldgruen-dark sm:text-5xl">
              Was liegt dir auf dem Herzen?
            </h2>
            <p className="mt-4 font-body text-lg leading-relaxed text-warmgrau/70">
              Schreib einfach los. Die Themen darunter sind optional und helfen nur beim Einstieg.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-waldgruen/15 bg-[#fffdf9] p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="font-body text-base font-bold text-waldgruen-dark">Startbaustein wählen <span className="font-normal text-warmgrau/55">(optional)</span></h3>
              <p className="font-body text-sm text-warmgrau/60">Maximal zwei. Ein Klick fügt ihn in dein Anliegen ein.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
              {SCHREIB_MERZ_CAMPAIGN.topics.map((topic, index) => {
                const selected = selectedTopicIds.includes(topic.id);
                const disabled = selectionLimitReached && !selected;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => toggleTopic(topic.id)}
                    className={`group relative min-h-32 rounded-lg border p-3.5 pr-9 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 sm:p-4 sm:pr-10 ${
                      selected
                        ? "border-waldgruen bg-waldgruen text-creme shadow-[0_16px_36px_-24px_rgba(27,67,50,0.8)]"
                        : disabled
                          ? "cursor-not-allowed border-warmgrau/10 bg-creme/50 text-warmgrau opacity-40"
                          : "border-waldgruen/15 bg-white text-warmgrau hover:-translate-y-0.5 hover:border-waldgruen/35 hover:shadow-sm motion-reduce:transform-none"
                    }`}
                  >
                    <span className={`font-typewriter text-[10px] font-bold uppercase tracking-[0.14em] ${selected ? "text-creme/70" : "text-waldgruen/60"}`}>
                      {String(index + 1).padStart(2, "0")} · {topic.eyebrow}
                    </span>
                    <span className="mt-3 block font-body text-base font-bold leading-tight sm:text-lg">{topic.title}</span>
                    <span aria-hidden="true" className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold ${selected ? "border-creme/40 bg-creme text-waldgruen" : "border-waldgruen/20 text-waldgruen/70"}`}>
                      {selected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 relative overflow-hidden rounded-[0.4rem] border border-warmgrau/20 bg-[#fffdf8] shadow-[0_24px_70px_-36px_rgba(27,67,50,0.45)]">
            <div aria-hidden="true" className="h-2 w-full" style={{ background: "repeating-linear-gradient(-45deg, #c1121f 0 10px, #faf8f5 10px 15px, #1d3557 15px 25px, #faf8f5 25px 30px)" }} />
            <div className="p-5 sm:p-8">
              <div className="flex items-start justify-between gap-5 border-b border-warmgrau/10 pb-5">
                <div>
                  <label htmlFor="issue-text" className="font-body text-lg font-bold text-waldgruen-dark">Dein Anliegen</label>
                  <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau/60">Alles an einem Ort. Du kannst jeden eingefügten Satz verändern.</p>
                </div>
                <p className="hidden rotate-3 rounded-full border-2 border-waldgruen/35 px-4 py-2 text-center font-typewriter text-[10px] font-bold uppercase tracking-widest text-waldgruen/60 sm:block">Nicht<br />abgeschickt</p>
              </div>
              <textarea
                id="issue-text"
                value={issueText}
                maxLength={MAX_ISSUE_LENGTH}
                rows={10}
                onChange={(event) => setIssueText(event.target.value)}
                placeholder="Zum Beispiel: Ich suche seit Monaten ein WG-Zimmer. Die Mieten sind für mich als Student:in kaum bezahlbar …"
                className="mt-5 min-h-72 w-full resize-y rounded-lg border border-dashed border-waldgruen/25 bg-white px-4 py-4 font-body text-base leading-relaxed text-warmgrau outline-none transition placeholder:text-warmgrau/40 focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/15 sm:min-h-80 sm:px-5"
              />
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p aria-live="polite" className="min-h-5 font-body text-sm text-warmgrau/70">{statusMessage}</p>
                  <p className="mt-1 font-body text-sm text-warmgrau/55">{issueText.length.toLocaleString("de-DE")} von maximal {MAX_ISSUE_LENGTH.toLocaleString("de-DE")} Zeichen</p>
                </div>
                <button
                  type="button"
                  onClick={continueToWizard}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-waldgruen px-6 py-3 font-body text-base font-bold text-creme shadow-[0_14px_35px_-16px_rgba(27,67,50,0.8)] transition hover:-translate-y-0.5 hover:bg-waldgruen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-4 active:translate-y-0 motion-reduce:transform-none sm:w-auto"
                >
                  Weiter zum Brief
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          </div>
          <p className="mx-auto mt-5 max-w-3xl font-body text-sm leading-relaxed text-warmgrau/65">
            Du behältst die Kontrolle: Wir machen einen Entwurf daraus. Du prüfst ihn, schreibst ihn selbst von Hand ab und verschickst ihn. Brief-nach-Berlin verschickt nichts in deinem Namen.
          </p>
        </div>
      </section>

      <aside className="border-t border-waldgruen/10 bg-waldgruen-dark px-5 py-9 text-creme sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
          <p className="font-typewriter text-xs font-bold uppercase tracking-[0.16em] text-creme/65">Unabhängige Aktion</p>
          <p className="max-w-3xl font-body text-sm leading-relaxed text-creme/75">
            „Schreib Merz“ ist eine unabhängige Aktion von Brief-nach-Berlin. Sie ist nicht mit Friedrich Merz, der CDU, der Bundesregierung oder dem Bundeskanzleramt verbunden. Die Themen sind Startpunkte – deine Position und dein Brief gehören dir.
          </p>
        </div>
      </aside>
    </div>
  );
}
