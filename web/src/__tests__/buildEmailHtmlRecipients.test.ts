/**
 * E-Mail-Rendering pro Empfänger-Art (999.6):
 * - mdb: heutiges Layout (Deutscher Bundestag-Zeile, MdB-Label, AW-Link)
 * - mdl: Landtag-Anschrift aus postalAddress, MdL-Label, keine Bundestag-Zeile
 * - rathaus: keine Partei, kein AW-Link, Google-Adresszeile
 * - LOCK-4c: kein sichtbarer Routing-Footer, Routing nur in der Debug-URL
 */

import { buildEmailHtml } from "@/lib/email/buildEmailHtml";
import type { SendLetterEmailParams } from "@/lib/email/sendLetterEmail";

function baseParams(overrides: Partial<SendLetterEmailParams>): SendLetterEmailParams {
  return {
    recipientEmail: "test@example.org",
    politicianName: "Anna Müller",
    politicianFirstName: "Anna",
    politicianLastName: "Müller",
    politicianTitle: null,
    politicianParty: "SPD",
    politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
    politicianAbgeordnetenwatchUrl: "https://www.abgeordnetenwatch.de/profile/anna-mueller",
    recipientKind: "mdb",
    letterText: "Sehr geehrte Frau Müller,\n\nTestbrief.\n\nMit freundlichen Grüßen",
    issueText: "Testanliegen",
    ...overrides,
  };
}

describe("buildEmailHtml — Empfänger-Arten", () => {
  it("mdb: heutiges Layout bleibt (Deutscher Bundestag + MdB + AW-Link)", () => {
    const html = buildEmailHtml(baseParams({}));
    expect(html).toContain("Deutscher Bundestag<br>");
    expect(html).toContain(", MdB (SPD)");
    expect(html).toContain("abgeordnetenwatch.de/profile/anna-mueller");
    expect(html).not.toContain("google.com/search");
  });

  it("mdl: Landtag-Anschrift ohne Bundestag-Zeile, MdL-Label", () => {
    const html = buildEmailHtml(
      baseParams({
        recipientKind: "mdl",
        politicianName: "Karl Schmidt",
        politicianFirstName: "Karl",
        politicianLastName: "Schmidt",
        politicianParty: "CDU",
        politicianPostalAddress:
          "Landtag Nordrhein-Westfalen, Platz des Landtags 1, 40221 Düsseldorf",
      })
    );
    expect(html).not.toContain("Deutscher Bundestag<br>");
    expect(html).toContain("Landtag Nordrhein-Westfalen<br>");
    expect(html).toContain(", MdL (CDU)");
  });

  it("rathaus: keine Partei, kein MdB/MdL, kein AW-Link, Google-Adresszeile", () => {
    const html = buildEmailHtml(
      baseParams({
        recipientKind: "rathaus",
        politicianName: "Stadtverwaltung Köln",
        politicianFirstName: "",
        politicianLastName: "Stadtverwaltung Köln",
        politicianParty: null,
        politicianPostalAddress: "Stadtverwaltung Köln, 50667 Köln",
        politicianAbgeordnetenwatchUrl: null,
        rathausSearch: { plz: "50667", ort: "Köln" },
      })
    );
    expect(html).not.toContain("Deutscher Bundestag<br>");
    // ", MdB (" / ", MdL (" sind die Mandats-Labels der Adresszeile; das
    // statische Template erwähnt "MdB" an anderer Stelle (Footer-Link) legitim.
    expect(html).not.toContain(", MdB (");
    expect(html).not.toContain(", MdL (");
    expect(html).not.toContain("abgeordnetenwatch.de/profile");
    expect(html).toContain("Stadtverwaltung Köln<br>");
    expect(html).toContain("50667 Köln");
    expect(html).toContain("google.com/search");
    expect(html).toContain("Rathaus-Adresse finden");
    expect(html).toContain(encodeURIComponent("Rathaus Adresse 50667 Köln"));
  });

  it("LOCK-4c: kein sichtbarer Routing-Footer in der Mail", () => {
    const html = buildEmailHtml(
      baseParams({
        debug: {
          toneLevel: 3,
          toneLabel: "sachlich-engagiert",
          letterLengthKey: "1",
          letterLengthMin: 200,
          letterLengthMax: 240,
          issueTextLength: 20,
          wordCount: 220,
          wordCountInRange: true,
          fallbackUsed: false,
          retried: false,
          politicalLevel: "Land",
          representativeName: "Karl Schmidt",
          representativeWahlkreis: "Köln II",
          representativeLevel: "Land",
          representativeParty: "CDU",
          mdbContextUsed: false,
          availablePoliticianCount: 5,
          model: "mistral-large-latest",
          temperature: 0.4,
          generationMs: 5000,
          hasParty: false,
          hasNgo: false,
          usedSpeechToText: false,
          routedPrimaryLevel: "Land",
          routedPrimaryConfidence: "high",
          wasOverridden: false,
          selectedLevel: "Land",
        },
      })
    );
    expect(html).not.toContain("Wohin geht dein Brief");
    expect(html).not.toContain("Brief gerichtet an");
    expect(html).not.toContain("KI-Vorauswahl");
    // Debug-URL bleibt als einziger Träger der Routing-Info
    expect(html).toContain("/debug?d=");
  });
});
