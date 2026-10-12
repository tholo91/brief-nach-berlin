import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
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
    expect(html).toContain("Mein Soloprojekt erhalten");
    expect(html).toContain('margin-right:6px;">Jetzt spenden');
    expect(html).toContain(
      "Ich baue Brief-nach-Berlin allein und ehrenamtlich in meiner Freizeit und trage die laufenden Kosten bisher selbst.",
    );
    expect(html).toContain("über WE AID unterstützen");
    expect(text).toContain("Mein Soloprojekt erhalten");
    expect(text).toContain("Jetzt spenden");
    expect(text).toContain("über WE AID unterstützen");
    expect(SUPPORT_CONTENT.ctas.donate.label).toBe("Jetzt über WE AID spenden");
    expect(html).not.toContain(SUPPORT_CONTENT.ctas.donate.label);
    expect(html).toContain("Mehr Informationen");
    expect(html).toContain("gemeinnützige Initiative in Trägerschaft der WE AID gGmbH");
    expect(text).toContain("Hinweis zur Finanzierung: Brief-nach-Berlin ist eine gemeinnützige Initiative in Trägerschaft der WE AID gGmbH.");
    expect(text.indexOf("Thomas")).toBeLessThan(text.indexOf("Hinweis zur Finanzierung"));
  });

  it.each([
    ["en", "Donate now", "Support via WE AID"],
    ["tr", "Şimdi bağış yap", "WE AID üzerinden destekle"],
  ] as const)("uses the compact button copy for %s letter email while keeping the heart decorative", (locale, label, providerLabel) => {
    const html = buildEmailHtml({ ...makeParams(), locale });
    const donationUrl = "https://spende.we-aid.org/Brief-nach-Berlin";
    const button = html.match(new RegExp(`<a href="${donationUrl}"[\\s\\S]*?</a>`))?.[0];

    expect(button).toContain("icon-heart-white.png");
    expect(button).toContain(label);
    expect(button?.indexOf("icon-heart-white.png") ?? -1).toBeLessThan(button?.indexOf(label) ?? -1);
    expect(html).toContain(providerLabel);
  });

  it("adds the financing notice to resent letter emails but not follow-up emails", () => {
    const params = makeParams();
    const resentDebug = { ...makeDebug(), resent: true };
    const learnMoreUrl = "https://www.brief-nach-berlin.de/spenden?src=email";

    expect(buildEmailHtml({ ...params, debug: resentDebug })).toContain(learnMoreUrl);
    expect(buildLetterEmailText({ ...params, debug: resentDebug })).toContain(learnMoreUrl);
    expect(buildFollowupHtml({ token: "signed-token" }).html).not.toContain(learnMoreUrl);
    expect(buildFollowupHtml({ token: "signed-token" }).text).not.toContain(learnMoreUrl);
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
