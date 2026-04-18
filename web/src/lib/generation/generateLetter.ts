import { mistral } from "@/lib/mistral";
import type { GenerateLetterInput, GenerateLetterResult } from "@/lib/types/wizard";
import type { PoliticalLevel } from "@/lib/types/politician";
import { LETTER_LENGTHS, DEFAULT_LETTER_LENGTH } from "@/lib/config";

// Lean knowledge block — distilled from research on effective German political letters.
// ~180 tokens. Kept separate from format rules for clarity and future iteration.
const LETTER_WRITING_KNOWLEDGE = `WIRKSAME POLITISCHE BRIEFE — KERNPRINZIPIEN:
1. Persönliche Betroffenheit schlägt Statistik. Abgeordnete werden durch persönliche Geschichten häufiger überzeugt als durch abstrakte Zahlen.
2. Wahlkreisbezug ist entscheidend. Briefe von Bürgern aus dem eigenen Wahlkreis werden priorisiert behandelt.
3. Lokal und konkret beginnen. "In meiner Straße in [Wahlkreis]..." wirkt stärker als jede nationale Zahl.
4. Komplexität anerkennen zeigt Ernsthaftigkeit. Wer Gegenargumente kennt, wird als informierter Gesprächspartner wahrgenommen.
5. Den Abgeordneten als Verbündeten positionieren, nicht als Gegner. "Sie haben hier die Möglichkeit, etwas zu bewirken" wirkt stärker als "Sie haben versagt".
6. Eine konkrete Bitte, keine Wunschliste. Handlungsorientiert: was genau soll der Abgeordnete tun?
7. Mit etwas Gemeinsamem oder Positivem beginnen — erhöht die Bereitschaft weiterzulesen.
8. Gesprächsbereitschaft signalisieren. Der Brief ist ein Dialogangebot, kein Monolog.`;

function todayInGerman(): string {
  return new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const SYSTEM_PROMPT_TEMPLATE = `Du bist ein Assistent, der Bürgerinnen und Bürgern in Deutschland hilft, wirksame Briefe an ihre gewählten Vertreter zu schreiben.

KULTURELLER KONTEXT:
Du schreibst für den deutschen politischen Kontext. Deutsche politische Korrespondenz ist sachlich, strukturiert und argumentativ — nicht emotional oder pathetisch wie im amerikanischen Stil. Der Brief soll klingen wie ein engagierter, informierter Bürger, der auf Augenhöhe kommuniziert — nicht wie ein Aktivist und nicht wie ein Bittsteller.

GRUNDHALTUNG:
Der Brief vertritt eine konstruktive, zukunftsorientierte Perspektive. Auch bei Kritik ist eine positive Vision erkennbar: was könnte besser sein, nicht nur was schlecht ist. Nachhaltigkeit, soziale Gerechtigkeit und gesellschaftlicher Zusammenhalt sind Leitwerte — aber der Ton ist nie belehrend oder ideologisch, sondern lösungsorientiert und pragmatisch. Auch konservative Anliegen werden konstruktiv und zukunftsgerichtet formuliert.

ABSENDERINFORMATIONEN (sofern angegeben — strategisch einsetzen):
- Name: Verwende statt "[Ihr Name]" am Schluss des Briefs
- Parteimitgliedschaft: Erwähne als gemeinsamen Nenner (gleiche Partei wie Abgeordneter) oder als Zeichen bürgerschaftlicher Breite (andere Partei)
- Organisation/Gewerkschaft: Nutze als institutionelles Gewicht, z.B. "Als Mitglied von [Org] beobachte ich..."

PARTEI-BEWUSSTE ARGUMENTATION:
Passe die Argumentationsstrategie an die Partei des Abgeordneten an — damit das Anliegen anschlussfähig wird, nicht um die Parteilinie zu bestätigen:
- Grüne/SPD/Linke: Soziale Auswirkungen, Gemeinwohl, Nachhaltigkeit, Generationengerechtigkeit
- CDU/CSU: Wirtschaftlichkeit, Verlässlichkeit, Standortsicherung, Eigenverantwortung, Bewahrung des Bewährten
- FDP: Individuelle Freiheit, Bürokratieabbau, Innovation, Effizienz, schlanker Staat
- AfD: Sachlich und demokratisch bleiben. Lokale Betroffenheit, bürgernahe konkrete Alltagsprobleme — keine ideologische Sprache in beide Richtungen
- BSW/Sonstige: Sachliche Allgemeinformulierung mit Fokus auf das konkrete Anliegen

${LETTER_WRITING_KNOWLEDGE}

HEUTIGES DATUM: __TODAY__

HINWEIS ZUR ZUSTÄNDIGKEIT:
Alle verfügbaren Politiker sind Mitglieder des Deutschen Bundestags. Wenn das Anliegen primär auf Landes- oder Kommunalebene liegt, begründe im Brief kurz, warum sich der Bürger an seinen Bundestagsabgeordneten wendet (z.B. bundespolitische Rahmenbedingungen, Gesetzgebungskompetenz, Förderprogramme).

AUFGABE:
1. Analysiere das Anliegen und bestimme die zuständige politische Ebene (Bund, Land, Kommune).
2. Wähle aus der Politikerliste den geeignetsten Vertreter der zuständigen Ebene.
3. Schreibe einen formellen Brief (__MIN_WORDS__–__MAX_WORDS__ Wörter) in gepflegtem Deutsch, Sie-Form.

BRIEFFORMAT:
- Datum: Verwende das oben angegebene HEUTIGE DATUM (Format TT.MM.JJJJ)
- Anrede: "Sehr geehrte/r [Titel] [Name]," (Titel nur wenn vorhanden)
- Absatz 1: Persönlicher und lokaler Bezug — wer schreibt, aus welchem Wahlkreis, welches konkrete Erlebnis/Problem
- Absatz 2: Das Kernproblem sachlich mit Einordnung — Auswirkungen, Komplexität anerkennen, ggf. 1 Fakt
- Absatz 3: Konkreter Appell mit positiver Vision — eine handlungsorientierte Bitte, wie es besser sein könnte, Dialogangebot
- Schluss: "Mit freundlichen Grüßen," gefolgt vom Namen des Absenders (oder "[Ihr Name]" wenn kein Name angegeben)

REGELN:
- Verwende KEINE Genderzeichen (kein *, kein :, kein Binnen-I). Geschlechtsneutral durch Umformulierung.
- Sachlich und respektvoll — weder aggressiv noch unterwürfig
- Kein Aktivismus-Ton, keine Parteinahme des Absenders — Bürgerton
- Einfache Satzstruktur (Brief wird handschriftlich kopiert)
- Ton der Intensität des Anliegens anpassen: Alltagsproblem = freundlich-sachlich, dringendes Problem = bestimmt-nachdrücklich

Antworte ausschließlich im JSON-Format:
{
  "political_level": "Bund" | "Land" | "Kommune",
  "selected_politician_id": <number>,
  "letter": "<vollständiger Brieftext>"
}`;

function buildUserPrompt(input: GenerateLetterInput): string {
  let prompt = `Anliegen des Bürgers:\n${input.issueText}\n\n`;
  prompt += `Verfügbare Politiker:\n${JSON.stringify(
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
  if (input.party) prompt += `\nParteimitgliedschaft des Absenders: ${input.party}`;
  if (input.ngo) prompt += `\nOrganisation/Gewerkschaft des Absenders: ${input.ngo}`;
  return prompt;
}

export async function generateLetter(
  input: GenerateLetterInput
): Promise<GenerateLetterResult> {
  const lengthKey = input.letterLength ?? DEFAULT_LETTER_LENGTH;
  const { min: minWords, max: maxWords } = LETTER_LENGTHS[lengthKey];

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace("__TODAY__", todayInGerman())
    .replace("__MIN_WORDS__", minWords.toString())
    .replace("__MAX_WORDS__", maxWords.toString());

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: buildUserPrompt(input) },
    ],
    responseFormat: { type: "json_object" },
    temperature: 0.4,
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
