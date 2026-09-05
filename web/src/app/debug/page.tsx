import type { LetterDebugPayload } from "@/lib/email/sendLetterEmail";
import type { LetterVariantDebugPayload } from "@/lib/email/variantDebugPayload";
import { FOUNDER_FEEDBACK_URL } from "@/lib/config";

export const metadata = {
  title: "Debug",
  robots: { index: false, follow: false },
};

type DebugPayload = LetterDebugPayload | LetterVariantDebugPayload;

function decode(d: string | undefined): DebugPayload | { error: string } {
  if (!d) return { error: "Missing ?d= param" };
  try {
    const b64 = d.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as DebugPayload;
  } catch (e) {
    return { error: `Decode failed: ${(e as Error).message}` };
  }
}

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

function format(payload: DebugPayload | { error: string }): string {
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
    `Political level       ${d.politicalLevel}`,
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
  ];
  return lines.join("\n");
}

export default async function DebugPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const payload = decode(d);
  return (
    <div style={{ padding: 24, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13 }}>
      <div
        style={{
          marginBottom: 20,
          padding: "14px 16px",
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: 8,
          color: "#065f46",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ flexShrink: 0, marginTop: 1 }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <strong>Keine Sorge:</strong> Diese Seite zeigt nur die Werte, die in
          deinem E-Mail-Link mitgeschickt wurden. Es wird nichts aus einer
          Datenbank geladen und nichts dauerhaft gespeichert.
          <div style={{ marginTop: 8 }}>
            Bei Fragen melde dich trotzdem gern{" "}
            <a
              href={FOUNDER_FEEDBACK_URL}
              style={{ color: "#047857", textDecoration: "underline" }}
            >
              hier
            </a>
            .
          </div>
        </div>
      </div>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {format(payload)}
      </pre>
    </div>
  );
}
