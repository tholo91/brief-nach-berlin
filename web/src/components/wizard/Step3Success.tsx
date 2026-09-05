"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { WizardData, WizardActionResult } from "@/lib/types/wizard";
import type { PoliticalLevel } from "@/lib/types/politician";
import type {
  Recipient,
  RecipientSelection,
  MdbRecipient,
  MdlRecipient,
  RathausRecipient,
} from "@/lib/lookup/rathausRecipient";
import type { LandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";
import { selectPoliticianAction } from "@/lib/actions/selectPolitician";
import { resendLetterAction } from "@/lib/actions/resendLetter";
import { reportErrorAction } from "@/lib/actions/reportError";
import { installClientLogBuffer, getClientLogs } from "@/lib/clientLogBuffer";
import { formatPartyShort } from "@/lib/formatParty";
import {
  FOUNDER_EMAIL,
  FOUNDER_FEEDBACK_URL,
} from "@/lib/config";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";
import {
  filterCampaignRecipients,
  initialPoliticianId,
  visibleLocalCampaignRecipients,
} from "@/lib/campaign-recipient-picker";
import { WizardForwardIcon } from "./WizardForwardIcon";
import { LetterSignalCard } from "./LetterSignalCard";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "deine E-Mail-Adresse";
  const visible = local.length <= 2 ? local[0] ?? "" : local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(1, Math.min(5, local.length - visible.length)))}@${domain}`;
}

// Phased loading copy. Rotates while the politician-pick spinner runs. This is
// the user's final click - they sit here waiting for the letter to be drafted,
// so a single static spinner feels longer than chunked progress. Timings sum
// to the LETTER_GEN_MIN_DISPLAY_MS budget below.
const LETTER_GEN_PHASES: ReadonlyArray<{ at: number; label: string }> = [
  { at: 0, label: "Empfänger prüfen..." },
  { at: 1300, label: "Angaben vorbereiten..." },
  { at: 2600, label: "Brief wird formuliert..." },
];
const LETTER_GEN_MIN_DISPLAY_MS = 4000;

// Webmail-Provider → öffentliche Inbox-URL. Used by the mobile-only
// "Mail-App öffnen" button to deep-link users back to where the letter lands.
// We only render the button when wizardData.email's domain matches one of
// these entries - better no button than a broken one for custom domains.
// Universal Links on iOS/Android usually route these to the installed app.
const WEBMAIL_PROVIDERS: Record<string, { label: string; url: string }> = {
  "gmail.com": { label: "Gmail öffnen", url: "https://mail.google.com/" },
  "googlemail.com": { label: "Gmail öffnen", url: "https://mail.google.com/" },
  "gmx.de": { label: "GMX öffnen", url: "https://www.gmx.net/" },
  "gmx.net": { label: "GMX öffnen", url: "https://www.gmx.net/" },
  "gmx.com": { label: "GMX öffnen", url: "https://www.gmx.com/" },
  "web.de": { label: "Web.de öffnen", url: "https://web.de/" },
  "outlook.com": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "outlook.de": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "hotmail.com": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "hotmail.de": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "live.de": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "live.com": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "msn.com": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "yahoo.com": { label: "Yahoo öffnen", url: "https://mail.yahoo.com/" },
  "yahoo.de": { label: "Yahoo öffnen", url: "https://mail.yahoo.de/" },
  "icloud.com": { label: "iCloud Mail öffnen", url: "https://www.icloud.com/mail" },
  "me.com": { label: "iCloud Mail öffnen", url: "https://www.icloud.com/mail" },
  "mac.com": { label: "iCloud Mail öffnen", url: "https://www.icloud.com/mail" },
  "t-online.de": { label: "T-Online öffnen", url: "https://email.t-online.de/" },
  "aol.com": { label: "AOL Mail öffnen", url: "https://mail.aol.com/" },
  "aol.de": { label: "AOL Mail öffnen", url: "https://mail.aol.de/" },
  "proton.me": { label: "Proton Mail öffnen", url: "https://mail.proton.me/" },
  "protonmail.com": { label: "Proton Mail öffnen", url: "https://mail.proton.me/" },
  "pm.me": { label: "Proton Mail öffnen", url: "https://mail.proton.me/" },
  "mailbox.org": { label: "mailbox.org öffnen", url: "https://login.mailbox.org/" },
  "posteo.de": { label: "Posteo öffnen", url: "https://posteo.de/" },
  "posteo.net": { label: "Posteo öffnen", url: "https://posteo.de/" },
};

function resolveWebmail(email: string | undefined): { label: string; url: string } | null {
  if (!email) return null;
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return null;
  return WEBMAIL_PROVIDERS[domain] ?? null;
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined" || typeof document === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
}

interface Step3SuccessProps {
  result: WizardActionResult | null;
  wizardData: WizardData;
  /** Empfänger der gewählten Ebene: MdB/MdL-Karten oder ein Rathaus-Empfänger */
  recipients: Recipient[];
  /** Optionale MdLs; erst nach bewusstem Wechsel in den Personenpfad sichtbar. */
  optionalLandRecipients?: MdlRecipient[];
  /** Gewählte Ebene (nur gesetzt, wenn der Ebene-Auswahl-Step aktiv war) */
  selectedLevel?: PoliticalLevel;
  /** Signierter Routing-Token — wird an /api/generate-letter durchgereicht */
  routingToken?: string | null;
  onChangePlz?: () => void;
  /** Zurück zum Ebene-Auswahl-Step (Override bleibt jederzeit leicht) */
  onChangeLevel?: () => void;
}

export function Step3Success({
  result,
  wizardData,
  recipients,
  optionalLandRecipients = [],
  selectedLevel,
  routingToken,
  onChangePlz,
  onChangeLevel,
}: Step3SuccessProps) {
  // Abgeordneten-Karten (mdb/mdl) und der synthetische Rathaus-Empfänger
  // teilen sich den Step; Kommune zeigt genau eine Verwaltungs-Karte.
  const [showLandPersonPicker, setShowLandPersonPicker] = useState(false);
  const politicians = useMemo(() => {
    const standard = recipients.filter(
      (r): r is MdbRecipient | MdlRecipient => r.kind === "mdb" || r.kind === "mdl"
    );
    return showLandPersonPicker ? [...standard, ...optionalLandRecipients] : standard;
  }, [recipients, optionalLandRecipients, showLandPersonPicker]);
  const rathaus = useMemo(
    () => recipients.find((r): r is RathausRecipient => r.kind === "rathaus") ?? null,
    [recipients]
  );
  const landesregierung = useMemo(
    () =>
      recipients.find(
        (r): r is LandesregierungRecipient => r.kind === "landesregierung"
      ) ?? null,
    [recipients]
  );
  const landWahlkreisCount = useMemo(
    () => new Set(politicians.map((p) => p.wahlkreisId)).size,
    [politicians]
  );
  const isAmbiguousLand =
    selectedLevel === "Land" && showLandPersonPicker && landWahlkreisCount > 1;
  const isAmbiguousKommune =
    selectedLevel === "Kommune" &&
    rathaus?.ambiguous === true;
  const campaignRestricted = Boolean(
    result &&
      "disambiguationNeeded" in result &&
      result.disambiguationNeeded &&
      result.campaignRestricted
  );
  const campaignRestrictedNoLocalMatch = Boolean(
    result &&
      "disambiguationNeeded" in result &&
      result.disambiguationNeeded &&
      result.campaignRestrictedNoLocalMatch
  );
  const campaignTargetCount =
    result && "disambiguationNeeded" in result && result.disambiguationNeeded
      ? result.campaignTargetCount ?? politicians.length
      : politicians.length;

  const isNoMdbFound = politicians.length === 1 && politicians[0].id === -1;

  const [selectedPoliticianId, setSelectedPoliticianId] = useState<number | null>(
    () =>
      initialPoliticianId(politicians, {
        ambiguousLand: isAmbiguousLand,
        campaignRestricted,
        campaignRestrictedNoLocalMatch,
      })
  );
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignPartyFilters, setCampaignPartyFilters] = useState<string[]>([]);
  const [showMoreCampaignPoliticians, setShowMoreCampaignPoliticians] = useState(false);
  // Kommune: die einzige Rathaus-Karte ist vorausgewählt (ein Klick weniger)
  const [rathausSelected, setRathausSelected] = useState<boolean>(() => Boolean(rathaus));
  const [landesregierungSelected, setLandesregierungSelected] = useState<boolean>(
    () => Boolean(landesregierung)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [resendOpen, setResendOpen] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error" | "limited">("idle");
  const [resendLimitMessage, setResendLimitMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState(wizardData.email);
  const [letterText, setLetterText] = useState<string>(() => {
    if (result && "success" in result && result.success) return result.letterText;
    return "";
  });
  // Die bestätigte Auswahl + der serverseitig aufgelöste Empfänger nach dem
  // Pre-Check. Treibt den /api/generate-letter-Fetch und den Resend-Pfad.
  const [generatedSelection, setGeneratedSelection] = useState<RecipientSelection | null>(() => {
    if (result && "success" in result && result.success) {
      return { kind: "mdb", selectedPoliticianId: result.politician.id };
    }
    return null;
  });
  const [generatedRecipient, setGeneratedRecipient] = useState<Recipient | null>(() => {
    if (result && "success" in result && result.success) {
      return { ...result.politician, kind: "mdb" };
    }
    return null;
  });
  // letterReady gates the "Keine E-Mail erhalten?" section - true once the
  // async /api/generate-letter fetch resolves (or immediately if letterText
  // was already available from the synchronous success path).
  const [letterReady, setLetterReady] = useState<boolean>(() => {
    if (result && "success" in result && result.success) return true;
    return false;
  });
  const [generationFetchError, setGenerationFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  // "Fehler melden"-Frühwarnsystem: Kontext des letzten Generierungsfehlers
  // (HTTP-Status, Server-Detail, Client-Fehler) wird hier festgehalten und beim
  // Klick zusammen mit den Console-Logs an Thomas gemailt.
  const lastErrorRef = useRef<{
    httpStatus: number | null;
    serverMessage: string | null;
    errorId: string | null;
    detail?: unknown;
    clientError: string | null;
  } | null>(null);
  // Verhindert gleichzeitige Requests an /api/generate-letter. Ohne diesen Guard
  // kann ein Re-render mit neuer wizardData-Referenz oder ein vorzeitiger Abort
  // einen zweiten Request starten, während der erste den Server schon erreicht hat
  // (after()-E-Mail wurde bereits eingereiht → Doppel-Send).
  const fetchInFlightRef = useRef(false);
  const [reportState, setReportState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [loadingDots, setLoadingDots] = useState(".");
  // "So geht es weiter" is collapsed by default - the same content lives in
  // the email, so we save vertical space and let the rating teaser breathe.
  const [stepsOpen, setStepsOpen] = useState(false);
  // Index into LETTER_GEN_PHASES - advances on a setTimeout chain while
  // isGenerating is true, resets when it ends. Drives the phased button copy
  // during the final letter-generation wait.
  const [genPhase, setGenPhase] = useState(0);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const [letterSignalContext, setLetterSignalContext] = useState<string | null>(() =>
    result && "letterSignalContext" in result && typeof result.letterSignalContext === "string"
      ? result.letterSignalContext
      : null,
  );
  const [generationProof, setGenerationProof] = useState<string | null>(() =>
    result && "generationProof" in result && typeof result.generationProof === "string"
      ? result.generationProof
      : null,
  );

  useEffect(() => {
    if (!isGenerating) return;
    const timers = LETTER_GEN_PHASES.slice(1).map((phase, idx) =>
      setTimeout(() => setGenPhase(idx + 1), phase.at)
    );
    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  // Console-Ringpuffer einmalig installieren, damit "Fehler melden" die letzten
  // Client-Logs an die Report-Mail anhängen kann.
  useEffect(() => {
    installClientLogBuffer();
  }, []);

  // After picking a politician the user lands mid-page (the submit button was
  // scrolled into view). When the success state renders, jump back to the top
  // so the "Brief ist fertig!" headline is the first thing they see.
  useEffect(() => {
    if (!generationComplete) return;
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [generationComplete]);

  const webmail = resolveWebmail(wizardData.email);
  // iOS: message:// opens Apple Mail's inbox directly, no domain sniffing
  // needed. Android has no equivalent universal scheme, so we fall back to
  // the provider-specific webmail URL.
  const [isIOS] = useState(detectIOS);
  const mailAppHref = isIOS ? "message://" : webmail?.url ?? null;

  // Smooth-scroll the submit button into view after a card is picked, so users
  // on long lists don't have to hunt for the next step. Honor
  // prefers-reduced-motion (vestibular-disorder safety, WCAG 2.3.3).
  const handleCardSelect = useCallback((politicianId: number) => {
    setSelectedPoliticianId(politicianId);
    setRathausSelected(false);
    setLandesregierungSelected(false);
    requestAnimationFrame(() => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia?.("(max-width: 639px)").matches;
      if (isMobile) return;
      submitButtonRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      });
    });
  }, []);

  const displayedPoliticians = useMemo(() => {
    if (campaignRestrictedNoLocalMatch) {
      return filterCampaignRecipients(
        politicians,
        campaignSearch,
        campaignPartyFilters
      );
    }
    if (campaignRestricted) {
      return visibleLocalCampaignRecipients(
        politicians,
        selectedPoliticianId,
        showMoreCampaignPoliticians
      );
    }
    return politicians;
  }, [
    campaignRestricted,
    campaignRestrictedNoLocalMatch,
    campaignPartyFilters,
    campaignSearch,
    politicians,
    selectedPoliticianId,
    showMoreCampaignPoliticians,
  ]);

  const campaignPartyOptions = useMemo(
    () =>
      [...new Set(politicians.map((politician) => politician.party))].sort(
        new Intl.Collator("de-DE").compare
      ),
    [politicians]
  );

  const toggleCampaignParty = useCallback((party: string) => {
    setCampaignPartyFilters((current) =>
      current.includes(party)
        ? current.filter((value) => value !== party)
        : [...current, party]
    );
    setSelectedPoliticianId(null);
  }, []);

  // Direktmandate first, then list/Nachrücker (stable within each group)
  const sortedPoliticians = useMemo(() => {
    return [...displayedPoliticians].sort(
      (a, b) => Number(b.isDirect) - Number(a.isDirect)
    );
  }, [displayedPoliticians]);

  const selectedPolitician = useMemo(
    () => politicians.find((p) => p.id === selectedPoliticianId) ?? null,
    [politicians, selectedPoliticianId]
  );

  // Diskriminierte Auswahl für die Server-Seite: rathaus trägt bewusst keine
  // ID (LOCK-5), Abgeordnete gehen mit kind + Abgeordnetenwatch-ID raus.
  const currentSelection = useMemo<RecipientSelection | null>(() => {
    if (landesregierung && landesregierungSelected) return { kind: "landesregierung" };
    if (rathaus && rathausSelected) return { kind: "rathaus" };
    if (selectedPolitician) {
      return { kind: selectedPolitician.kind, selectedPoliticianId: selectedPolitician.id };
    }
    if (selectedPoliticianId !== null) {
      // Fallback-Karte (id -1, "MdB später auswählen") ist kein echtes Politician-Objekt
      return { kind: "mdb", selectedPoliticianId };
    }
    return null;
  }, [landesregierung, landesregierungSelected, rathaus, rathausSelected, selectedPolitician, selectedPoliticianId]);

  // Group the disambiguation cards by Wahlkreis. sortedPoliticians is already
  // Direkt-first, so insertion order puts the group holding the pre-selected
  // Direktmandat at the top. Each card carries a precomputed flat index matching
  // its DOM order (groups render in order), so the existing arrow-key radio
  // navigation in handleCardKeyDown keeps working across groups. The index is
  // assigned here in the memo rather than via a render-time counter, so the JSX
  // below stays a plain map (no IIFE that reads refs during render).
  const wahlkreisGroups = useMemo(() => {
    const groups: {
      wahlkreisId: number;
      wahlkreisName: string;
      politicians: (MdbRecipient | MdlRecipient)[];
    }[] = [];
    const indexById = new Map<number, number>();
    for (const p of sortedPoliticians) {
      if (campaignRestrictedNoLocalMatch) {
        if (groups.length === 0) {
          groups.push({
            wahlkreisId: -1,
            wahlkreisName: "Kampagnenauswahl",
            politicians: [],
          });
        }
        groups[0].politicians.push(p);
        continue;
      }
      let gi = indexById.get(p.wahlkreisId);
      if (gi === undefined) {
        gi = groups.length;
        indexById.set(p.wahlkreisId, gi);
        groups.push({
          wahlkreisId: p.wahlkreisId,
          wahlkreisName: p.wahlkreisName,
          politicians: [],
        });
      }
      groups[gi].politicians.push(p);
    }
    let flatIndex = 0;
    return groups.map((group) => ({
      wahlkreisId: group.wahlkreisId,
      wahlkreisName: group.wahlkreisName,
      cards: group.politicians.map((politician) => ({
        politician,
        flatIndex: flatIndex++,
      })),
    }));
  }, [campaignRestrictedNoLocalMatch, sortedPoliticians]);

  // >5 total cards => 2-col grid per group, else single column.
  const cardsMultiCol = sortedPoliticians.length > 5;

  const handleSelectPolitician = useCallback(
    async () => {
      if (currentSelection === null) return;

      // Reset phase so a second attempt starts at "Wahlkreis prüfen..." again,
      // not at whatever phase the last attempt ended on.
      setGenPhase(0);
      setIsGenerating(true);
      setGenerationError(null);

      // Minimum spinner duration - starts in parallel with the pre-check so the
      // button shows phased progress for the full LETTER_GEN_MIN_DISPLAY_MS
      // window before navigating. This is the user's final click; padding it
      // here is the main perceived-wait reduction tool.
      const minDisplayTimer = new Promise<void>((resolve) =>
        setTimeout(resolve, LETTER_GEN_MIN_DISPLAY_MS)
      );

      try {
        // NOTE: we deliberately never pass recipient objects here - the server
        // re-derives everything from PLZ to prevent tampering. Only the
        // discriminated selection (kind + optional numeric ID) is user input.
        const selectResult = await selectPoliticianAction(
          wizardData,
          currentSelection,
          routingToken ?? undefined,
        );

        if ("letterSignalContext" in selectResult && typeof selectResult.letterSignalContext === "string") {
          setLetterSignalContext(selectResult.letterSignalContext);
        }
        if ("generationProof" in selectResult && typeof selectResult.generationProof === "string") {
          setGenerationProof(selectResult.generationProof);
        }

        if ("error" in selectResult) {
          setGenerationError(selectResult.message);
          setIsGenerating(false);
          return;
        }

        if ("preCheckOk" in selectResult && selectResult.preCheckOk) {
          await minDisplayTimer;
          setGenerationComplete(true);
          setGeneratedSelection(currentSelection);
          setGeneratedRecipient(selectResult.recipient);
          // letterText arrives async via /api/generate-letter (see useEffect below)
        }
      } catch {
        setGenerationError(
          "Es ist ein Fehler aufgetreten. Bitte versuche es erneut."
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [currentSelection, wizardData, routingToken]
  );

  // Animate ". .. ..." while letter is still being generated.
  useEffect(() => {
    if (letterReady) return;
    const interval = setInterval(() => {
      setLoadingDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [letterReady]);

  // Fetch the generated letter from the server once pre-checks pass.
  // Retries once automatically on failure, then shows a manual error banner.
  //
  // fetchInFlightRef verhindert, dass ein laufender Request durch einen
  // Re-render (z.B. neue wizardData-Referenz) abgebrochen und sofort neu
  // gestartet wird — der Server hat after() bereits eingereiht, eine zweite
  // Anfrage würde eine zweite Mail auslösen. wizardData ist bewusst nicht in
  // den Deps: es ändert sich nach generationComplete nicht mehr, und als
  // Closure-Variable ist der Wert zum Zeitpunkt des Fires korrekt.
  useEffect(() => {
    if (!generationComplete || letterReady || generatedSelection === null) return;
    if (fetchInFlightRef.current) return;
    fetchInFlightRef.current = true;

    const controller = new AbortController();
    let autoRetryTimer: ReturnType<typeof setTimeout> | null = null;

    fetch("/api/generate-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wizardData,
          selection: generatedSelection,
          ...(letterSignalContext ? { letterSignalContext } : {}),
        ...(routingToken ? { routingToken } : {}),
      }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          // Body lesen, bevor wir werfen - hier steckt die echte Server-Meldung
          // + errorId + detail, die wir für die "Fehler melden"-Mail brauchen.
          let serverMessage: string | null = null;
          let errorId: string | null = null;
          let detail: unknown;
          try {
            const errBody = (await res.json()) as {
              error?: string;
              errorId?: string;
              detail?: unknown;
            };
            serverMessage = errBody?.error ?? null;
            errorId = errBody?.errorId ?? null;
            detail = errBody?.detail;
          } catch {
            // Body nicht lesbar (z.B. HTML-Errorpage) - Status reicht.
          }
          lastErrorRef.current = {
            httpStatus: res.status,
            serverMessage,
            errorId,
            detail,
            clientError: null,
          };
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<{
          letterText?: string;
          letterNumber?: number;
          letterId?: string;
          letterSignalContext?: string;
          generationProof?: string;
        }>;
      })
      .then((data) => {
        if (data.letterSignalContext) setLetterSignalContext(data.letterSignalContext);
        if (data.generationProof) setGenerationProof(data.generationProof);
        if (data.letterText) {
          setLetterText(data.letterText);
          setLetterReady(true);
        } else {
          throw new Error("No letterText");
        }
      })
      .catch((err: Error) => {
        // Ref freigeben, damit der einmalige Auto-Retry (retryCount 0→1) oder
        // ein Abort-bedingter Re-run einen neuen Request starten darf.
        fetchInFlightRef.current = false;
        if (err.name === "AbortError") return;
        // Client-/Netzwerkfehler (kein HTTP-Status erfasst) festhalten.
        if (!err.message.startsWith("HTTP ")) {
          lastErrorRef.current = {
            httpStatus: null,
            serverMessage: null,
            errorId: null,
            detail: undefined,
            clientError: err.message,
          };
        }
        const status = lastErrorRef.current?.httpStatus ?? null;
        const retryable = status === null || status >= 500;
        if (retryCount === 0 && retryable) {
          autoRetryTimer = setTimeout(() => setRetryCount(1), 3000);
        } else {
          setGenerationFetchError(
            "Beim Erstellen deines Briefes ist ein Fehler aufgetreten."
          );
        }
      });

    return () => {
      controller.abort();
      if (autoRetryTimer) clearTimeout(autoRetryTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generationComplete, letterReady, retryCount, generatedSelection, letterSignalContext]);

  // Ein-Klick-Fehlerreport: übergibt den Fehlerstatus; die Server-Action verwirft
  // Freitext und versendet ausschließlich erlaubte technische Metadaten.
  const handleReportError = useCallback(async () => {
    setReportState("sending");
    const e = lastErrorRef.current;
    const result = await reportErrorAction({
      httpStatus: e?.httpStatus ?? null,
      serverMessage: e?.serverMessage ?? null,
      errorId: e?.errorId ?? null,
      detail: e?.detail,
      clientError: e?.clientError ?? null,
      consoleLogs: getClientLogs(),
      context: {
        plz: wizardData.plz ?? null,
        email: wizardData.email ?? null,
        politicianId:
          generatedSelection &&
          (generatedSelection.kind === "mdb" || generatedSelection.kind === "mdl")
            ? generatedSelection.selectedPoliticianId
            : null,
        retryCount,
      },
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      pageUrl: typeof window !== "undefined" ? window.location.href : null,
    }).catch(() => ({ success: false }));
    setReportState(result.success ? "sent" : "failed");
  }, [wizardData, generatedSelection, retryCount]);

  // Keyboard navigation for politician cards
  const handleCardKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    politicianId: number
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardSelect(politicianId);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const cards = document.querySelectorAll<HTMLElement>('[role="radio"]');
      const nextIndex =
        e.key === "ArrowDown"
          ? (index + 1) % cards.length
          : (index - 1 + cards.length) % cards.length;
      cards[nextIndex]?.focus();
    }
  };

  const handleResend = useCallback(async () => {
    if (resendState === "sending" || resendState === "sent" || resendState === "limited") return;
    if (!letterText || generatedSelection === null) return;
    setResendState("sending");
    try {
      const res = await resendLetterAction({ ...wizardData, email: resendEmail }, generatedSelection, letterText, generationProof ?? undefined);
      if ("success" in res) {
        setResendState("sent");
      } else if (res.error === "rate_limited") {
        setResendLimitMessage(res.message);
        setResendState("limited");
      } else {
        setResendState("error");
      }
    } catch {
      setResendState("error");
    }
  }, [resendState, letterText, generatedSelection, wizardData, resendEmail, generationProof]);

  const founderFeedbackUrl = wizardData.email
    ? `${FOUNDER_FEEDBACK_URL}?email=${encodeURIComponent(wizardData.email)}`
    : FOUNDER_FEEDBACK_URL;
  const effectiveLevel: PoliticalLevel =
    selectedLevel ??
    generatedRecipient?.level ??
    (result && "success" in result && result.success ? result.politicalLevel : "Bund");
  const handwrittenImpactCopy = effectiveLevel === "Bund"
    ? "Handgeschriebene Briefe werden im Bundestag tatsächlich gelesen und besprochen."
    : effectiveLevel === "Land"
      ? "Ein persönlicher, handgeschriebener Brief macht dein Anliegen auf Landesebene konkret."
      : "Ein persönlicher, handgeschriebener Brief macht dein Anliegen für die Verwaltung greifbar.";
  const addressInstruction = effectiveLevel === "Kommune"
    ? "Nutze die Suchhilfe, prüfe die vollständige Anschrift und schreib sie auf den Umschlag."
    : "Die Adresse findest du im Brief.";
  if (!result) return null;

  // Sub-state C: Level data missing (D-07)
  if ("error" in result && result.error === "level_data_missing") {
    return (
      <div>
        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark">
          Daten nicht verfügbar
        </h1>
        <p className="font-body text-base text-warmgrau leading-relaxed mt-6">
          {result.message}
        </p>
        {"fallbackUrl" in result && (
          <a
            href={result.fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-waldgruen underline hover:text-waldgruen-dark font-body text-base"
          >
            {result.fallbackUrl}
          </a>
        )}
      </div>
    );
  }

  // Sub-state A: Processing / Success (single Wahlkreis or after disambiguation)
  if (
    ("success" in result && result.success) ||
    generationComplete
  ) {
    return (
      <div className="grid gap-x-8 gap-y-7 md:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:gap-x-12">
        <section className="min-w-0 md:col-start-1 md:row-start-1">
        {/* Header: envelope + headline side by side */}
        <div className="mb-3 flex items-center gap-3">
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" className="text-waldgruen flex-shrink-0" aria-hidden="true">
            <rect x="4" y="10" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M4 13 L24 28 L44 13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          </svg>
          <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark m-0">
            Dein Brief ist fertig
          </h1>
        </div>
        <p className="font-body text-base text-warmgrau leading-relaxed mt-3">
          {letterReady ? (
            <>Dein Entwurf und alle nächsten Schritte sind an <strong>{maskEmail(wizardData.email)}</strong> unterwegs.</>
          ) : (
            <>
              Brief und nächste Schritte kommen per E-Mail zu dir
              <span aria-hidden="true">{loadingDots}</span>
            </>
          )}
        </p>

        {/* Recognized providers get a direct inbox link on every device;
            unknown domains keep the neutral manual instruction. */}
        <div className={letterReady ? "block" : "hidden"}>
          <div className="mt-5">
            {mailAppHref ? (
              <a
                href={mailAppHref}
                target={isIOS ? undefined : "_blank"}
                rel={isIOS ? undefined : "noopener noreferrer"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-waldgruen px-4 py-3 font-body text-sm font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
              >
                Postfach öffnen <span aria-hidden="true">→</span>
              </a>
            ) : (
              <p className="rounded-lg border border-waldgruen/20 bg-waldgruen/5 px-4 py-3 text-center font-body text-sm leading-relaxed text-waldgruen-dark">
                Öffne jetzt dein E-Mail-Postfach und suche nach „Dein Brief nach Berlin ist fertig“.
              </p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center divide-x divide-warmgrau/20">
            <button
              type="button"
              onClick={() => {
                setResendOpen((open) => !open);
                setStepsOpen(false);
              }}
              aria-expanded={resendOpen}
              className="cursor-pointer px-3 font-body text-sm text-warmgrau/55 underline underline-offset-2 transition-colors hover:text-warmgrau/75"
            >
              Keine E-Mail erhalten?
            </button>
            <button
              type="button"
              onClick={() => {
                setStepsOpen((open) => !open);
                setResendOpen(false);
              }}
              aria-expanded={stepsOpen}
              className="inline-flex cursor-pointer items-center gap-1.5 px-3 font-body text-sm text-warmgrau/55 transition-colors hover:text-warmgrau/75"
            >
              <span className="underline underline-offset-2">So geht es weiter</span>
              <span
                aria-hidden="true"
                className={`text-[9px] transition-transform duration-300 ${stepsOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
          </div>
        </div>
        {resendOpen && letterReady && (
          <div className="mt-3 p-4 bg-warmgrau/5 rounded-lg space-y-3">
              <p className="font-body text-sm text-warmgrau leading-relaxed">
                Prüfe deinen Spam-Ordner. Falls nichts ankommt, überprüfe deine E-Mail-Adresse und sende den Brief erneut.
              </p>
              {resendState !== "sent" && resendState !== "limited" && (
                <div>
                  <label htmlFor="resend-email" className="font-body text-xs text-warmgrau/60 mb-1 block">
                    E-Mail-Adresse
                  </label>
                  <input
                    id="resend-email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => { setResendEmail(e.target.value); setResendState("idle"); }}
                    className="w-full font-body text-sm text-warmgrau bg-white border border-warmgrau/25 rounded-lg px-3 py-2 focus:outline-none focus:border-waldgruen transition-colors"
                    disabled={resendState === "sending"}
                  />
                </div>
              )}
              <div>
                {resendState === "sent" ? (
                  <p className="font-body text-sm text-waldgruen font-semibold flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                    Brief wurde erneut gesendet
                  </p>
                ) : resendState === "limited" ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-2.5 rounded-lg bg-waldgruen/5 border border-waldgruen/20 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-waldgruen flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                    </svg>
                    <div className="space-y-1.5">
                      <p className="font-body text-sm font-semibold text-waldgruen-dark">Maximal dreimal gesendet</p>
                      <p className="font-body text-sm text-warmgrau leading-relaxed">
                        {resendLimitMessage ?? "Der Brief wurde jetzt mehrfach gesendet. Bitte prüfe noch einmal deinen Spam-Ordner und die E-Mail-Adresse."}
                      </p>
                      <a
                        href={founderFeedbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block font-body text-sm font-semibold text-waldgruen underline underline-offset-2 hover:text-waldgruen-dark"
                      >
                        Hilfe anfragen
                      </a>
                    </div>
                  </div>
                ) : resendState === "error" ? (
                  <div className="space-y-2">
                    <p className="font-body text-sm text-airmail-rot">
                      Senden fehlgeschlagen. Bitte lade die Seite neu und versuche es erneut.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="font-body text-sm text-waldgruen font-semibold underline underline-offset-2 hover:text-waldgruen-dark transition-colors cursor-pointer"
                      >
                        Seite neu laden
                      </button>
                      <button
                        type="button"
                        onClick={handleResend}
                        className="font-body text-sm text-warmgrau/70 underline underline-offset-2 hover:text-warmgrau transition-colors cursor-pointer"
                      >
                        Nochmal versuchen
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendState === "sending" || !resendEmail.trim()}
                    className={[
                      "font-body text-sm font-semibold text-waldgruen border border-waldgruen/30 px-4 py-2 rounded-lg transition-colors",
                      resendState === "sending" || !resendEmail.trim() ? "opacity-60 cursor-not-allowed" : "hover:bg-waldgruen/8 cursor-pointer",
                    ].join(" ")}
                  >
                    {resendState === "sending" ? (
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        Wird gesendet...
                      </span>
                    ) : (
                      "Brief erneut senden"
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

        {/* Generation error banner - shown if /api/generate-letter fails after auto-retry.
            The report sends only server-sanitized technical metadata. */}
        {generationFetchError && (
          reportState === "sent" ? (
            <div
              role="status"
              className="mt-6 bg-waldgruen/10 border-l-4 border-waldgruen p-4 rounded-r-lg font-body text-sm"
            >
              <p className="flex items-center gap-2 font-semibold text-waldgruen mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                Danke für deine Hilfe!
              </p>
              <p className="text-waldgruen/80">
                Ich habe die Fehlermeldung bekommen. Ich beeile mich und melde mich, sobald das behoben ist.
              </p>
            </div>
          ) : (
            <div
              role="alert"
              className="mt-6 bg-airmail-rot/10 border-l-4 border-airmail-rot p-4 rounded-r-lg font-body text-sm"
            >
              <p className="font-semibold text-airmail-rot mb-1">Brief konnte nicht erstellt werden</p>
              <p className="text-airmail-rot/80 mb-3">{generationFetchError}</p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleReportError}
                  disabled={reportState === "sending"}
                  className={[
                    "inline-flex items-center gap-2 font-body text-sm font-semibold text-white bg-airmail-rot px-4 py-2 rounded-lg transition-colors",
                    reportState === "sending"
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-airmail-rot/90 cursor-pointer",
                  ].join(" ")}
                >
                  {reportState === "sending" ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      Wird gemeldet...
                    </>
                  ) : (
                    "Fehler melden"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGenerationFetchError(null);
                    setReportState("idle");
                    setRetryCount((c) => c + 1);
                  }}
                  className="font-semibold text-airmail-rot underline underline-offset-2 hover:text-airmail-rot/80 transition-colors cursor-pointer"
                >
                  Nochmal versuchen
                </button>
              </div>
              <p className="mt-2 text-xs text-airmail-rot/70">
                {reportState === "failed" ? (
                  <>
                    Melden hat nicht geklappt. Schreib mir kurz an{" "}
                    <a href={`mailto:${FOUNDER_EMAIL}`} className="underline">{FOUNDER_EMAIL}</a>.
                  </>
                ) : (
                  "Ein Klick genügt. Schickt mir die Fehlerdaten, damit ich es schnell beheben kann."
                )}
              </p>
            </div>
          )
        )}

        {/* The trigger lives beside the resend action to keep the default
            success state compact. Details expand in place only on demand. */}
        <div className={stepsOpen ? "mt-3" : undefined}>
          <div
            className={`grid transition-all duration-300 ease-out ${
              stepsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className={`overflow-hidden ${stepsOpen ? "rounded-lg bg-warmgrau/5 p-4" : ""}`}>
              {letterReady && (
                <div className="mb-4 border-l-2 border-waldgruen/35 pl-4">
                  <p className="font-body text-sm font-semibold text-waldgruen-dark">
                    Mach diesen Brief zu deinem Brief.
                  </p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-warmgrau/75">
                    Lies dir die Mail durch und pass Ton, Formulierungen oder einzelne Argumente so an, dass der Brief sich nach dir anfühlt. Der Entwurf ist ein Anfang, die Unterschrift ist deine.
                  </p>
                </div>
              )}
              <ol className="space-y-3 pt-1">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-waldgruen/15 text-waldgruen font-body text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                  <p className="font-body text-sm text-warmgrau leading-relaxed">
                    <strong>Brief abschreiben.</strong> Schreib den Brief von Hand ab und pass ihn an deinen Schreibstil an. {handwrittenImpactCopy}
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-waldgruen/15 text-waldgruen font-body text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                  <p className="font-body text-sm text-warmgrau leading-relaxed">
                    <strong>Adresse aufschreiben, Briefmarke drauf, ab zur Post.</strong> {addressInstruction}
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-waldgruen/15 text-waldgruen font-body text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                  <p className="font-body text-sm text-warmgrau leading-relaxed">
                    <strong>Weitersagen.</strong> Je mehr Menschen schreiben, desto mehr Gewicht hat jeder einzelne Brief.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </div>
        </section>

        <aside className="min-w-0 border-t border-warmgrau/15 pt-6 md:-mt-1 md:col-start-2 md:row-span-2 md:row-start-1 md:border-l md:border-t-0 md:pl-8 md:pt-12">
          {letterSignalContext && (
            <LetterSignalCard
              contextToken={letterSignalContext}
              generationProof={generationProof}
              email={wizardData.email}
              letterPending={!letterReady}
            />
          )}
        </aside>

        <section
          aria-labelledby="success-support-title"
          className="overflow-hidden rounded-2xl border border-waldgruen/15 bg-creme/90 px-5 py-5 shadow-[0_18px_50px_-38px_rgba(24,70,51,0.7)] backdrop-blur-[2px] sm:px-6 md:col-start-1 md:row-start-2"
        >
          <h2 id="success-support-title" className="font-body text-lg font-semibold leading-snug text-waldgruen-dark">
            {SUPPORT_CONTENT.headline}
          </h2>

          <div className="mt-4 flex items-start gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-waldgruen/10">
              <Image
                src={SUPPORT_CONTENT.founder.portraitPath}
                alt="Thomas Lorenz, der Brief-nach-Berlin entwickelt"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <p className="font-body text-sm leading-relaxed text-warmgrau/75">
              {SUPPORT_EMAIL_COPY.de.body}
            </p>
          </div>

          <div className="mt-4 grid gap-2 min-[440px]:grid-cols-2">
            <a
              href={SUPPORT_CONTENT.ctas.donate.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-waldgruen px-5 py-2.5 font-body text-sm font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
              {SUPPORT_EMAIL_COPY.de.compactButton}
            </a>
            <Link
              href={SUPPORT_CONTENT.ctas.learnMore.href}
              prefetch={false}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-waldgruen/30 bg-white/45 px-5 py-2.5 font-body text-sm font-semibold text-waldgruen transition-[border-color,background-color,transform] duration-200 hover:border-waldgruen hover:bg-white/80 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
            >
              {SUPPORT_EMAIL_COPY.de.infoButton}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Sub-state B: Disambiguation
  if ("disambiguationNeeded" in result && result.disambiguationNeeded) {
    const selectedPoliticianParty = selectedPolitician
      ? formatPartyShort(selectedPolitician.party).replace(/^Die Linke$/, "die Linke")
      : "";
    const selectedPoliticianLabel =
      landesregierung && landesregierungSelected
        ? landesregierung.label
        : rathaus && rathausSelected
        ? rathaus.label
        : selectedPolitician?.id === -1
          ? "MdB später auswählen"
          : selectedPolitician
            ? `${selectedPolitician.firstName} ${selectedPolitician.lastName}${selectedPoliticianParty ? ` (${selectedPoliticianParty})` : ""}`
            : null;
    const campaignAttribution = wizardData.campaign?.creatorName?.trim()
      ? `Die Kampagne von ${wizardData.campaign.creatorName.trim()}`
      : "Diese Kampagne";
    const campaignTargetLabel =
      campaignTargetCount === 1
        ? "eine ausgewählte Person"
        : `${campaignTargetCount} ausgewählte Abgeordnete`;
    const isKommune = selectedLevel === "Kommune" && rathaus !== null;
    const isLand = selectedLevel === "Land";
    const selectionTitle = isKommune
      ? "Dein Brief geht an die Verwaltung"
      : isLand
        ? showLandPersonPicker
          ? "Lieber einer Person schreiben"
          : landesregierung
            ? `Dein Brief geht an ${landesregierung.institutionKind === "senat" ? "den" : "die"} ${landesregierung.label}`
            : "Dein Brief geht an die Landesregierung"
        : campaignRestricted
          ? "Wähle ein MdB aus"
        : !isNoMdbFound && sortedPoliticians.length > 1
          ? `${sortedPoliticians.length} Abgeordnete für PLZ ${wizardData.plz}`
          : "Wer vertritt deinen Wahlkreis?";
    const introCopy = isKommune
      ? "Der kommunale Empfänger ist bereits vorausgewählt."
      : isLand
        ? showLandPersonPicker
          ? "Wähle selbst eine Person aus deiner PLZ-Zuordnung. Wir treffen keine automatische Personen- oder Parteiauswahl."
          : "Der institutionelle Empfänger ist bereits vorausgewählt."
        : campaignRestricted
          ? campaignRestrictedNoLocalMatch
            ? "Filtere nach Partei oder suche nach Name, Wahlkreis und Ausschuss."
            : selectedPolitician
              ? "Die passende Person ist bereits vorausgewählt."
              : "Wähle eine der passenden Personen aus."
        : isNoMdbFound
          ? `Für die PLZ ${wizardData.plz} wurde kein MdB gefunden. Du kannst den Brief dennoch formulieren lassen und dein MdB später auswählen oder deine PLZ anpassen.`
          : wahlkreisGroups.length === 1
            ? "Dein Wahlkreis wird von folgenden MdBs vertreten. Das MdB mit Direktmandat ist vorausgewählt, du kannst aber auch jemand anderen wählen."
            : "Deine PLZ liegt an einer Wahlkreis-Grenze. Wähle das MdB, das deinen Wahlkreis vertritt. Das Direktmandat ist je Wahlkreis vorausgewählt.";

    return (
      <div className={currentSelection !== null ? "pb-32 sm:pb-0" : undefined}>
        {(onChangePlz || onChangeLevel) && (
          <div className="mb-6 flex items-center gap-4">
            {onChangeLevel && (
              <button
                type="button"
                onClick={onChangeLevel}
                className="font-body text-sm text-warmgrau/60 hover:text-warmgrau transition-colors cursor-pointer flex items-center gap-1"
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
                Ebene ändern
              </button>
            )}
            {onChangePlz && (
              <button
                type="button"
                onClick={onChangePlz}
                className="font-body text-sm text-warmgrau/60 hover:text-warmgrau transition-colors cursor-pointer flex items-center gap-1"
              >
                {!onChangeLevel && (
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
                )}
                PLZ ändern
              </button>
            )}
          </div>
        )}
        <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark">
          {selectionTitle}
        </h1>
        <p className="font-body text-base text-warmgrau mt-2">
          {introCopy}
        </p>

        {campaignRestricted && (
          <div
            role="note"
            className="mt-4 rounded-xl border border-waldgruen/25 bg-waldgruen/8 p-4 font-body text-sm leading-relaxed text-warmgrau"
          >
            <p className="font-semibold text-waldgruen-dark">
              {campaignAttribution} richtet sich an {campaignTargetLabel}.
            </p>
            <p className="mt-1">
              {campaignRestrictedNoLocalMatch
                ? "Für deine PLZ ist keine Person aus dieser Auswahl direkt zuständig. Wähle eine Person aus der Kampagnenauswahl."
                : selectedPolitician
                  ? politicians.length === 1
                    ? `Für deine PLZ ist ${selectedPolitician.firstName} ${selectedPolitician.lastName} zuständig und bereits ausgewählt.`
                    : `${selectedPolitician.firstName} ${selectedPolitician.lastName} ist vorausgewählt. Du kannst weitere passende Personen anzeigen.`
                  : `Für deine PLZ passen ${politicians.length} Personen aus dieser Auswahl.`}
            </p>
          </div>
        )}

        {(isAmbiguousLand || isAmbiguousKommune) && (
          <div role="note" className="mt-4 rounded-xl border border-waldgruen/25 bg-waldgruen/8 p-4 font-body text-sm text-warmgrau leading-relaxed">
            <p className="font-semibold text-waldgruen-dark">Beta-Hinweis</p>
            <p className="mt-1">
              {isAmbiguousLand
                ? "Eine PLZ kann mehrere Landtagswahlkreise abdecken. Prüfe über das verlinkte Profil, welcher Wahlkreis zu deiner Wohnadresse gehört, bevor du auswählst."
                : "Diese PLZ kann zu mehreren Berliner Bezirken gehören. Wir wählen deshalb kein Bezirksamt für dich aus. Suche und prüfe das zuständige Bezirksamt anhand deiner vollständigen Adresse."}
            </p>
          </div>
        )}

        {/* Error banner */}
        {generationError && (
          <div
            role="alert"
            className="bg-airmail-rot/10 border-l-4 border-airmail-rot text-airmail-rot p-4 rounded-r-lg text-sm font-body mt-4"
          >
            {generationError}
          </div>
        )}

        {/* Politician cards - grouped by Wahlkreis. Each group gets a header
            ("Wahlkreis 21 · Hamburg-Nord") and its cards are labelled
            Direktmandat vs Landesliste. On long lists (PLZs straddling
            several Wahlkreise) each group switches to a 2-col grid so the
            disambiguation step doesn't turn into an endless scroll. All cards
            stay one logical radiogroup; a flat index keeps arrow-key nav working
            across groups. */}
        {/* Kommune: eine einzige Verwaltungs-Karte statt Abgeordneten-Gruppen */}
        {isKommune && rathaus && (
          <div role="radiogroup" aria-label="Empfänger auswählen" className="mt-6">
            <div
              role="radio"
              aria-checked={rathausSelected}
              tabIndex={0}
              onClick={() => setRathausSelected(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setRathausSelected(true);
                }
              }}
              className={[
                "w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer",
                rathausSelected
                  ? "border-waldgruen bg-waldgruen/10"
                  : "border-waldgruen/20 bg-creme hover:border-waldgruen/40",
              ].join(" ")}
            >
              <span className="inline-block font-body text-[11px] font-semibold uppercase tracking-wide text-waldgruen-dark bg-waldgruen/15 px-2 py-0.5 rounded mb-1.5">
                {rathaus.recipientKind === "bezirksamt" ? "Bezirksamt" : "Bürgermeisteramt"}
              </span>
              <p className="font-body text-base font-semibold text-warmgrau">{rathaus.label}</p>
              {rathaus.address.source === "destatis" ? (
                <>
                  <p className="font-body text-sm text-warmgrau mt-1 leading-relaxed">
                    {rathaus.address.streetAddress}
                    <br />
                    {rathaus.address.postalCode} {rathaus.address.city}
                  </p>
                  <p className="font-body text-xs text-warmgrau/70 mt-2 leading-relaxed">
                    Amtliche Anschrift von{" "}
                    <a
                      href={rathaus.address.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={rathaus.address.sourceTitle}
                      className="font-semibold text-waldgruen-dark underline underline-offset-2"
                    >
                      Destatis
                    </a>
                    , Stand {rathaus.address.sourceStand}
                  </p>
                </>
              ) : (
                <p className="font-body text-xs text-warmgrau/70 mt-2 leading-relaxed">
                  Die genaue Postanschrift prüfst du vor dem Abschicken über die
                  Suchhilfe.
                </p>
              )}
            </div>
          </div>
        )}

        {isLand && landesregierung && !showLandPersonPicker && (
          <div role="radiogroup" aria-label="Empfänger auswählen" className="mt-6">
            <div
              role="radio"
              aria-checked={landesregierungSelected}
              tabIndex={0}
              onClick={() => {
                setLandesregierungSelected(true);
                setSelectedPoliticianId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLandesregierungSelected(true);
                  setSelectedPoliticianId(null);
                }
              }}
              className={[
                "w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer",
                landesregierungSelected
                  ? "border-waldgruen bg-waldgruen/10"
                  : "border-waldgruen/20 bg-creme hover:border-waldgruen/40",
              ].join(" ")}
            >
              <span className="inline-block font-body text-[11px] font-semibold uppercase tracking-wide text-waldgruen-dark bg-waldgruen/15 px-2 py-0.5 rounded mb-1.5">
                {landesregierung.institutionKind === "senat" ? "Senat" : "Landesregierung"}
              </span>
              <p className="font-body text-base font-semibold text-warmgrau">
                {landesregierung.label}
              </p>
              <p className="font-body text-sm text-warmgrau mt-1 leading-relaxed">
                {landesregierung.officeName}
                <br />
                {landesregierung.address.addressLines.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </p>
              <p className="font-body text-sm text-warmgrau/80 mt-3 leading-relaxed">
                {landesregierung.institutionKind === "senat"
                  ? `Dein Brief geht an den ${landesregierung.label}. Er ist für landesweite politische Entscheidungen zuständig.`
                  : `Dein Brief geht an die Landesregierung von ${landesregierung.bundeslandName}. Sie ist für landesweite politische Entscheidungen zuständig.`}
              </p>
              <p className="font-body text-xs text-warmgrau/70 mt-2 leading-relaxed">
                Amtliche Anschrift: {" "}
                <a
                  href={landesregierung.address.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={landesregierung.address.sourceTitle}
                  className="font-semibold text-waldgruen-dark underline underline-offset-2"
                >
                  Quelle
                </a>
                , geprüft am {landesregierung.address.sourceStand}
              </p>
            </div>
            {optionalLandRecipients.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowLandPersonPicker(true);
                  setLandesregierungSelected(false);
                  setSelectedPoliticianId(null);
                }}
                className="mt-4 font-body text-sm font-semibold text-waldgruen underline underline-offset-4 hover:text-waldgruen-dark"
              >
                Lieber einer Person schreiben
              </button>
            )}
          </div>
        )}

        {!isKommune && (!isLand || showLandPersonPicker) && (
        <div className="mt-6">
          {campaignRestrictedNoLocalMatch && (
            <div className="mb-6 grid gap-5">
              <div className="grid gap-2">
                <p className="font-body text-sm font-semibold text-waldgruen-dark">
                  Parteien filtern
                </p>
                <div className="flex flex-wrap gap-2" aria-label="Parteien filtern">
                  {campaignPartyOptions.map((party) => {
                    const active = campaignPartyFilters.includes(party);
                    return (
                      <button
                        key={party}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleCampaignParty(party)}
                        className={[
                          "rounded-full border px-3 py-1.5 font-body text-sm font-semibold transition-colors active:scale-[0.98]",
                          active
                            ? "border-waldgruen bg-waldgruen text-creme"
                            : "border-warmgrau/25 bg-creme text-waldgruen-dark hover:border-waldgruen/50",
                        ].join(" ")}
                      >
                        {formatPartyShort(party)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="grid gap-1.5" htmlFor="campaign-recipient-search">
                <span className="font-body text-sm font-semibold text-waldgruen-dark">
                  MdB suchen
                </span>
                <input
                  id="campaign-recipient-search"
                  type="search"
                  value={campaignSearch}
                  onChange={(event) => {
                    setCampaignSearch(event.target.value);
                    setSelectedPoliticianId(null);
                  }}
                  placeholder="Name, Partei, Wahlkreis oder Ausschuss"
                  className="rounded-lg border border-warmgrau/30 bg-creme px-4 py-3 font-body text-base text-warmgrau outline-none focus:border-waldgruen focus:ring-2 focus:ring-waldgruen"
                />
                <span className="font-body text-sm text-warmgrau/60" aria-live="polite">
                  {displayedPoliticians.length} von {campaignTargetCount} Personen
                </span>
              </label>
            </div>
          )}

          {campaignRestricted &&
            !campaignRestrictedNoLocalMatch &&
            politicians.length > 1 &&
            selectedPoliticianId !== null && (
              <button
                type="button"
                onClick={() => setShowMoreCampaignPoliticians((current) => !current)}
                aria-expanded={showMoreCampaignPoliticians}
                className="mb-5 font-body text-sm font-semibold text-waldgruen underline decoration-waldgruen/35 underline-offset-4 hover:text-waldgruen-dark"
              >
                {showMoreCampaignPoliticians
                  ? "Weitere passende Abgeordnete ausblenden"
                  : `Weitere passende Abgeordnete anzeigen (${politicians.length - 1})`}
              </button>
            )}

          {displayedPoliticians.length === 0 ? (
            <p className="rounded-lg border border-warmgrau/20 bg-creme px-4 py-5 font-body text-sm text-warmgrau/70">
              Keine passende Person gefunden. Ändere deine Suche.
            </p>
          ) : (
          <div
            role="radiogroup"
            aria-label="Abgeordnete auswählen"
            className="space-y-6"
          >
            {wahlkreisGroups.map((group) => (
            <div key={group.wahlkreisId}>
              {!campaignRestrictedNoLocalMatch && (
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-warmgrau/55 mb-2 flex items-center gap-2">
                  {!isNoMdbFound && <span className="h-px flex-shrink-0 w-3 bg-warmgrau/25" aria-hidden="true" />}
                  {isNoMdbFound ? group.wahlkreisName : `${isLand && isAmbiguousLand ? "Möglicher Landtagswahlkreis" : isLand ? "Landtagswahlkreis" : "Wahlkreis"} ${group.wahlkreisId} · ${group.wahlkreisName}`}
                </p>
              )}
              <div
                className={
                  campaignRestrictedNoLocalMatch
                    ? "grid grid-cols-1 gap-3 md:grid-cols-2"
                    : cardsMultiCol
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
                    : "space-y-3"
                }
              >
                {group.cards.map(({ politician: p, flatIndex }) => (
                  <div
                    key={p.id}
                    role="radio"
                    aria-checked={selectedPoliticianId === p.id}
                    tabIndex={0}
                    onClick={() => handleCardSelect(p.id)}
                    onKeyDown={(e) => handleCardKeyDown(e, flatIndex, p.id)}
                    className={[
                      "h-full w-full text-left p-4 rounded-lg border-2 transition-colors cursor-pointer",
                      selectedPoliticianId === p.id
                        ? "border-waldgruen bg-waldgruen/10"
                        : "border-waldgruen/20 bg-creme hover:border-waldgruen/40",
                    ].join(" ")}
                  >
                    {p.id === -1 ? (
                      <p className="font-body text-base font-semibold text-warmgrau">
                        MdB später auswählen
                      </p>
                    ) : (
                      <>
                        {p.isDirect ? (
                          <span className="inline-block font-body text-[11px] font-semibold uppercase tracking-wide text-waldgruen-dark bg-waldgruen/15 px-2 py-0.5 rounded mb-1.5">
                            Direktmandat
                          </span>
                        ) : (
                          <span className="inline-block font-body text-[11px] font-medium uppercase tracking-wide text-warmgrau/55 bg-warmgrau/10 px-2 py-0.5 rounded mb-1.5">
                            Landesliste
                          </span>
                        )}
                        <p className="font-body text-base font-semibold text-warmgrau">
                          {p.title ? p.title + " " : ""}
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="font-body text-sm text-warmgrau mt-0.5">
                          {formatPartyShort(p.party)}
                        </p>
                        {campaignRestrictedNoLocalMatch && (
                          <p className="mt-2 font-body text-xs leading-relaxed text-warmgrau/65">
                            Wahlkreis {p.wahlkreisId} · {p.wahlkreisName}
                          </p>
                        )}
                        {campaignRestricted && p.committees?.length ? (
                          <div className="mt-3 border-t border-warmgrau/15 pt-3">
                            <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-warmgrau/55">
                              Ausschüsse
                            </p>
                            <p className="mt-1 font-body text-xs leading-relaxed text-warmgrau/70">
                              {p.committees.join(" · ")}
                            </p>
                          </div>
                        ) : null}
                        {p.abgeordnetenwatchUrl && (
                          <a
                            href={p.abgeordnetenwatchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 font-body text-xs text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 mt-2"
                          >
                            Profil auf Abgeordnetenwatch.de
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            ))}
          </div>
          )}
        </div>
        )}

        {isLand && showLandPersonPicker && (
          <button
            type="button"
            onClick={() => {
              setShowLandPersonPicker(false);
              setSelectedPoliticianId(null);
              setLandesregierungSelected(true);
            }}
            className="mt-5 font-body text-sm font-semibold text-waldgruen underline underline-offset-4 hover:text-waldgruen-dark"
          >
            Zurück zur Landesregierung
          </button>
        )}

        {/* Submit after selection - full width to match cards */}
        {currentSelection !== null && (
          <div className="mt-8 hidden sm:block">
            <button
              ref={submitButtonRef}
              type="button"
              onClick={handleSelectPolitician}
              disabled={isGenerating}
              className={[
                "relative w-full bg-waldgruen text-creme font-semibold text-base px-8 pr-14 py-4 rounded-xl whitespace-nowrap",
                "hover:bg-waldgruen-dark transition-colors min-h-[44px]",
                isGenerating ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span key={genPhase} className="animate-feedback-in">
                    {LETTER_GEN_PHASES[genPhase].label}
                  </span>
                </span>
              ) : (
                <>
                  Brief erstellen
                  <WizardForwardIcon className="absolute right-5 top-1/2 -translate-y-1/2" />
                </>
              )}
            </button>
            <p className="text-xs text-warmgrau/60 mt-3 text-center">
              Du siehst den Entwurf zuerst und kannst ihn anpassen, bevor du ihn abschickst.
            </p>
          </div>
        )}

        {currentSelection !== null && (
          <div
            className="fixed inset-x-0 bottom-0 z-40 sm:hidden border-t border-warmgrau/15 bg-creme/95 px-4 pt-3 backdrop-blur"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
          >
            {selectedPoliticianLabel && (
              <p className="mb-2 truncate text-center font-body text-xs text-warmgrau/65">
                Ausgewählt: {selectedPoliticianLabel}
              </p>
            )}
            <button
              type="button"
              onClick={handleSelectPolitician}
              disabled={isGenerating}
              className={[
                "relative w-full bg-waldgruen text-creme font-semibold text-base px-8 pr-14 py-4 rounded-xl whitespace-nowrap",
                "hover:bg-waldgruen-dark transition-colors min-h-[44px]",
                isGenerating ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              ].join(" ")}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span key={genPhase} className="animate-feedback-in">
                    {LETTER_GEN_PHASES[genPhase].label}
                  </span>
                </span>
              ) : (
                <>
                  Brief erstellen
                  <WizardForwardIcon className="absolute right-5 top-1/2 -translate-y-1/2" />
                </>
              )}
            </button>
            <p className="mt-2 text-center font-body text-xs text-warmgrau/60">
              Du siehst den Entwurf und kannst ihn anpassen.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
