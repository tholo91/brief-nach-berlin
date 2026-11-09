import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";
import { SUPPORT_CONTENT } from "@/lib/support-content";

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

  it("mdb: Berlin-Fahrt steht dabei, mit MdB-ID und PLZ vorbefüllt", () => {
    const r = buildFollowupHtml(mdb);
    expect(r.html).toContain("/bundestag-besuch-kostenlos?mdb=123&plz=28195");
    expect(r.text).toContain("/bundestag-besuch-kostenlos?mdb=123&plz=28195");
  });

  it("mdb: Berlin-Fahrt ohne gültige PLZ nur mit MdB-ID", () => {
    const r = buildFollowupHtml({ ...mdb, plz: "abc" });
    expect(r.html).toContain("/bundestag-besuch-kostenlos?mdb=123\"");
  });

  it("steht nach Gruß und Unterschrift, kompakt nur mit den Links für nach dem Brief", () => {
    const { html } = buildFollowupHtml(mdb);
    const signoff = html.indexOf("Sign-off paragraph");
    expect(signoff).toBeLessThan(html.indexOf(ANCHOR));
    expect(html).toContain("Was du noch tun kannst</a>");
    expect(html).toContain("/andere-tools");
    expect(html).toContain("Schreib mir gern bei Fragen + Ideen</a>");
    expect(html).not.toContain("Deine Eingaben nochmal einsehen");
    expect(html).not.toContain("/tipps");
    expect(html).not.toContain("Gut zu wissen");
    expect(html).toContain("Was du noch tun kannst</a>");
    expect(html).not.toContain("border-bottom:1px solid #EDEAE6");
    expect(buildFollowupHtml(mdb).text).not.toContain("Gut zu wissen");
    expect(buildFollowupHtml(mdb).text).toContain("Was du noch tun kannst");
  });

  it.each([
    ["de", "Etwa 100 € monatlich", "25–40 € für Tools", "Damit Brief-nach-Berlin kostenlos bleibt*"],
    ["en", "Around €100 per month", "€25–40 for tools", "Support Brief-nach-Berlin*"],
    ["tr", "ayda yaklaşık 100 €", "25–40 €", "Brief-nach-Berlin&#39;i destekle*"],
  ] as const)("zeigt Spendenhinweis und Kostenerklärung in %s", (locale, amount, tools, heading) => {
    const r = buildFollowupHtml({ token: "t", locale });
    expect(r.html).toContain(heading);
    expect(r.html).toContain(amount);
    expect(r.html).toContain(tools);
    expect(r.html).toContain(SUPPORT_CONTENT.ctas.donate.href);
    expect(r.text).toContain(`${amount}`);
    expect(r.text).toContain(SUPPORT_CONTENT.ctas.donate.href);
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
    expect(r.html).not.toContain("Gut zu wissen");
    expect(r.html).toContain("Was du noch tun kannst</a>");
    expect(r.html).toContain('/aktiv-werden" target="_blank"');
    expect(r.text).not.toContain(ANCHOR);
    expect(r.text).not.toContain("Gut zu wissen");
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
