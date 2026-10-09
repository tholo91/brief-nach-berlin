jest.mock("server-only", () => ({}), { virtual: true });

const mockSendTransacEmail = jest.fn();
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: {
      sendTransacEmail: (...args: unknown[]) => mockSendTransacEmail(...args),
    },
  })),
}));

import { CONTACT } from "@/lib/contact";
import type { CreatorSurveyAnswers } from "@/lib/campaigns/creatorSurvey";

type EmailModule = typeof import("@/lib/email/sendCreatorSurveyAdminEmail");

const campaign = {
  slug: "sichere-schulwege",
  title: 'Schulwege <script>alert("t")</script>',
  creatorName: "<b>Initiative</b> \"Beispiel\"",
  creatorEmail: "creator@example.org",
};

function answers(overrides: Partial<CreatorSurveyAnswers> = {}): CreatorSurveyAnswers {
  return {
    reasons: ["handschrift"],
    concerns: ["ki_spam"],
    statements: {
      einfacherEinstieg: "stimmt",
      handschriftWirkt: "teils",
      schnellEingerichtet: null,
      wiederKampagne: "stimmt_nicht",
    },
    quote: '<script>alert("x")</script> "Zitat"',
    consentQuote: true,
    consentAggregate: false,
    helpOffers: ["gemeinsamer_post", "austausch"],
    ...overrides,
  };
}

describe("creator survey admin email", () => {
  const originalKey = process.env.BREVO_API_KEY;
  const originalThomas = process.env.THOMAS_MAIL;
  let mod: EmailModule;

  beforeAll(async () => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.THOMAS_MAIL = "thomas@example.org";
    mod = await import("@/lib/email/sendCreatorSurveyAdminEmail");
  });

  afterAll(() => {
    if (originalKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalKey;
    if (originalThomas === undefined) delete process.env.THOMAS_MAIL;
    else process.env.THOMAS_MAIL = originalThomas;
  });

  beforeEach(() => {
    mockSendTransacEmail.mockReset();
    mockSendTransacEmail.mockResolvedValue({});
  });

  it("escapes quote, campaign title and creator name", () => {
    const html = mod.buildCreatorSurveyAdminEmailHtml({ campaign, answers: answers(), isUpdate: false });

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Initiative</b>");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).toContain("&lt;b&gt;Initiative&lt;/b&gt;");
    expect(html).toContain("&quot;Beispiel&quot;");
  });

  it("puts the help offers above the reasons", () => {
    const html = mod.buildCreatorSurveyAdminEmailHtml({ campaign, answers: answers(), isUpdate: false });

    const help = html.indexOf("Einen gemeinsamen Post oder ein Reel machen");
    const reasons = html.indexOf("Handschrift statt Klick-Petition");
    expect(help).toBeGreaterThan(-1);
    expect(reasons).toBeGreaterThan(-1);
    expect(help).toBeLessThan(reasons);
  });

  it("still states at the top that nothing was offered", () => {
    const html = mod.buildCreatorSurveyAdminEmailHtml({
      campaign,
      answers: answers({ helpOffers: [] }),
      isUpdate: false,
    });

    const none = html.indexOf("Keine Hilfsangebote angekreuzt");
    expect(none).toBeGreaterThan(-1);
    expect(none).toBeLessThan(html.indexOf("Handschrift statt Klick-Petition"));
  });

  it("shows the consent flags and contains no em dash", () => {
    const html = mod.buildCreatorSurveyAdminEmailHtml({ campaign, answers: answers(), isUpdate: false });

    expect(html).toContain("Zitat mit Logo/Name freigegeben: ja");
    expect(html).toContain("Anonym in Zahlen: nein");
    expect(html).not.toContain("—");
  });

  it("sends to Thomas with the creator as reply-to", async () => {
    await expect(
      mod.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: false }),
    ).resolves.toEqual({ success: true });

    const payload = mockSendTransacEmail.mock.calls[0]![0];
    expect(payload.to).toEqual([{ email: "thomas@example.org" }]);
    expect(payload.replyTo).toEqual({ email: "creator@example.org" });
    expect(payload.tags).toEqual(["creator-survey-admin"]);
    expect(payload.subject).toBe("[BnB Ersteller-Feedback] sichere-schulwege");
  });

  it("marks updates in the subject", async () => {
    await mod.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: true });

    expect(mockSendTransacEmail.mock.calls[0]![0].subject).toBe(
      "[BnB Ersteller-Feedback] sichere-schulwege (geändert)",
    );
  });

  it("falls back to the contact address without THOMAS_MAIL", async () => {
    delete process.env.THOMAS_MAIL;
    try {
      await mod.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: false });
      expect(mockSendTransacEmail.mock.calls[0]![0].to).toEqual([{ email: CONTACT.email }]);
    } finally {
      process.env.THOMAS_MAIL = "thomas@example.org";
    }
  });

  it("resolves success false when sending fails", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      mockSendTransacEmail.mockRejectedValue(new Error("boom"));
      await expect(
        mod.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: false }),
      ).resolves.toEqual({ success: false });
    } finally {
      spy.mockRestore();
    }
  });

  it("resolves success false without throwing when BREVO_API_KEY is missing", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const saved = process.env.BREVO_API_KEY;
    delete process.env.BREVO_API_KEY;
    try {
      let isolated: EmailModule | undefined;
      await jest.isolateModulesAsync(async () => {
        isolated = await import("@/lib/email/sendCreatorSurveyAdminEmail");
      });
      await expect(
        isolated!.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: false }),
      ).resolves.toEqual({ success: false });
      expect(mockSendTransacEmail).not.toHaveBeenCalled();
    } finally {
      process.env.BREVO_API_KEY = saved;
      spy.mockRestore();
    }
  });
});
