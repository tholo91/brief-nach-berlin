import { buildEmailHtml } from "@/lib/email/buildEmailHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

const ANCHOR = "/aktiv-werden#wahlkreisbuero";

function params(overrides: Partial<SendLetterEmailParams>): SendLetterEmailParams {
  return {
    recipientEmail: "test@example.org",
    politicianName: "Anna Müller",
    politicianFirstName: "Anna",
    politicianLastName: "Müller",
    politicianTitle: null,
    politicianParty: "SPD",
    politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
    politicianAbgeordnetenwatchUrl: null,
    recipientKind: "mdb",
    letterText: "Sehr geehrte Frau Müller,\n\nTestbrief.\n\nMit freundlichen Grüßen",
    issueText: "Testanliegen",
    ...overrides,
  };
}

describe("buildEmailHtml - MdB-Zeile Wahlkreisbüro", () => {
  it("mdb: Link auf Wahlkreisbüro-Anker und Name im Intro", () => {
    const html = buildEmailHtml(params({}));
    expect(html).toContain(`${ANCHOR}"`);
    expect(html).toContain("Du willst Anna Müller auch persönlich sprechen?");
    expect(html).toContain("Hier findest du das Wahlkreisbüro und die Bürgersprechstunde.");
  });

  it("mdb: Titel und Name werden HTML-escaped", () => {
    const html = buildEmailHtml(
      params({ politicianTitle: "Dr.", politicianName: "Anna <b>Müller</b>" }),
    );
    expect(html).toContain("Du willst Dr. Anna &lt;b&gt;Müller&lt;/b&gt; auch persönlich sprechen?");
  });

  it("mdb: Link ohne Query-Parameter", () => {
    const html = buildEmailHtml(params({}));
    const href = html.match(/href="([^"]*aktiv-werden#wahlkreisbuero[^"]*)"/)?.[1];
    expect(href).toBeDefined();
    expect(href).not.toContain("?");
  });

  it.each(["mdl", "rathaus", "campaign_fixed", "mdb_later"] as const)(
    "%s: keine Wahlkreisbüro-Zeile, allgemeiner aktiv-werden-Link bleibt",
    (recipientKind) => {
      const html = buildEmailHtml(params({ recipientKind }));
      expect(html).not.toContain(ANCHOR);
      expect(html).toContain('/aktiv-werden"');
    },
  );

  it.each([
    ["en", "Want to talk to Anna Müller in person?"],
    ["tr", "Anna Müller ile yüz yüze görüşmek ister misiniz?"],
  ] as const)("mdb: %s-Locale", (locale, intro) => {
    const html = buildEmailHtml(params({ locale }));
    expect(html).toContain(intro);
    expect(html).toContain(ANCHOR);
  });
});
