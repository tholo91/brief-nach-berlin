import { buildShareTarget } from "@/lib/share";

describe("buildShareTarget — institutionelle Ebenen", () => {
  it("nennt im freien Land-Flow die Landesregierung ohne Wahlkreis- oder Personenkontext", () => {
    const share = buildShareTarget(null, "participant", "Land");

    expect(share.text).toContain("an meine Landesregierung");
    expect(share.text).not.toContain("Landtag");
    expect(share.text).not.toContain("MdL");
    expect(share.text).not.toContain("Wahlkreis");
  });

  it("nennt in Stadtstaaten den Senat", () => {
    const share = buildShareTarget(null, "participant", "Land", "senat");

    expect(share.text).toContain("an den Senat meines Bundeslands");
    expect(share.text).not.toContain("Landesregierung");
  });

  it("hält Kampagnen-Creator-Copy ebenenneutral", () => {
    const share = buildShareTarget(
      { slug: "test", title: "Testkampagne" },
      "creator",
      "Land"
    );

    expect(share.text).toContain("eigenen Brief mit deinen Worten");
    expect(share.text).not.toContain("Wahlkreis");
    expect(share.text).not.toContain("Landtag");
  });
});
