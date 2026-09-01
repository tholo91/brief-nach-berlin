import {
  DONATION_PATH,
  DONATION_PROVIDER_URL,
  FOUNDER_NAME,
} from "@/lib/config";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";

describe("support content", () => {
  it("keeps internal and external donation destinations separate", () => {
    expect(DONATION_PATH).toBe("/spenden");
    expect(DONATION_PROVIDER_URL).toBe("https://spende.we-aid.org/Brief-nach-Berlin");
    expect(SUPPORT_CONTENT.ctas.learnMore.href).toBe(DONATION_PATH);
    expect(SUPPORT_CONTENT.ctas.donate.href).toBe(DONATION_PROVIDER_URL);
    expect(SUPPORT_CONTENT.ctas.share.href).toBe("/weitersagen");
  });

  it("offers a non-monetary support path and related trust pages", () => {
    expect(SUPPORT_CONTENT.sharePrompt).toContain("nicht spenden");
    expect(SUPPORT_CONTENT.relatedLinks.map((item) => item.href)).toEqual([
      "/warum",
      "/brief-schreiben-wirkt",
      "/datenschutz",
    ]);
  });

  it("states the confirmed fiscal-host facts and cost categories", () => {
    expect(SUPPORT_CONTENT.fiscalHost.name).toBe("WE AID gGmbH");
    expect(SUPPORT_CONTENT.status).toContain("gemeinnützige Initiative");
    expect(SUPPORT_CONTENT.fiscalHost.text).toContain("Spendenbescheinigungen");
    expect(SUPPORT_CONTENT.founder.name).toBe(FOUNDER_NAME);
    expect(SUPPORT_CONTENT.founder.portraitPath).toBe("/images/thomas-portrait.webp");
    expect(SUPPORT_CONTENT.costCategories).toEqual([
      {
        title: "Betrieb",
        description: "Hosting, Domain, E-Mail sowie Software- und KI-Kosten.",
      },
      {
        title: "Weiterentwicklung",
        description: "Barrierearme Weiterentwicklung und Design.",
      },
      {
        title: "Reichweite",
        description:
          "Outreach, Dokumentation sowie dokumentierte Veranstaltungs- und Reisekosten.",
      },
    ]);
  });

  it("keeps the factual email notice available in every supported UI language", () => {
    expect(Object.keys(SUPPORT_EMAIL_COPY)).toEqual(["de", "en", "tr"]);
    expect(SUPPORT_EMAIL_COPY.de.status).toBe(SUPPORT_CONTENT.status);
    expect(SUPPORT_EMAIL_COPY.en.status).toContain("WE AID gGmbH");
    expect(SUPPORT_EMAIL_COPY.tr.status).toContain("WE AID gGmbH");
  });
});
