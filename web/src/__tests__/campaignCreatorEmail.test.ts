import { existsSync, statSync } from "node:fs";
import path from "node:path";

import { APP_URL } from "@/lib/config";
import { BRIEF_EMAIL } from "@/lib/contact";
import { buildCampaignCreatorEmailHtml } from "@/lib/email/buildCampaignCreatorEmailHtml";
import { SUPPORT_CAMPAIGN_CREATOR_COPY, SUPPORT_CONTENT } from "@/lib/support-content";

const base = {
  campaignTitle: "Sichere Schulwege",
  slug: "sichere-schulwege",
  campaignUrl: "https://www.brief-nach-berlin.de/kampagne/sichere-schulwege",
  actionUrl: "https://www.brief-nach-berlin.de/kampagne/verwalten?token=test",
  creatorName: "Initiative Beispiel",
};

describe("campaign creator emails", () => {
  it("keeps a pending campaign private while giving its creator the management link", () => {
    const html = buildCampaignCreatorEmailHtml({
      ...base,
      kind: "management_pending",
    });

    expect(html).toContain("Status: wartet auf Freigabe");
    expect(html).toContain("in der Regel innerhalb von 24 Stunden");
    expect(html).toContain(base.actionUrl);
    expect(html).not.toContain(base.campaignUrl);
    expect(html).not.toContain("Kampagne teilen");
  });

  it("keeps public links and sharing for active campaigns only", () => {
    const html = buildCampaignCreatorEmailHtml({ ...base, kind: "management" });

    expect(html).toContain(base.campaignUrl);
    expect(html).toContain("Kampagne teilen");
  });

  it("offers a one-time campaign takeover without exposing pending campaign links", () => {
    const html = buildCampaignCreatorEmailHtml({
      ...base,
      kind: "transfer",
      actionUrl: "https://www.brief-nach-berlin.de/kampagne/verwalten?token=transfer",
    });

    expect(html).toContain("Kampagne übernehmen");
    expect(html).toContain("nur einmal verwendbar");
    expect(html).toContain("token=transfer");
    expect(html).not.toContain("Kampagne teilen");
    expect(html).not.toContain(base.campaignUrl);
  });

  describe("transfer mail", () => {
    const transfer = {
      ...base,
      kind: "transfer" as const,
      actionUrl: "https://www.brief-nach-berlin.de/kampagne/verwalten?token=transfer",
    };

    it("shows the letter count tile when letters exist", () => {
      const html = buildCampaignCreatorEmailHtml({ ...transfer, letterCount: 1234 });

      expect(html).toContain("Stand heute");
      expect(html).toContain("1.234");
      expect(html).toContain("Briefe geschrieben");
    });

    it("uses the singular for a single letter", () => {
      const html = buildCampaignCreatorEmailHtml({ ...transfer, letterCount: 1 });

      expect(html).toContain("Brief geschrieben");
      expect(html).not.toContain("Briefe geschrieben");
    });

    it("omits the count tile for zero letters, a missing count or a pending campaign", () => {
      expect(buildCampaignCreatorEmailHtml({ ...transfer, letterCount: 0 })).not.toContain("Stand heute");
      expect(buildCampaignCreatorEmailHtml(transfer)).not.toContain("Stand heute");
      expect(
        buildCampaignCreatorEmailHtml({
          ...transfer,
          letterCount: 50,
          campaignStatus: "awaiting_approval",
        })
      ).not.toContain("Stand heute");
    });

    it("names the inviter and never greets the new address with the old name", () => {
      const html = buildCampaignCreatorEmailHtml({
        ...transfer,
        creatorName: "Anna",
        inviterName: "Anna <b>",
      });

      expect(html).toContain("Anna &lt;b&gt; möchte dir die Kampagne übergeben");
      expect(html).toContain(">Moin,<");
      expect(html).not.toContain("Moin Anna");
    });

    it("keeps the generic intro without an inviter name", () => {
      const html = buildCampaignCreatorEmailHtml(transfer);

      expect(html).toContain("Du wurdest eingeladen, diese Kampagne zu übernehmen.");
    });

    it("explains what the new owner sees, can do and does not get", () => {
      const html = buildCampaignCreatorEmailHtml(transfer);

      expect(html).toContain("Das siehst du live");
      expect(html).toContain("Das kannst du");
      expect(html).toContain("Das bekommst du nicht");
      expect(html).toContain("nur einmal verwendbar");
      expect(html).not.toContain("sobald die Kampagne freigegeben ist");
    });

    it("says the live view starts after approval for a pending campaign", () => {
      const html = buildCampaignCreatorEmailHtml({
        ...transfer,
        campaignStatus: "awaiting_approval",
      });

      expect(html).toContain("Das siehst du live, sobald die Kampagne freigegeben ist");
    });

    it("contains no dashes in the copy", () => {
      const html = buildCampaignCreatorEmailHtml({
        ...transfer,
        letterCount: 1234,
        inviterName: "Anna",
      });

      expect(html).not.toMatch(/[\u2013\u2014]/);
    });
  });

  it.each([
    ["management_pending", { kind: "management_pending" }],
    ["management (active)", { kind: "management" }],
    ["management (paused)", { kind: "management", campaignStatus: "paused" }],
  ] as const)("shows the support box in %s mails", (_label, variant) => {
    const html = buildCampaignCreatorEmailHtml({ ...base, ...variant });

    expect(html).toContain(SUPPORT_CAMPAIGN_CREATOR_COPY.heading);
    expect(html).toContain(SUPPORT_CONTENT.ctas.donate.href);
    expect(html).toContain(`${APP_URL}/spenden?src=email`);
    expect(html).toContain(SUPPORT_CAMPAIGN_CREATOR_COPY.infoButton);
    expect(html).toContain(`${APP_URL}${SUPPORT_CONTENT.founder.avatarPath}`);
  });

  it.each([
    ["management_pending", { kind: "management_pending" }],
    ["management (active)", { kind: "management" }],
    ["management (paused)", { kind: "management", campaignStatus: "paused" }],
  ] as const)("puts the actions inside the access box above the support box in %s mails", (_label, variant) => {
    const html = buildCampaignCreatorEmailHtml({ ...base, ...variant });

    const label = html.indexOf("Verwaltungszugang");
    const action = html.indexOf(base.actionUrl);
    const support = html.indexOf(SUPPORT_CAMPAIGN_CREATOR_COPY.heading);

    expect(label).toBeGreaterThan(-1);
    expect(action).toBeGreaterThan(label);
    expect(support).toBeGreaterThan(action);
  });

  it("keeps the primary action above the explanation in verify_email mails", () => {
    const html = buildCampaignCreatorEmailHtml({ ...base, kind: "verify_email" });

    expect(html.indexOf(base.actionUrl)).toBeGreaterThan(-1);
    expect(html.indexOf(base.actionUrl)).toBeLessThan(html.indexOf(">Danach<"));
  });

  it.each(["verify_email", "management_pending", "management", "transfer"] as const)(
    "offers a mail link instead of the feedback button and links the new pages in %s mails",
    (kind) => {
      const html = buildCampaignCreatorEmailHtml({ ...base, kind });

      expect(html).toContain(`mailto:${BRIEF_EMAIL}`);
      expect(html).toContain("Thomas schreiben");
      expect(html).not.toContain("Feedback geben");
      expect(html).toContain(`${APP_URL}/petition-starten`);
      expect(html).toContain(`${APP_URL}/kampagne-starten`);
    },
  );

  it.each(["verify_email", "transfer"] as const)("omits the support box in %s mails", (kind) => {
    const html = buildCampaignCreatorEmailHtml({ ...base, kind });

    expect(html).not.toContain(SUPPORT_CONTENT.ctas.donate.href);
    expect(html).not.toContain(SUPPORT_CAMPAIGN_CREATOR_COPY.heading);
    expect(html).not.toContain(SUPPORT_CONTENT.founder.avatarPath);
  });

  it("ships the founder avatar as a small file", () => {
    const file = path.join(process.cwd(), "public", SUPPORT_CONTENT.founder.avatarPath);

    expect(existsSync(file)).toBe(true);
    expect(statSync(file).size).toBeLessThan(30 * 1024);
  });

  it("keeps the creator support copy free of dashes", () => {
    const dashes = /[\u2013\u2014]/;

    for (const value of Object.values(SUPPORT_CAMPAIGN_CREATOR_COPY)) {
      expect(value).not.toMatch(dashes);
    }
  });

  it("keeps the share buttons the same height on phones, including the LinkedIn badge", () => {
    const html = buildCampaignCreatorEmailHtml({ ...base, kind: "management" });

    expect(html).toContain('class="bnb-share-icon bnb-share-badge"');
    expect(html).toMatch(/\.bnb-share-btn \{[^}]*height: 48px !important/);
    expect(html.indexOf("WhatsApp</span>")).toBeLessThan(html.indexOf("Telegram</span>"));
    expect(html.indexOf("Telegram</span>")).toBeLessThan(html.indexOf("E-Mail</span>"));
    expect(html.indexOf("E-Mail</span>")).toBeLessThan(html.indexOf("LinkedIn</span>"));
  });
});

describe("campaign creator approved mail", () => {
  const approvedBase = { ...base, kind: "approved" as const, actionUrl: base.campaignUrl };

  it("announces the public campaign with link and sharing", () => {
    const html = buildCampaignCreatorEmailHtml(approvedBase);

    expect(html).toContain("Deine Kampagne ist live");
    expect(html).toContain("Ich habe deine Kampagne geprüft");
    expect(html).toContain(base.campaignUrl);
    expect(html).toContain("Kampagne teilen");
    expect(html).toContain("Verwaltungslink aus meiner früheren E-Mail");
    expect(html).not.toContain("token=");
    expect(html).not.toMatch(/\bwir\b|—|–/i);
  });
});
