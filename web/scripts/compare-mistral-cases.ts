/**
 * compare-mistral-cases.ts
 *
 * Die 10 festen Testfaelle fuer scripts/compare-mistral-models.ts.
 * Alles Testdaten, keine PII. Empfaenger kommen aus den vorhandenen, reinen
 * Helfern (kein DB- oder Netz-Lookup). Kein Import von @/lib/mistral.
 */

import type { GenerateLetterInput, MdbContext } from "../src/lib/types/wizard";
import type { Politician } from "../src/lib/types/politician";
import type { RathausRecipient } from "../src/lib/lookup/rathausRecipient";
import type { GenerateLetterVariantInput } from "../src/lib/generation/generateLetterVariant";
import type { CaseView } from "./compare-mistral-shared";

export interface CaseDef extends CaseView {
  letterInput?: GenerateLetterInput;
  variantInput?: GenerateLetterVariantInput;
}

// TESTDATEN: erfundene Abgeordnete, Muster FAKE_MDB aus scripts/test-argument-chain.ts.
const FAKE_MDB: Politician = {
  id: 999001,
  politicianId: 999001,
  firstName: "Maria",
  lastName: "Beispiel",
  title: null,
  party: "SPD",
  wahlkreisId: 54,
  wahlkreisName: "Bremen I",
  level: "Bund",
  postalAddress: "Platz der Republik 1, 11011 Berlin",
  isDirect: true,
  abgeordnetenwatchUrl: null,
  committees: [],
};

// TESTDATEN: erfundener Landtagsabgeordneter, Muster aus generateLetterLevelPrompt.test.ts.
const FAKE_MDL: Politician = {
  ...FAKE_MDB,
  id: 999002,
  politicianId: 999002,
  firstName: "Karl",
  lastName: "Schmidt",
  party: "CDU",
  level: "Land",
  wahlkreisName: "Köln II",
  bundeslandKey: "NW",
  postalAddress: "Landtag Nordrhein-Westfalen, Platz des Landtags 1, 40221 Düsseldorf",
};

// TESTDATEN: Ausschuesse und eine Position sind erfunden und gehoeren zu keiner realen Person.
const TEST_MDB_CONTEXT: MdbContext = {
  committees: ["Ausschuss für Verkehr", "Ausschuss für Wohnen, Stadtentwicklung und Kommunen"],
  recentRelevant: [
    {
      date: "2026-06-12",
      title: "Antrag zur Stärkung des ÖPNV im ländlichen Raum",
      snippet: "",
    },
  ],
};

// TESTDATEN: statisch gebauter Rathaus-Empfaenger (Muster generateLetterLevelPrompt.test.ts).
const TEST_RATHAUS: RathausRecipient = {
  kind: "rathaus",
  level: "Kommune",
  recipientKind: "buergermeisteramt",
  gemeindeName: "Köln",
  plz: "50667",
  label: "Bürgermeisteramt Köln",
  postalAddress: "Bürgermeisteramt Köln",
  address: { source: "fallback" },
};

const KANZLER_WUT_TEXT =
  "Ich bin wütend. Die Pflege in diesem Land steht vor dem Zusammenbruch, und die Bundesregierung sieht zu. " +
  "Pflegekräfte arbeiten am Limit, viele hören auf, und ich merke im Alltag nichts davon, dass etwas passiert. " +
  "Wer so lange nichts tut, darf sich nicht wundern, wenn extreme Parteien immer stärker werden. " +
  "Ich verlange, dass Sie die Pflege zur Chefsache machen und endlich liefern.";

// Eigene Formulierung einer PRUEF-artigen Kampagne, sachlich, ohne Parteinamen.
const KAMPAGNE_TEXT =
  "Ich bitte Sie, im Bundesrat darauf hinzuwirken, dass die Verfassungsmäßigkeit einer Partei vom Bundesverfassungsgericht geprüft wird. " +
  "Nach dem Grundgesetz können Bundestag, Bundesrat und Bundesregierung ein solches Verfahren beantragen. " +
  "Die Entscheidung liegt dann beim Gericht und nicht bei der Politik. " +
  "Ich halte es für richtig, dass diese Frage nicht dauerhaft offen bleibt, sondern sorgfältig und nach rechtsstaatlichen Maßstäben geklärt wird. " +
  "Das Verfahren hat hohe Hürden, deshalb sollte ein Antrag auf einer gründlichen Auswertung des vorhandenen Materials beruhen. " +
  "Mir ist wichtig, dass die Länder im Bundesrat ihre Verantwortung wahrnehmen und das Thema nicht anderen überlassen. " +
  "Mir liegt der Schutz der demokratischen Grundordnung am Herzen, und ich erwarte, dass die dafür vorgesehenen rechtsstaatlichen Wege genutzt werden. " +
  "Bitte setzen Sie sich dafür ein, dass der Bundesrat die Prüfung eines solchen Antrags aufnimmt und das Ergebnis öffentlich nachvollziehbar macht.";

// Fester Referenzbrief fuer Fall 10: von Hand geschrieben, gleiche Eingabe fuer ALLE Modelle.
export const REFERENCE_LETTER = `13.11.2026

Sehr geehrte Frau Beispiel,

ich schreibe Ihnen, weil mich die Unsicherheit bei der Förderung energetischer Sanierungen stark beschäftigt. In meinem Mietshaus steht eine Modernisierung der Heizungsanlage an. Die Eigentümergesellschaft verweist auf wechselnde Förderbedingungen und hat die Entscheidung deshalb mehrfach vertagt. Eine verbindliche Auskunft haben wir bis heute nicht bekommen. Für uns Mieter bedeutet diese mangelnde Planungssicherheit, dass wir weder die künftigen Nebenkosten noch den Zeitpunkt der Umstellung einschätzen können.

Aus meiner Sicht darf die Wärmewende nicht an der Frage scheitern, wer die Investitionskosten trägt. Wenn Vermieter aus Sorge vor Kostenrisiken Maßnahmen aufschieben, bleibt die Dekarbonisierung des Gebäudebestands hinter den Erwartungen zurück, und Haushalte mit geringem Einkommen tragen am Ende die Last steigender Energiepreise. Viele Nachbarn im Haus sind älter und haben ein kleines Einkommen. Sie fragen mich, ob sie mit hohen Umlagen für die Modernisierung rechnen müssen, und ich kann ihnen keine verlässliche Antwort geben. Verlässliche Rahmenbedingungen sind deshalb die Voraussetzung für Akzeptanz und Investitionsbereitschaft.

Ich bitte Sie daher, sich im Bundestag für eine langfristig stabile und verständliche Förderkulisse einzusetzen, die die Kosten der Sanierung fair zwischen Eigentümern und Mietern verteilt. Dazu gehört, dass Mieter rechtzeitig und verständlich erfahren, mit welchen Kosten sie rechnen müssen. Nur mit klaren Regeln lässt sich das Vertrauen der Betroffenen zurückgewinnen.

Mit freundlichen Grüßen
Max Beispiel`;

const VARIANT_CHANGE_REQUEST = "Bitte in einfacherer Alltagssprache";

export async function buildCases(): Promise<CaseDef[]> {
  // Reine Helfer, kein DB-/Netz-Zugriff.
  const { getLandesregierungRecipient } = await import("../src/lib/lookup/landesregierungRecipient");
  const { getCampaignFixedRecipient } = await import("../src/lib/lookup/campaignFixedRecipient");
  const { getBundeskanzlerRecipient } = await import("../src/lib/lookup/bundeskanzlerRecipient");

  const landesregierung = getLandesregierungRecipient("NW");
  if (!landesregierung) throw new Error("Landesregierung NW nicht gefunden");

  // TESTDATEN: Test-Ministerium wie im Adult-Regression-Test.
  const fixed = getCampaignFixedRecipient({
    targetLevel: "Fixed",
    targetRecipient: {
      organizationName: "Hessisches Ministerium der Justiz und für den Rechtsstaat",
      personName: null,
      salutation: "Sehr geehrte Damen und Herren,",
      street: "Luisenstraße",
      houseNumber: "13",
      postalCode: "65185",
      city: "Wiesbaden",
      countryCode: "DE",
    },
  });
  if (!fixed) throw new Error("Fester Kampagnenempfänger konnte nicht gebaut werden");

  const mdbRecipient = "MdB (Test: Maria Beispiel, SPD, Bremen I)";

  const cases: CaseDef[] = [
    {
      id: "bund-knapp",
      label: "Bund, knapp",
      kind: "letter",
      recipientLabel: mdbRecipient,
      issueText: "Ich finde das neue Heizungsgesetz schlecht. Ich habe E-Auto und Wärmepumpe.",
      toneLevel: 3,
      lengthKey: "1",
      letterInput: {
        issueText: "Ich finde das neue Heizungsgesetz schlecht. Ich habe E-Auto und Wärmepumpe.",
        politicians: [FAKE_MDB],
        level: "Bund",
        letterLength: "1",
        toneLevel: 3,
      },
    },
    {
      id: "bund-mdb-kontext",
      label: "Bund, mit MdB-Kontext (Testdaten)",
      kind: "letter",
      recipientLabel: mdbRecipient,
      issueText:
        "Das ÖPNV-Angebot in meinem Wahlkreis ist katastrophal. Letzte Woche habe ich 90 Minuten auf den Bus gewartet, am Ende kam keiner. Ich kann mir kein Auto leisten und brauche den Bus, um zur Arbeit zu kommen.",
      toneLevel: 4,
      lengthKey: "1",
      letterInput: {
        issueText:
          "Das ÖPNV-Angebot in meinem Wahlkreis ist katastrophal. Letzte Woche habe ich 90 Minuten auf den Bus gewartet, am Ende kam keiner. Ich kann mir kein Auto leisten und brauche den Bus, um zur Arbeit zu kommen.",
        politicians: [FAKE_MDB],
        level: "Bund",
        letterLength: "1",
        toneLevel: 4,
        mdbContext: TEST_MDB_CONTEXT,
      },
    },
    {
      id: "bund-lang-persoenlich",
      label: "Bund, lang und persönlich",
      kind: "letter",
      recipientLabel: mdbRecipient,
      issueText:
        "Ich bin Krankenpfleger und arbeite seit 8 Jahren auf der Intensivstation. Ich verdiene weniger als ein Berufseinsteiger in der freien Wirtschaft. Personalnotstand. Bürokratie. Wenn das so weitergeht, kündige ich.",
      toneLevel: 5,
      lengthKey: "1.5",
      letterInput: {
        issueText:
          "Ich bin Krankenpfleger und arbeite seit 8 Jahren auf der Intensivstation. Ich verdiene weniger als ein Berufseinsteiger in der freien Wirtschaft. Personalnotstand. Bürokratie. Wenn das so weitergeht, kündige ich.",
        politicians: [FAKE_MDB],
        level: "Bund",
        letterLength: "1.5",
        toneLevel: 5,
      },
    },
    {
      id: "kanzler-wut",
      label: "Bundeskanzler, ausdrücklich wütend",
      kind: "letter",
      recipientLabel: "Bundeskanzler",
      issueText: KANZLER_WUT_TEXT,
      toneLevel: 5,
      lengthKey: "1",
      letterInput: {
        issueText: KANZLER_WUT_TEXT,
        politicians: [],
        level: "Bund",
        bundeskanzler: getBundeskanzlerRecipient(),
        letterLength: "1",
        toneLevel: 5,
      },
    },
    {
      id: "land-regierung-nrw",
      label: "Land, Landesregierung NRW",
      kind: "letter",
      recipientLabel: "Landesregierung Nordrhein-Westfalen",
      issueText:
        "An den Schulen fällt ständig Unterricht aus, weil Lehrkräfte fehlen. Viele Stunden werden nur vertreten oder gar nicht gehalten. Das geht auf Kosten der Kinder. Ich möchte, dass das Land mehr Lehrkräfte einstellt und den Unterrichtsausfall stoppt.",
      toneLevel: 3,
      lengthKey: "1",
      letterInput: {
        issueText:
          "An den Schulen fällt ständig Unterricht aus, weil Lehrkräfte fehlen. Viele Stunden werden nur vertreten oder gar nicht gehalten. Das geht auf Kosten der Kinder. Ich möchte, dass das Land mehr Lehrkräfte einstellt und den Unterrichtsausfall stoppt.",
        politicians: [],
        level: "Land",
        landesregierung,
        letterLength: "1",
        toneLevel: 3,
      },
    },
    {
      id: "land-abgeordnete",
      label: "Land, Landtagsabgeordneter (Test)",
      kind: "letter",
      recipientLabel: "MdL (Test: Karl Schmidt, CDU, Köln II)",
      issueText:
        "Das Krankenhaus in unserem Landkreis soll schließen. Dann ist die nächste Notaufnahme weit weg, und im Notfall zählt jede Minute. Ältere Menschen und Familien auf dem Land trifft das am härtesten. Bitte setzen Sie sich dafür ein, dass das Krankenhaus erhalten bleibt.",
      toneLevel: 2,
      lengthKey: "1",
      letterInput: {
        issueText:
          "Das Krankenhaus in unserem Landkreis soll schließen. Dann ist die nächste Notaufnahme weit weg, und im Notfall zählt jede Minute. Ältere Menschen und Familien auf dem Land trifft das am härtesten. Bitte setzen Sie sich dafür ein, dass das Krankenhaus erhalten bleibt.",
        politicians: [FAKE_MDL],
        level: "Land",
        letterLength: "1",
        toneLevel: 2,
      },
    },
    {
      id: "kommune-rathaus",
      label: "Kommune, Rathaus",
      kind: "letter",
      recipientLabel: "Bürgermeisteramt (Test)",
      issueText: "Die Schlaglöcher in der Goethestraße sind gefährlich, vor allem für Radfahrer. Bitte lassen Sie die Straße reparieren.",
      toneLevel: 3,
      lengthKey: "1",
      letterInput: {
        issueText: "Die Schlaglöcher in der Goethestraße sind gefährlich, vor allem für Radfahrer. Bitte lassen Sie die Straße reparieren.",
        politicians: [],
        level: "Kommune",
        rathaus: TEST_RATHAUS,
        letterLength: "1",
        toneLevel: 3,
      },
    },
    {
      id: "kampagne-fest",
      label: "Kampagne, fester Empfänger, langer Text",
      kind: "letter",
      recipientLabel: "Festes Ministerium (Test)",
      issueText: KAMPAGNE_TEXT,
      toneLevel: 3,
      lengthKey: "1",
      letterInput: {
        issueText: KAMPAGNE_TEXT,
        politicians: [],
        level: "Fixed",
        campaignFixedRecipient: fixed,
        preclassifiedTopic: null,
        letterLength: "1",
        toneLevel: 3,
      },
    },
    {
      id: "jung-klasse8",
      label: "Jugendbrief, Klasse 8",
      kind: "letter",
      recipientLabel: mdbRecipient,
      issueText: "Bei uns in der Schule fällt oft Unterricht aus und die Toiletten sind kaputt. Das nervt alle. Bitte kümmern Sie sich darum.",
      toneLevel: 3,
      lengthKey: "Klasse 8 (150 bis 200 Wörter)",
      letterInput: {
        issueText: "Bei uns in der Schule fällt oft Unterricht aus und die Toiletten sind kaputt. Das nervt alle. Bitte kümmern Sie sich darum.",
        politicians: [FAKE_MDB],
        level: "Bund",
        youth: { klasse: 8, viaClassLink: true },
        toneLevel: 3,
      },
    },
    {
      id: "variante-einfach",
      label: "Variante: einfachere Alltagssprache",
      kind: "variant",
      recipientLabel: "(Variante eines Referenzbriefs an MdB)",
      issueText: VARIANT_CHANGE_REQUEST,
      toneLevel: 3,
      lengthKey: "1",
      extra: [{ title: "Referenzbrief (Eingabe für alle Modelle)", text: REFERENCE_LETTER }],
      variantInput: {
        originalLetter: REFERENCE_LETTER,
        changeRequest: VARIANT_CHANGE_REQUEST,
        toneLevel: 3,
        letterLength: "1",
      },
    },
  ];

  return cases;
}
