const mockSendTransacEmail = jest.fn();
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: (...args: unknown[]) => mockSendTransacEmail(...args) },
  })),
}));

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { APP_URL } from "@/lib/config";
import { BRIEF_EMAIL } from "@/lib/contact";
import { verifyDataDeletionToken } from "@/lib/dataDeletion/token";
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
  it("documents outcome feedback data, separate explicit consent, retention, and deletion", () => {
    const policy = readFileSync(join(process.cwd(), "src/app/(site)/datenschutz/page.tsx"), "utf8");

    expect(policy).toContain('id="rueckmeldungen"');
    expect(policy).toContain("18. Rückmeldung zur letzten E-Mail");
    expect(policy).toContain("E-Mail-Adresse, den Versandjahrgang und Ihre Auswahl");
    expect(policy).toContain("Hash der IP-Adresse");
    expect(policy).toContain("gesonderte ausdrückliche Einwilligung");
    expect(policy).toContain("Zeitpunkt Ihrer Einwilligung");
    expect(policy).toContain("Supabase gespeichert (Details siehe Abschnitt 17)");
    expect(policy).toContain("Art. 9 Abs. 2 lit. a DSGVO");
    expect(policy).toContain("höchstens 24 Monate. Eine tägliche");
    expect(policy).toContain("Rückmeldedaten über den persönlichen Link");
    expect(policy).toContain("Stand: 14. Oktober 2026");
  });

  it("builds a prefilled deletion email for the project mailbox", () => {
    const mailto = buildDataDeletionMailto("de");

    expect(mailto).toMatch(new RegExp(`^mailto:${BRIEF_EMAIL}\\?`));
    expect(decodeURIComponent(mailto)).toContain("Bewertungen");
    expect(decodeURIComponent(mailto)).toContain("Mir ist bewusst");
    expect(mailto).not.toContain("datenschutz@brief-nach-berlin.de");
    expect(mailto).not.toContain("thomas_lorenz@posteo.de");
  });

  it.each(["de", "en", "tr"] as const)(
    "links the tokenless deletion page in the %s follow-up mail by default",
    (locale) => {
      const mailto = buildDataDeletionMailto(locale);
      const followup = buildFollowupHtml({ token: "signed-token", locale });

      expect(followup.html).toContain(`href="${APP_URL}/datenloeschen"`);
      expect(followup.text).toContain(`${APP_URL}/datenloeschen`);
      expect(followup.html).not.toContain(mailto);
      expect(followup.text).not.toContain(mailto);
      expect(followup.html).not.toContain("datenschutz@brief-nach-berlin.de");
      expect(followup.html).not.toContain("thomas_lorenz@posteo.de");
      expect(getEmailCopy(locale).followup.oneOff).toMatch(/Newsletter|newsletter|bülten/);
      expect(followup.html).toContain(getEmailCopy(locale).followup.oneOff);
    },
  );

  it("puts a given personal deletion link into the follow-up HTML and text footers", () => {
    const deleteUrl = `${APP_URL}/datenloeschen?t=abc.def`;
    const followup = buildFollowupHtml({ token: "signed-token", locale: "de", deleteUrl });

    expect(followup.html).toContain(`href="${deleteUrl}"`);
    expect(followup.text).toContain(`Meine gespeicherten Daten löschen: ${deleteUrl}`);
  });

  describe("sendFollowupEmail", () => {
    const originalBrevoKey = process.env.BREVO_API_KEY;
    const originalSecret = process.env.FEEDBACK_TOKEN_SECRET;
    let send: typeof import("@/lib/email/sendFollowupEmail").sendFollowupEmail;

    beforeAll(async () => {
      process.env.BREVO_API_KEY = "test-key";
      process.env.FEEDBACK_TOKEN_SECRET = "test-feedback-secret";
      ({ sendFollowupEmail: send } = await import("@/lib/email/sendFollowupEmail"));
    });

    afterAll(() => {
      if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
      else process.env.BREVO_API_KEY = originalBrevoKey;
      if (originalSecret === undefined) delete process.env.FEEDBACK_TOKEN_SECRET;
      else process.env.FEEDBACK_TOKEN_SECRET = originalSecret;
    });

    it("mints a personal deletion token for the recipient", async () => {
      mockSendTransacEmail.mockResolvedValue({ messageId: "m1" });

      await send({ recipientEmail: "Person@Example.org", feedbackToken: "t", scheduledAt: new Date() });

      const payload = mockSendTransacEmail.mock.calls[0][0] as { htmlContent: string; textContent: string };
      for (const content of [payload.htmlContent, payload.textContent]) {
        expect(content).toContain(`${APP_URL}/datenloeschen?t=`);
      }
      const token = /datenloeschen\?t=([A-Za-z0-9_.-]+)/.exec(payload.textContent)?.[1] ?? "";
      expect(verifyDataDeletionToken(token)).toEqual({ email: "person@example.org" });
    });
  });

  it("announces only the rating follow-up in the letter email", () => {
    const html = buildEmailHtml(params);
    const text = buildLetterEmailText(params);

    expect(html).toContain("Dein Brief und dein Anliegen werden nicht gespeichert");
    expect(text).toContain("In 2-3 Tagen kommt nur noch eine Mail");
    expect(html).toContain("Kein Newsletter");
    expect(text).toContain("Kein Newsletter");
  });

  it("links the tokenless deletion page in the last-call mail by default", () => {
    const lastcall = buildLastcallHtml();
    const mailto = buildDataDeletionMailto("de");

    expect(lastcall.html).toContain(`href="${APP_URL}/datenloeschen"`);
    expect(lastcall.text).toContain(`${APP_URL}/datenloeschen`);
    expect(lastcall.html).not.toContain(mailto);
    expect(lastcall.text).not.toContain(mailto);
    expect(lastcall.html).toContain("Das ist meine letzte automatische Mail an dich.");
  });

  it("puts a given personal deletion link into the last-call HTML and text", () => {
    const deleteUrl = `${APP_URL}/datenloeschen?t=abc.def`;
    const lastcall = buildLastcallHtml({ deleteUrl });

    expect(lastcall.html).toContain(`href="${deleteUrl}"`);
    expect(lastcall.text).toContain(deleteUrl);
    expect(lastcall.html).toContain("Das ist meine letzte automatische Mail an dich.");
  });

  it("links the tokenless deletion page in the letter mail by default", () => {
    expect(buildEmailHtml(params)).toContain(`href="${APP_URL}/datenloeschen"`);
    expect(buildLetterEmailText(params)).toContain(`Meine gespeicherten Daten löschen: ${APP_URL}/datenloeschen`);
  });

  it("puts a given personal deletion link into the letter mail HTML and text", () => {
    const deleteUrl = `${APP_URL}/datenloeschen?t=abc.def`;

    expect(buildEmailHtml({ ...params, deleteUrl })).toContain(`href="${deleteUrl}"`);
    expect(buildLetterEmailText({ ...params, deleteUrl })).toContain(`Meine gespeicherten Daten löschen: ${deleteUrl}`);
  });

  describe("sendLetterEmail", () => {
    const originalBrevoKey = process.env.BREVO_API_KEY;
    const originalSecret = process.env.FEEDBACK_TOKEN_SECRET;
    let send: typeof import("@/lib/email/sendLetterEmail").sendLetterEmail;

    beforeAll(async () => {
      process.env.BREVO_API_KEY = "test-key";
      process.env.FEEDBACK_TOKEN_SECRET = "test-feedback-secret";
      ({ sendLetterEmail: send } = await import("@/lib/email/sendLetterEmail"));
    });

    afterAll(() => {
      if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
      else process.env.BREVO_API_KEY = originalBrevoKey;
      if (originalSecret === undefined) delete process.env.FEEDBACK_TOKEN_SECRET;
      else process.env.FEEDBACK_TOKEN_SECRET = originalSecret;
    });

    it("mints a personal deletion token for the recipient", async () => {
      mockSendTransacEmail.mockReset();
      mockSendTransacEmail.mockResolvedValue({ messageId: "m1" });

      await send({ ...params, recipientEmail: "Person@Example.org" });

      const payload = mockSendTransacEmail.mock.calls[0][0] as { htmlContent: string; textContent: string };
      for (const content of [payload.htmlContent, payload.textContent]) {
        expect(content).toContain(`${APP_URL}/datenloeschen?t=`);
      }
      const token = /datenloeschen\?t=([A-Za-z0-9_.-]+)/.exec(payload.textContent)?.[1] ?? "";
      expect(verifyDataDeletionToken(token)).toEqual({ email: "person@example.org" });
    });
  });
});
