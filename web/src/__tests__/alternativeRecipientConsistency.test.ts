import { lookupPLZ, lookupPLZWithLevel } from "@/lib/lookup/plzLookup";
import { allowsAlternativeRecipients } from "@/lib/lookup/alternativeRecipients";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { searchAlternativeRecipients } from "@/lib/lookup/recipientSearch";

describe("Alternativ-Picker und Server-Auflösung", () => {
  const plz = "20095";

  it("löst ohne Kampagne jede Picker-Auswahl in Hamburg auf (Bund und Land)", () => {
    for (const level of ["Bund", "Land"] as const) {
      const pages: number[] = [];
      const parties = searchAlternativeRecipients({ level, plz, query: "" }).parties;
      for (const party of parties) {
        let offset: number | null = 0;
        while (offset !== null) {
          const page = searchAlternativeRecipients({ level, plz, party, query: "", offset });
          for (const item of page.items) pages.push(item.id);
          offset = page.nextOffset;
        }
      }
      expect(pages.length).toBeGreaterThan(0);
      const failed = pages.filter(
        (id) =>
          !resolveRecipientSelection(plz, {
            kind: level === "Bund" ? "mdb" : "mdl",
            selectedPoliticianId: id,
          }).ok
      );
      expect(failed).toEqual([]);
    }
  });

  it("zeigt den Picker nur, wenn der Server Auswahlen außerhalb des Wahlkreises annimmt", () => {
    const localIds = new Set(lookupPLZ(plz).politicians.map((p) => p.id));
    const other = searchAlternativeRecipients({ level: "Bund", plz, query: "an" }).items.find(
      (item) => !localIds.has(item.id)
    )!;
    for (const campaignSlug of [null, undefined, "irgendeine-kampagne"]) {
      const accepted = resolveRecipientSelection(
        plz,
        { kind: "mdb", selectedPoliticianId: other.id },
        { campaignSlug }
      ).ok;
      expect(allowsAlternativeRecipients(campaignSlug, localIds.size)).toBe(accepted);
    }
    expect(lookupPLZWithLevel(plz).bundeslandKey).toBe("HH");
  });

  it("erlaubt in offenen Kampagnen freie Auswahl, wenn im Wahlkreis niemand zugeordnet ist", () => {
    const orphanPlz = "29216";
    expect(lookupPLZ(orphanPlz).politicians).toEqual([]);
    const other = searchAlternativeRecipients({ level: "Bund", plz: orphanPlz, query: "an" }).items[0];
    const result = resolveRecipientSelection(
      orphanPlz,
      { kind: "mdb", selectedPoliticianId: other.id },
      { campaignSlug: "irgendeine-kampagne" }
    );
    expect(allowsAlternativeRecipients("irgendeine-kampagne", 0)).toBe(true);
    expect(result.ok).toBe(true);
  });
});
