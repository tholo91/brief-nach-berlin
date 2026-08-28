"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type {
  WizardStep,
  WizardData,
  WizardActionResult,
  LevelRoutingContext,
} from "@/lib/types/wizard";
import type { Politician, PoliticalLevel } from "@/lib/types/politician";
import type { Recipient } from "@/lib/lookup/rathausRecipient";
import type { Step1Data } from "@/lib/validation/wizardSchemas";
import { submitWizardAction } from "@/lib/actions/submitWizard";
import { prefetchRoutingAction } from "@/lib/actions/prefetchRouting";
import { campaignLogoPublicUrl } from "@/lib/campaigns/logo";
import {
  peekHandoff,
  clearHandoff,
  entryStepForHandoff,
  saveHandoff,
} from "@/lib/wizard-handoff";
import { clearLandingDraft } from "@/lib/landing-draft";
import { bundRecipientsForCampaign } from "@/lib/campaign-recipient-picker";
import { Step1Form } from "./Step1Form";
import { StepPreferences, type StepPreferencesData } from "./StepPreferences";
import { Step2Issue } from "./Step2Issue";
import { StepLevelSelect } from "./StepLevelSelect";
import { Step3Success } from "./Step3Success";
import FadeFooterImage from "../FadeFooterImage";

const PARAM_KEYS = ["plz", "letterLength"] as const;

const STEP_LABELS = [
  "Dein Anliegen",
  "PLZ & E-Mail",
  "Ton & Länge",
] as const;

function readParamsToData(searchParams: URLSearchParams): Partial<WizardData> {
  const data: Record<string, string> = {};
  for (const key of PARAM_KEYS) {
    const val = searchParams.get(key);
    if (val) data[key] = val;
  }
  return data;
}

function writeDataToParams(router: ReturnType<typeof useRouter>, data: Partial<WizardData>, step: WizardStep) {
  const params = new URLSearchParams();
  for (const key of PARAM_KEYS) {
    const val = data[key as keyof WizardData];
    if (val) params.set(key, String(val));
  }
  params.set("step", String(step));
  router.replace(`?${params.toString()}`, { scroll: false });
}

// Map internal steps to the 3 progress dots
function stepToProgress(step: WizardStep): number {
  if (step === 1) return 1; // Anliegen
  if (step === 2) return 2; // Kontaktdaten
  return 3; // Präferenzen und Ebenenwahl
}

/**
 * Empfänger-Liste für die gewählte Ebene. Ohne Routing-Kontext (Flag aus)
 * bleibt der heutige Bund-Pfad: die flache Politikerliste, als mdb getaggt.
 */
function recipientsForLevel(
  politicians: Politician[],
  levelRouting: LevelRoutingContext | null,
  level: PoliticalLevel | null,
  campaignRestricted: boolean
): Recipient[] {
  if (!levelRouting || !level) {
    return politicians.map((p) => ({ ...p, kind: p.level === "Land" ? "mdl" : "mdb" }));
  }
  if (level === "Kommune") return levelRouting.byLevel.Kommune;
  if (level === "Land") return levelRouting.byLevel.Land;
  return bundRecipientsForCampaign(
    politicians,
    levelRouting.byLevel.Bund,
    campaignRestricted
  ).map((p) => ({ ...p, kind: "mdb" as const }));
}

export function WizardShell() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [wizardData, setWizardData] = useState<Partial<WizardData>>(() => {
    const data = readParamsToData(searchParams);
    const textParam = searchParams.get("text");
    if (textParam) {
      data.issueText = textParam;
    }
    return data;
  });
  // Direct visits start on the issue step. Landing and campaign handoffs have
  // already collected the issue and continue with contact details.
  const [step, setStep] = useState<WizardStep>(1);
  const [entrySource, setEntrySource] = useState<"direct" | "landing" | "campaign">("direct");
  const [handoffPending, setHandoffPending] = useState(true);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [actionResult, setActionResult] = useState<WizardActionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [plzError, setPlzError] = useState<string | null>(null);
  // Kampagne mit fester Bundesland-Bindung, aber Besucher-PLZ liegt woanders:
  // freundliches Panel statt hartem Fehler, mit Angebot für einen freien Brief.
  const [campaignMismatch, setCampaignMismatch] = useState<{ message: string } | null>(null);
  const hasMountedRef = useRef(false);
  // 999.6 Ebenen-Routing: Kontext aus submitWizardAction, gewählte Ebene und
  // der signierte Prefetch-Token (LOCK-10). Der Prefetch läuft spätestens
  // parallel zu Ton- und Längenauswahl.
  const [levelRouting, setLevelRouting] = useState<LevelRoutingContext | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<PoliticalLevel | null>(null);
  const [routingToken, setRoutingToken] = useState<string | null>(null);
  const routingPrefetchRef = useRef<{
    issueText: string;
    promise: Promise<{ token: string } | null>;
  } | null>(null);

  // Landing -> wizard handoff (sessionStorage): hydrate the issue without
  // rendering another issue field. Read after mount so sessionStorage never
  // affects the server render.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const handoff = peekHandoff();
      if (!handoff) {
        setHandoffPending(false);
        return;
      }

      setEntrySource(handoff.source ?? "landing");
      setWizardData((current) => ({
        ...current,
        issueText: handoff.issueText,
        ...(handoff.toneLevel != null ? { toneLevel: handoff.toneLevel } : {}),
        ...(handoff.tipsOpened ? { tipsOpened: true } : {}),
        ...(handoff.usedSpeechToText ? { usedSpeechToText: true } : {}),
        ...(handoff.source === "campaign" && handoff.campaignSlug
          ? {
              campaign: {
                slug: handoff.campaignSlug,
                title: handoff.campaignTitle ?? "Kampagne",
                creatorName: handoff.campaignCreatorName,
                externalUrl: handoff.campaignExternalUrl,
                logoPath: handoff.campaignLogoPath,
                targetLevel: handoff.campaignTargetLevel ?? "Bund",
                targetState: handoff.campaignTargetState ?? null,
              },
            }
          : {}),
      }));
      setStep(entryStepForHandoff(handoff));
      setHandoffPending(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Sobald die Empfängerauswahl bereitsteht, ist der Landing-Handoff verbraucht.
  // Ein späterer neuer Start im selben Tab darf deshalb keinen alten Entwurf laden.
  useEffect(() => {
    if (step === 3) {
      clearLandingDraft(wizardData.campaign?.slug);
      clearHandoff();
    }
  }, [step, wizardData.campaign?.slug]);

  // Sync URL params when step/data change
  useEffect(() => {
    if (!handoffPending && step !== 3) {
      writeDataToParams(router, wizardData, step);
    }
  }, [handoffPending, step, wizardData, router]);

  const ensureRoutingPrefetch = useCallback((issueText: string) => {
    if (!issueText || routingPrefetchRef.current?.issueText === issueText) return;
    routingPrefetchRef.current = {
      issueText,
      promise: prefetchRoutingAction(issueText).catch(() => null),
    };
  }, []);

  // Step 1: Anliegen — stores state and advances. This step is reached on a
  // direct visit or when a landing visitor explicitly goes back to edit.
  const handleStep1Complete = useCallback(
    (issueText: string, usedSpeechToText: boolean, tipsOpened: boolean) => {
      // OR the step-1 open into any open that already happened on the landing
      // (seeded from the handoff), so "tips ever opened" survives both places.
      setWizardData((prev) => ({
        ...prev,
        issueText,
        toneLevel: prev.toneLevel ?? 3,
        // OR mit einem evtl. von der Landing uebernommenen Voice-Flag, damit er
        // ueberlebt, wenn im Wizard nicht erneut aufgenommen wird (gleiche
        // Logik wie bei tipsOpened darunter).
        usedSpeechToText: prev.usedSpeechToText || usedSpeechToText,
        tipsOpened: prev.tipsOpened || tipsOpened,
      }));
      const handoff = peekHandoff();
      if (handoff?.source !== "campaign") {
        saveHandoff({
          ...handoff,
          issueText,
          source: "landing",
          usedSpeechToText: Boolean(handoff?.usedSpeechToText || usedSpeechToText),
          tipsOpened: Boolean(handoff?.tipsOpened || tipsOpened),
        });
      }
      ensureRoutingPrefetch(issueText);
      setStep(2);
    },
    [ensureRoutingPrefetch]
  );

  // Step 2: start routing while the visitor chooses tone and length. This also
  // covers landing/campaign entries that intentionally skipped the issue step.
  const handleStep2Complete = useCallback(
    (data: Step1Data) => {
      setWizardData((prev) => ({ ...prev, ...data }));
      ensureRoutingPrefetch(wizardData.issueText ?? "");
      setPlzError(null);
      setStep("2b");
    },
    [ensureRoutingPrefetch, wizardData.issueText]
  );

  const handlePreferencesChange = useCallback((data: StepPreferencesData) => {
    setWizardData((prev) => ({
      ...prev,
      party: data.party,
      ngo: data.ngo,
      letterLength: data.letterLength,
      toneLevel: data.toneLevel,
    }));
  }, []);

  const handleBack = useCallback(() => {
    setCampaignMismatch(null);
    if (step === 2) {
      if (entrySource === "campaign") {
        router.back();
      } else {
        setStep(1);
      }
    }
    else if (step === "2b") setStep(2);
    else if (step === "level") setStep("2b");
  }, [entrySource, router, step]);

  // Step 3: Preferences — this is where we actually submit to the backend.
  // The advanced fields remain optional and may stay empty.
  const submitWizard = useCallback(
    async (optionalData: Partial<StepPreferencesData>) => {
      setIsSubmitting(true);
      setErrorMessage(null);

      const fullData: WizardData = {
        plz: wizardData.plz ?? "",
        email: wizardData.email ?? "",
        party: optionalData.party,
        ngo: optionalData.ngo,
        letterLength: optionalData.letterLength ?? wizardData.letterLength,
        toneLevel: optionalData.toneLevel ?? wizardData.toneLevel ?? 3,
        issueText: wizardData.issueText ?? "",
        usedSpeechToText: wizardData.usedSpeechToText,
        tipsOpened: wizardData.tipsOpened,
        campaign: wizardData.campaign,
      };

      // Step1b is the PLZ-lookup step, not the final letter-generation click —
      // the real wait happens after the user picks a politician in Step3Success.
      // Keep a short min-display only to smooth out flickering on very fast
      // server responses. Errors fall through immediately.
      const minDisplayTimer = new Promise<void>((resolve) =>
        setTimeout(resolve, 1500)
      );

      try {
        console.log("[wizard] submitting", {
          issueTextLength: fullData.issueText.length,
          plz: fullData.plz,
        });
        // Prefetch-Token einsammeln, wenn er zum finalen Anliegen-Text passt.
        // Die Server-Action bricht spätestens nach 3.5s selbst ab, das await
        // hier blockiert also nie länger als der Foreground-Fallback würde.
        let prefetchedToken: string | null = null;
        const prefetch = routingPrefetchRef.current;
        if (prefetch && prefetch.issueText === fullData.issueText) {
          prefetchedToken = (await prefetch.promise)?.token ?? null;
        }
        const result = await submitWizardAction(fullData, prefetchedToken);

        if ("error" in result) {
          console.warn("[wizard] server returned error", result);
          if (result.error === "plz_not_found") {
            setPlzError(result.message);
            setIsSubmitting(false);
            setStep(2);
            return;
          }
          if (result.error === "campaign_state_mismatch") {
            setCampaignMismatch({ message: result.message });
            setIsSubmitting(false);
            return;
          }
          if (result.error === "level_data_missing" && wizardData.campaign?.slug) {
            setCampaignMismatch({ message: result.message });
            setIsSubmitting(false);
            return;
          }
          if (result.error === "rate_limited" && result.retryAfterSeconds != null) {
            const secs = result.retryAfterSeconds;
            const timeHint =
              secs >= 90
                ? `Bitte warte noch etwa ${Math.ceil(secs / 60)} Minuten.`
                : `Bitte warte noch etwa ${secs} Sekunden.`;
            setErrorMessage(`${result.message} ${timeHint}`);
          } else {
            setErrorMessage(result.message);
          }
          setIsSubmitting(false);
          return;
        }

        await minDisplayTimer;
        setRoutingToken(result.routingToken ?? prefetchedToken);

        // Persist the optional data into wizardData so Step3Success has the full payload
        setWizardData((prev) => ({
          ...prev,
          party: optionalData.party,
          ngo: optionalData.ngo,
          letterLength: optionalData.letterLength ?? prev.letterLength,
          toneLevel: optionalData.toneLevel ?? prev.toneLevel ?? 3,
        }));

        if ("disambiguationNeeded" in result && result.disambiguationNeeded) {
          setPoliticians(result.politicians);
          setActionResult(result);
          if (wizardData.campaign) {
            // Kampagne: die Ebene hat der Creator festgelegt. Den Ebene-Step
            // überspringen und den Empfänger an das serverseitig neu geladene
            // Kampagnenziel binden. Session-Werte sind nur Darstellungskontext.
            // levelRouting bleibt gesetzt, damit recipientsForLevel für Land
            // byLevel.Land nutzt; die Auto-Empfehlung lenkt nie um.
            if (!result.campaignTargetLevel) {
              setErrorMessage(
                "Die Kampagne konnte nicht sicher geladen werden. Bitte versuche es erneut."
              );
              return;
            }
            setLevelRouting(result.levelRouting ?? null);
            setSelectedLevel(result.campaignTargetLevel);
            setStep(3);
          } else if (result.levelRouting) {
            // Ebenen-Routing aktiv: erst der eigene Ebene-Auswahl-Step,
            // danach die konkrete Empfängerwahl.
            setLevelRouting(result.levelRouting);
            setSelectedLevel(null);
            setStep("level");
          } else {
            setLevelRouting(null);
            setSelectedLevel(null);
            setStep(3);
          }
        } else if ("success" in result && result.success) {
          setActionResult(result);
          setStep(3);
        }
      } catch (error) {
        console.error("[wizard] submit threw", error);
        setErrorMessage("Es ist ein Fehler aufgetreten. Bitte versuche es erneut.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [wizardData]
  );

  const handleStep2bComplete = useCallback(
    (data: StepPreferencesData) => {
      void submitWizard(data);
    },
    [submitWizard]
  );

  const handleErrorDismiss = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const progress = stepToProgress(step);
  const showIndicator = step !== 3;
  const showBack = !handoffPending && (step === 2 || step === "2b" || step === "level");
  const campaignContext = wizardData.campaign;
  const campaignRestricted = Boolean(
    actionResult &&
      "disambiguationNeeded" in actionResult &&
      actionResult.disambiguationNeeded &&
      actionResult.campaignRestricted
  );
  const showWideCampaignPicker = Boolean(
    step === 3 &&
      actionResult &&
      "disambiguationNeeded" in actionResult &&
      actionResult.disambiguationNeeded &&
      actionResult.campaignRestrictedNoLocalMatch
  );
  const campaignLogoUrl = campaignLogoPublicUrl(campaignContext?.logoPath);
  const campaignInitial = (
    campaignContext?.creatorName ||
    campaignContext?.title ||
    "K"
  )
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [step]);

  return (
    <>
      <div
        className={`${showWideCampaignPicker ? "max-w-5xl" : "max-w-xl"} mx-auto w-full px-4 pb-16 pt-8 sm:px-8 sm:py-16`}
      >
      {(showIndicator || showBack) && (
        <div className="mb-8 flex items-center justify-between sm:mb-12">
          <div className="w-20">
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 font-body text-sm text-warmgrau/60 transition-colors hover:text-warmgrau"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                zurück
              </button>
            )}
          </div>
          {showIndicator && (
            <div className="flex items-center gap-6" aria-label={`Schritt ${progress} von 3`}>
              {STEP_LABELS.map((label, i) => {
                const dotNum = i + 1;
                const isActive = dotNum === progress;
                const isDone = dotNum < progress;
                return (
                  <div key={label} className="group relative flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full transition-colors duration-150 ${
                        isActive
                          ? "bg-waldgruen"
                          : isDone
                            ? "bg-waldgruen/40"
                            : "bg-warmgrau/30"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="sr-only">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="w-20" aria-hidden="true" />
        </div>
      )}

      {campaignContext && step !== 3 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-waldgruen/15 bg-waldgruen/5 px-4 py-3 font-body text-sm leading-relaxed text-warmgrau/75">
          {campaignLogoUrl ? (
            <div
              role="img"
              aria-label={`Logo von ${campaignContext.creatorName ?? campaignContext.title}`}
              className="h-11 w-11 shrink-0 rounded-full border border-waldgruen/15 bg-white shadow-sm"
              style={{
                backgroundImage: `url(${campaignLogoUrl})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-waldgruen/15 bg-white font-typewriter text-base font-bold text-waldgruen-dark shadow-sm"
            >
              {campaignInitial}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-typewriter text-[11px] font-bold uppercase tracking-widest text-waldgruen/60">
              Kampagne
            </p>
            <p className="mt-0.5 truncate font-body text-sm font-semibold text-waldgruen-dark">
              {campaignContext.title}
            </p>
            <p className="mt-0.5 font-body text-sm text-warmgrau/75">
              {campaignContext.creatorName && (
                <>
                  von{" "}
                  {campaignContext.externalUrl ? (
                    <a
                      href={campaignContext.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-waldgruen underline decoration-waldgruen/30 underline-offset-4"
                    >
                      {campaignContext.creatorName}
                    </a>
                  ) : (
                    <span className="font-semibold text-waldgruen-dark">
                      {campaignContext.creatorName}
                    </span>
                  )}
                  {" "}
                  <span aria-hidden="true" className="text-warmgrau/35">
                    ·
                  </span>{" "}
                </>
              )}
              <a
                href={`/kampagne/${campaignContext.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-waldgruen underline decoration-waldgruen/30 underline-offset-4"
              >
                Zur Kampagne
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="transition-opacity duration-150 ease-in" key={step}>
        {handoffPending && (
          <div className="py-16 text-center" role="status" aria-live="polite">
            <p className="font-body text-sm text-warmgrau/70">Dein Anliegen wird übernommen …</p>
          </div>
        )}
        {!handoffPending && step === 1 && (
          <Step2Issue
            autoFocus
            onSubmit={handleStep1Complete}
            defaultValue={wizardData.issueText}
            isCampaign={Boolean(campaignContext)}
          />
        )}
        {!handoffPending && step === 2 && (
          <Step1Form
            onNext={handleStep2Complete}
            defaultValues={{ plz: wizardData.plz, email: wizardData.email }}
            plzError={plzError}
            onPlzErrorDismiss={() => setPlzError(null)}
          />
        )}
        {step === "2b" && campaignMismatch && (
          <div className="rounded-lg border border-waldgruen/20 bg-waldgruen/5 px-5 py-5">
            <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-waldgruen/60">
              Hinweis zur Kampagne
            </p>
            <p className="mt-2 font-body text-base leading-relaxed text-waldgruen-dark">
              {campaignMismatch.message}
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">
              Du kannst stattdessen einen freien Brief zu deinem Thema schreiben. Wir finden dann über deine Postleitzahl die passende politische Ebene.
            </p>
            <button
              type="button"
              onClick={() => {
                setWizardData((prev) => ({ ...prev, campaign: undefined }));
                setCampaignMismatch(null);
                setStep("2b");
              }}
              className="mt-4 rounded-md bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark"
            >
              Stattdessen einen freien Brief schreiben
            </button>
          </div>
        )}
        {!handoffPending && step === "2b" && !campaignMismatch && (
          <StepPreferences
            onNext={handleStep2bComplete}
            onChange={handlePreferencesChange}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onErrorDismiss={handleErrorDismiss}
            isCampaign={Boolean(campaignContext)}
            defaultValues={{
              party: wizardData.party,
              ngo: wizardData.ngo,
              letterLength: wizardData.letterLength,
              toneLevel: wizardData.toneLevel,
            }}
          />
        )}
        {step === "level" && levelRouting && (
          <StepLevelSelect
            routing={levelRouting}
            initialLevel={selectedLevel}
            onContinue={(level) => {
              setSelectedLevel(level);
              setStep(3);
            }}
          />
        )}
        {step === 3 && (
          <Step3Success
            key={selectedLevel ?? "flat"}
            result={actionResult}
            wizardData={wizardData as WizardData}
            recipients={recipientsForLevel(
              politicians,
              levelRouting,
              selectedLevel,
              campaignRestricted
            )}
            optionalLandRecipients={
              selectedLevel === "Land"
                ? (levelRouting?.optionalByLevel.Land ?? []).map((p) => ({
                    ...p,
                    kind: "mdl" as const,
                  }))
                : []
            }
            selectedLevel={selectedLevel ?? undefined}
            routingToken={routingToken}
            onChangePlz={
              actionResult && "disambiguationNeeded" in actionResult && actionResult.disambiguationNeeded
                ? () => {
                    setActionResult(null);
                    setPoliticians([]);
                    setLevelRouting(null);
                    setSelectedLevel(null);
                    setStep(2);
                  }
                : undefined
            }
            onChangeLevel={
              !wizardData.campaign &&
              levelRouting &&
              actionResult &&
              "disambiguationNeeded" in actionResult &&
              actionResult.disambiguationNeeded
                ? () => setStep("level")
                : undefined
            }
          />
        )}
      </div>
      </div>
      <FadeFooterImage
        variant={step === "level" ? "level" : step === 3 ? "success" : "wizard"}
      />
    </>
  );
}
