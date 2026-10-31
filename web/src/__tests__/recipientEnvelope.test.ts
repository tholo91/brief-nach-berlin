import type { MdbRecipient, MdlRecipient, RathausRecipient } from "@/lib/lookup/rathausRecipient";
import { getBundeskanzlerRecipient } from "@/lib/lookup/bundeskanzlerRecipient";
import { getLandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";
import { recipientEnvelope } from "@/lib/lookup/recipientEnvelope";

const politician = {
  id: 1,
  politicianId: 2,
  firstName: "Maria",
  lastName: "Muster",
  title: "Dr.",
  party: "SPD",
  wahlkreisId: 3,
  wahlkreisName: "Bremen",
  isDirect: true,
  abgeordnetenwatchUrl: null,
};

const rathaus: RathausRecipient = {
  kind: "rathaus",
  level: "Kommune",
  recipientKind: "buergermeisteramt",
  gemeindeName: "Köln",
  plz: "50667",
  label: "Bürgermeisteramt Köln",
  postalAddress: "Bürgermeisteramt Köln, Rathausplatz 1, 50667 Köln",
  address: {
    source: "destatis",
    ags: "05315000",
    streetAddress: "Rathausplatz 1",
    postalCode: "50667",
    city: "Köln",
    sourceTitle: "Destatis",
    sourceUrl: "https://example.org",
    sourceStand: "2026-01-01",
  },
};

describe("recipientEnvelope", () => {
  it("adds the Bundestag line for MdB", () => {
    const recipient: MdbRecipient = {
      ...politician,
      kind: "mdb",
      level: "Bund",
      postalAddress: "Platz der Republik 1, 11011 Berlin",
    };
    expect(recipientEnvelope(recipient)).toEqual({
      lines: ["Dr. Maria Muster, MdB", "Deutscher Bundestag", "Platz der Republik 1", "11011 Berlin"],
      complete: true,
    });
  });

  it("keeps the Landtag address of an MdL and flags missing streets", () => {
    const recipient: MdlRecipient = {
      ...politician,
      kind: "mdl",
      level: "Land",
      title: null,
      postalAddress: "Landtag Bremen, Am Markt 20, 28195 Bremen",
    };
    expect(recipientEnvelope(recipient).lines).toEqual([
      "Maria Muster, MdL",
      "Landtag Bremen",
      "Am Markt 20",
      "28195 Bremen",
    ]);
    expect(recipientEnvelope({ ...recipient, postalAddress: "" }).complete).toBe(false);
  });

  it("gives the Chancellor one name line", () => {
    expect(recipientEnvelope(getBundeskanzlerRecipient()).lines).toEqual([
      "Bundeskanzler Friedrich Merz",
      "Bundeskanzleramt",
      "Willy-Brandt-Straße 1",
      "10557 Berlin",
    ]);
  });

  it("covers both addressees of a state government", () => {
    const institution = getLandesregierungRecipient("BW", "institution");
    const head = getLandesregierungRecipient("BW", "head");
    if (!institution || !head) throw new Error("Testdaten fehlen");
    expect(recipientEnvelope(institution).lines[0]).toBe("Staatsministerium Baden-Württemberg");
    expect(recipientEnvelope(head).lines[0]).toBe(head.address.addressLines[0]);
    expect(recipientEnvelope(head).complete).toBe(true);
  });

  it("is complete for an official town hall and offers the search otherwise", () => {
    expect(recipientEnvelope(rathaus).complete).toBe(true);
    expect(recipientEnvelope(rathaus).lines).toEqual(["Bürgermeisteramt Köln", "Rathausplatz 1", "50667 Köln"]);

    const fallback = recipientEnvelope({ ...rathaus, label: "Zuständiges Bürgermeisteramt", address: { source: "fallback" } });
    expect(fallback.complete).toBe(false);
    expect(fallback.lines).toEqual(["Zuständiges Bürgermeisteramt"]);
    expect(fallback.searchUrl).toContain("google.com/search");
  });
});
