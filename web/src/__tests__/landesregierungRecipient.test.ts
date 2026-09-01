import governmentData from "../../data/landesregierung-addresses.json";
import {
  buildLandesregierungRecipient,
  getLandesregierungRecipient,
  type LandesregierungDataEntry,
} from "@/lib/lookup/landesregierungRecipient";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import type { RecipientSelection } from "@/lib/lookup/rathausRecipient";

const STATE_KEYS = [
  "BB", "BE", "BW", "BY", "HB", "HE", "HH", "MV",
  "NI", "NW", "RP", "SH", "SL", "SN", "ST", "TH",
] as const;

const typedRecipients = governmentData.recipients as Record<
  (typeof STATE_KEYS)[number],
  LandesregierungDataEntry
>;

describe("landesregierung-addresses", () => {
  it("enthält genau die 16 Bundesland-Keys mit vollständigen amtlichen Quellen", () => {
    expect(Object.keys(governmentData.recipients).sort()).toEqual([...STATE_KEYS].sort());

    for (const key of STATE_KEYS) {
      const entry = typedRecipients[key];
      expect(entry.stateKey).toBe(key);
      expect(entry.stateName).toBeTruthy();
      expect(entry.label).toBeTruthy();
      expect(entry.officeName).toBeTruthy();
      expect(entry.addressLines.length).toBeGreaterThan(0);
      expect(entry.source.title).toBeTruthy();
      expect(entry.source.url).toMatch(/^https:\/\//);
      expect(entry.source.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it.each(STATE_KEYS)("erzeugt für %s genau einen institutionellen Recipient", (key) => {
    const recipient = getLandesregierungRecipient(key);
    expect(recipient).toEqual(buildLandesregierungRecipient(typedRecipients[key]));
    expect(recipient).toMatchObject({
      kind: "landesregierung",
      level: "Land",
      bundeslandKey: key,
    });
    expect(recipient).not.toHaveProperty("id");
    expect(recipient).not.toHaveProperty("politicianId");
    expect(recipient).not.toHaveProperty("party");
  });

  it("benennt die drei Stadtstaaten als Senat", () => {
    expect(getLandesregierungRecipient("BE")?.institutionKind).toBe("senat");
    expect(getLandesregierungRecipient("HB")?.institutionKind).toBe("senat");
    expect(getLandesregierungRecipient("HH")?.institutionKind).toBe("senat");
  });

  it("rät bei einem unbekannten Bundesland-Key keinen Empfänger", () => {
    expect(getLandesregierungRecipient("XX")).toBeNull();
  });

  it("ignoriert selbst bei direktem Resolver-Aufruf manipulierte Client-Felder", () => {
    const manipulated = {
      kind: "landesregierung",
      selectedPoliticianId: 999,
      bundeslandKey: "BY",
      label: "Falscher Empfänger",
      address: "Manipulierte Adresse",
    } as unknown as RecipientSelection;

    const resolved = resolveRecipientSelection("28203", manipulated);
    expect(resolved).toMatchObject({
      ok: true,
      availableCount: 1,
      recipient: {
        kind: "landesregierung",
        bundeslandKey: "HB",
        label: "Senat der Freien Hansestadt Bremen",
      },
    });
    if (resolved.ok) {
      expect(resolved.recipient.postalAddress).not.toContain("Manipulierte Adresse");
    }
  });
});
