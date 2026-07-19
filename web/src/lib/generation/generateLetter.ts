import { mistral, withMistralRetry, MISTRAL_MODELS } from "@/lib/mistral";
import type { GenerateLetterInput, GenerateLetterResult, MdbContext } from "@/lib/types/wizard";
import type { PoliticalLevel } from "@/lib/types/politician";
import type { Recipient } from "@/lib/lookup/rathausRecipient";
import { extractJsonObject } from "@/lib/mistral-json";
import { LETTER_LENGTHS, DEFAULT_LETTER_LENGTH } from "@/lib/config";

const MISTRAL_TEMPERATURE = 0.4;

interface ToneRegister {
  register: string;
  beschreibung: string;
  verboten: string;
}

// Tone ladder: register name + concrete descriptor + verboten floor.
// Named registers help the model land the slider; verboten lines tell it what NOT to soften toward.
const TONE_REGISTERS: Record<number, ToneRegister> = {
  1: {
    register: "freundlich-einladend",
    beschreibung: "Warm, bittend, ohne unterwürfig zu wirken. Du klingst wie jemand, der höflich anklopft.",
    verboten: "Unterwürfigkeit, Entschuldigungen für das Schreiben selbst",
  },
  2: {
    register: "höflich-konstruktiv",
    beschreibung: "Konstruktiv, zugewandt, klar. Du erklärst dein Anliegen offen, ohne dramatisch zu werden.",
    verboten: "Floskeln, dramatische Sprache, Schmeicheleien",
  },
  3: {
    register: "sachlich-engagiert",
    beschreibung: "Engagierte Bürgerin, engagierter Bürger auf Augenhöhe. Weder fordernd noch devot.",
    verboten: "Devotion, übertriebene Höflichkeit, Abstandstexte",
  },
  4: {
    register: "scharf-pointiert",
    beschreibung: "Direkte Sprache, ehrlich, mit klarer Forderung. Persönliche Betroffenheit darf hervortreten. Du redest nicht um den heißen Brei.",
    verboten: "Glätten, Diplomatie-Floskeln, Weichspül-Formulierungen, Abschwächen ausdrücklicher Kritik",
  },
  5: {
    register: "konfrontativ-aber-respektvoll",
    beschreibung: "Kantig, fordernd, ungeglättet. Formuliere die Kritik klar und die Forderung unmissverständlich. Bewahre ausdrücklich geäußerte Wut, Frustration und Ungeduld. Erfinde keine Enttäuschung oder Vorgeschichte, nur um den Ton zu verschärfen.",
    verboten: "Beleidigungen, Unterstellungen, Pauschalurteile, Du-Form. Politische Schärfe, Ungeduld und klare Kritik aus dem Transkript bleiben erlaubt",
  },
};

export function tonalityBlock(level: number): string {
  const reg = TONE_REGISTERS[level] ?? TONE_REGISTERS[3];
  return `register: ${reg.register} (Stufe ${level} von 5)
beschreibung: ${reg.beschreibung}
verboten: ${reg.verboten}`;
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
- <tonalitaet>: gewählte Tonstufe mit Register, Beschreibung und Verboten-Liste.
- <ziel>: Zielwortzahl und Absatzanzahl.
- <empfaenger>: Liste der verfügbaren Empfänger (JSON). Du wählst genau eine ID.
- <mdb_kontext> (optional): Ausschüsse und jüngste Positionen der Empfängerin/des Empfängers.
- <absender_optional> (optional): Name, Parteimitgliedschaft, Organisation des Absenders.

REGEL — KEINE ERFINDUNGEN (nicht verhandelbar):
Verwende ausschließlich Informationen aus <transkript>. Erfinde keine Daten, Uhrzeiten, Zeiträume, Dauerangaben, Orte, Wegstrecken, Beobachtungen, Personen, Szenen, Zahlen, Studien oder Programmnamen. Erfinde auch keine früheren Kontaktversuche, Beschwerden, Fristen oder ausbleibenden Antworten. Erfinde keine Drohungen oder Eskalationsschritte. Dazu gehören Hinweise auf Medien oder Öffentlichkeit, rechtliche Schritte, Wahlen, Vertrauensverlust und andere Konsequenzen. Verwende solche Aussagen nur, wenn der Bürger sie ausdrücklich im Transkript nennt. Unterstelle keine Untätigkeit, Pflichtverletzung oder gebrochenen Versprechen, wenn das nicht im Transkript steht. Wenn der Bürger keinen konkreten Anlass nennt, beschreibe das Problem allgemein und persönlich, aber erfinde keinen Anlass. Lieber abstrakter formulieren als Fakten erfinden.

ÜBER DEN ABSENDER (positive Vorgabe):
Beschreibe den Absender ausschließlich mit Informationen, die wörtlich in
<transkript> oder <absender_optional> stehen. Wenn der Bürger sich selbst
nicht beschreibt, schreibe in allgemeiner Ich-Form ohne Vita, ohne
Berufsangabe, ohne Familiensituation, ohne Wohnhistorie, ohne politische
Vorgeschichte. Lieber abstrakt-allgemein als plausibel klingende Erfindung.

REGEL — STIMME DES BÜRGERS BEWAHREN (nicht verhandelbar):
Identifiziere die ein bis drei stärksten Argumente und Einschätzungen des Bürgers, einschließlich politisch zugespitzter oder unbequemer. Übernimm sie sinngemäß im Brieftext und schwäche sie nicht ab. Ausdrücklich geäußerte Wut, Frustration, Ungeduld und Forderungen gehören zur Stimme des Bürgers. Bewahre sie in geeigneter formeller Sprache, aber erfinde sie nicht als Tonverstärker. Wenn der Bürger einen politischen Zusammenhang herstellt (z. B. dass ein Problem extremen Parteien Auftrieb gibt, oder dass Untätigkeit politische Folgen hat), übernimm diesen Gedanken in geeigneter formeller Sprache. Empathie und Mitgefühl des Bürgers für Betroffene gehören ebenfalls in den Brief, wenn sie im Transkript stehen.

REGEL — ZEICHENSETZUNG (nicht verhandelbar):
Verwende ausschließlich: Komma, Doppelpunkt, Klammer, Punkt.
Em-Dash (—) und En-Dash (–) sind verboten. Ersetze jeden Gedankenstrich durch das passende Satzzeichen: Komma bei weiterführendem Gedanken, Doppelpunkt bei Erläuterung, Klammer bei Einschub, Punkt bei neuem Satz.

ARGUMENTATIONSAUFBAU (nicht verhandelbar):
Der Brief führt eine zusammenhängende Argumentation, keine Aufzählung. Verbinde die 1–3 stärksten Punkte aus dem <transkript> zu einer Kette:
  1. Anlass: was ist passiert / was beschäftigt den Bürger
  2. Begründung: warum das relevant ist (für die Person, die Region, die Demokratie)
  3. Forderung: was der politische Empfänger konkret tun soll
Jeder Absatz transportiert einen logischen Schritt, nicht einen abstrakten Wert. Keine Aufzählungs-Marker wie "Erstens", "Zweitens", "Drittens". Keine drei Adjektive in Reihe. Wenn der Bürger nur einen Punkt liefert, bleib bei einem Punkt, keine künstliche Dreiteilung.

KEINE WIEDERHOLUNG (nicht verhandelbar):
Jeder Absatz bringt eine NEUE Information, einen neuen Gedanken oder eine neue Facette. Restatement derselben Aussage in anderen Worten ist ein Fehler. Beispiel-Fehler: Absatz 1 sagt "der Kiez verliert seinen Charakter", Absatz 2 sagt "das Viertel verliert seine Seele", Absatz 3 sagt "der Stadtteil verliert seine Identität". Das ist dieselbe Aussage dreimal. Lieber kürzer schreiben als denselben Punkt in neuer Verpackung wiederholen. Prüfe vor der Ausgabe: Wenn du einen Absatz streichen könntest, ohne dass eine substanzielle Aussage verloren geht, ist er Wiederholung und muss raus oder mit echter neuer Information ersetzt werden.

ZWEI-ASPEKT-SÄTZE TEILEN (Hard-Verbot für additive Doppel-Konstruktionen):
Die Wortfolge "nicht nur ... sondern" ist auf Token-Ebene komplett verboten, in jeder Variante, an jeder Stelle im Satz, auch in den Formen "nicht nur ... sondern auch ...", "nicht allein ... sondern auch ...", "nicht bloß ... sondern auch ...". Wenn du zwei Aspekte hast (z. B. persönliche Betroffenheit UND ein größerer Zusammenhang), schreibe sie in zwei aufeinanderfolgenden Sätzen:
- Satz 1 beschreibt Aspekt A direkt.
- Satz 2 beginnt mit einem neuen Subjekt oder mit "Und", "Dazu", "Zugleich", "Hinzu kommt", "Das gilt auch für ...".
Vermeide ebenso die symmetrischen Verwandten "sowohl ... als auch", "einerseits ... andererseits", "zum einen ... zum anderen": sie sind dieselbe Konstruktion in Tarnung. Punkt vor Komma: lieber zwei kurze Sätze als ein paralleler Doppel-Satz.

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
Schreibe einen formellen Brief in gepflegtem Deutsch (Sie-Form). Länge und Absatzanzahl sind in <ziel> vorgegeben. Das Wortfenster in <ziel> ist eine harte Anforderung, keine Empfehlung. Wenn der Brief zu kurz wäre: stärker ausarbeiten (Kontext, Begründung, Empathie für Betroffene), aber NIEMALS Fakten erfinden, um Wörter zu füllen. Wenn zu lang: kürze, ergänze nicht.

PFLICHT-ELEMENTE:
1. KONKRETER ANLASS in Absatz 1: ein Detail aus <transkript> (Ort, Erlebnis, Beobachtung). Wenn das Transkript keinen konkreten Anlass nennt, beschreibe das Problem persönlich-allgemein. Nichts erfinden.
2. EINE BITTE: genau ein konkretes Verb plus ein konkretes politisches Handlungsobjekt. Keine Aufzählung und keine Wunschliste. Erfinde keinen Ausschuss, kein Programm und keine Zuständigkeit. Leite die Bitte aus <transkript> ab. Nutze Angaben aus <mdb_kontext> nur, wenn sie dort verifiziert stehen.
3. SCHLUSS-SATZ vor Grußformel: eine politische Handlungs­erwartung an die Empfängerin/den Empfänger. KEINE Bitte um Antwort, KEIN Gesprächs- oder Treffen-Wunsch, KEIN "ich freue mich auf Ihre Rückmeldung". Das Ziel ist politische Wirkung, nicht Korrespondenz.

BRIEFFORMAT:
- Datum oben (TT.MM.JJJJ, das oben angegebene HEUTIGE DATUM verwenden).
- Anrede: "Sehr geehrte/r [Titel] [Name]," (Titel nur wenn vorhanden).
- Absatzanzahl gemäß <ziel>, einfache Satzstruktur (der Brief wird handschriftlich abgeschrieben).
- Schluss: "Mit freundlichen Grüßen" dann Name oder "[Ihr Name]".

TONHINWEIS:
Folge dem Register, der Beschreibung und der Verboten-Liste aus <tonalitaet>. Diese Wahl des Bürgers hat Vorrang vor deinem eigenen Urteil. Wenn der Bürger Stufe 5 (konfrontativ-aber-respektvoll) wählt, glätte den Brief NICHT auf Stufe 3 zurück.

REGELN:
- Erfinde KEINE demografischen Details (Geschlecht, Familienstand, Beruf, Kinder, Mitgliedschaften), die nicht in <transkript> oder <absender_optional> stehen.
- Erfinde KEINE Zahlen, Programmnamen, Studien, Organisationen.
- Sachlich und respektvoll, nie unterwürfig, nie aggressiv beleidigend. Tonschärfe gemäß <tonalitaet> ist explizit erlaubt.
- Mische Satzlängen. Kurze Sätze landen härter, ein längerer kann Nuancen tragen.

VOR DER AUSGABE: Lies deinen Brief einmal in Gedanken laut. Klingt das wie ein Mensch, der zum ersten Mal einen politischen Brief schreibt, oder wie ein Pressetext? Wenn Pressetext, schreibe um.

Antworte ausschließlich im JSON-Format:
{
  "political_level": "Bund" | "Land" | "Kommune",
  "selected_politician_id": <number>,
  "voice_check": "<ein Satz: warum klingt dein Brief wie ein Bürger und nicht wie ein Pressetext>",
  "letter": "<vollständiger Brieftext>"
}`;

// ---------------------------------------------------------------------------
// Level-aware Prompt-Branches (999.6, LOCK-1):
// Gemeinsame Prompt-Regeln gelten für alle Ebenen. Nur Land und Kommune bekommen
// zusätzliche ebenenspezifische Ersetzungen, und auch die nur, wenn
// LETTER_PROMPT_LEVEL_AWARE=true ist (Wave-4-Kill-Switch, LOCK-6).
// ---------------------------------------------------------------------------

// Exakte Template-Segmente, die in den Land-/Kommune-Branches ersetzt werden.
// Müssen 1:1 im SYSTEM_PROMPT_TEMPLATE vorkommen (Tests sichern das ab).
const BUND_ZUSTAENDIGKEIT_BLOCK = `ZUSTÄNDIGKEITSHINWEIS:
Alle verfügbaren Politiker sind Bundestagsabgeordnete. Wenn das Anliegen primär Landes- oder Kommunalebene betrifft, begründe im Brief kurz, warum sich der Bürger an die Bundestagsebene wendet (Gesetzgebungs­kompetenz, Förderprogramme, bundespolitischer Rahmen).`;

const BUND_ANREDE_LINE = `- Anrede: "Sehr geehrte/r [Titel] [Name]," (Titel nur wenn vorhanden).`;

const BUND_BITTE_LINE = `2. EINE BITTE: genau ein konkretes Verb plus ein konkretes politisches Handlungsobjekt. Keine Aufzählung und keine Wunschliste. Erfinde keinen Ausschuss, kein Programm und keine Zuständigkeit. Leite die Bitte aus <transkript> ab. Nutze Angaben aus <mdb_kontext> nur, wenn sie dort verifiziert stehen.`;

const BUND_MDB_CONTEXT_BLOCK = `MdB-KONTEXT NUTZEN (nur wenn <mdb_kontext> mitgeliefert):
Wenn ein Ausschuss zum Thema passt, das knapp und natürlich erwähnen ("Gerade als Mitglied des Ausschusses für ... haben Sie hier Einfluss"). Wenn eine jüngste Position zum Thema passt, knapp aufgreifen, ohne sie wörtlich zu zitieren. NIEMALS Ausschüsse, Reden oder Positionen erfinden, die nicht in <mdb_kontext> stehen.`;

const LAND_ABGEORDNETEN_CONTEXT_BLOCK = `ABGEORDNETEN-KONTEXT NUTZEN (nur wenn <mdb_kontext> mitgeliefert):
Wenn ein Ausschuss zum Thema passt, das knapp und natürlich erwähnen ("Gerade als Mitglied des Ausschusses für ... haben Sie hier Einfluss"). Wenn eine jüngste Position zum Thema passt, knapp aufgreifen, ohne sie wörtlich zu zitieren. NIEMALS Ausschüsse, Reden oder Positionen erfinden, die nicht in <mdb_kontext> stehen.`;

const LAND_ZUSTAENDIGKEIT_BLOCK = `ZUSTÄNDIGKEITSHINWEIS:
Alle verfügbaren Politiker sind Landtagsabgeordnete. Der Brief argumentiert in Landes-Logik, nicht in Bundes-Logik.

STRATEGIE FÜR DIE LAND-EBENE (nicht verhandelbar):
- Der Landtag gestaltet über Landesgesetze, den Landeshaushalt und Landtagsausschüsse. Nutze diese Landesinstrumente in der Forderung (z. B. Landesschulgesetz, Landespolizeigesetz, Krankenhausplan des Landes), aber erfinde keine Programmnamen.
- Landtagswahlkreise sind klein: der konkrete regionale Bezug aus dem <transkript> (Ort, Stadtteil) ist der stärkste Hebel.
- Fordere KEINE Bundesgesetzgebung, das wäre die falsche Ebene.
- Zitiere KEINE Grundgesetz-Artikel mit Nummern (kein "Art. 70 GG", kein "Art. 28 GG"). Allgemeine Begriffe wie "Kulturhoheit der Länder" sind erlaubt.`;

const KOMMUNE_ZUSTAENDIGKEIT_BLOCK = `ZUSTÄNDIGKEITSHINWEIS:
Der Empfänger ist das Bürgermeisteramt der Gemeinde oder in Berlin das Bezirksamt. Der Brief richtet sich an die politische Leitung der Kommune, nicht an ein Fachamt.

STRATEGIE FÜR DIE KOMMUNALE EBENE (nicht verhandelbar):
- Richte die Forderung an den politischen Handlungsmöglichkeiten der Kommune aus: kommunaler Haushalt, örtliche Planung, Infrastruktur und politische Prioritäten.
- Nenne kein Fachamt, keinen Ausschuss und keine Dienststelle, wenn sie nicht wörtlich in <transkript> stehen.
- Konkrete Orts- und Straßenangaben aus dem <transkript> sind der stärkste Hebel.
- Zitiere KEINE Grundgesetz-Artikel mit Nummern.`;

const KOMMUNE_ANREDE_LINE = `- Anrede: exakt "Sehr geehrte Damen und Herren,". Kein Name und kein Zusatz zum Amt.`;

const KOMMUNE_BITTE_LINE = `2. EINE BITTE: genau ein konkretes Verb plus ein konkretes Objekt. Keine Aufzählung und keine Wunschliste. Richte die Bitte an das Bürgermeisteramt oder Bezirksamt. Nenne kein Fachamt, keinen Ausschuss und kein Programm, das nicht im <transkript> steht.`;

const BUND_PARTEI_HEADER = `PARTEI-BEWUSSTES FRAMING (Werte, nicht Strategie):
Passe die Werte-Sprache an die Partei der Empfängerin/des Empfängers an, damit das Anliegen anschluss­fähig wird. Du benennst keine Parteien außer der adressierten und kommentierst keine Parteidynamiken.`;

const KOMMUNE_PARTEI_HEADER = `PARTEI-NEUTRALITÄT (Kommune):
Für das Bürgermeisteramt oder Bezirksamt liegen keine verifizierten Parteiinformationen vor. Verwende KEINE parteibezogene Werte-Sprache und benenne keine Parteien.`;

const BUND_PARTEI_LIST = `- SPD: Arbeitnehmerrechte, sozialer Zusammenhalt, faire Chancen.
- Grüne: Generationengerechtigkeit, Nachhaltigkeit, Lebensqualität, ökologische Verantwortung.
- CDU/CSU: Verlässlichkeit, wirtschaftliche Vernunft, Sicherheit, Bewahrung des Bewährten.
- FDP: Eigenverantwortung, Bürokratieabbau, Innovation, schlanker Staat.
- Linke: öffentliches Gut, soziale Ungleichheit, gemeinwohlorientiert.
- AfD: streng sachlich, lokale Alltagsprobleme, keine ideologische Sprache in beide Richtungen, würdige Distanz wahren.
- BSW / sonstige: rein sachlich, Fokus auf das konkrete Anliegen.`;

/** Kompetenz-Mismatch: der User schreibt bewusst an eine andere als die empfohlene Ebene. */
const LEVEL_LABELS: Record<PoliticalLevel, string> = {
  Bund: "Bundesebene (Bundestag)",
  Land: "Landesebene (Landtag)",
  Kommune: "kommunale Ebene (Bürgermeisteramt/Bezirksamt)",
};

function mismatchBlock(selected: PoliticalLevel, recommended: PoliticalLevel): string {
  const reason =
    selected === "Kommune"
      ? "öffentliche Verantwortung der Verwaltung"
      : "politisches Gewicht, öffentliche Aufmerksamkeit, Verantwortung als gewählte Stimme";
  return `

KOMPETENZ-HINWEIS (wichtig):
Der Bürger hat sich bewusst entschieden, an die ${LEVEL_LABELS[selected]} zu schreiben, obwohl sein Anliegen primär in die Zuständigkeit der ${LEVEL_LABELS[recommended]} fällt. Verschweige diese Spannung nicht: Mache früh im Brief in einem Satz transparent, dass die unmittelbare Zuständigkeit woanders liegt, und begründe, warum der Bürger trotzdem an diese Adresse schreibt (${reason}). Verspreche dem Empfänger keine Handlungsmacht, die er nicht hat.`;
}

/**
 * Baut den System-Prompt abhängig von Ebene und Flag.
 * - Flag aus ODER level=Bund: gemeinsames Grundtemplate ohne Ebenen-Ersetzungen.
 * - Land/Kommune: gezielte Block-Ersetzungen + Strategie-Block.
 * Exportiert für die Snapshot-Tests.
 */
export function buildSystemPrompt(input: GenerateLetterInput): string {
  const base = SYSTEM_PROMPT_TEMPLATE.replace("__TODAY__", todayInGerman());
  const levelAware = process.env.LETTER_PROMPT_LEVEL_AWARE === "true";
  const level: PoliticalLevel = levelAware ? input.level ?? "Bund" : "Bund";

  let prompt = base;
  if (level === "Land") {
    prompt = prompt
      .replace(BUND_ZUSTAENDIGKEIT_BLOCK, LAND_ZUSTAENDIGKEIT_BLOCK)
      .replace(BUND_MDB_CONTEXT_BLOCK, LAND_ABGEORDNETEN_CONTEXT_BLOCK);
  } else if (level === "Kommune") {
    prompt = prompt
      .replace(BUND_ZUSTAENDIGKEIT_BLOCK, KOMMUNE_ZUSTAENDIGKEIT_BLOCK)
      .replace(BUND_ANREDE_LINE, KOMMUNE_ANREDE_LINE)
      .replace(BUND_BITTE_LINE, KOMMUNE_BITTE_LINE)
      .replace(BUND_PARTEI_HEADER, KOMMUNE_PARTEI_HEADER)
      .replace(`\n${BUND_PARTEI_LIST}`, "")
      .replace(`${BUND_MDB_CONTEXT_BLOCK}\n\n`, "");
  }

  if (
    levelAware &&
    input.mismatchRecommendedLevel &&
    input.mismatchRecommendedLevel !== level
  ) {
    prompt += mismatchBlock(level, input.mismatchRecommendedLevel);
  }
  return prompt;
}

// When ctx is empty (build-time data missing, runtime fetch failed, or no
// relevant votes), the model still needs an anchor. Without one it invents
// committees and speeches (see Sven Ruttor / Jonathan Berlin review fixtures).
// The defensive block tells the model explicitly what it does NOT know.
const EMPTY_MDB_CONTEXT_BLOCK = `\n\n<mdb_kontext>\nEs liegen KEINE verifizierten Informationen über Ausschüsse, Reden oder Abstimmungen dieser/dieses Abgeordneten vor. Erwähne deshalb KEINE konkreten Ausschüsse, keine konkreten Reden und keine konkreten Abstimmungen — nur die Partei-Zugehörigkeit und den Wahlkreis aus dem <empfaenger>-Block.\n</mdb_kontext>`;

export function mdbContextBlock(ctx: MdbContext | undefined): string {
  if (!ctx || (ctx.committees.length === 0 && ctx.recentRelevant.length === 0)) {
    return EMPTY_MDB_CONTEXT_BLOCK;
  }
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

export function buildUserPrompt(
  input: GenerateLetterInput,
  minWords: number,
  maxWords: number,
  toneLevel: number
): string {
  // Kommune: der synthetische Verwaltungs-Empfänger ersetzt die Politiker-Liste.
  // Die Pseudo-ID 0 existiert nur im Prompt-Kontrakt (Antwortformat verlangt
  // selected_politician_id); sie wird nie gegen Abgeordnetenwatch-Daten geprüft.
  const empfaenger = input.rathaus
    ? [
        {
          id: 0,
          name: input.rathaus.label,
          anrede: "Sehr geehrte Damen und Herren,",
          ort:
            input.rathaus.address.source === "destatis" ||
            input.rathaus.recipientKind === "bezirksamt"
              ? `${input.rathaus.plz} ${input.rathaus.gemeindeName}`
              : "nicht eindeutig zugeordnet",
          level: input.rathaus.level,
        },
      ]
    : input.politicians.map((p) => ({
        id: p.id,
        name: `${p.title ? p.title + " " : ""}${p.firstName} ${p.lastName}`,
        party: p.party,
        wahlkreis: p.wahlkreisName,
        level: p.level,
      }));
  const politiciansJson = JSON.stringify(empfaenger, null, 2);

  // For short inputs, remind the model to stay abstract. Hallucinated vita
  // (Review 2, Jonathan) showed up most often when the citizen left little
  // material — the model fills the gap with plausible-sounding fiction.
  const shortInputHinweis =
    input.issueText.length < 200
      ? `\n\n<hinweis>\nDer Bürger hat sich knapp gehalten. Bleibe entsprechend abstrakt: keine Erlebnis-Szenen, keine Vita, keine konkreten Ortsangaben außer Stadt/Stadtteil, wenn vorhanden.\n</hinweis>`
      : "";

  const toneBlock = tonalityBlock(toneLevel);
  const contextBlock = input.rathaus ? "" : mdbContextBlock(input.mdbContext);

  return `<transkript>
${input.issueText}
</transkript>

<tonalitaet>
${toneBlock}
</tonalitaet>

<ziel>
woerter: ${minWords} bis ${maxWords}
absaetze: 3 bis 4
</ziel>

<empfaenger>
${politiciansJson}
</empfaenger>${contextBlock}${absenderBlock(input)}${shortInputHinweis}`;
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
  // Gemeinsamer Parser mit dem Level-Router (Fences, Prosa-Präfix, Brace-Extraktion)
  const parsed = extractJsonObject(content) as ParsedLetter | null;
  if (parsed === null) {
    throw new Error("Failed to parse Mistral response as JSON");
  }
  if (
    typeof parsed.letter !== "string" ||
    parsed.letter.trim().length < 10
  ) {
    throw new Error("Mistral returned empty or missing letter field");
  }
  return parsed;
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

  const systemPrompt = buildSystemPrompt(input);
  const userPrompt = buildUserPrompt(input, minWords, maxWords, toneLevel);

  const generationStart = Date.now();

  const firstResponse = await withMistralRetry("generateLetter:first", () =>
    mistral.chat.complete({
      model: MISTRAL_MODELS.letter,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      responseFormat: { type: "json_object" },
      temperature: MISTRAL_TEMPERATURE,
      maxTokens,
      frequencyPenalty: 0.3,
      presencePenalty: 0.4,
    })
  );

  let parsed = parseLetterResponse(firstResponse.choices?.[0]?.message?.content);
  let wordCount = countWords(parsed.letter);

  // Retry corridor: ±15% around the configured band. Mistral usually lands
  // close to the target; a strict band triggered costly retries (~10s extra
  // latency) that were often discarded anyway. The user-prompt still asks
  // for the original min/max as the *target* — we only soften the threshold
  // for the expensive corrective call.
  const acceptableMin = Math.floor(minWords * 0.85);
  const acceptableMax = Math.ceil(maxWords * 1.15);

  // One corrective retry if length lands outside the acceptance corridor.
  // Only retries on length, not on hallucination. Caps cost at 2× per letter.
  let retried = false;
  if (wordCount < acceptableMin || wordCount > acceptableMax) {
    retried = true;
    const directive = wordCount < acceptableMin
      ? `Der vorherige Brief hatte nur ${wordCount} Wörter. Das Zielfenster ist ${minWords}–${maxWords} Wörter. Schreibe den Brief neu mit folgendem Aufbau: (1) Anlass aus <transkript>, (2) persönliche Begründung / Betroffenheit, (3) konkrete Forderung, (4) politischer Schlussappell. Jeder Absatz MUSS eine neue, eigenständige Aussage enthalten. WIEDERHOLE NICHTS aus dem vorherigen Brief in anderen Worten. Wenn das <transkript> nicht genug Substanz für ${minWords} Wörter hergibt, akzeptiere lieber eine kürzere Länge als denselben Gedanken zu wiederholen oder Fakten zu erfinden.`
      : `Der vorherige Brief hatte ${wordCount} Wörter. Das Zielfenster ist ${minWords}–${maxWords} Wörter. Schreibe den Brief neu: kürze, ohne die Stimme oder die Kernargumente des Bürgers zu verlieren.`;

    console.warn("[generateLetter] word count out of acceptance corridor, retrying once", {
      wordCount,
      minWords,
      maxWords,
      acceptableMin,
      acceptableMax,
      lengthKey,
      direction: wordCount < acceptableMin ? "too_short" : "too_long",
    });

    const retryResponse = await withMistralRetry("generateLetter:length-retry", () =>
      mistral.chat.complete({
        model: MISTRAL_MODELS.letter,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
          { role: "assistant", content: firstResponse.choices?.[0]?.message?.content as string ?? "" },
          { role: "user", content: directive },
        ],
        responseFormat: { type: "json_object" },
        temperature: MISTRAL_TEMPERATURE,
        maxTokens,
        frequencyPenalty: 0.3,
        presencePenalty: 0.4,
      })
    );

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

  // Empfänger auflösen: Kommune hat einen vorbestimmten Verwaltungs-Empfänger
  // (keine Auswahl durch das Modell); mdb/mdl laufen über die bisherige
  // ID-Validierung (T-02-13: no arbitrary ID injection).
  let selectedRecipient: Recipient;
  let chosenPolitician: (typeof input.politicians)[number] | null = null;
  let fallbackUsed = false;

  if (input.rathaus) {
    selectedRecipient = input.rathaus;
  } else {
    const selectedPolitician = input.politicians.find(
      (p) => p.id === parsed.selected_politician_id
    );
    chosenPolitician = selectedPolitician ?? null;
    if (!chosenPolitician) {
      const fallback = input.politicians[0];
      if (!fallback) throw new Error("No politicians available");
      fallbackUsed = true;
      console.error("[generateLetter] FALLBACK politicians[0] used, Mistral returned unknown ID", {
        returnedId: parsed.selected_politician_id,
        availableIds: input.politicians.map((p) => p.id),
        availableLevels: input.politicians.map((p) => p.level),
        issueTextLength: input.issueText.length,
        fallbackPoliticianId: fallback.id,
        fallbackPoliticianName: `${fallback.firstName} ${fallback.lastName}`,
      });
      chosenPolitician = fallback;
    }
    selectedRecipient = {
      ...chosenPolitician,
      kind: chosenPolitician.level === "Land" ? "mdl" : "mdb",
    };
  }

  const mdbContextUsed = Boolean(
    !input.rathaus &&
      input.mdbContext &&
      (input.mdbContext.committees.length > 0 || input.mdbContext.recentRelevant.length > 0)
  );

  return {
    letter: parsed.letter,
    selectedRecipient,
    selectedPolitician: chosenPolitician,
    politicalLevel: selectedRecipient.level,
    wordCount,
    wordCountInRange,
    fallbackUsed,
    mdbContextUsed,
    retried,
    model: MISTRAL_MODELS.letter,
    temperature: MISTRAL_TEMPERATURE,
    generationMs: Date.now() - generationStart,
  };
}
