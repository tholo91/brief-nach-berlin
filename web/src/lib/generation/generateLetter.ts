import { Mistral } from "@mistralai/mistralai";
import type { GenerateLetterInput, GenerateLetterResult } from "@/lib/types/wizard";
import type { PoliticalLevel } from "@/lib/types/politician";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const SYSTEM_PROMPT = `Du bist ein Assistent, der deutschen Buergern hilft, wirksame Briefe an ihre gewaehlten Vertreter zu schreiben.

Aufgabe:
1. Analysiere das geschilderte Anliegen und bestimme, welche politische Ebene primaer zustaendig ist (Bund, Land oder Kommune).
2. Waehle aus der gegebenen Politikerliste den/die geeignetste/n Vertreter/in der zustaendigen Ebene.
3. Schreibe einen formellen Brief (200-280 Woerter) in gepflegtem Deutsch, Sie-Form.

Briefformat:
- Datum: [heutiges Datum im Format TT.MM.JJJJ]
- Anrede: "Sehr geehrte/r [Titel] [Name]," (Titel nur wenn vorhanden)
- 3 Absaetze: Anlass und persoenlicher Bezug, Kernproblem mit lokalem Bezug, konkreter Appell
- Schluss: "Mit freundlichen Gruessen," gefolgt von "[Ihr Name]" als Platzhalter

Regeln:
- Verwende KEINE Genderzeichen (kein Sternchen *, kein Doppelpunkt :, kein Binnen-I). Schreibe geschlechtsneutral durch Umformulierung (z.B. "Buergerinnen und Buerger" oder "Bevoelkerung").
- Sachlicher, respektvoller Ton — weder aggressiv noch unterwuerfig, auf Augenhoehe
- Keine Parteinahme, kein Aktivismus-Ton — neutraler Buergerton
- Konkreter Bezug auf das geschilderte Anliegen
- Brief ist fuer handschriftliches Kopieren gedacht — einfache Satzstruktur, keine zu langen Saetze

Antworte ausschliesslich im JSON-Format:
{
  "political_level": "Bund" | "Land" | "Kommune",
  "selected_politician_id": <number>,
  "letter": "<vollstaendiger Brieftext>"
}`;

function buildUserPrompt(input: GenerateLetterInput): string {
  let prompt = `Anliegen des Buergers:\n${input.issueText}\n\n`;
  prompt += `Verfuegbare Politiker:\n${JSON.stringify(
    input.politicians.map((p) => ({
      id: p.id,
      name: `${p.title ? p.title + " " : ""}${p.firstName} ${p.lastName}`,
      party: p.party,
      wahlkreis: p.wahlkreisName,
      level: p.level,
    })),
    null,
    2
  )}\n`;
  if (input.name) prompt += `\nName des Absenders: ${input.name}`;
  if (input.party) prompt += `\nParteimitgliedschaft: ${input.party}`;
  if (input.ngo) prompt += `\nOrganisation/Gewerkschaft: ${input.ngo}`;
  return prompt;
}

export async function generateLetter(
  input: GenerateLetterInput
): Promise<GenerateLetterResult> {
  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    responseFormat: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Mistral returned empty response");
  }

  // Parse JSON with fallback regex extraction (handles cases where Mistral wraps JSON in markdown)
  let parsed: {
    political_level: string;
    selected_politician_id: number;
    letter: string;
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse Mistral response as JSON");
    parsed = JSON.parse(match[0]);
  }

  // Validate selected politician against input list (T-02-13: no arbitrary ID injection)
  const selectedPolitician = input.politicians.find(
    (p) => p.id === parsed.selected_politician_id
  );

  if (!selectedPolitician) {
    // Fallback: use first politician in the list
    const fallback = input.politicians[0];
    if (!fallback) throw new Error("No politicians available");
    return {
      letter: parsed.letter,
      selectedPolitician: fallback,
      politicalLevel: (parsed.political_level as PoliticalLevel) || "Bund",
    };
  }

  return {
    letter: parsed.letter,
    selectedPolitician,
    politicalLevel: parsed.political_level as PoliticalLevel,
  };
}
