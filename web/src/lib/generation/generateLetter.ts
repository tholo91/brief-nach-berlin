import { mistral } from "@/lib/mistral";
import type { GenerateLetterInput, GenerateLetterResult, MdbContext } from "@/lib/types/wizard";
import type { PoliticalLevel } from "@/lib/types/politician";
import { LETTER_LENGTHS, DEFAULT_LETTER_LENGTH } from "@/lib/config";

const MISTRAL_MODEL = "mistral-medium-latest";
const MISTRAL_TEMPERATURE = 0.4;

interface ToneRegister {
  register: string;
  beschreibung: string;
  verboten: string;
  opener: string;
  schluss: string;
}

// Tone ladder: register name + concrete descriptor + verboten floor + opener/closer few-shot anchors.
// Named registers help the model land the slider; verboten lines tell it what NOT to soften toward.
const TONE_REGISTERS: Record<number, ToneRegister> = {
  1: {
    register: "freundlich-einladend",
    beschreibung: "Warm, bittend, ohne unterwürfig zu wirken. Du klingst wie jemand, der höflich anklopft.",
    verboten: "Unterwürfigkeit, Entschuldigungen für das Schreiben selbst",
    opener: "Ich wende mich heute an Sie, weil mir ein Thema in unserem Stadtteil keine Ruhe lässt.",
    schluss: "Ich würde mich sehr freuen, wenn Sie diesen Punkt in Ihre Arbeit aufnehmen.",
  },
  2: {
    register: "höflich-konstruktiv",
    beschreibung: "Konstruktiv, zugewandt, klar. Du erklärst dein Anliegen offen, ohne dramatisch zu werden.",
    verboten: "Floskeln, dramatische Sprache, Schmeicheleien",
    opener: "Ich schreibe Ihnen, weil mich eine konkrete Situation in unserer Nachbarschaft umtreibt.",
    schluss: "Ich bitte Sie, sich für eine Lösung dieses Problems einzusetzen.",
  },
  3: {
    register: "sachlich-engagiert",
    beschreibung: "Engagierte Bürgerin, engagierter Bürger auf Augenhöhe. Weder fordernd noch devot.",
    verboten: "Devotion, übertriebene Höflichkeit, Abstandstexte",
    opener: "Es gibt etwas, das mich seit Wochen beschäftigt und das ich Ihnen schildern möchte.",
    schluss: "Setzen Sie sich bitte dafür ein, dass dieses Anliegen politisch behandelt wird.",
  },
  4: {
    register: "scharf-pointiert",
    beschreibung: "Direkte Sprache, ehrlich, mit klarer Forderung. Persönliche Betroffenheit darf hervortreten. Du redest nicht um den heißen Brei.",
    verboten: "Glätten, Diplomatie-Floskeln, Weichspül-Formulierungen, Sanitisieren der Anliegen",
    opener: "Ich schreibe Ihnen, weil ich nicht länger zusehen will, ohne etwas zu sagen.",
    schluss: "Ich erwarte, dass Sie hier handeln und das Thema in Ihrer Fraktion auf den Tisch bringen.",
  },
  5: {
    register: "konfrontativ-aber-respektvoll",
    beschreibung: 'Kantig, fordernd, ungeglättet. Du machst unmissverständlich klar, dass dir der Geduldsfaden ausgeht. Sätze wie "Ich verstehe nicht, warum...", "Ich bin frustriert, weil..." oder "Es reicht, dass..." sind ausdrücklich erwünscht. Politisch zugespitzte Beobachtungen des Bürgers werden NICHT gemildert, sondern in geeignete formelle Sprache übersetzt.',
    verboten: "Beleidigungen, Unterstellungen, Pauschalurteile, Du-Form. ABER NICHT verboten: politische Schärfe, Ungeduld, klare Kritik an Untätigkeit",
    opener: "Ich schreibe Ihnen, weil ich es leid bin, dass an diesem Punkt nichts passiert.",
    schluss: "Ich fordere Sie auf, dieses Thema noch in dieser Sitzungsperiode konkret anzugehen.",
  },
};

function tonalityBlock(level: number): string {
  const reg = TONE_REGISTERS[level] ?? TONE_REGISTERS[3];
  return `register: ${reg.register} (Stufe ${level} von 5)
beschreibung: ${reg.beschreibung}
verboten: ${reg.verboten}
beispiel_opener: "${reg.opener}"
beispiel_schluss_vor_grußformel: "${reg.schluss}"`;
}

function todayInGerman(): string {
  return new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const SYSTEM_PROMPT_TEMPLATE = `Du hilfst Bürgerinnen und Bürgern in Deutschland, einen wirksamen, handschriftlich abschreibbaren Brief an ihre gewählte Vertretung zu schreiben.

EINGABEFORMAT (im User-Prompt mit XML-Tags markiert):
- <transkript>: Wortlaut des Bürgers. Das ist die einzige Quelle für Fakten, Beobachtungen, Argumente und Einschätzungen.
- <tonalitaet>: gewählte Tonstufe inkl. Register, Beschreibung, Verboten-Liste, Beispiel-Opener und Beispiel-Schluss.
- <ziel>: Zielwortzahl und Absatzanzahl.
- <empfaenger>: Liste der verfügbaren Politiker (JSON). Du wählst genau eine ID.
- <mdb_kontext> (optional): Ausschüsse und jüngste Positionen der Empfängerin/des Empfängers.
- <absender_optional> (optional): Name, Parteimitgliedschaft, Organisation des Absenders.

REGEL — KEINE ERFINDUNGEN (nicht verhandelbar):
Verwende ausschließlich Informationen aus <transkript>. Erfinde keine Daten, Uhrzeiten, Orte, Wegstrecken, Beobachtungen, Personen, Szenen, Zahlen, Studien oder Programmnamen. Wenn der Bürger keinen konkreten Anlass nennt, beschreibe das Problem allgemein und persönlich, aber erfinde keinen Anlass. Lieber abstrakter formulieren als Fakten erfinden. Kein "Gestern Abend...", kein "Letzte Woche...", keine Uhrzeit, kein Wegestreckendetail, das nicht im Transkript steht.

REGEL — STIMME DES BÜRGERS BEWAHREN (nicht verhandelbar):
Identifiziere die 1–3 stärksten Argumente und Einschätzungen des Bürgers, einschließlich politisch zugespitzter oder unbequemer. Übernimm sie sinngemäß im Brieftext. Glätte sie NICHT weg, sanitize sie NICHT. Wenn der Bürger einen politischen Zusammenhang herstellt (z. B. dass ein Problem extremen Parteien Auftrieb gibt, oder dass Untätigkeit politische Folgen hat), übernimm diesen Gedanken in geeigneter formeller Sprache. Empathie und Mitgefühl des Bürgers für Betroffene gehören ebenfalls in den Brief, wenn sie im Transkript stehen.

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

MdB-KONTEXT NUTZEN (nur wenn <mdb_kontext> mitgeliefert):
Wenn ein Ausschuss zum Thema passt, das knapp und natürlich erwähnen ("Gerade als Mitglied des Ausschusses für ... haben Sie hier Einfluss"). Wenn eine jüngste Position zum Thema passt, knapp aufgreifen, ohne sie wörtlich zu zitieren. NIEMALS Ausschüsse, Reden oder Positionen erfinden, die nicht in <mdb_kontext> stehen.

HEUTIGES DATUM: __TODAY__

ZUSTÄNDIGKEITSHINWEIS:
Alle verfügbaren Politiker sind Bundestagsabgeordnete. Wenn das Anliegen primär Landes- oder Kommunalebene betrifft, begründe im Brief kurz, warum sich der Bürger an die Bundestagsebene wendet (Gesetzgebungs­kompetenz, Förderprogramme, bundespolitischer Rahmen).

AUFGABE:
Schreibe einen formellen Brief in gepflegtem Deutsch (Sie-Form). Länge und Absatzanzahl sind in <ziel> vorgegeben. Halte die Zielwortzahl ein (±15%). Wenn der Brief zu kurz wäre: stärker ausarbeiten (Kontext, Begründung, Empathie für Betroffene), aber NIEMALS Fakten erfinden, um Wörter zu füllen. Wenn zu lang: kürze, ergänze nicht.

PFLICHT-ELEMENTE:
1. KONKRETER ANLASS in Absatz 1: ein Detail aus <transkript> (Ort, Erlebnis, Beobachtung). Wenn das Transkript keinen konkreten Anlass nennt, beschreibe das Problem persönlich-allgemein. Nichts erfinden.
2. KOMPLEXITÄT ANERKENNEN: ein Satz, der zeigt, dass du verstehst, warum das Thema schwierig ist. Maximal eine Zahl oder ein Fakt aus <transkript>, nicht mehr.
3. EINE BITTE: genau ein konkretes Verb plus ein konkretes Objekt. Keine Aufzählung, keine Wunschliste. Nicht "ich bitte um Maßnahmen", sondern z. B. "ich bitte Sie, sich im Verkehrsausschuss für die Aufnahme dieser Strecke ins Sonderprogramm einzusetzen".
4. SCHLUSS-SATZ vor Grußformel: eine politische Handlungs­erwartung an die Empfängerin/den Empfänger. KEINE Bitte um Antwort, KEIN Gesprächs- oder Treffen-Wunsch, KEIN "ich freue mich auf Ihre Rückmeldung". Das Ziel ist politische Wirkung, nicht Korrespondenz.

BRIEFFORMAT:
- Datum oben (TT.MM.JJJJ, das oben angegebene HEUTIGE DATUM verwenden).
- Anrede: "Sehr geehrte/r [Titel] [Name]," (Titel nur wenn vorhanden).
- Absatzanzahl gemäß <ziel>, einfache Satzstruktur (der Brief wird handschriftlich abgeschrieben).
- Schluss: "Mit freundlichen Grüßen," dann Name oder "[Ihr Name]".

TONHINWEIS:
Folge dem Register, der Beschreibung und der Verboten-Liste aus <tonalitaet>. Diese Wahl des Bürgers hat Vorrang vor deinem eigenen Urteil. Wenn der Bürger Stufe 5 (konfrontativ-aber-respektvoll) wählt, glätte den Brief NICHT auf Stufe 3 zurück.

REGELN:
- Erfinde KEINE demografischen Details (Geschlecht, Familienstand, Beruf, Kinder, Mitgliedschaften), die nicht in <transkript> oder <absender_optional> stehen.
- Erfinde KEINE Zahlen, Programmnamen, Studien, Organisationen.
- Sachlich und respektvoll, nie unterwürfig, nie aggressiv beleidigend. Tonschärfe gemäß <tonalitaet> ist explizit erlaubt.
- Mische Satzlängen. Kurze Sätze landen härter, ein längerer kann Nuancen tragen.

VOR DER AUSGABE: Lies deinen Brief einmal in Gedanken laut. Klingt das wie ein Mensch, der zum ersten Mal an seinen Abgeordneten schreibt, oder wie ein Pressetext? Wenn Pressetext, schreibe um.

Antworte ausschließlich im JSON-Format:
{
  "political_level": "Bund" | "Land" | "Kommune",
  "selected_politician_id": <number>,
  "voice_check": "<ein Satz: warum klingt dein Brief wie ein Bürger und nicht wie ein Pressetext>",
  "letter": "<vollständiger Brieftext>"
}`;

function mdbContextBlock(ctx: MdbContext | undefined): string {
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
  return `\n\n<mdb_kontext>\n${parts.join("\n")}\n</mdb_kontext>`;
}

function absenderBlock(input: GenerateLetterInput): string {
  const lines: string[] = [];
  if (input.name) lines.push(`name: ${input.name}`);
  if (input.party) lines.push(`parteimitgliedschaft: ${input.party}`);
  if (input.ngo) lines.push(`organisation: ${input.ngo}`);
  if (lines.length === 0) return "";
  return `\n\n<absender_optional>\n${lines.join("\n")}\n</absender_optional>`;
}

function buildUserPrompt(
  input: GenerateLetterInput,
  targetWords: number,
  toneLevel: number
): string {
  const politiciansJson = JSON.stringify(
    input.politicians.map((p) => ({
      id: p.id,
      name: `${p.title ? p.title + " " : ""}${p.firstName} ${p.lastName}`,
      party: p.party,
      wahlkreis: p.wahlkreisName,
      level: p.level,
    })),
    null,
    2
  );

  return `<transkript>
${input.issueText}
</transkript>

<tonalitaet>
${tonalityBlock(toneLevel)}
</tonalitaet>

<ziel>
woerter: ${targetWords} (±15%)
absaetze: 3 bis 4
</ziel>

<empfaenger>
${politiciansJson}
</empfaenger>${mdbContextBlock(input.mdbContext)}${absenderBlock(input)}`;
}

interface ParsedLetter {
  political_level: string;
  selected_politician_id: number;
  voice_check?: string;
  letter: string;
}

function parseLetterResponse(content: unknown): ParsedLetter {
  if (!content || typeof content !== "string") {
    throw new Error("Mistral returned empty response");
  }
  try {
    return JSON.parse(content) as ParsedLetter;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Failed to parse Mistral response as JSON");
    return JSON.parse(match[0]) as ParsedLetter;
  }
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function generateLetter(
  input: GenerateLetterInput
): Promise<GenerateLetterResult> {
  const lengthKey = input.letterLength ?? DEFAULT_LETTER_LENGTH;
  const { min: minWords, max: maxWords } = LETTER_LENGTHS[lengthKey];
  const targetWords = Math.round((minWords + maxWords) / 2);
  const toneLevel = input.toneLevel ?? 3;
  const maxTokens = Math.ceil(maxWords * 2.2) + 250;

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace("__TODAY__", todayInGerman());
  const userPrompt = buildUserPrompt(input, targetWords, toneLevel);

  const generationStart = Date.now();

  const firstResponse = await mistral.chat.complete({
    model: MISTRAL_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    responseFormat: { type: "json_object" },
    temperature: MISTRAL_TEMPERATURE,
    maxTokens,
  });

  let parsed = parseLetterResponse(firstResponse.choices?.[0]?.message?.content);
  let wordCount = countWords(parsed.letter);

  // One corrective retry if length is materially off (±15% bounds).
  // Only retries on length, not on hallucination. Caps cost at 2× per letter.
  const minOk = Math.floor(minWords * 0.85);
  const maxOk = Math.ceil(maxWords * 1.15);
  let retried = false;
  if (wordCount < minOk || wordCount > maxOk) {
    retried = true;
    const directive = wordCount < minOk
      ? `Der vorherige Brief hatte nur ${wordCount} Wörter. Ziel sind ${targetWords} Wörter (±15%, also ${minOk}–${maxOk}). Schreibe den Brief neu mit der korrekten Länge: arbeite Kontext und Begründung stärker aus, übernimm mehr Argumente und Empathie aus <transkript>. Erfinde KEINE neuen Fakten, um Wörter zu füllen.`
      : `Der vorherige Brief hatte ${wordCount} Wörter. Ziel sind ${targetWords} Wörter (±15%, also ${minOk}–${maxOk}). Schreibe den Brief neu mit der korrekten Länge: kürze, ohne die Stimme oder die Kernargumente des Bürgers zu verlieren.`;

    console.warn("[generateLetter] word count out of range, retrying once", {
      wordCount,
      minWords,
      maxWords,
      lengthKey,
      direction: wordCount < minOk ? "too_short" : "too_long",
    });

    const retryResponse = await mistral.chat.complete({
      model: MISTRAL_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
        { role: "assistant", content: firstResponse.choices?.[0]?.message?.content as string ?? "" },
        { role: "user", content: directive },
      ],
      responseFormat: { type: "json_object" },
      temperature: MISTRAL_TEMPERATURE,
      maxTokens,
    });

    try {
      const retryParsed = parseLetterResponse(retryResponse.choices?.[0]?.message?.content);
      const retryWordCount = countWords(retryParsed.letter);
      // Only accept the retry if it's actually closer to target than the first attempt.
      const firstDelta = Math.abs(wordCount - targetWords);
      const retryDelta = Math.abs(retryWordCount - targetWords);
      if (retryDelta < firstDelta) {
        parsed = retryParsed;
        wordCount = retryWordCount;
      } else {
        console.warn("[generateLetter] retry was not closer to target, keeping original", {
          firstWordCount: wordCount,
          retryWordCount,
          target: targetWords,
        });
      }
    } catch (err) {
      console.error("[generateLetter] retry parse failed, keeping original", err);
    }
  }

  const wordCountInRange = wordCount >= minWords && wordCount <= maxWords;
  if (!wordCountInRange) {
    console.warn("[generateLetter] final word count still out of range", {
      wordCount,
      minWords,
      maxWords,
      lengthKey,
      retried,
    });
  }

  // voice_check is a self-reflection field that forces the model to read its own output.
  // We do not surface it to the user, but we log it for prompt iteration.
  if (parsed.voice_check) {
    console.log("[generateLetter] voice_check:", parsed.voice_check.slice(0, 200));
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
    retried,
    model: MISTRAL_MODEL,
    temperature: MISTRAL_TEMPERATURE,
    generationMs: Date.now() - generationStart,
  };
}
