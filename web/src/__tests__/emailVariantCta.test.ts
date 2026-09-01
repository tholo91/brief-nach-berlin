import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
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
  it("adds the donation CTA once to the first letter email HTML and plaintext", () => {
    const params = makeParams();
    const donationUrl = "https://spende.we-aid.org/Brief-nach-Berlin";
    const learnMoreUrl = "https://www.brief-nach-berlin.de/spenden?src=email";
    const html = buildEmailHtml(params);
    const text = buildLetterEmailText(params);

    expect(html.match(new RegExp(donationUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(1);
    expect(text.match(new RegExp(donationUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(1);
    expect(html.match(new RegExp(learnMoreUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(1);
    expect(text.match(new RegExp(learnMoreUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(1);
    expect(html).toContain("Brief-nach-Berlin unterstützen");
    expect(html).toContain("Brief-nach-Berlin unterstützen ❤️");
    expect(html).toContain("Mein Projekt soll weiterhin für alle kostenlos und unabhängig bleiben.");
    expect(html).toContain("Jetzt über WE AID spenden");
    expect(html).toContain("Mehr Informationen");
    expect(html).toContain("gemeinnützige Initiative in Trägerschaft der WE AID gGmbH");
    expect(text).toContain("Hinweis zur Finanzierung: Brief-nach-Berlin ist eine gemeinnützige Initiative in Trägerschaft der WE AID gGmbH.");
    expect(text.indexOf("Thomas")).toBeLessThan(text.indexOf("Hinweis zur Finanzierung"));
  });

  it("does not add the financing notice to a resent/follow-up letter email", () => {
    const params = makeParams();
    const resentDebug = { ...makeDebug(), resent: true };
    const learnMoreUrl = "https://www.brief-nach-berlin.de/spenden?src=email";

    expect(buildEmailHtml({ ...params, debug: resentDebug })).not.toContain(learnMoreUrl);
    expect(buildLetterEmailText({ ...params, debug: resentDebug })).not.toContain(learnMoreUrl);
    expect(buildFollowupHtml({ token: "signed-token" }).html).not.toContain(learnMoreUrl);
    expect(buildFollowupHtml({ token: "signed-token" }).text).not.toContain(learnMoreUrl);
  });

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
