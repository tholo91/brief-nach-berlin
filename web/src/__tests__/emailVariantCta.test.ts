import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";
import { SUPPORT_CONTENT } from "@/lib/support-content";

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
  it("keeps the first letter email free of donation asks in HTML and plaintext", () => {
    const params = makeParams();
    const donationUrl = "https://spende.we-aid.org/Brief-nach-Berlin";
    const learnMoreUrl = "https://www.brief-nach-berlin.de/spenden?src=email";
    const html = buildEmailHtml(params);
    const text = buildLetterEmailText(params);

    for (const output of [html, text]) {
      expect(output).not.toContain(donationUrl);
      expect(output).not.toContain(learnMoreUrl);
      expect(output).not.toContain("Hinweis zur Finanzierung");
      expect(output).not.toContain("Damit Brief-nach-Berlin kostenlos bleibt");
    }
    expect(SUPPORT_CONTENT.ctas.donate.label).toBe("Jetzt über WE AID spenden");
    expect(html).not.toContain(SUPPORT_CONTENT.ctas.donate.label);
    expect(html).not.toContain("über WE AID unterstützen");
    expect(text).not.toContain("über WE AID unterstützen");
  });

  it.each([
    ["en", "Donate now", "Support via WE AID"],
    ["tr", "Şimdi bağış yap", "WE AID üzerinden destekle"],
  ] as const)("keeps the %s letter email free of donation asks", (locale, label, providerLabel) => {
    const donationUrl = "https://spende.we-aid.org/Brief-nach-Berlin";
    const html = buildEmailHtml({ ...makeParams(), locale });
    const text = buildLetterEmailText({ ...makeParams(), locale });

    for (const output of [html, text]) {
      expect(output).not.toContain(donationUrl);
      expect(output).not.toContain(label);
      expect(output).not.toContain(providerLabel);
    }
  });

  it("keeps resent letter emails free of the financing notice", () => {
    const params = makeParams();
    const resentDebug = { ...makeDebug(), resent: true };
    const donationUrl = "https://spende.we-aid.org/Brief-nach-Berlin";
    const learnMoreUrl = "https://www.brief-nach-berlin.de/spenden?src=email";

    for (const url of [learnMoreUrl, donationUrl]) {
      expect(buildEmailHtml({ ...params, debug: resentDebug })).not.toContain(url);
      expect(buildLetterEmailText({ ...params, debug: resentDebug })).not.toContain(url);
    }
  });

  it("localizes the plaintext sign-off", () => {
    expect(buildLetterEmailText({ ...makeParams(), locale: "en" })).toContain(
      "Best wishes from Bremen ✌️\n\nThomas\nAn initiative by"
    );
    expect(buildLetterEmailText({ ...makeParams(), locale: "tr" })).toContain(
      "Bremen'den selamlar ✌️\n\nThomas\nBir girişim:"
    );
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

  it("carries the issue preview in the normal letter email debug URL", () => {
    const html = buildEmailHtml({
      ...makeParams(),
      debug: { ...makeDebug(), issueTextPreview: "Sichere Radwege" },
    });
    const href = html.match(/href="([^"]+\/debug\?d=[^"]+)"/)?.[1];
    expect(href).toBeDefined();

    const debugUrl = new URL(href!);
    const encoded = debugUrl.searchParams.get("d")!;
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (encoded.length % 4)) % 4);
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    expect(payload.issueTextPreview).toBe("Sichere Radwege");
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
