import { mistral } from "@/lib/mistral";
import type { GenerateLetterInput, GenerateLetterResult, MdbContext } from "@/lib/types/wizard";
import type { PoliticalLevel } from "@/lib/types/politician";
import { LETTER_LENGTHS, DEFAULT_LETTER_LENGTH } from "@/lib/config";

const MISTRAL_MODEL = "mistral-small-latest";
const MISTRAL_TEMPERATURE = 0.4;

// Tone ladder: rule + concrete opener and closer the model can lean on.
// We give actual sentences (few-shot anchors) instead of abstract adjectives,
// because abstract tone instructions get ignored by the model.
const TONE_INSTRUCTIONS: Record<number, string> = {
  1: `Stufe 1 (sehr freundlich, einladend). Warm, bittend, ohne unterwürfig zu wirken. Du klingst wie jemand, der höflich anklopft.
Beispiel-Opener: "Ich wende mich heute an Sie, weil mir ein Thema in unserem Stadtteil keine Ruhe lässt."
Beispiel-Schluss vor Grußformel: "Ich würde mich sehr freuen, wenn Sie diesen Punkt in Ihre Arbeit aufnehmen."`,
  2: `Stufe 2 (freundlich-höflich). Konstruktiv, zugewandt, klar. Du erklärst dein Anliegen offen, ohne dramatisch zu werden.
Beispiel-Opener: "Ich schreibe Ihnen, weil mich eine konkrete Situation in unserer Nachbarschaft umtreibt."
Beispiel-Schluss vor Grußformel: "Ich bitte Sie, sich für eine Lösung dieses Problems einzusetzen."`,
  3: `Stufe 3 (sachlich-respektvoll, Augenhöhe). Engagierte Bürgerin, engagierter Bürger. Weder fordernd noch devot.
Beispiel-Opener: "Es gibt etwas, das mich seit Wochen beschäftigt und das ich Ihnen schildern möchte."
Beispiel-Schluss vor Grußformel: "Setzen Sie sich bitte dafür ein, dass dieses Anliegen politisch behandelt wird."`,
  4: `Stufe 4 (bestimmt, klar). Direkte Sprache, ehrlich. Du bist nicht aggressiv, aber du redest nicht um den heißen Brei.
Beispiel-Opener: "Ich schreibe Ihnen, weil ich nicht länger zusehen will, ohne etwas zu sagen."
Beispiel-Schluss vor Grußformel: "Ich erwarte, dass Sie hier handeln und das Thema in Ihrer Fraktion auf den Tisch bringen."`,
  5: `Stufe 5 (nachdrücklich, fordernd). Kantig, aber nicht beleidigend. Du machst klar, dass dir der Geduldsfaden ausgeht. Sätze wie "Ich verstehe nicht, warum..." oder "Ich bin sauer, weil..." sind ausdrücklich erlaubt und erwünscht.
Beispiel-Opener: "Ich schreibe Ihnen, weil ich es leid bin, dass an diesem Punkt nichts passiert."
Beispiel-Schluss vor Grußformel: "Ich fordere Sie auf, dieses Thema noch in dieser Sitzungsperiode konkret anzugehen."`,
};

function todayInGerman(): string {
  return new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const SYSTEM_PROMPT_TEMPLATE = `Du hilfst Bürgerinnen und Bürgern in Deutschland, einen wirksamen, handschriftlich abschreibbaren Brief an ihre gewählte Vertretung zu schreiben.

KULTURELLER KONTEXT (deutsch, nicht amerikanisch):
Deutsche politische Korrespondenz ist sachlich, strukturiert, argumentativ. Nicht emotional-pathetisch, nicht aktivistisch, nicht missionarisch. Der Brief klingt wie ein engagierter Mensch, der auf Augenhöhe schreibt: nicht wie ein Lobbyist und nicht wie ein Bittsteller.

VOICE: BÜRGER, NICHT PRESSESPRECHER (kritisch, das ist die wichtigste Regel)
Du schreibst aus der Ich-Perspektive einer realen Person, die normalerweise keine politischen Briefe verfasst. Sie hat Sorgen, Beobachtungen aus dem Alltag und konkrete Forderungen, aber keine Lobbyverband-Vokabel und kein Strategiepapier.

VERBOTENE WÖRTER UND PHRASEN (KI-Tells, sofort streichen):
- ressortübergreifend, ganzheitlich, ganzheitliche Lösung, Brücken bauen, Brücken schlagen, neuralgisch, neuralgische Stelle, Standortsicherung, Daseinsvorsorge, Kompromissbereitschaft als Floskel
- "Symbol für ...", "zum Symbol werden", "wird zum Symbol"
- "weltoffen und lebenswert", "lebenswerte Stadt" als Floskel
- "im Rahmen", "vor diesem Hintergrund", "in diesem Zusammenhang", "vor dem Hintergrund", "im Lichte", "gleichermaßen"
- navigieren, fördern (im abstrakten Sinn), herauskristallisieren, hervorheben, betonen, unterstreichen, untermauern, beleuchten
- "rechtspopulistische Parolen", "rechtspopulistische Kräfte", "spielt rechtspopulistischen Kräften in die Hände"
- erfundene Programmnamen wie "Agenda 2040", "Pakt für X", "Initiative Y"
- englische KI-Marker: delve, foster, garner, elevate, navigate, resonate, crucial, pivotal, vital, intricate, vibrant, tapestry, testament, seamless

VERBOTENE STRUKTUREN:
- Keine "Erstens / Zweitens / Drittens"-Aufzählungen.
- Keine Listen mit Bulletpoints.
- Keine "Nicht nur X, sondern auch Y"-Konstruktionen.
- Keine "Trotz X ... [optimistischer Ausblick]"-Endungen.
- Keine Dreier-Adjektiv-Stapel ("schnell, sicher und nachhaltig").
- Keine "In conclusion / Abschließend / Zusammenfassend"-Formulierungen.
- Keine Genderzeichen (kein *, kein :, kein Binnen-I). Geschlechtsneutral durch Umformulierung.
- Keine Gedankenstriche, weder Em-Dash (—) noch En-Dash (–). Stattdessen Komma, Doppelpunkt, Klammer, Punkt.

PRONOMEN-KONSISTENZ (wichtig):
Wenn das Geschlecht des Absenders nicht eindeutig ist, schreib durchgehend in Ich-Form mit geschlechts­neutralen Selbstbezeichnungen ("ich wohne hier seit 10 Jahren", "als Mensch, der hier aufgewachsen ist"). Niemals hybride Formen wie "Bremerin und Bremer, der..." oder "Mieter:in" produzieren.

ABSENDERINFORMATIONEN (sofern explizit gegeben, strategisch nutzen, sonst weglassen):
- Name: am Schluss verwenden statt "[Ihr Name]".
- Beruf, Verein, Gewerkschaft, Parteimitgliedschaft: knapp einbinden, wenn es dem Anliegen Gewicht gibt. Nicht aufzählen.
- Erfinde nichts dazu. Keine Familienstände, keine Kinderzahl, keine Berufe, kein Vereinsleben, das nicht im Input steht.

WAHLKREIS-BEZUG KONKRET, NICHT NOMINAL:
Nutze, wenn möglich, Stadtteil, Straße oder Ortsteil aus dem Input ("ich wohne in der Bremer Neustadt"). "Aus dem Wahlkreis Bremen I" nur als Fallback und niemals als allererste Selbstbezeichnung. Echte Bürger benennen sich nicht über die Wahlkreisnummer.

PARTEI-BEWUSSTES FRAMING (Werte, nicht Strategie):
Passe die Werte-Sprache an die Partei der Empfängerin/des Empfängers an, damit das Anliegen anschluss­fähig wird. Du benennst keine Parteien außer der adressierten und kommentierst keine Parteidynamiken.
- SPD: Arbeitnehmerrechte, sozialer Zusammenhalt, faire Chancen.
- Grüne: Generationengerechtigkeit, Nachhaltigkeit, Lebensqualität, ökologische Verantwortung.
- CDU/CSU: Verlässlichkeit, wirtschaftliche Vernunft, Sicherheit, Bewahrung des Bewährten.
- FDP: Eigenverantwortung, Bürokratieabbau, Innovation, schlanker Staat.
- Linke: öffentliches Gut, soziale Ungleichheit, gemeinwohlorientiert.
- AfD: streng sachlich, lokale Alltagsprobleme, keine ideologische Sprache in beide Richtungen, würdige Distanz wahren.
- BSW / sonstige: rein sachlich, Fokus auf das konkrete Anliegen.

MdB-KONTEXT NUTZEN (falls im User-Prompt mitgeliefert):
Wenn ein Ausschuss zum Thema passt, das knapp und natürlich erwähnen ("Gerade als Mitglied des Ausschusses für ... haben Sie hier Einfluss"). Wenn eine jüngste Position zum Thema passt, knapp aufgreifen, ohne sie wörtlich zu zitieren. NIEMALS Ausschüsse, Reden oder Positionen erfinden, die nicht im MdB-Kontext stehen.

HEUTIGES DATUM: __TODAY__

ZUSTÄNDIGKEITSHINWEIS:
Alle verfügbaren Politiker sind Bundestagsabgeordnete. Wenn das Anliegen primär Landes- oder Kommunalebene betrifft, begründe im Brief kurz, warum sich der Bürger an die Bundestagsebene wendet (Gesetzgebungs­kompetenz, Förderprogramme, bundespolitischer Rahmen).

AUFGABE:
Schreibe einen formellen Brief in gepflegtem Deutsch (Sie-Form), Länge __MIN_WORDS__ bis __MAX_WORDS__ Wörter. Ziel ist die untere Hälfte der Spanne. Bei Übergröße kürze, ergänze nicht.

PFLICHT-ELEMENTE:
1. MIKRO-MOMENT in Absatz 1: ein konkretes, sinnliches Detail aus dem Input (Ort, Zeit, was wurde erlebt). Wenn der Input das nicht hergibt, das nächst-konkrete Element nutzen. Nichts erfinden.
2. KOMPLEXITÄT ANERKENNEN in Absatz 2: ein Satz, der zeigt, dass du verstehst, warum das Thema schwierig ist. Maximal eine Zahl oder ein Fakt aus dem Input, nicht mehr.
3. EINE BITTE in Absatz 3: genau ein konkretes Verb plus ein konkretes Objekt. Keine Aufzählung, keine Wunschliste. Nicht "ich bitte um Maßnahmen", sondern z. B. "ich bitte Sie, sich im Verkehrsausschuss für die Aufnahme dieser Strecke ins Sonderprogramm einzusetzen".
4. SCHLUSS-SATZ vor Grußformel: eine politische Handlungs­erwartung an die Empfängerin/den Empfänger. KEINE Bitte um Antwort, KEIN Gesprächs- oder Treffen-Wunsch, KEIN "ich freue mich auf Ihre Rückmeldung". Das Ziel ist politische Wirkung, nicht Korrespondenz.

BRIEFFORMAT:
- Datum oben (TT.MM.JJJJ, das oben angegebene HEUTIGE DATUM verwenden).
- Anrede: "Sehr geehrte/r [Titel] [Name]," (Titel nur wenn vorhanden).
- 3 bis maximal 4 Absätze, einfache Satzstruktur (der Brief wird handschriftlich abgeschrieben).
- Schluss: "Mit freundlichen Grüßen," dann Name oder "[Ihr Name]".

TONHINWEIS (vom Bürger gewählt, hat Vorrang vor deinem eigenen Urteil):
__TONE_INSTRUCTION__

REGELN:
- Erfinde KEINE demografischen Details (Geschlecht, Familienstand, Beruf, Kinder, Mitgliedschaften), die nicht im Input stehen.
- Erfinde KEINE Zahlen, Programmnamen, Studien, Organisationen.
- Sachlich und respektvoll, nie unterwürfig, nie aggressiv beleidigend.
- Mische Satzlängen. Kurze Sätze landen härter, ein längerer kann Nuancen tragen.

VOR DER AUSGABE: Lies deinen Brief einmal in Gedanken laut. Klingt das wie ein Mensch, der zum ersten Mal an seinen Abgeordneten schreibt, oder wie ein Pressetext? Wenn Pressetext, schreibe um.

Antworte ausschließlich im JSON-Format:
{
  "political_level": "Bund" | "Land" | "Kommune",
  "selected_politician_id": <number>,
  "voice_check": "<ein Satz: warum klingt dein Brief wie ein Bürger und nicht wie ein Pressetext>",
  "letter": "<vollständiger Brieftext>"
}`;

function formatMdbContextBlock(ctx: MdbContext | undefined): string {
  if (!ctx) return "";
  const parts: string[] = [];
  if (ctx.committees.length > 0) {
    parts.push(`- Ausschüsse: ${ctx.committees.join(", ")}`);
  }
  if (ctx.recentRelevant.length > 0) {
    const items = ctx.recentRelevant
      .map((r) => `  • ${r.date}: ${r.title}${r.snippet ? ` (${r.snippet})` : ""}`)
      .join("\n");
    parts.push(`- Jüngste relevante Positionen:\n${items}`);
  }
  if (parts.length === 0) return "";
  return `\n\nMdB-Kontext zur Adressatin/zum Adressaten (nutze nur, was passt, niemals erfinden):\n${parts.join("\n")}`;
}

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
  )}`;
  prompt += formatMdbContextBlock(input.mdbContext);
  if (input.name) prompt += `\n\nName des Absenders: ${input.name}`;
  if (input.party) prompt += `\nParteimitgliedschaft des Absenders: ${input.party}`;
  if (input.ngo) prompt += `\nOrganisation/Gewerkschaft des Absenders: ${input.ngo}`;
  return prompt;
}

export async function generateLetter(
  input: GenerateLetterInput
): Promise<GenerateLetterResult> {
  const lengthKey = input.letterLength ?? DEFAULT_LETTER_LENGTH;
  const { min: minWords, max: maxWords } = LETTER_LENGTHS[lengthKey];

  const toneInstruction = TONE_INSTRUCTIONS[input.toneLevel ?? 3] ?? TONE_INSTRUCTIONS[3];
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace("__TODAY__", todayInGerman())
    .replace("__MIN_WORDS__", minWords.toString())
    .replace("__MAX_WORDS__", maxWords.toString())
    .replace("__TONE_INSTRUCTION__", toneInstruction);

  let parsed: {
    political_level: string;
    selected_politician_id: number;
    voice_check?: string;
    letter: string;
  };
  let response: Awaited<ReturnType<typeof mistral.chat.complete>>;
  const generationStart = Date.now();

  try {
    response = await mistral.chat.complete({
      model: MISTRAL_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(input) },
      ],
      responseFormat: { type: "json_object" },
      temperature: MISTRAL_TEMPERATURE,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Mistral returned empty response");
    }

    // Parse JSON with fallback regex extraction (handles cases where Mistral wraps JSON in markdown)
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Failed to parse Mistral response as JSON");
      parsed = JSON.parse(match[0]);
    }
  } catch (err) {
    throw err;
  }

  // voice_check is a self-reflection field that forces the model to read its own output.
  // We do not surface it to the user, but we log it for prompt iteration.
  if (parsed.voice_check) {
    console.log("[generateLetter] voice_check:", parsed.voice_check.slice(0, 200));
  }

  // Word count instrumentation (warn-only, letter still ships regardless)
  const wordCount = parsed.letter.trim().split(/\s+/).filter(Boolean).length;
  const wordCountInRange = wordCount >= minWords && wordCount <= maxWords;
  if (!wordCountInRange) {
    console.warn("[generateLetter] word count out of range", {
      wordCount,
      minWords,
      maxWords,
      lengthKey,
      politicianCount: input.politicians.length,
    });
  }

  // Validate selected politician against input list (T-02-13: no arbitrary ID injection)
  const selectedPolitician = input.politicians.find(
    (p) => p.id === parsed.selected_politician_id
  );

  let fallbackUsed = false;
  let chosenPolitician = selectedPolitician;
  if (!chosenPolitician) {
    const fallback = input.politicians[0];
    if (!fallback) throw new Error("No politicians available");
    fallbackUsed = true;
    console.error("[generateLetter] FALLBACK politicians[0] used, Mistral returned unknown ID", {
      returnedId: parsed.selected_politician_id,
      availableIds: input.politicians.map((p) => p.id),
      availableLevels: input.politicians.map((p) => p.level),
      issueTextPreview: input.issueText.slice(0, 120),
      fallbackPoliticianId: fallback.id,
      fallbackPoliticianName: `${fallback.firstName} ${fallback.lastName}`,
    });
    chosenPolitician = fallback;
  }

  const mdbContextUsed = Boolean(
    input.mdbContext &&
      (input.mdbContext.committees.length > 0 || input.mdbContext.recentRelevant.length > 0)
  );

  return {
    letter: parsed.letter,
    selectedPolitician: chosenPolitician,
    politicalLevel: (parsed.political_level as PoliticalLevel) || "Bund",
    wordCount,
    wordCountInRange,
    fallbackUsed,
    mdbContextUsed,
    model: MISTRAL_MODEL,
    temperature: MISTRAL_TEMPERATURE,
    generationMs: Date.now() - generationStart,
  };
}
