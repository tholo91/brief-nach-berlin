import { mistral, withMistralRetry, MISTRAL_MODELS } from "@/lib/mistral";
import { tonalityBlock } from "@/lib/generation/generateLetter";

const VARIANT_TEMPERATURE = 0.35;

export interface GenerateLetterVariantInput {
  originalLetter: string;
  toneLevel?: number;
  originalToneLevel?: number;
  changeRequest?: string;
}

export interface GenerateLetterVariantResult {
  letter: string;
  wordCount: number;
  model: string;
  temperature: number;
  generationMs: number;
  lengthRetried: boolean;
  preservationCheck?: string;
}

export const VARIANT_SYSTEM_PROMPT = `Du überarbeitest einen bereits fertigen politischen Brief nach eng begrenzten Regeln.

Der Nutzer gibt keinen neuen Rohtext ein, sondern einen bestehenden Briefentwurf. Deine Aufgabe ist eine Revision desselben Briefs, keine Neuerstellung.

Nicht verhandelbare Regeln:
- Behandle <bestehender_brief> als Quelle und Ziel zugleich.
- Erhalte Empfängeranrede, Fakten, politische Position, zentrale Forderung, Adressatenbezug und Grußformel.
- Wenn der bestehende Brief mit "Mit freundlichen Grüßen," oder einer anderen Grußformel endet, muss die Variante mit derselben Grußformel und derselben Namenszeile enden.
- Erhalte Datum, Namen, Orte, Rollen, Zahlen und konkrete Sachverhalte, wenn sie im Brief stehen.
- Füge keine neuen Fakten, Beispiele, Zahlen, Programme, Studien, Orte, lokalen Versorgungslagen, Superlative oder biografischen Angaben hinzu.
- Verändere nur Tonalität, Formulierungen, Klarheit, Satzbau und bei Bedarf die Struktur.
- Wenn <aenderungswunsch> eine neue Tatsache verlangt, übernimm sie nicht als Fakt. Formuliere nur bestehende Inhalte anders.
- Wenn <aenderungswunsch> mehr Wahlkreisbezug verlangt, nutze nur allgemeine Perspektiven wie "Menschen vor Ort" oder "in unserem Wahlkreis". Behaupte keine neue lokale Lage, keine regionale Praxissituation und keine Steigerung wie "so hoch wie nie".
- Nutze die gewählte Tonalität als Obergrenze. Mache den Brief nicht schärfer, emotionaler oder anklagender als <tonalitaet> und <aenderungswunsch> verlangen.
- Erhöhe den emotionalen Druck nur, wenn der Änderungswunsch das ausdrücklich verlangt. Sonst bleibt die emotionale Grundhaltung des bestehenden Briefs erhalten.
- Worte wie "Verrat", "zerstört", "Schlag ins Gesicht", "Dreistigkeit" oder "ich erwarte" nur verwenden, wenn sie bereits im bestehenden Brief stehen oder im Änderungswunsch ausdrücklich verlangt werden.
- Bei Tonstufe 4 oder 5: klare, respektvolle Forderungen statt Wutrede. Keine dramatischen Zuspitzungen.
- Behalte etwa 70 bis 90 Prozent der Sachinhalte und der Argumentationsreihenfolge bei. Kürze, glätte oder schärfe Sprache, aber tausche die Substanz nicht aus.
- Keine Bulletpoints, keine Meta-Erklärung, kein Kommentar vor oder nach dem Brief.
- Verwende ausschließlich Komma, Doppelpunkt, Klammer und Punkt. Keine Gedankenstriche.
- Der Brief bleibt ein formeller Brief in Sie-Form.

Antworte ausschließlich im JSON-Format:
{
  "preservation_check": "<ein Satz, dass Fakten, Forderung, Anrede und Grußformel erhalten blieben>",
  "letter": "<vollständiger umformulierter Brief>"
}`;

export function buildVariantUserPrompt(input: GenerateLetterVariantInput): string {
  const toneLevel = input.toneLevel ?? 3;
  const changeRequest = input.changeRequest?.trim();
  const originalWordCount = countWords(input.originalLetter);
  const minWords = minimumVariantWords(originalWordCount);

  return `<tonalitaet>
${tonalityBlock(toneLevel)}
</tonalitaet>

<laengenvorgabe>
Der bestehende Brief hat ${originalWordCount} Wörter. Die Variante muss ein vollständiger Brief bleiben und mindestens ${minWords} Wörter haben. Schreibe keinen Teaser, keine Zusammenfassung und keinen Auszug.
</laengenvorgabe>

<aenderungswunsch>
${changeRequest ? changeRequest : "Kein konkreter Änderungswunsch. Nur Tonalität und Formulierungen passend zur gewählten Tonstufe überarbeiten."}
</aenderungswunsch>

<bestehender_brief>
${input.originalLetter}
</bestehender_brief>`;
}

interface ParsedVariant {
  preservation_check?: string;
  letter: string;
}

function extractSalutation(text: string): string | undefined {
  const firstLine = text.trim().split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  return firstLine && /^Sehr geehrte|^Sehr geehrter|^Guten Tag/i.test(firstLine) ? firstLine : undefined;
}

function extractClosing(text: string): string | undefined {
  const lines = text.trim().split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (/^(Mit freundlichen Grüßen|Mit freundlichem Gruß|Freundliche Grüße|Viele Grüße),?$/i.test(lines[i] ?? "")) {
      return lines.slice(i).join("\n");
    }
  }
  return undefined;
}

function preserveOriginalSalutation(originalLetter: string, variantLetter: string): string {
  const salutation = extractSalutation(originalLetter);
  if (!salutation) return variantLetter;
  if (variantLetter.toLowerCase().includes(salutation.toLowerCase())) {
    return variantLetter;
  }
  return `${salutation}\n\n${variantLetter.trim()}`;
}

function preserveOriginalClosing(originalLetter: string, variantLetter: string): string {
  const closing = extractClosing(originalLetter);
  if (!closing) return variantLetter;
  const closingLine = closing.split("\n")[0];
  if (closingLine && variantLetter.toLowerCase().includes(closingLine.toLowerCase())) {
    return variantLetter;
  }
  return `${variantLetter.trim()}\n\n${closing}`;
}

function preserveLetterFrame(originalLetter: string, variantLetter: string): string {
  return preserveOriginalClosing(originalLetter, preserveOriginalSalutation(originalLetter, variantLetter));
}

function parseVariantResponse(content: unknown): ParsedVariant {
  if (!content || typeof content !== "string") {
    throw new Error("Mistral returned empty variant response");
  }
  let parsed: ParsedVariant;
  try {
    parsed = JSON.parse(content) as ParsedVariant;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse Mistral variant response as JSON");
    parsed = JSON.parse(match[0]) as ParsedVariant;
  }
  if (typeof parsed.letter !== "string" || parsed.letter.trim().length < 100) {
    throw new Error("Mistral returned empty or missing variant letter");
  }
  return parsed;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function minimumVariantWords(originalWordCount: number): number {
  return Math.min(originalWordCount, Math.max(140, Math.floor(originalWordCount * 0.72)));
}

function assertCompleteVariant(letter: string, minWords: number): number {
  const wordCount = countWords(letter);
  if (wordCount < minWords) {
    throw new Error(`Mistral returned too short variant letter (${wordCount} words, expected at least ${minWords})`);
  }
  return wordCount;
}

function lengthRetryPrompt(wordCount: number, minWords: number): string {
  return `Der vorige Entwurf war mit ${wordCount} Wörtern zu kurz. Schreibe jetzt den vollständigen Brief neu. Mindestlänge: ${minWords} Wörter. Erhalte Anrede, Argumente, Forderung und Grußformel. Kein Teaser, keine Zusammenfassung, kein Auszug.`;
}

async function requestVariantCompletion(
  input: GenerateLetterVariantInput,
  maxTokens: number,
  label: string,
  retryInstruction?: string
) {
  return withMistralRetry(label, () =>
    mistral.chat.complete({
      model: MISTRAL_MODELS.letter,
      messages: [
        { role: "system", content: VARIANT_SYSTEM_PROMPT },
        { role: "user", content: buildVariantUserPrompt(input) },
        ...(retryInstruction ? [{ role: "user" as const, content: retryInstruction }] : []),
      ],
      responseFormat: { type: "json_object" },
      temperature: retryInstruction ? 0.25 : VARIANT_TEMPERATURE,
      maxTokens,
      frequencyPenalty: 0.25,
      presencePenalty: 0.15,
    })
  );
}

export async function generateLetterVariant(
  input: GenerateLetterVariantInput
): Promise<GenerateLetterVariantResult> {
  const originalWordCount = countWords(input.originalLetter);
  const minWords = minimumVariantWords(originalWordCount);
  const maxTokens = Math.min(4500, Math.max(900, Math.ceil(originalWordCount * 2.6) + 400));
  const generationStart = Date.now();

  let response = await requestVariantCompletion(input, maxTokens, "generateLetterVariant:first");
  let lengthRetried = false;
  let parsed = parseVariantResponse(response.choices?.[0]?.message?.content);
  let letter = preserveLetterFrame(input.originalLetter, parsed.letter);
  let wordCount = countWords(letter);

  if (wordCount < minWords) {
    lengthRetried = true;
    response = await requestVariantCompletion(
      input,
      maxTokens,
      "generateLetterVariant:length-retry",
      lengthRetryPrompt(wordCount, minWords)
    );
    parsed = parseVariantResponse(response.choices?.[0]?.message?.content);
    letter = preserveLetterFrame(input.originalLetter, parsed.letter);
    wordCount = countWords(letter);
  }

  wordCount = assertCompleteVariant(letter, minWords);

  if (parsed.preservation_check) {
    console.log("[generateLetterVariant] preservation_check:", parsed.preservation_check.slice(0, 200));
  }

  return {
    letter,
    wordCount,
    model: MISTRAL_MODELS.letter,
    temperature: VARIANT_TEMPERATURE,
    generationMs: Date.now() - generationStart,
    lengthRetried,
    preservationCheck: parsed.preservation_check?.trim(),
  };
}
