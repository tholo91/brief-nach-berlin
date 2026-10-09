import { APP_URL, CAMPAIGN_CREATOR_FEEDBACK_URL, DONATION_PROVIDER_URL, FOUNDER_INSTAGRAM } from "@/lib/config";
import { BRIEF_EMAIL } from "@/lib/contact";
import { DEFAULT_CAMPAIGN_MILESTONES } from "@/lib/campaigns/milestones";
import { buildCampaignCreatorEmailHtml } from "@/lib/email/buildCampaignCreatorEmailHtml";
import { SUPPORT_CAMPAIGN_CREATOR_COPY } from "@/lib/support-content";

const base = {
  kind: "milestone" as const,
  campaignTitle: "Mehr Busse für Bremen-Nord",
  slug: "mehr-busse-bremen-nord",
  campaignUrl: `${APP_URL}/kampagne/mehr-busse-bremen-nord`,
  actionUrl: `${APP_URL}/kampagne/verwalten?token=test`,
  creatorName: "Lena",
};

function milestone(count: number) {
  return {
    count,
    milestones: [...DEFAULT_CAMPAIGN_MILESTONES],
    imageUrl: `${APP_URL}/kampagne/mehr-busse-bremen-nord/meilenstein/${count}/bild`,
    downloadUrl: `${APP_URL}/kampagne/mehr-busse-bremen-nord/meilenstein/${count}/bild?download=1`,
  };
}

function build(count: number, overrides: Record<string, unknown> = {}) {
  return buildCampaignCreatorEmailHtml({ ...base, milestone: milestone(count), ...overrides });
}

describe("milestone creator email", () => {
  it("renders the approved copy and a three-button row below 500 letters", () => {
    const html = build(50);

    expect(html).toContain("Moin Lena,");
    expect(html).toContain(
      "50 Briefe und kein Ende in Sicht. So viele Menschen haben die Argumente deiner Kampagne aufgegriffen und daraus ihren eigenen, persönlichen Brief geschrieben.",
    );
    expect(html).toContain(
      "Wenn du magst, teil deinen Fortschritt auf Instagram, LinkedIn oder WhatsApp. Das Bild dafür ist schon fertig.",
    );
    expect(html).toContain(`src="${milestone(50).imageUrl}"`);
    expect(html).toContain('alt="50 Briefe für „Mehr Busse für Bremen-Nord“"');
    expect(html).toContain("&nbsp;Verwalten</a>");
    expect(html).toContain("&nbsp;Unterstützen</a>");
    expect(html).toContain(`href="${DONATION_PROVIDER_URL}"`);
    expect(html).toContain(`href="mailto:${BRIEF_EMAIL}"`);
    expect(html).toContain("Thomas schreiben");
    expect(html).not.toContain(SUPPORT_CAMPAIGN_CREATOR_COPY.milestoneHeading);
  });

  it("renders the footer with the campaign's stufen and the unsubscribe fragment", () => {
    const html = build(50);

    expect(html).toContain("Meilenstein-Mail");
    expect(html).toContain("Du bekommst diese Mail bei 50, 100, 500, 1.000, 2.000 und 5.000 Briefen.");
    expect(html).toContain(`href="${base.actionUrl}#meilenstein-mails"`);
    expect(html).toContain("Diese Mails abbestellen");
    expect(html).toContain(`href="${base.campaignUrl}"`);
    expect(html).toContain(`${APP_URL}/impressum`);
    expect(html).toContain(`${APP_URL}/datenschutz`);
    expect(html).toContain(CAMPAIGN_CREATOR_FEEDBACK_URL);
    expect(html).toContain(FOUNDER_INSTAGRAM);
  });

  it("shows own stufen in the footer", () => {
    const html = build(1000, {
      milestone: { ...milestone(1000), milestones: [1000, 5000] },
    });

    expect(html).toContain("Du bekommst diese Mail bei 1.000 und 5.000 Briefen.");
    expect(html).toContain("1.000 Briefe und kein Ende in Sicht.");
  });

  it("adds the support box from 500 letters and keeps two buttons", () => {
    const html = build(500);

    const image = html.indexOf(`src="${milestone(500).imageUrl}"`);
    const greeting = html.indexOf("Moin Lena,");
    const support = html.indexOf(SUPPORT_CAMPAIGN_CREATOR_COPY.milestoneHeading);
    const manage = html.indexOf("Kampagne verwalten");
    const footer = html.indexOf("Meilenstein-Mail");

    expect(image).toBeGreaterThan(-1);
    expect(greeting).toBeGreaterThan(image);
    expect(support).toBeGreaterThan(greeting);
    expect(manage).toBeGreaterThan(support);
    expect(footer).toBeGreaterThan(manage);
    expect(html).toContain(SUPPORT_CAMPAIGN_CREATOR_COPY.body);
    expect(html).toContain("Thomas schreiben");
    expect(html).not.toContain("&nbsp;Unterstützen</a>");
    expect(html).not.toContain(SUPPORT_CAMPAIGN_CREATOR_COPY.heading);
  });

  it("greets without a name", () => {
    const html = build(50, { creatorName: null });

    expect(html).toContain(">Moin,</p>");
    expect(html).not.toContain("Moin Lena");
  });

  it("escapes the title in the alt text", () => {
    const html = build(50, { campaignTitle: 'Rad <b>"fahren"</b>' });

    expect(html).toContain("Rad &lt;b&gt;&quot;fahren&quot;&lt;/b&gt;");
    expect(html).not.toContain("<b>");
  });

  it("contains no en or em dashes", () => {
    expect(build(50)).not.toMatch(/[–—]/);
    expect(build(500)).not.toMatch(/[–—]/);
  });

  it("requires milestone params", () => {
    expect(() => buildCampaignCreatorEmailHtml({ ...base })).toThrow();
  });
});
