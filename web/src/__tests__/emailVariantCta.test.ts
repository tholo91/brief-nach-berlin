import { buildEmailHtml } from "@/lib/email/buildEmailHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

function makeParams(
  letterText = "Sehr geehrte Frau Mustermann,\n\nbitte setzen Sie sich für sichere Radwege ein.\n\nMit freundlichen Grüßen,\nMax"
): SendLetterEmailParams {
  return {
    recipientEmail: "test+variant@example.com",
    politicianName: "Erika Mustermann",
    politicianFirstName: "Erika",
    politicianLastName: "Mustermann",
    politicianTitle: null,
    politicianParty: "SPD",
    politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
    politicianAbgeordnetenwatchUrl: null,
    recipientKind: "mdb" as const,
    letterText,
    issueText: "Sichere Radwege",
  };
}

function makeDebug(): NonNullable<SendLetterEmailParams["debug"]> {
  return {
    toneLevel: 4,
    toneLabel: "scharf-pointiert",
    letterLengthKey: "1",
    letterLengthMin: 200,
    letterLengthMax: 280,
    issueTextLength: 16,
    wordCount: 100,
    wordCountInRange: false,
    fallbackUsed: false,
    retried: false,
    politicalLevel: "bund",
    representativeName: "Erika Mustermann",
    representativeWahlkreis: "Berlin",
    representativeLevel: "bund",
    representativeParty: "SPD",
    mdbContextUsed: false,
    availablePoliticianCount: 1,
    model: "mistral-large-latest",
    temperature: 0.4,
    generationMs: 1000,
    hasParty: false,
    hasNgo: false,
    usedSpeechToText: false,
    tipsOpened: false,
  };
}

describe("letter email variant CTA", () => {
  it("links to the no-storage variant flow with email only in the hash", () => {
    const html = buildEmailHtml(makeParams());

    expect(html).toContain("Nicht ganz dein Ton? Hier deinen &rarr;");
    expect(html).toContain("Briefentwurf schnell anpassen");
    expect(html).toContain(
      "https://www.brief-nach-berlin.de/brief/anpassen#email=test%2Bvariant%40example.com"
    );
    expect(html).not.toContain("briefText=");
    expect(html).not.toContain("letterText=");
    expect(html).toContain("Mit freundlichen Grüßen<br>Max");
    expect(html).not.toContain("Mit freundlichen Grüßen,<br>Max");
  });

  it("carries original tone metadata in the hash when debug data is available", () => {
    const html = buildEmailHtml({ ...makeParams(), debug: makeDebug() });

    expect(html).toContain(
      "https://www.brief-nach-berlin.de/brief/anpassen#email=test%2Bvariant%40example.com&originalToneLevel=4"
    );
    expect(html).not.toContain("briefText=");
    expect(html).not.toContain("letterText=");
  });

  it("normalizes alternative closing formulas before rendering the letter email", () => {
    const html = buildEmailHtml(
      makeParams(
        "Sehr geehrte Frau Mustermann,\n\nbitte setzen Sie sich für sichere Radwege ein.\n\nMit herzlichen Grüßen,\nMax"
      )
    );

    expect(html).toContain("Mit herzlichen Grüßen<br>Max");
    expect(html).not.toContain("Mit herzlichen Grüßen,<br>Max");
  });
});
