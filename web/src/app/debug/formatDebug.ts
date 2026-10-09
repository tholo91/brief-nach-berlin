import type { LetterDebugPayload } from "@/lib/email/sendLetterEmail";
import type { LetterVariantDebugPayload } from "@/lib/email/variantDebugPayload";

export type DebugPayload = LetterDebugPayload | LetterVariantDebugPayload;

function isVariantDebugPayload(payload: DebugPayload): payload is LetterVariantDebugPayload {
  return "source" in payload && payload.source === "brief_variant";
}

function formatVariant(d: LetterVariantDebugPayload): string {
  const lines = [
    "BRIEF VARIANT",
    "",
    `Original tonality    ${d.originalToneLevel ?? "—"} (${d.originalToneLabel})`,
    `Requested tonality   ${d.requestedToneLevel} (${d.requestedToneLabel})`,
    `Original letter      ${d.originalLetterWordCount} words, ${d.originalLetterLength} chars`,
    `Letter length        ${d.letterLengthKey} (${d.letterLengthMin}–${d.letterLengthMax} Wörter)`,
    `Variant word count   ${d.wordCount} ${d.wordCountInRange ? "OK" : "OUT OF RANGE"}`,
    `Change request       ${d.changeRequestLength} chars`,
    `Model                ${d.model}`,
    `Temperature          ${d.temperature}`,
    `Generation           ${d.generationMs} ms`,
    `Length retry         ${d.lengthRetried}`,
    `Code version         ${d.codeVersion ?? "—"}`,
    ...(d.preservationCheck
      ? ["", "Preservation check:", d.preservationCheck]
      : []),
    ...(d.changeRequestPreview
      ? ["", "Änderungswunsch:", d.changeRequestPreview]
      : ["", "Änderungswunsch:", "—"]),
    "",
    "Eingefügter Brief (Auszug, max 1200 Zeichen):",
    d.originalLetterPreview,
  ];
  return lines.join("\n");
}

// Routing-Block nur für Payloads mit Routing-Telemetrie (alte Links haben sie nicht).
// Mismatch framing = wasOverridden && routedPrimaryLevel, gleiche Logik wie
// mismatchRecommendedLevel in app/api/generate-letter/route.ts.
function routingLines(d: LetterDebugPayload): string[] {
  if (d.selectedLevel === undefined && d.routedPrimaryLevel == null) return [];
  const routed = d.routedPrimaryLevel
    ? `${d.routedPrimaryLevel}${d.routedPrimaryConfidence ? ` (${d.routedPrimaryConfidence})` : ""}`
    : "—";
  const mismatch = Boolean(d.wasOverridden && d.routedPrimaryLevel);
  return [
    `Routed level          ${routed}`,
    `Selected level        ${d.selectedLevel ?? "—"}`,
    `Overridden            ${d.wasOverridden ?? "—"}`,
    `Mismatch framing      ${mismatch ? `ja (empfohlene Ebene: ${d.routedPrimaryLevel})` : "nein"}`,
  ];
}

export function format(payload: DebugPayload | { error: string }): string {
  if ("error" in payload) return payload.error;
  if (isVariantDebugPayload(payload)) return formatVariant(payload);
  const d = payload;
  const recipientLabel =
    d.representativeKind === "landesregierung" || d.representativeKind === "rathaus"
      ? "Institution"
      : d.representativeKind === "mdl"
        ? "MdL"
        : "MdB";
  const recipientRegion = d.recipientRegion ?? d.representativeWahlkreis;
  const wcLabel = `${d.wordCount} (target ${d.letterLengthMin}–${d.letterLengthMax}) ${d.wordCountInRange ? "OK" : "OUT OF RANGE"}`;
  const lines = [
    ...(d.resent
      ? [
          "⚠ RESEND              kein Generierungslauf — Model/Temperature/Generation sind Platzhalter",
          "",
        ]
      : []),
    `Tonality              ${d.toneLevel ?? "—"} (${d.toneLabel})`,
    `Letter length         ${d.letterLengthKey} (${d.letterLengthMin}–${d.letterLengthMax} Wörter)`,
    `Word count            ${wcLabel}`,
    `Issue text length     ${d.issueTextLength} chars`,
    "",
    "Anliegen (Auszug, max 2000 Zeichen):",
    d.issueTextPreview || "—",
    ...(d.issueTextPreview !== undefined && d.issueTextPreview.length < d.issueTextLength
      ? [`gekürzt: ${d.issueTextPreview.length} von ${d.issueTextLength} Zeichen`]
      : []),
    "",
    `Political level       ${d.politicalLevel}`,
    ...routingLines(d),
    `${recipientLabel.padEnd(21)} ${d.representativeName} (${d.representativeLevel}, ${recipientRegion})`,
    ...(d.representativeKind === "landesregierung" || d.representativeKind === "rathaus"
      ? []
      : [`${`${recipientLabel} Partei`.padEnd(21)} ${d.representativeParty ?? "—"}`]),
    `MdB-Kontext genutzt   ${d.mdbContextUsed}`,
    `Available politicians ${d.availablePoliticianCount}`,
    `Fallback used         ${d.fallbackUsed}`,
    `Length retry fired    ${d.retried}`,
    `Sender hints          party=${d.hasParty} ngo=${d.hasNgo}`,
    `Voice input           ${d.usedSpeechToText}`,
    `Tips opened           ${d.tipsOpened ?? false}`,
    `Model                 ${d.model}`,
    `Temperature           ${d.temperature}`,
    `Generation            ${d.generationMs} ms`,
    `Letter ID             ${d.letterId ?? "—"}`,
    `Code version          ${d.codeVersion ?? "—"}`,
  ];
  return lines.join("\n");
}
