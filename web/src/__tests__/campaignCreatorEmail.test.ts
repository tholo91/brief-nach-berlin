import { buildCampaignCreatorEmailHtml } from "@/lib/email/buildCampaignCreatorEmailHtml";

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
});
