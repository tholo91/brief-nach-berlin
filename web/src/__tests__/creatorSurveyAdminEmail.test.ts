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
      todoHandeln: "stimmt",
    },
    quote: '<script>alert("x")</script> "Zitat"',
    consentQuote: true,
    consentAggregate: false,
    helpOffers: ["gemeinsamer_post", "austausch"],
    expectation: "mehr",
    outcomes: ["medienbericht", "antwort_politik"],
    outcomesNote: '<i>Radio</i> "morgen"',
    quoteMode: "named",
    anonymousLabel: null,
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
    const html = mod.buildCreatorSurveyAdminEmailHtml({ campaign, answers: answers(), isUpdate: false, createdByFounder: false });

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Initiative</b>");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).toContain("&lt;b&gt;Initiative&lt;/b&gt;");
    expect(html).toContain("&quot;Beispiel&quot;");
  });

  it("puts the help offers above the reasons", () => {
    const html = mod.buildCreatorSurveyAdminEmailHtml({ campaign, answers: answers(), isUpdate: false, createdByFounder: false });

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
      createdByFounder: false,
    });

    const none = html.indexOf("Keine Hilfsangebote angekreuzt");
    expect(none).toBeGreaterThan(-1);
    expect(none).toBeLessThan(html.indexOf("Handschrift statt Klick-Petition"));
  });

  it("shows the consent flags and contains no em dash", () => {
    const html = mod.buildCreatorSurveyAdminEmailHtml({ campaign, answers: answers(), isUpdate: false, createdByFounder: false });

    expect(html).toContain("Zitat freigegeben: mit Logo und Name");
    expect(html).not.toContain("Zitat mit Logo/Name freigegeben");
    expect(html).toContain("Anonym in Zahlen: nein");
    expect(html).not.toContain("—");
  });

  it("states the three quote consent variants", () => {
    const build = (overrides: Partial<CreatorSurveyAnswers>) =>
      mod.buildCreatorSurveyAdminEmailHtml({
        campaign,
        answers: answers(overrides),
        isUpdate: false,
        createdByFounder: false,
      });

    expect(build({ consentQuote: false, quoteMode: null })).toContain("Zitat freigegeben: nein");
    expect(build({ quoteMode: "named" })).toContain("Zitat freigegeben: mit Logo und Name");
    expect(build({ quoteMode: "anonymous", anonymousLabel: "eine Umwelt-NGO aus NRW" })).toContain(
      "Zitat freigegeben: anonym als „eine Umwelt-NGO aus NRW“",
    );
    expect(build({ quoteMode: "anonymous", anonymousLabel: null })).toContain(
      "Zitat freigegeben: anonym als „eine Initiative“",
    );
    expect(build({ quoteMode: "anonymous", anonymousLabel: '<b>"x"</b>' })).toContain(
      "anonym als „&lt;b&gt;&quot;x&quot;&lt;/b&gt;“",
    );
  });

  it("shows the founder line, expectation, outcomes with an escaped note and the To-Do statement", () => {
    const founder = mod.buildCreatorSurveyAdminEmailHtml({
      campaign,
      answers: answers(),
      isUpdate: false,
      createdByFounder: true,
    });
    expect(founder).toContain("Von Thomas aufgesetzt: ja");
    expect(founder).toContain("Briefe im Vergleich zur Erwartung");
    expect(founder).toContain("Mehr als erwartet");
    expect(founder).toContain("Ergebnisse gehört");
    expect(founder).toContain("Medienbericht");
    expect(founder).toContain("Antwort aus der Politik");
    expect(founder).toContain("&lt;i&gt;Radio&lt;/i&gt; &quot;morgen&quot;");
    expect(founder).not.toContain("<i>Radio</i>");
    expect(founder).toContain("Ein konkretes To-Do hat unsere Leute ins Handeln gebracht.");

    const plain = mod.buildCreatorSurveyAdminEmailHtml({
      campaign,
      answers: answers({ expectation: null, outcomes: [], outcomesNote: null }),
      isUpdate: false,
      createdByFounder: false,
    });
    expect(plain).toContain("Von Thomas aufgesetzt: nein");
    expect(plain).toContain("keine Angabe");
    expect(plain).toContain("Nichts angekreuzt");
  });

  it("sends to Thomas with the creator as reply-to", async () => {
    await expect(
      mod.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: false, createdByFounder: false }),
    ).resolves.toEqual({ success: true });

    const payload = mockSendTransacEmail.mock.calls[0]![0];
    expect(payload.to).toEqual([{ email: "thomas@example.org" }]);
    expect(payload.replyTo).toEqual({ email: "creator@example.org" });
    expect(payload.tags).toEqual(["creator-survey-admin"]);
    expect(payload.subject).toBe("[BnB Ersteller-Feedback] sichere-schulwege");
  });

  it("marks updates in the subject", async () => {
    await mod.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: true, createdByFounder: false });

    expect(mockSendTransacEmail.mock.calls[0]![0].subject).toBe(
      "[BnB Ersteller-Feedback] sichere-schulwege (geändert)",
    );
  });

  it("falls back to the contact address without THOMAS_MAIL", async () => {
    delete process.env.THOMAS_MAIL;
    try {
      await mod.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: false, createdByFounder: false });
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
        mod.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: false, createdByFounder: false }),
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
        isolated!.sendCreatorSurveyAdminEmail({ campaign, answers: answers(), isUpdate: false, createdByFounder: false }),
      ).resolves.toEqual({ success: false });
      expect(mockSendTransacEmail).not.toHaveBeenCalled();
    } finally {
      process.env.BREVO_API_KEY = saved;
      spy.mockRestore();
    }
  });
});
