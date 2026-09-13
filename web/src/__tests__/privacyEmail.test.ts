import { BRIEF_EMAIL } from "@/lib/contact";
import { buildEmailHtml, buildLetterEmailText } from "@/lib/email/buildEmailHtml";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import { buildLastcallHtml } from "@/lib/email/buildLastcallHtml";
import { buildDataDeletionMailto, getEmailCopy } from "@/lib/email/mailLocale";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

const params: SendLetterEmailParams = {
  locale: "de",
  recipientEmail: "test@example.org",
  politicianName: "Anna Müller",
  politicianFirstName: "Anna",
  politicianLastName: "Müller",
  politicianTitle: null,
  politicianParty: "SPD",
  politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
  politicianAbgeordnetenwatchUrl: null,
  recipientKind: "mdb",
  letterText: "Sehr geehrte Frau Müller,\n\nTestbrief.",
  issueText: "Testanliegen",
};

describe("privacy email contact", () => {
  it("builds a prefilled deletion email for the project mailbox", () => {
    const mailto = buildDataDeletionMailto("de");

    expect(mailto).toMatch(new RegExp(`^mailto:${BRIEF_EMAIL}\\?`));
    expect(decodeURIComponent(mailto)).toContain("Bewertungen");
    expect(decodeURIComponent(mailto)).toContain("Mir ist bewusst");
    expect(mailto).not.toContain("datenschutz@brief-nach-berlin.de");
    expect(mailto).not.toContain("thomas_lorenz@posteo.de");
  });

  it.each(["de", "en", "tr"] as const)(
    "uses the same deletion target in the %s follow-up mail",
    (locale) => {
      const mailto = buildDataDeletionMailto(locale);
      const followup = buildFollowupHtml({ token: "signed-token", locale });

      expect(followup.html).toContain(`href="${mailto}"`);
      expect(followup.html).not.toContain("datenschutz@brief-nach-berlin.de");
      expect(followup.html).not.toContain("thomas_lorenz@posteo.de");
      expect(getEmailCopy(locale).followup.oneOff).toMatch(/Newsletter|newsletter|bülten/);
    },
  );

  it("keeps the three-message explanation in the letter email", () => {
    const html = buildEmailHtml(params);
    const text = buildLetterEmailText(params);

    expect(html).toContain("höchstens drei automatische E-Mails");
    expect(text).toContain("höchstens drei automatische E-Mails");
    expect(html).toContain("Kein Newsletter");
    expect(text).toContain("Kein Newsletter");
  });

  it("uses the same deletion mailto in the last-call mail", () => {
    const lastcall = buildLastcallHtml();
    const mailto = buildDataDeletionMailto("de");

    expect(lastcall.html).toContain(`href="${mailto}"`);
    expect(lastcall.text).toContain(mailto);
    expect(lastcall.html).toContain("dritte und letzte automatische Mail");
  });
});
