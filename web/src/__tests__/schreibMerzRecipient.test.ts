import {
  getBundeskanzlerRecipient,
  isBundeskanzlerCampaignSlug,
} from "@/lib/lookup/bundeskanzlerRecipient";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";

describe("Schreib-Merz Bundeskanzler recipient", () => {
  it("contains the fixed official identity, salutation, address, and source", () => {
    expect(getBundeskanzlerRecipient()).toEqual({
      kind: "bundeskanzler",
      level: "Bund",
      label: "Bundeskanzler Friedrich Merz",
      firstName: "Friedrich",
      lastName: "Merz",
      title: null,
      officeName: "Bundeskanzleramt",
      anrede: "Sehr geehrter Herr Bundeskanzler,",
      postalAddress:
        "Bundeskanzleramt, Bundeskanzler, Friedrich Merz, Willy-Brandt-Straße 1, 10557 Berlin",
      address: {
        addressLines: [
          "Bundeskanzleramt",
          "Bundeskanzler",
          "Friedrich Merz",
          "Willy-Brandt-Straße 1",
          "10557 Berlin",
        ],
        sourceTitle: "Kontakt zum Bundeskanzler",
        sourceUrl:
          "https://www.bundeskanzler.de/bk-de/service/kontakt/kontakt-formular/1853246-1853246",
        sourceStand: "2026-09-10",
      },
    });
  });

  it("recognizes only the exact special-campaign slug", () => {
    expect(isBundeskanzlerCampaignSlug("schreib-merz")).toBe(true);
    expect(isBundeskanzlerCampaignSlug("Schreib-Merz")).toBe(false);
    expect(isBundeskanzlerCampaignSlug("andere-kampagne")).toBe(false);
    expect(isBundeskanzlerCampaignSlug(null)).toBe(false);
    expect(isBundeskanzlerCampaignSlug(undefined)).toBe(false);
  });

  it("resolves the chancellor only inside the Schreib-Merz campaign", () => {
    expect(
      resolveRecipientSelection(
        "50667",
        { kind: "bundeskanzler" },
        { campaignSlug: "schreib-merz" },
      ),
    ).toMatchObject({
      ok: true,
      availableCount: 1,
      recipient: {
        kind: "bundeskanzler",
        label: "Bundeskanzler Friedrich Merz",
      },
    });

    expect(
      resolveRecipientSelection("50667", { kind: "bundeskanzler" }),
    ).toEqual({ ok: false, reason: "not_found" });
    expect(
      resolveRecipientSelection(
        "50667",
        { kind: "bundeskanzler" },
        { campaignSlug: "andere-kampagne" },
      ),
    ).toEqual({ ok: false, reason: "not_found" });
  });

  it("returns a fresh address-lines array for each trusted recipient", () => {
    const first = getBundeskanzlerRecipient();
    const second = getBundeskanzlerRecipient();

    expect(first).not.toBe(second);
    expect(first.address.addressLines).not.toBe(second.address.addressLines);
  });
});
