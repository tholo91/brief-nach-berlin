import type { LetterDebugPayload } from "@/lib/email/sendLetterEmail";

export const metadata = {
  title: "Debug",
  robots: { index: false, follow: false },
};

function decode(d: string | undefined): LetterDebugPayload | { error: string } {
  if (!d) return { error: "Missing ?d= param" };
  try {
    const b64 = d.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as LetterDebugPayload;
  } catch (e) {
    return { error: `Decode failed: ${(e as Error).message}` };
  }
}

function format(payload: LetterDebugPayload | { error: string }): string {
  if ("error" in payload) return payload.error;
  const d = payload;
  const wcLabel = `${d.wordCount} (target ${d.letterLengthMin}–${d.letterLengthMax}) ${d.wordCountInRange ? "OK" : "OUT OF RANGE"}`;
  const lines = [
    `Tonality              ${d.toneLevel ?? "—"} (${d.toneLabel})`,
    `Letter length         ${d.letterLengthKey} (${d.letterLengthMin}–${d.letterLengthMax} Wörter)`,
    `Word count            ${wcLabel}`,
    `Issue text length     ${d.issueTextLength} chars`,
    `Political level       ${d.politicalLevel}`,
    `Selected party        ${d.selectedPoliticianParty ?? "—"}`,
    `Available politicians ${d.availablePoliticianCount}`,
    `Fallback used         ${d.fallbackUsed}`,
    `Sender hints          name=${d.hasName} party=${d.hasParty} ngo=${d.hasNgo}`,
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
    <pre style={{ padding: 24, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {format(payload)}
    </pre>
  );
}
