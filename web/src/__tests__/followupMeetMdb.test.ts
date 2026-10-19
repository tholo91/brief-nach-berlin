import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

const ANCHOR = "/aktiv-werden#wahlkreisbuero";

describe("buildFollowupHtml - Wahlkreisbüro-Hinweis", () => {
  it("mdb + Name: html und text enthalten Anker und Namen", () => {
    const r = buildFollowupHtml({ token: "t", politicianName: "Anna Müller", recipientKind: "mdb" });
    expect(r.html).toContain(`${ANCHOR}"`);
    expect(r.html).toContain("Anna Müller");
    expect(r.text).toContain(ANCHOR);
    expect(r.text).toContain("Anna Müller");
    expect(r.html).toContain("Wahlkreisbüro finden");
  });

  it("mdb: Hinweis steht zwischen Bewertungsblock und Verabschiedung", () => {
    const { html } = buildFollowupHtml({ token: "t", politicianName: "Anna Müller", recipientKind: "mdb" });
    const hint = html.indexOf(ANCHOR);
    expect(html.indexOf("/feedback?r=")).toBeLessThan(hint);
    expect(hint).toBeLessThan(html.indexOf("Sign-off paragraph"));
  });

  it("mdb: Link ohne Query-Parameter", () => {
    const { html } = buildFollowupHtml({ token: "t", politicianName: "Anna Müller", recipientKind: "mdb" });
    expect(html).toMatch(/href="[^"?]*aktiv-werden#wahlkreisbuero"/);
  });

  it.each<SendLetterEmailParams["recipientKind"] | undefined>([
    "mdl",
    "rathaus",
    "landesregierung",
    "campaign_fixed",
    "bundeskanzler",
    "mdb_later",
    undefined,
  ])("kein Hinweis bei recipientKind=%s", (kind) => {
    const r = buildFollowupHtml({ token: "t", politicianName: "Anna Müller", recipientKind: kind });
    expect(r.html).not.toContain("#wahlkreisbuero");
    expect(r.text).not.toContain("#wahlkreisbuero");
  });

  it("mdb ohne Namen: kein Hinweis", () => {
    const r = buildFollowupHtml({ token: "t", recipientKind: "mdb" });
    expect(r.html).not.toContain("#wahlkreisbuero");
  });

  it("escaped den Namen im HTML", () => {
    const { html } = buildFollowupHtml({ token: "t", politicianName: "Anna <b>Müller</b>", recipientKind: "mdb" });
    expect(html).toContain("Anna &lt;b&gt;Müller&lt;/b&gt;");
    expect(html).not.toContain("Anna <b>Müller</b>");
  });

  it.each(["de", "en", "tr"] as const)("liefert den Block in %s", (locale) => {
    const r = buildFollowupHtml({ token: "t", locale, politicianName: "Anna Müller", recipientKind: "mdb" });
    expect(r.html).toContain(ANCHOR);
    expect(r.html).toContain("Bürgersprechstunde");
    expect(r.text).toContain(ANCHOR);
  });
});
