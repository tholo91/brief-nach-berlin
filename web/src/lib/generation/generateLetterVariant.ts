import { mistral, withMistralRetry, MISTRAL_MODELS } from "@/lib/mistral";
import { tonalityBlock } from "@/lib/generation/generateLetter";

const VARIANT_TEMPERATURE = 0.35;

export interface GenerateLetterVariantInput {
  originalLetter: string;
  toneLevel?: number;
  changeRequest?: string;
}

export interface GenerateLetterVariantResult {
  letter: string;
  wordCount: number;
  model: string;
  temperature: number;
  generationMs: number;
}

export const VARIANT_SYSTEM_PROMPT = `Du überarbeitest einen bereits fertigen politischen Brief.

Der Nutzer gibt keinen neuen Rohtext ein, sondern einen bestehenden Briefentwurf. Deine Aufgabe ist eine Variante desselben Briefs.

Nicht verhandelbare Regeln:
- Behandle <bestehender_brief> als Quelle und Ziel zugleich.
- Erhalte Empfängeranrede, Fakten, politische Position, zentrale Forderung, Adressatenbezug und Grußformel.
- Erhalte Datum, Namen, Orte, Rollen, Zahlen und konkrete Sachverhalte, wenn sie im Brief stehen.
- Füge keine neuen Fakten, Beispiele, Zahlen, Programme, Studien, Orte, lokalen Versorgungslagen, Superlative oder biografischen Angaben hinzu.
- Verändere nur Tonalität, Formulierungen, Klarheit, Satzbau und bei Bedarf die Struktur.
- Wenn <aenderungswunsch> eine neue Tatsache verlangt, übernimm sie nicht als Fakt. Formuliere nur bestehende Inhalte anders.
- Wenn <aenderungswunsch> mehr Wahlkreisbezug verlangt, nutze nur allgemeine Perspektiven wie "Menschen vor Ort" oder "in unserem Wahlkreis". Behaupte keine neue lokale Lage, keine regionale Praxissituation und keine Steigerung wie "so hoch wie nie".
- Keine Bulletpoints, keine Meta-Erklärung, kein Kommentar vor oder nach dem Brief.
- Verwende ausschließlich Komma, Doppelpunkt, Klammer und Punkt. Keine Gedankenstriche.
- Der Brief bleibt ein formeller Brief in Sie-Form.

Antworte ausschließlich im JSON-Format:
{
  "preservation_check": "<ein Satz, was erhalten blieb>",
  "letter": "<vollständiger umformulierter Brief>"
}`;

export function buildVariantUserPrompt(input: GenerateLetterVariantInput): string {
  const toneLevel = input.toneLevel ?? 3;
  const changeRequest = input.changeRequest?.trim();

  return `<tonalitaet>
${tonalityBlock(toneLevel)}
</tonalitaet>

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

export async function generateLetterVariant(
  input: GenerateLetterVariantInput
): Promise<GenerateLetterVariantResult> {
  const originalWordCount = countWords(input.originalLetter);
  const maxTokens = Math.min(4500, Math.max(900, Math.ceil(originalWordCount * 2.6) + 400));
  const generationStart = Date.now();

  const response = await withMistralRetry("generateLetterVariant:first", () =>
    mistral.chat.complete({
      model: MISTRAL_MODELS.letter,
      messages: [
        { role: "system", content: VARIANT_SYSTEM_PROMPT },
        { role: "user", content: buildVariantUserPrompt(input) },
      ],
      responseFormat: { type: "json_object" },
      temperature: VARIANT_TEMPERATURE,
      maxTokens,
      frequencyPenalty: 0.25,
      presencePenalty: 0.15,
    })
  );

  const parsed = parseVariantResponse(response.choices?.[0]?.message?.content);
  if (parsed.preservation_check) {
    console.log("[generateLetterVariant] preservation_check:", parsed.preservation_check.slice(0, 200));
  }

  return {
    letter: parsed.letter,
    wordCount: countWords(parsed.letter),
    model: MISTRAL_MODELS.letter,
    temperature: VARIANT_TEMPERATURE,
    generationMs: Date.now() - generationStart,
  };
}
