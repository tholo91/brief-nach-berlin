import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

const ANCHOR = "#wahlkreisbuero";
const mdb = {
  token: "t",
  politicianName: "Anna Müller",
  politicianId: 123,
  plz: "28195",
  recipientKind: "mdb" as const,
};

describe("buildFollowupHtml - Gut zu wissen", () => {
  it("mdb: Sprechstunde mit MdB-ID und PLZ in html und text", () => {
    const r = buildFollowupHtml(mdb);
    expect(r.html).toContain("/aktiv-werden?mdb=123&plz=28195#wahlkreisbuero");
    expect(r.html).toContain("Anna Müller persönlich treffen");
    expect(r.html).toContain("Sprechstunde finden");
    expect(r.text).toContain("/aktiv-werden?mdb=123&plz=28195#wahlkreisbuero");
    expect(r.text).toContain("Anna Müller persönlich treffen");
  });

  it("mdb: Berlin-Fahrt steht dabei", () => {
    const r = buildFollowupHtml(mdb);
    expect(r.html).toContain("/bundestag-besuch-kostenlos");
    expect(r.text).toContain("/bundestag-besuch-kostenlos");
  });

  it("steht nach Gruß und Unterschrift, kompakt ohne Kontaktzeile", () => {
    const { html } = buildFollowupHtml(mdb);
    const signoff = html.indexOf("Sign-off paragraph");
    expect(signoff).toBeLessThan(html.indexOf("Gut zu wissen"));
    expect(html.indexOf("Gut zu wissen")).toBeLessThan(html.indexOf(ANCHOR));
    expect(html).not.toContain("Schreib mir sehr gern");
    expect(html).not.toContain("/andere-tools");
  });

  it("ungültige PLZ fällt aus dem Link", () => {
    const { html } = buildFollowupHtml({ ...mdb, plz: "abc" });
    expect(html).toContain("/aktiv-werden?mdb=123#wahlkreisbuero");
  });

  it.each<SendLetterEmailParams["recipientKind"] | undefined>([
    "mdl",
    "rathaus",
    "landesregierung",
    "campaign_fixed",
    "bundeskanzler",
    "mdb_later",
    undefined,
  ])("recipientKind=%s: nur der Aktionen-Link", (kind) => {
    const r = buildFollowupHtml({ token: "t", politicianName: "Anna Müller", recipientKind: kind });
    expect(r.html).not.toContain(ANCHOR);
    expect(r.html).not.toContain("/bundestag-besuch-kostenlos");
    expect(r.html).toContain("Gut zu wissen");
    expect(r.html).toContain('/aktiv-werden" target="_blank"');
    expect(r.text).not.toContain(ANCHOR);
    expect(r.text).toContain("/aktiv-werden");
  });

  it("mdb ohne Namen: kein Treffen-Tipp", () => {
    const r = buildFollowupHtml({ token: "t", recipientKind: "mdb" });
    expect(r.html).not.toContain(ANCHOR);
  });

  it("nimmt den Titel in den Namen", () => {
    const { html } = buildFollowupHtml({ ...mdb, politicianTitle: "Dr." });
    expect(html).toContain("Dr. Anna Müller persönlich treffen");
  });

  it("escaped den Namen im HTML", () => {
    const { html } = buildFollowupHtml({ ...mdb, politicianName: "Anna <b>Müller</b>" });
    expect(html).toContain("Anna &lt;b&gt;Müller&lt;/b&gt;");
    expect(html).not.toContain("Anna <b>Müller</b>");
  });

  it.each(["de", "en", "tr"] as const)("liefert den Block in %s", (locale) => {
    const r = buildFollowupHtml({ ...mdb, locale });
    expect(r.html).toContain(ANCHOR);
    expect(r.text).toContain(ANCHOR);
  });
});
