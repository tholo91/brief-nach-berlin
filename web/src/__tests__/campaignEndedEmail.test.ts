const mockSendTransacEmail = jest.fn();
jest.mock("@getbrevo/brevo", () => ({
  BrevoClient: jest.fn().mockImplementation(() => ({
    transactionalEmails: { sendTransacEmail: (...args: unknown[]) => mockSendTransacEmail(...args) },
  })),
}));

import { APP_URL, DONATION_PROVIDER_URL, FOUNDER_EMAIL } from "@/lib/config";
import { creatorSurveyUrl } from "@/lib/campaigns/creatorSurvey";
import { buildCampaignCreatorEmailHtml } from "@/lib/email/buildCampaignCreatorEmailHtml";

const base = {
  kind: "ended" as const,
  campaignTitle: "Unterschrift ist kein Dienstvergehen",
  slug: "unterschrift-ist-kein-dienstvergehen",
  campaignUrl: `${APP_URL}/kampagne/unterschrift-ist-kein-dienstvergehen`,
  actionUrl: `${APP_URL}/kampagne/verwalten?token=test`,
  creatorName: "Stephanie",
};

const ended = {
  count: 90,
  imageUrl: `${APP_URL}/kampagne/unterschrift-ist-kein-dienstvergehen/meilenstein/90/bild`,
  downloadUrl: `${APP_URL}/kampagne/unterschrift-ist-kein-dienstvergehen/meilenstein/90/bild?download=1`,
  feedbackUrl: creatorSurveyUrl("test"),
};

function build(overrides: Record<string, unknown> = {}) {
  return buildCampaignCreatorEmailHtml({ ...base, ended, ...overrides });
}

describe("campaign ended creator email", () => {
  it("renders the approved copy with count, image and share box", () => {
    const html = build();

    expect(html).toContain("Moin Stephanie,");
    expect(html).toContain(
      "deine Kampagne ist beendet. 90 Briefe sind darüber entstanden: So viele Menschen haben deine Argumente aufgegriffen und daraus ihren eigenen, persönlichen Brief geschrieben. Danke, dass du das angestoßen hast.",
    );
    expect(html).toContain(
      "Wenn du magst, teil deinen Erfolg auf Instagram, LinkedIn oder WhatsApp. Das Bild dafür ist schon fertig.",
    );
    expect(html).toContain(`src="${ended.imageUrl}"`);
    expect(html).toContain('alt="90 Briefe für „Unterschrift ist kein Dienstvergehen“"');
    expect(html).toContain("Erfolg auf den Socials teilen");
    expect(html).toContain(`href="${ended.downloadUrl}"`);
    expect(html).toContain("Bild speichern");
  });

  it("links the stats box to the creator stats anchor", () => {
    const html = build();

    expect(html).toContain("Neu: Statistiken zu deiner Kampagne");
    expect(html).toContain(`href="${base.actionUrl}#creator-stats"`);
    expect(html).toContain("Statistiken ansehen");
  });

  it("leads into the survey with one feedback button", () => {
    const html = build();

    expect(html).toContain("1 Minute Feedback");
    expect(html).toMatch(/href="[^"]*token=test[^"]*ziel=feedback[^"]*"/);
    expect(html).not.toContain("Wie war es für dich?");
  });

  it("keeps the donation hint small: only the support button, no manage or mail button", () => {
    const html = build();

    expect(html).toContain(`href="${DONATION_PROVIDER_URL}"`);
    expect(html).toContain("&nbsp;Unterstützen</a>");
    expect(html).not.toContain("&nbsp;Verwalten</a>");
    expect(html).not.toContain("Thomas schreiben");
    expect(html).toContain("Allerbeste Grüße aus Bremen und danke für dein Engagement");
    expect(html).toContain("family=Caveat");
    expect(html).toMatch(/font-family:'Caveat'[^>]*>Thomas<\/p>/);
  });

  it("has a one-off footer without an unsubscribe link", () => {
    const html = build();

    expect(html).toContain("Kampagnen-Abschluss");
    expect(html).toContain("Du bekommst diese Mail einmalig, weil deine Kampagne beendet ist.");
    expect(html).not.toContain("#meilenstein-mails");
    expect(html).not.toContain("abbestellen");
    expect(html).toContain(`${APP_URL}/impressum`);
    expect(html).toContain(`${APP_URL}/datenschutz`);
  });

  it("contains no en or em dashes", () => {
    expect(build()).not.toMatch(/[–—]/);
  });

  it("greets without a name and escapes the title", () => {
    const html = build({ creatorName: null, campaignTitle: 'Rad <b>"fahren"</b>' });

    expect(html).toContain(">Moin,</p>");
    expect(html).toContain("Rad &lt;b&gt;&quot;fahren&quot;&lt;/b&gt;");
    expect(html).not.toContain("<b>");
  });

  it("requires ended params", () => {
    expect(() => buildCampaignCreatorEmailHtml({ ...base })).toThrow();
  });
});

describe("sendCampaignCreatorEmail kind ended", () => {
  const originalBrevoKey = process.env.BREVO_API_KEY;
  let send: typeof import("@/lib/email/sendCampaignCreatorEmail").sendCampaignCreatorEmail;

  beforeAll(async () => {
    process.env.BREVO_API_KEY = "test-key";
    ({ sendCampaignCreatorEmail: send } = await import("@/lib/email/sendCampaignCreatorEmail"));
  });

  afterAll(() => {
    if (originalBrevoKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = originalBrevoKey;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendTransacEmail.mockResolvedValue({ messageId: "m1" });
  });

  it("sets subject, replyTo, tag and image URLs", async () => {
    const result = await send({
      kind: "ended",
      recipientEmail: "creator@example.org",
      campaignTitle: base.campaignTitle,
      slug: base.slug,
      creatorName: base.creatorName,
      token: "tok",
      ended: { count: 90 },
    });

    expect(result).toEqual({ success: true, messageId: "m1" });
    const payload = mockSendTransacEmail.mock.calls[0][0];
    expect(payload.subject).toBe("Danke für 90 Briefe zu „Unterschrift ist kein Dienstvergehen“");
    expect(payload.replyTo).toEqual({ email: FOUNDER_EMAIL });
    expect(payload.tags).toEqual(["campaign-ended"]);
    expect(payload.to).toEqual([{ email: "creator@example.org" }]);
    expect(payload.htmlContent).toContain(ended.imageUrl);
    expect(payload.htmlContent).toContain(`${ended.imageUrl}?download=1`);
    expect(payload.htmlContent).toContain("/kampagne/verwalten?token=tok#creator-stats");
    expect(payload.htmlContent).toContain("1 Minute Feedback");
    expect(payload.htmlContent).toContain("token=tok&amp;ziel=feedback");
  });
});
