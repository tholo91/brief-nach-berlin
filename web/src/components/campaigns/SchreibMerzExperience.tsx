"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WIZARD_PATH } from "@/lib/config";
import {
  SCHREIB_MERZ_CAMPAIGN,
  composeSpecialCampaignIssue,
  toggleSpecialCampaignTopic,
} from "@/lib/campaigns/specialCampaigns";
import { saveHandoff } from "@/lib/wizard-handoff";

const DRAFT_KEY = "special-campaign-draft:schreib-merz:v1";
const MAX_TOPICS = 2;
const MIN_TOPIC_TEXT_LENGTH = 20;
const MAX_ISSUE_LENGTH = 5000;

type CampaignDraft = {
  selectedTopicIds: string[];
  topicTexts: Record<string, string>;
  personalText: string;
  sharedRequest: string;
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
        (id): id is string => typeof id === "string"
      ),
      topicTexts:
        candidate.topicTexts && typeof candidate.topicTexts === "object"
          ? candidate.topicTexts
          : {},
      personalText:
        typeof candidate.personalText === "string" ? candidate.personalText : "",
      sharedRequest:
        typeof candidate.sharedRequest === "string"
          ? candidate.sharedRequest
          : SCHREIB_MERZ_CAMPAIGN.sharedRequest,
    };
  } catch {
    return null;
  }
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

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 20 20">
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function SchreibMerzExperience() {
  const router = useRouter();
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [topicTexts, setTopicTexts] = useState<Record<string, string>>({});
  const [personalText, setPersonalText] = useState("");
  const [sharedRequest, setSharedRequest] = useState(
    SCHREIB_MERZ_CAMPAIGN.sharedRequest
  );
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    router.prefetch(WIZARD_PATH);
    const saved = readDraft();
    if (saved) {
      const validTopicIds = saved.selectedTopicIds
        .filter((id) =>
          SCHREIB_MERZ_CAMPAIGN.topics.some((topic) => topic.id === id)
        )
        .slice(0, MAX_TOPICS);
      const restoredTexts = Object.fromEntries(
        validTopicIds.map((id) => {
          const topic = SCHREIB_MERZ_CAMPAIGN.topics.find(
            (candidate) => candidate.id === id
          );
          const savedText = saved.topicTexts[id];
          return [
            id,
            typeof savedText === "string" ? savedText : (topic?.issueText ?? ""),
          ];
        })
      );
      setSelectedTopicIds(validTopicIds);
      setTopicTexts(restoredTexts);
      setPersonalText(saved.personalText.slice(0, 1000));
      setSharedRequest(saved.sharedRequest.slice(0, 800));
    }
    setDraftHydrated(true);
  }, [router]);

  useEffect(() => {
    if (!draftHydrated) return;
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          selectedTopicIds,
          topicTexts,
          personalText,
          sharedRequest,
        } satisfies CampaignDraft)
      );
    } catch {
      // Der Entwurf ist eine progressive Verbesserung. Der Flow funktioniert
      // auch, wenn sessionStorage im Browser nicht verfügbar ist.
    }
  }, [
    draftHydrated,
    personalText,
    selectedTopicIds,
    sharedRequest,
    topicTexts,
  ]);

  const issueText = useMemo(
    () =>
      composeSpecialCampaignIssue({
        selectedTopicIds,
        topicTexts,
        personalText,
        sharedRequest,
      }),
    [personalText, selectedTopicIds, sharedRequest, topicTexts]
  );

  const hasUsableTopicText = selectedTopicIds.some(
    (id) => (topicTexts[id] ?? "").trim().length >= MIN_TOPIC_TEXT_LENGTH
  );

  function toggleTopic(topicId: string) {
    const wasSelected = selectedTopicIds.includes(topicId);
    const nextIds = toggleSpecialCampaignTopic(
      selectedTopicIds,
      topicId,
      MAX_TOPICS
    );

    if (!wasSelected && nextIds.length === selectedTopicIds.length) {
      setStatusMessage("Du kannst höchstens zwei Themen auswählen.");
      return;
    }

    setSelectedTopicIds(nextIds);
    if (wasSelected) {
      const nextTexts = { ...topicTexts };
      delete nextTexts[topicId];
      setTopicTexts(nextTexts);
      setStatusMessage("Thema entfernt.");
      return;
    }

    const topic = SCHREIB_MERZ_CAMPAIGN.topics.find(
      (candidate) => candidate.id === topicId
    );
    if (topic) {
      setTopicTexts((current) => ({
        ...current,
        [topicId]: topic.issueText,
      }));
      setStatusMessage(
        nextIds.length === MAX_TOPICS
          ? "Zwei Themen ausgewählt. Du kannst die Texte jetzt anpassen."
          : "Thema ausgewählt. Du kannst noch ein zweites ergänzen."
      );
    }
  }

  function continueToWizard() {
    if (selectedTopicIds.length === 0) {
      setStatusMessage("Wähle zuerst mindestens ein Thema aus.");
      document.getElementById("themen")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!hasUsableTopicText) {
      setStatusMessage("Lass zu mindestens einem Thema ein paar eigene Sätze stehen.");
      return;
    }
    if (issueText.length > MAX_ISSUE_LENGTH) {
      setStatusMessage("Dein Entwurf ist zu lang. Bitte kürze ihn etwas.");
      return;
    }

    saveHandoff({
      issueText,
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
        className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_78%_18%,rgba(45,106,79,0.16),transparent_32rem)]"
      />

      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-20">
        <div className="relative z-10">
          <div className="inline-flex -rotate-1 items-center gap-2 border border-waldgruen/20 bg-white/75 px-3 py-1.5 font-typewriter text-xs font-bold uppercase tracking-[0.16em] text-waldgruen shadow-sm">
            <span aria-hidden="true">✉</span>
            Für 16- bis 25-Jährige
          </div>
          <h1 className="mt-6 max-w-2xl text-balance font-typewriter text-[2.55rem] font-bold leading-[1.02] tracking-[-0.035em] text-waldgruen-dark sm:text-6xl lg:text-7xl">
            Was soll der Bundeskanzler von dir hören?
          </h1>
          <p className="mt-6 max-w-xl text-pretty font-body text-lg leading-relaxed text-warmgrau/80 sm:text-xl">
            Wähle bis zu zwei Themen. Ergänze deine Sicht. Wir machen daraus
            einen persönlichen Brief an Friedrich Merz – oder an ein Mitglied
            des Bundestags aus deinem Wahlkreis.
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
            href="#themen"
            className="mt-9 inline-flex min-h-12 items-center gap-3 rounded-lg bg-waldgruen px-6 py-3 font-body text-base font-bold text-creme shadow-[0_14px_35px_-16px_rgba(27,67,50,0.8)] transition hover:-translate-y-0.5 hover:bg-waldgruen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-4 motion-reduce:transform-none"
          >
            Thema auswählen
            <ArrowRightIcon />
          </a>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -left-5 top-10 h-[76%] w-8 -rotate-3 rounded-sm bg-airmail-rot/75"
          />
          <div
            aria-hidden="true"
            className="absolute -right-4 top-20 h-[68%] w-8 rotate-3 rounded-sm bg-airmail-blau/80"
          />
          <div className="relative aspect-[9/10] overflow-hidden rounded-[0.35rem] border border-warmgrau/15 bg-[#efe8dc] shadow-[0_28px_70px_-34px_rgba(27,67,50,0.55)]">
            <Image
              src="/images/schreib-merz-editorial.jpg"
              alt="Redaktionelle Illustration von Bundeskanzler Friedrich Merz"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 44vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-waldgruen-dark/90 via-waldgruen-dark/55 to-transparent px-5 pb-5 pt-20 text-creme sm:px-7 sm:pb-7">
              <p className="font-typewriter text-xs font-bold uppercase tracking-[0.18em] text-creme/75">
                Dein Brief. Deine Haltung.
              </p>
              <p className="mt-1 max-w-sm font-body text-base leading-snug text-creme/95 sm:text-lg">
                Kein Copy-Paste-Protest, sondern ein Schreiben, das zu dir passt.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-5 right-5 rotate-2 rounded-sm border border-warmgrau/15 bg-white px-4 py-3 shadow-lg sm:right-9">
            <p className="font-handwriting text-xl text-waldgruen-dark">
              Demokratie ist kein Zuschauersport.
            </p>
          </div>
        </div>
      </section>

      <section
        id="themen"
        aria-labelledby="themen-heading"
        className="relative border-y border-waldgruen/15 bg-white/45 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="font-typewriter text-xs font-bold uppercase tracking-[0.18em] text-waldgruen/65">
              Schritt 1 · maximal zwei
            </p>
            <h2
              id="themen-heading"
              className="mt-3 text-balance font-body text-3xl font-bold tracking-tight text-waldgruen-dark sm:text-5xl"
            >
              Was betrifft dich gerade?
            </h2>
            <p className="mt-4 font-body text-lg leading-relaxed text-warmgrau/70">
              Jeder Klick fügt einen sachlichen Starttext hinzu. Du kannst jeden
              Satz danach verändern oder löschen.
            </p>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  className={`group relative min-h-48 rounded-xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 ${
                    selected
                      ? "border-waldgruen bg-waldgruen text-creme shadow-[0_16px_36px_-24px_rgba(27,67,50,0.8)]"
                      : disabled
                        ? "cursor-not-allowed border-warmgrau/10 bg-creme/50 text-warmgrau opacity-40"
                        : "border-waldgruen/15 bg-[#fffdf9] text-warmgrau shadow-sm hover:-translate-y-1 hover:border-waldgruen/35 hover:shadow-md motion-reduce:transform-none"
                  }`}
                >
                  <span
                    className={`font-typewriter text-[11px] font-bold uppercase tracking-[0.16em] ${
                      selected ? "text-creme/70" : "text-waldgruen/60"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")} · {topic.eyebrow}
                  </span>
                  <span className="mt-5 block font-body text-xl font-bold leading-tight">
                    {topic.title}
                  </span>
                  <span
                    className={`mt-3 block font-body text-sm leading-relaxed ${
                      selected ? "text-creme/80" : "text-warmgrau/65"
                    }`}
                  >
                    {topic.shortDescription}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold ${
                      selected
                        ? "border-creme/40 bg-creme text-waldgruen"
                        : "border-waldgruen/20 text-waldgruen/70"
                    }`}
                  >
                    {selected ? "✓" : "+"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex min-h-6 items-center justify-between gap-4 font-body text-sm">
            <p className="font-semibold text-waldgruen-dark">
              {selectedTopicIds.length} von {MAX_TOPICS} Themen ausgewählt
            </p>
            <p aria-live="polite" className="text-right text-warmgrau/65">
              {statusMessage}
            </p>
          </div>
        </div>
      </section>

      {selectedTopicIds.length > 0 && (
        <section
          aria-labelledby="entwurf-heading"
          className="relative mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="mb-8 max-w-2xl">
            <p className="font-typewriter text-xs font-bold uppercase tracking-[0.18em] text-waldgruen/65">
              Schritt 2 · persönlich machen
            </p>
            <h2
              id="entwurf-heading"
              className="mt-3 text-balance font-body text-3xl font-bold tracking-tight text-waldgruen-dark sm:text-5xl"
            >
              Dein Anliegen, noch vor dem Brief
            </h2>
            <p className="mt-4 font-body text-lg leading-relaxed text-warmgrau/70">
              Das hier ist dein Arbeitsblatt. Schreib direkt hinein – im nächsten
              Schritt entsteht daraus der eigentliche Brief.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[0.4rem] border border-warmgrau/20 bg-[#fffdf8] shadow-[0_24px_70px_-36px_rgba(27,67,50,0.45)]">
            <div
              aria-hidden="true"
              className="h-2 w-full"
              style={{
                background:
                  "repeating-linear-gradient(-45deg, #c1121f 0 10px, #faf8f5 10px 15px, #1d3557 15px 25px, #faf8f5 25px 30px)",
              }}
            />
            <div className="p-5 sm:p-8 lg:p-10">
              <div className="flex items-start justify-between gap-5 border-b border-warmgrau/10 pb-6">
                <div>
                  <p className="font-typewriter text-xs font-bold uppercase tracking-[0.16em] text-waldgruen/60">
                    Notizen für deinen Brief
                  </p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/60">
                    Automatisch in diesem Tab gespeichert
                  </p>
                </div>
                <div className="hidden rotate-3 rounded-full border-2 border-waldgruen/35 px-4 py-2 text-center font-typewriter text-[10px] font-bold uppercase tracking-widest text-waldgruen/60 sm:block">
                  Nicht<br />abgeschickt
                </div>
              </div>

              <div className="mt-2 divide-y divide-warmgrau/10">
                {selectedTopicIds.map((topicId) => {
                  const topic = SCHREIB_MERZ_CAMPAIGN.topics.find(
                    (candidate) => candidate.id === topicId
                  );
                  if (!topic) return null;
                  return (
                    <div key={topic.id} className="py-7">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <label
                          htmlFor={`topic-${topic.id}`}
                          className="font-body text-base font-bold text-waldgruen-dark"
                        >
                          {topic.title}
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleTopic(topic.id)}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 font-body text-sm font-semibold text-warmgrau/60 transition hover:bg-airmail-rot/5 hover:text-airmail-rot focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airmail-rot"
                        >
                          <CloseIcon />
                          Entfernen
                        </button>
                      </div>
                      <textarea
                        id={`topic-${topic.id}`}
                        value={topicTexts[topic.id] ?? ""}
                        maxLength={1200}
                        rows={5}
                        onChange={(event) =>
                          setTopicTexts((current) => ({
                            ...current,
                            [topic.id]: event.target.value,
                          }))
                        }
                        className="w-full resize-y rounded-lg border border-warmgrau/15 bg-creme/45 px-4 py-3 font-body text-base leading-relaxed text-warmgrau outline-none transition focus:border-waldgruen focus:bg-white focus:ring-2 focus:ring-waldgruen/15"
                      />
                    </div>
                  );
                })}

                <div className="py-7">
                  <label
                    htmlFor="personal-addition"
                    className="font-body text-base font-bold text-waldgruen-dark"
                  >
                    Was soll Merz über deine Situation wissen?
                  </label>
                  <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau/60">
                    Ein konkretes Erlebnis macht aus einer Vorlage deinen Brief.
                  </p>
                  <textarea
                    id="personal-addition"
                    value={personalText}
                    maxLength={1000}
                    rows={4}
                    onChange={(event) => setPersonalText(event.target.value)}
                    placeholder="Zum Beispiel: Ich suche seit Monaten ein WG-Zimmer …"
                    className="mt-3 w-full resize-y rounded-lg border border-dashed border-waldgruen/25 bg-white px-4 py-3 font-body text-base leading-relaxed text-warmgrau outline-none transition placeholder:text-warmgrau/40 focus:border-waldgruen focus:ring-2 focus:ring-waldgruen/15"
                  />
                </div>

                <div className="py-7">
                  <label
                    htmlFor="shared-request"
                    className="font-body text-base font-bold text-waldgruen-dark"
                  >
                    Deine Bitte zum Schluss
                  </label>
                  <textarea
                    id="shared-request"
                    value={sharedRequest}
                    maxLength={800}
                    rows={3}
                    onChange={(event) => setSharedRequest(event.target.value)}
                    className="mt-3 w-full resize-y rounded-lg border border-warmgrau/15 bg-creme/45 px-4 py-3 font-body text-base leading-relaxed text-warmgrau outline-none transition focus:border-waldgruen focus:bg-white focus:ring-2 focus:ring-waldgruen/15"
                  />
                </div>
              </div>

              <div className="border-t border-warmgrau/10 pt-6">
                <div className="grid gap-3 rounded-lg bg-waldgruen/5 p-4 font-body text-sm leading-relaxed text-warmgrau/75 sm:grid-cols-[auto_1fr] sm:items-start">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-waldgruen text-creme"
                  >
                    ✉
                  </span>
                  <p>
                    <strong className="text-waldgruen-dark">Du behältst die Kontrolle:</strong>{" "}
                    Wir schicken dir den fertigen Entwurf per E-Mail. Du prüfst
                    ihn, schreibst ihn selbst von Hand ab und sendest ihn an das
                    Bundeskanzleramt oder die gewählte MdB-Adresse. Brief-nach-Berlin
                    verschickt nichts in deinem Namen.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-body text-sm text-warmgrau/55">
                    {issueText.length.toLocaleString("de-DE")} von maximal{" "}
                    {MAX_ISSUE_LENGTH.toLocaleString("de-DE")} Zeichen
                  </p>
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
          </div>
        </section>
      )}

      <aside className="border-t border-waldgruen/10 bg-waldgruen-dark px-5 py-9 text-creme sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
          <p className="font-typewriter text-xs font-bold uppercase tracking-[0.16em] text-creme/65">
            Unabhängige Aktion
          </p>
          <p className="max-w-3xl font-body text-sm leading-relaxed text-creme/75">
            „Schreib Merz“ ist eine unabhängige Aktion von Brief-nach-Berlin. Sie
            ist nicht mit Friedrich Merz, der CDU, der Bundesregierung oder dem
            Bundeskanzleramt verbunden. Die Themen sind Startpunkte – deine
            Position und dein Brief gehören dir.
          </p>
        </div>
      </aside>
    </div>
  );
}
