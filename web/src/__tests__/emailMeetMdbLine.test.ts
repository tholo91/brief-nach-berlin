jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: jest.fn() },
  })),
}));
jest.mock("@/lib/feedback/token", () => ({
  signFeedbackToken: jest.fn(() => "signed-feedback-token"),
}));

import { buildEmailHtml } from "@/lib/email/buildEmailHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";
import { lookupPLZ } from "@/lib/lookup/plzLookup";
import { lookupMdbContactByIdAction } from "@/lib/actions/lookupMdbContact";

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

  it("mdb: Link trägt die MdB-ID und weder PLZ noch Token", () => {
    const html = buildEmailHtml(
      params({
        politicianId: 123,
        feedbackToken: "geheim-token",
        deleteUrl: "https://brief-nach-berlin.de/datenloeschen?t=loeschtoken",
        debug: { plz: "28195" } as never,
      }),
    );
    const href = html.match(/href="([^"]*aktiv-werden\?mdb=[^"]*)"/)?.[1];
    expect(href).toBeDefined();
    expect(href).toMatch(/\/aktiv-werden\?mdb=123#wahlkreisbuero$/);
    for (const forbidden of ["28195", "plz", "geheim-token", "loeschtoken", "t="]) {
      expect(href).not.toContain(forbidden);
    }
  });

  it("mdb: ohne politicianId bleibt der Link ohne Query", () => {
    const html = buildEmailHtml(params({}));
    const href = html.match(/href="([^"]*aktiv-werden#wahlkreisbuero[^"]*)"/)?.[1];
    expect(href).toBeDefined();
    expect(href).toMatch(/\/aktiv-werden#wahlkreisbuero$/);
    expect(href).not.toContain("?");
  });

  it("mdl: keine MdB-ID im Link", () => {
    const html = buildEmailHtml(params({ recipientKind: "mdl", politicianId: 5 }));
    expect(html).not.toContain("?mdb=");
  });

  it("Roundtrip: ID aus dem Mail-Link liefert über die Server-Action denselben MdB", async () => {
    const originalBrevoKey = process.env.BREVO_API_KEY;
    process.env.BREVO_API_KEY = "test-key";
    try {
      const { prepareLetterEmail } = await import("@/lib/email/sendLetterEmail");
      const politician = lookupPLZ("28195").politicians[0];
      const { params: prepared } = prepareLetterEmail({
        recipientEmail: "test@example.org",
        recipient: { ...politician, kind: "mdb" as const },
        letterText: "Sehr geehrte Damen und Herren,\n\nTest.",
        issueText: "Testanliegen",
        debug: {} as never,
      });
      expect(prepared.politicianId).toBe(politician.id);

      const capturedId = buildEmailHtml(prepared).match(
        /aktiv-werden\?mdb=(\d+)#wahlkreisbuero/,
      )?.[1];
      expect(capturedId).toBeDefined();

      const result = await lookupMdbContactByIdAction(Number(capturedId));
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.contacts[0].id).toBe(politician.id);
        expect(result.contacts[0].name.length).toBeGreaterThan(0);
      }
    } finally {
      if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
      else process.env.BREVO_API_KEY = originalBrevoKey;
    }
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
