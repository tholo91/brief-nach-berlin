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
  it("renders the draft thanks with count, image and share box", () => {
    const html = build();

    expect(html).toContain("Moin Stephanie,");
    expect(html).toContain(
      "Eure Kampagne ist vorbei. 90 Briefe sind dabei entstanden, jeder in eigenen Worten. Ihr habt euren Leuten ein konkretes To-Do gegeben, und sie haben es gemacht. Danke, dass ihr euch das getraut habt. Brief-nach-Berlin ist noch klein, das war ein echter Vertrauensvorschuss.",
    );
    expect(html).toContain(
      "Wenn ihr mögt, teilt euren Erfolg auf Instagram, LinkedIn oder WhatsApp. Das Bild dafür ist schon fertig.",
    );
    expect(html).toContain(`src="${ended.imageUrl}"`);
    expect(html).toContain('alt="90 Briefe für „Unterschrift ist kein Dienstvergehen“"');
    expect(html).toContain("Erfolg auf den Socials teilen");
    expect(html).toContain(`href="${ended.downloadUrl}"`);
    expect(html).toContain("Bild speichern");
  });

  it("renders the personal note in Caveat under the greeting, escaped, newlines as br", () => {
    const html = build({
      ended: { ...ended, note: 'Ihr habt <b>Mut</b> "gezeigt".\nDanke dafür.' },
    });

    expect(html).toContain("Ihr habt &lt;b&gt;Mut&lt;/b&gt; &quot;gezeigt&quot;.<br>Danke dafür.");
    expect(html).not.toContain("<b>Mut</b>");
    const greeting = html.indexOf("Moin Stephanie,");
    const note = html.indexOf("Ihr habt &lt;b&gt;");
    const thanks = html.indexOf("Eure Kampagne ist vorbei.");
    expect(greeting).toBeLessThan(note);
    expect(note).toBeLessThan(thanks);
    expect(html).toMatch(/font-family:'Caveat'[^>]*>Ihr habt/);
    expect(html).not.toContain("Dein persönlicher Absatz");
  });

  it("shows the dashed placeholder only in a preview without a note", () => {
    expect(build({ ended: { ...ended, preview: true } })).toContain(
      "Dein persönlicher Absatz: 2-3 Sätze, kommen per --note hier rein.",
    );
    expect(build({ ended: { ...ended, preview: true } })).toContain("dashed");
    expect(build({ ended: { ...ended, preview: true, note: "Hallo" } })).not.toContain(
      "Dein persönlicher Absatz",
    );
    expect(build()).not.toContain("Dein persönlicher Absatz");
    expect(build({ ended: { ...ended, note: "   " } })).not.toContain("Dein persönlicher Absatz");
  });

  it("adds the founder thank-you sentence only when created_by_founder", () => {
    const sentence = "Und danke, dass ich die Kampagne für euch aufsetzen durfte.";
    expect(build()).not.toContain(sentence);
    expect(build({ ended: { ...ended, createdByFounder: false } })).not.toContain(sentence);
    expect(build({ ended: { ...ended, createdByFounder: true } })).toContain(sentence);
  });

  it("shows the honest send-rate line only with a stat, linked to the creator stats", () => {
    expect(build()).not.toContain("Brief ist abgeschickt");
    expect(build()).not.toContain("#creator-stats");

    const html = build({ ended: { ...ended, sendStat: { percent: 78, responses: 23 } } });
    expect(html).toContain(
      "78 % der 23 Leute, die mir geantwortet haben, sagen: Brief ist abgeschickt.",
    );
    expect(html).toContain(`href="${base.actionUrl}#creator-stats"`);
    expect(html).toContain("Alle Zahlen stehen auf eurer Verwaltungsseite.");
    expect(html).not.toContain("Statistiken ansehen");
  });

  it("puts the referral ask with the NGO link directly above the single feedback button", () => {
    const html = build();

    expect(html).toContain(
      "Was mir am meisten hilft, ist Reichweite. Wenn ihr eine Initiative oder einen Creator kennt, für die so eine Briefkampagne passt: Erzählt ihnen davon.",
    );
    expect(html).toContain(`href="${APP_URL}/ngo-briefkampagne"`);
    const referral = html.indexOf("/ngo-briefkampagne");
    const button = html.indexOf("1 Minute Feedback");
    expect(referral).toBeGreaterThan(-1);
    expect(referral).toBeLessThan(button);
    expect(html.slice(referral, button)).not.toContain("Bild speichern");
    expect(html).toContain("Oder antwortet einfach auf diese Mail.");
  });

  it("has exactly one big primary feedback button outside the share box", () => {
    const html = build();
    const beforeShare = html.slice(0, html.indexOf("Erfolg auf den Socials teilen"));

    expect(html.split(">1 Minute Feedback</a>").length - 1).toBe(1);
    expect(beforeShare.split("background-color:#2D6A4F;color:#ffffff").length - 1).toBe(1);
    expect(html).toMatch(/href="[^"]*token=test[^"]*ziel=feedback[^"]*"/);
    expect(html).not.toContain("Wie war es für dich?");
  });

  it("keeps the donation quiet: a small text link, no outline buttons", () => {
    const html = build();

    expect(html).toContain(`href="${DONATION_PROVIDER_URL}"`);
    expect(html).toContain("Brief-nach-Berlin bleibt kostenlos. Wer mich unterstützen will, findet hier die");
    expect(html).toContain(">Spendenseite</a>");
    expect(html).not.toContain("&nbsp;Unterstützen</a>");
    expect(html).not.toContain("&nbsp;Verwalten</a>");
    expect(html).not.toContain("Thomas schreiben");
    expect(html).not.toContain("border:1px solid #2D6A4F;line-height:1.25;\">&#");
    expect(html).toContain("Allerbeste Grüße aus Bremen");
    expect(html).toContain("family=Caveat");
    expect(html).toMatch(/font-family:'Caveat'[^>]*>Thomas<\/p>/);
  });

  it("has a one-off footer without an unsubscribe link", () => {
    const html = build();

    expect(html).toContain("Kampagnen-Abschluss");
    expect(html).toContain("Ihr bekommt diese Mail einmalig, weil eure Kampagne beendet ist.");
    expect(html).not.toContain("#meilenstein-mails");
    expect(html).not.toContain("abbestellen");
    expect(html).toContain(`${APP_URL}/impressum`);
    expect(html).toContain(`${APP_URL}/datenschutz`);
  });

  it("contains no en or em dashes in any variant and never says wir", () => {
    const variants = [
      build(),
      build({ ended: { ...ended, preview: true } }),
      build({
        ended: { ...ended, note: "Danke euch.", createdByFounder: true, sendStat: { percent: 78, responses: 23 } },
      }),
    ];
    for (const html of variants) {
      expect(html).not.toMatch(/[–—]/);
      expect(html).not.toMatch(/\b(wir|uns|unser\w*)\b/i);
      expect(html).not.toContain("Brief nach Berlin");
    }
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
    expect(payload.htmlContent).toContain("1 Minute Feedback");
    expect(payload.htmlContent).toContain("token=tok&amp;ziel=feedback");
    expect(payload.htmlContent).not.toContain("Dein persönlicher Absatz");
  });

  it("prefixes the subject and shows the placeholder for a preview", async () => {
    await send({
      kind: "ended",
      recipientEmail: "thomas@example.org",
      campaignTitle: base.campaignTitle,
      slug: base.slug,
      creatorName: base.creatorName,
      token: "vorschau",
      ended: { count: 90, preview: true },
    });

    const payload = mockSendTransacEmail.mock.calls[0][0];
    expect(payload.subject).toBe(
      "[Vorschau] Danke für 90 Briefe zu „Unterschrift ist kein Dienstvergehen“",
    );
    expect(payload.htmlContent).toContain("Dein persönlicher Absatz");
  });

  it("passes note, founder flag and send stat through to the mail", async () => {
    await send({
      kind: "ended",
      recipientEmail: "creator@example.org",
      campaignTitle: base.campaignTitle,
      slug: base.slug,
      creatorName: base.creatorName,
      token: "tok",
      ended: {
        count: 90,
        note: "Danke für alles.",
        createdByFounder: true,
        sendStat: { percent: 64, responses: 12 },
      },
    });

    const html = mockSendTransacEmail.mock.calls[0][0].htmlContent;
    expect(html).toContain("Danke für alles.");
    expect(html).toContain("die Kampagne für euch aufsetzen durfte");
    expect(html).toContain("64 % der 12 Leute, die mir geantwortet haben");
    expect(html).toContain("/kampagne/verwalten?token=tok#creator-stats");
    expect(mockSendTransacEmail.mock.calls[0][0].subject).not.toContain("[Vorschau]");
  });
});
