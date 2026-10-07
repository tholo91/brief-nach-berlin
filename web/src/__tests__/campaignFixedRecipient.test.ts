import {
  buildCampaignFixedRecipient,
  campaignFixedRecipientAddressLines,
  getCampaignFixedRecipient,
} from "@/lib/lookup/campaignFixedRecipient";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";

const configuredRecipient = {
  organizationName: "Hessisches Ministerium der Justiz und für den Rechtsstaat",
  personName: null,
  salutation: "Sehr geehrte Damen und Herren,",
  street: "Luisenstraße",
  houseNumber: "13",
  postalCode: "65185",
  city: "Wiesbaden",
  countryCode: "DE" as const,
};

describe("campaign fixed recipient", () => {
  it("formatiert Organisation, Person und deutsche Anschrift deterministisch", () => {
    expect(campaignFixedRecipientAddressLines({
      ...configuredRecipient,
      personName: "Frau Dr. Erika Beispiel",
    })).toEqual([
      "Hessisches Ministerium der Justiz und für den Rechtsstaat",
      "Frau Dr. Erika Beispiel",
      "Luisenstraße 13",
      "65185 Wiesbaden",
    ]);

    expect(buildCampaignFixedRecipient({
      ...configuredRecipient,
      organizationName: null,
      personName: "Frau Dr. Erika Beispiel",
    })).toMatchObject({
      kind: "campaign_fixed",
      level: "Fixed",
      label: "Frau Dr. Erika Beispiel",
      postalAddress: "Frau Dr. Erika Beispiel, Luisenstraße 13, 65185 Wiesbaden",
    });
  });

  it.each(["28203", "50667", "01067"])(
    "bindet für PLZ %s immer denselben serverseitigen Empfänger",
    (plz) => {
      const campaignFixedRecipient = getCampaignFixedRecipient({
        targetLevel: "Fixed",
        targetRecipient: configuredRecipient,
      });
      expect(campaignFixedRecipient).not.toBeNull();

      expect(resolveRecipientSelection(
        plz,
        { kind: "campaign_fixed" },
        { campaignSlug: "unterschrift-ist-kein-dienstvergehen", campaignFixedRecipient },
      )).toMatchObject({
        ok: true,
        availableCount: 1,
        relation: "institutional",
        recipient: {
          kind: "campaign_fixed",
          label: configuredRecipient.organizationName,
          postalAddress: expect.stringContaining("Luisenstraße 13"),
        },
      });
    },
  );

  it("akzeptiert campaign_fixed nicht ohne den serverseitig geladenen Kampagnenempfänger", () => {
    expect(resolveRecipientSelection("28203", { kind: "campaign_fixed" })).toEqual({
      ok: false,
      reason: "not_found",
    });
  });
});
