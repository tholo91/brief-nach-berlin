import governmentData from "../../data/landesregierung-addresses.json";
import { getLandesregierungRecipient } from "@/lib/lookup/landesregierungRecipient";
import { resolveRecipientSelection } from "@/lib/lookup/resolveRecipient";
import { recipientSelectionSchema } from "@/lib/validation/wizardSchemas";

const statePostcodes = {
  BW: "70173", BY: "80331", BE: "10178", BB: "14467",
  HB: "28203", HH: "20095", HE: "65183", MV: "19053",
  NI: "30159", NW: "40213", RP: "55116", SL: "66111",
  SN: "01067", ST: "39104", SH: "24103", TH: "99084",
} as const;

describe("Landeskampagne — 16 Regierungschef:innen", () => {
  it("hat für jedes Land eine belegte namentliche Postanschrift und Anrede", () => {
    const entries = governmentData.recipients;
    expect(Object.keys(entries).sort()).toEqual(Object.keys(statePostcodes).sort());

    for (const key of Object.keys(statePostcodes) as Array<keyof typeof statePostcodes>) {
      const entry = entries[key];
      const head = entry.headOfGovernment;
      expect(head.name).toBeTruthy();
      expect(head.title).toBeTruthy();
      expect(head.salutation).toMatch(/^Sehr geehrte[r]? /);
      expect(head.salutation.endsWith(",")).toBe(true);
      expect(head.addressLines[0]).toContain(head.name);
      expect(head.addressLines[1]).toMatch(/Staats|Senatskanzlei/);
      expect(head.addressLines.at(-1)).toMatch(/^\d{5} /);
      expect(head.source.url).toMatch(/^https:\/\//);
      expect(head.source.title).toBeTruthy();
      expect(head.source.verifiedAt).toBe("2026-09-24");

      const recipient = getLandesregierungRecipient(key, "head");
      expect(recipient).toMatchObject({
        kind: "landesregierung",
        level: "Land",
        addressee: "head",
        bundeslandKey: key,
        headName: head.name,
        headTitle: head.title,
        salutation: head.salutation,
        postalAddress: head.addressLines.join(", "),
      });
      expect(getLandesregierungRecipient(key)).toMatchObject({
        addressee: "institution",
        salutation: "Sehr geehrte Damen und Herren,",
      });
    }
  });

  it("verwendet in den drei Stadtstaaten die jeweiligen Amtstitel", () => {
    expect(getLandesregierungRecipient("BE", "head")?.headTitle).toContain("Regierender Bürgermeister");
    expect(getLandesregierungRecipient("HB", "head")?.headTitle).toContain("Präsident des Senats");
    expect(getLandesregierungRecipient("HH", "head")?.headTitle).toContain("Erster Bürgermeister");
    for (const key of ["BE", "HB", "HH"]) {
      expect(getLandesregierungRecipient(key, "head")?.headTitle).not.toContain("Ministerpräsident");
    }
  });

  it.each(Object.entries(statePostcodes))("leitet %s mit PLZ %s serverseitig ab", (key, plz) => {
    const institution = resolveRecipientSelection(plz, { kind: "landesregierung" });
    const person = resolveRecipientSelection(plz, { kind: "landesregierung", addressee: "head" });
    expect(institution.ok).toBe(true);
    expect(person.ok).toBe(true);
    if (!institution.ok || !person.ok) return;
    expect(institution.recipient).toMatchObject({ kind: "landesregierung", bundeslandKey: key, addressee: "institution" });
    expect(person.recipient).toMatchObject({ kind: "landesregierung", bundeslandKey: key, addressee: "head" });
    expect(person.recipient).toEqual(getLandesregierungRecipient(key, "head"));
  });

  it("akzeptiert nur die Auswahl, keine Client-Angaben zu Person, Land oder Anschrift", () => {
    expect(recipientSelectionSchema.safeParse({ kind: "landesregierung", addressee: "head" }).success).toBe(true);
    for (const payload of [
      { kind: "landesregierung", addressee: "head", headName: "Falscher Name" },
      { kind: "landesregierung", addressee: "head", bundeslandKey: "BY" },
      { kind: "landesregierung", addressee: "head", postalAddress: "Falsche Anschrift" },
      { kind: "landesregierung", addressee: "other" },
    ]) {
      expect(recipientSelectionSchema.safeParse(payload).success).toBe(false);
    }
  });
});
