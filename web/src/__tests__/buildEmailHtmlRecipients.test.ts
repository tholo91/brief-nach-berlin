/**
 * E-Mail-Rendering pro Empfänger-Art (999.6):
 * - mdb: heutiges Layout (Deutscher Bundestag-Zeile, MdB-Label, AW-Link)
 * - mdl: Landtag-Anschrift aus postalAddress, MdL-Label, keine Bundestag-Zeile
 * - rathaus: keine Partei, kein AW-Link, amtliche Anschrift oder Google-Fallback
 * - LOCK-4c: kein sichtbarer Routing-Footer, Routing nur in der Debug-URL
 */

import {
  buildEmailHtml,
  buildLetterEmailSubject,
} from "@/lib/email/buildEmailHtml";
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
    const params = baseParams({});
    const html = buildEmailHtml(params);
    expect(buildLetterEmailSubject(params)).toBe("Dein Brief nach Berlin ist fertig");
    expect(html).toContain("Brief-nach-Berlin</h1>");
    expect(html).toContain("Dein Briefentwurf ist fertig zum Absenden.");
    expect(html).toContain("Deutscher Bundestag<br>");
    expect(html).toContain(", MdB (SPD)");
    expect(html).toContain("abgeordnetenwatch.de/profile/anna-mueller");
    expect(html).toContain("/images/email-title-watermark-v2.png");
    expect(html).toContain("/images/email-bundestag-banner.png");
    expect(html).not.toContain("google.com/search");
  });

  it("mdl: Landtag-Anschrift ohne Bundestag-Zeile, MdL-Label", () => {
    const params = baseParams({
        recipientKind: "mdl",
        politicianName: "Karl Schmidt",
        politicianFirstName: "Karl",
        politicianLastName: "Schmidt",
        politicianParty: "CDU",
        bundeslandKey: "NW",
        politicianPostalAddress:
          "Landtag Nordrhein-Westfalen, Platz des Landtags 1, 40221 Düsseldorf",
      });
    const html = buildEmailHtml(params);
    expect(buildLetterEmailSubject(params)).toBe("Dein Brief nach Düsseldorf ist fertig");
    expect(html).toContain("Brief-nach-Berlin</h1>");
    expect(html).toContain("Dein Brief nach Düsseldorf ist fertig zum Absenden.");
    expect(html).not.toContain("Deutscher Bundestag<br>");
    expect(html).toContain("Landtag Nordrhein-Westfalen<br>");
    expect(html).toContain(", MdL (CDU)");
    expect(html).toContain("/images/email-variants/email-landtag-nordrhein-westfalen.webp");
    expect(html).not.toContain("/images/email-title-watermark-v2.png");
    expect(html).not.toContain("/images/email-bundestag-banner.png");
    expect(html).not.toContain("Bundestagsbüros");
    expect(html).not.toContain("im Bundestag");
    expect(html).toContain("Handgeschriebene Briefe fallen in Abgeordnetenbüros auf.");
  });

  it("mdl: verwendet für Hessen die Landeshauptstadt Wiesbaden", () => {
    const params = baseParams({
      recipientKind: "mdl",
      bundeslandKey: "HE",
      politicianPostalAddress:
        "Hessischer Landtag, Schlossplatz 1-3, 65183 Wiesbaden",
    });
    expect(buildLetterEmailSubject(params)).toBe("Dein Brief nach Wiesbaden ist fertig");
    expect(buildEmailHtml(params)).toContain(
      "Dein Brief nach Wiesbaden ist fertig zum Absenden."
    );
  });

  it("mdl: leitet den Betreff für alle 16 Landeshauptstädte aus der Anschrift ab", () => {
    const destinations = {
      BW: ["Landtag von Baden-Württemberg, Konrad-Adenauer-Straße 3, 70173 Stuttgart", "Stuttgart"],
      BY: ["Bayerischer Landtag, Max-Planck-Straße 1, 81675 München", "München"],
      BE: ["Abgeordnetenhaus von Berlin, Margot-Friedländer-Platz, 10117 Berlin", "Berlin"],
      BB: ["Landtag Brandenburg, Alter Markt 1, 14467 Potsdam", "Potsdam"],
      HB: ["Bremische Bürgerschaft, Am Markt 20, 28195 Bremen", "Bremen"],
      HH: ["Hamburgische Bürgerschaft, Rathausmarkt 1, 20095 Hamburg", "Hamburg"],
      HE: ["Hessischer Landtag, Schlossplatz 1-3, 65183 Wiesbaden", "Wiesbaden"],
      MV: ["Landtag Mecklenburg-Vorpommern, Lennéstraße 1, 19053 Schwerin", "Schwerin"],
      NI: ["Niedersächsischer Landtag, Hannah-Arendt-Platz 1, 30159 Hannover", "Hannover"],
      NW: ["Landtag Nordrhein-Westfalen, Platz des Landtags 1, 40221 Düsseldorf", "Düsseldorf"],
      RP: ["Landtag Rheinland-Pfalz, Platz der Mainzer Republik 1, 55116 Mainz", "Mainz"],
      SL: ["Landtag des Saarlandes, Franz-Josef-Röder-Straße 7, 66119 Saarbrücken", "Saarbrücken"],
      SN: ["Sächsischer Landtag, Bernhard-von-Lindenau-Platz 1, 01067 Dresden", "Dresden"],
      ST: ["Landtag von Sachsen-Anhalt, Domplatz 6-9, 39104 Magdeburg", "Magdeburg"],
      SH: ["Schleswig-Holsteinischer Landtag, Düsternbrooker Weg 70, 24105 Kiel", "Kiel"],
      TH: ["Thüringer Landtag, Jürgen-Fuchs-Straße 1, 99096 Erfurt", "Erfurt"],
    } as const;

    for (const [bundeslandKey, [politicianPostalAddress, city]] of Object.entries(destinations)) {
      const params = baseParams({
        recipientKind: "mdl",
        bundeslandKey,
        politicianPostalAddress,
      });
      expect(buildLetterEmailSubject(params)).toBe(`Dein Brief nach ${city} ist fertig`);
    }
  });

  it("mdl: mappt alle 16 Bundesländer auf eine eigene Briefmarke", () => {
    const stamps = {
      BW: "baden-wuerttemberg",
      BY: "bayern",
      BE: "berlin",
      BB: "brandenburg",
      HB: "bremen",
      HH: "hamburg",
      HE: "hessen",
      MV: "mecklenburg-vorpommern",
      NI: "niedersachsen",
      NW: "nordrhein-westfalen",
      RP: "rheinland-pfalz",
      SL: "saarland",
      SN: "sachsen",
      ST: "sachsen-anhalt",
      SH: "schleswig-holstein",
      TH: "thueringen",
    } as const;

    for (const [bundeslandKey, slug] of Object.entries(stamps)) {
      const html = buildEmailHtml(
        baseParams({ recipientKind: "mdl", bundeslandKey })
      );
      expect(html).toContain(`/images/email-variants/email-landtag-${slug}.webp`);
    }
  });

  it("landesregierung: institutioneller Adressblock und Copy ohne MdL-, Partei- oder Profilkontext", () => {
    const params = baseParams({
      recipientKind: "landesregierung",
      politicianName: "Landesregierung Nordrhein-Westfalen",
      politicianFirstName: "",
      politicianLastName: "Landesregierung Nordrhein-Westfalen",
      politicianParty: null,
      politicianPostalAddress:
        "Staatskanzlei des Landes Nordrhein-Westfalen, Horionplatz 1, 40190 Düsseldorf",
      politicianAbgeordnetenwatchUrl: null,
      bundeslandKey: "NW",
      governmentSource: {
        institutionKind: "landesregierung",
        officeName: "Staatskanzlei des Landes Nordrhein-Westfalen",
        title: "Staatskanzlei Nordrhein-Westfalen: Organisationsplan",
        url: "https://www.land.nrw/media/34665/download",
        stand: "2026-07-20",
      },
    });
    const html = buildEmailHtml(params);
    expect(buildLetterEmailSubject(params)).toBe(
      "Dein Brief nach Düsseldorf ist fertig"
    );
    expect(html).toContain(
      "Dein Brief nach Düsseldorf ist fertig zum Absenden."
    );
    expect(html).toContain("<strong>Staatskanzlei NRW</strong><br>");
    expect(html).toContain("Horionplatz 1<br>40190 Düsseldorf");
    expect(html).not.toContain("<strong>Landesregierung Nordrhein-Westfalen</strong><br>");
    expect(html).not.toContain("Staatskanzlei des Landes Nordrhein-Westfalen<br>Horionplatz 1");
    expect(html).toContain("Staatskanzlei NRW: Organisationsplan");
    expect(html).toContain("geprüft am 20.07.2026");
    expect(html).not.toContain(", MdL (");
    expect(html).not.toContain(", MdB (");
    expect(html).not.toContain("abgeordnetenwatch.de/profile");
    expect(html).not.toContain("Landtagsbüro");
    expect(html).not.toContain("im Landtag");
  });

  it("landesregierung: Stadtstaat nennt im Betreff den Senat", () => {
    const params = baseParams({
      recipientKind: "landesregierung",
      politicianName: "Senat von Berlin",
      politicianFirstName: "",
      politicianLastName: "Senat von Berlin",
      politicianParty: null,
      politicianPostalAddress: "Senatskanzlei Berlin, Rotes Rathaus, Jüdenstraße 1, 10178 Berlin",
      politicianAbgeordnetenwatchUrl: null,
      bundeslandKey: "BE",
      governmentSource: {
        institutionKind: "senat",
        officeName: "Senatskanzlei Berlin",
        title: "Berlin.de: Bürgerberatung der Senatskanzlei",
        url: "https://www.berlin.de/rbmskzl/service/buergerberatung/",
        stand: "2026-07-20",
      },
    });
    expect(buildLetterEmailSubject(params)).toBe("Dein Brief nach Berlin ist fertig");
    expect(buildEmailHtml(params)).toContain(
      "Dein Brief nach Berlin ist fertig zum Absenden."
    );
  });

  it("rathaus: zeigt die vollständige amtliche Anschrift und Google nur zur Kontrolle", () => {
    const params = baseParams({
        recipientKind: "rathaus",
        politicianName: "Bürgermeisteramt Köln",
        politicianFirstName: "",
        politicianLastName: "Bürgermeisteramt Köln",
        politicianParty: null,
        politicianPostalAddress: "Bürgermeisteramt Köln, Rathaus, 50667 Köln",
        politicianAbgeordnetenwatchUrl: null,
        rathausSearch: {
          ort: "Köln",
          kind: "buergermeisteramt",
          address: {
            source: "destatis",
            ags: "05315000",
            streetAddress: "Rathaus",
            postalCode: "50667",
            city: "Köln",
            sourceTitle: "Destatis-Anschriftenverzeichnis",
            sourceUrl: "https://www.destatis.de/anschriften",
            sourceStand: "31.01.2026",
          },
        },
      });
    const html = buildEmailHtml(params);
    expect(buildLetterEmailSubject(params)).toBe("Dein Brief ans Rathaus in Köln ist fertig");
    expect(html).toContain("Brief-nach-Berlin</h1>");
    expect(html).toContain("Dein Brief ans Rathaus in Köln ist fertig zum Absenden.");
    expect(html).not.toContain("Deutscher Bundestag<br>");
    // ", MdB (" / ", MdL (" sind die Mandats-Labels der Adresszeile; das
    // statische Template erwähnt "MdB" an anderer Stelle (Footer-Link) legitim.
    expect(html).not.toContain(", MdB (");
    expect(html).not.toContain(", MdL (");
    expect(html).not.toContain("abgeordnetenwatch.de/profile");
    expect(html).toContain("<strong>Bürgermeisteramt Köln</strong><br>");
    expect(html).toContain("Rathaus<br>50667 Köln");
    expect(html).toContain("google.com/search");
    expect(html).toContain("Destatis</a>, Stand 31.01.2026");
    expect(html).toContain("https://www.destatis.de/anschriften");
    expect(html).toContain(encodeURIComponent("Bürgermeisteramt Köln Postanschrift"));
    expect(html).not.toContain(encodeURIComponent("Bürgermeisteramt 50667 Köln"));
    expect(html).toMatch(/<a href="[^"]+"[^>]*>hier<\/a> prüfen/);
    expect(html).toContain("/images/email-variants/email-kommune-rathaus.webp");
    expect(html).toContain("/images/email-variants/email-rathaus-banner.webp");
    expect(html).not.toContain("/images/email-bundestag-banner.png");
    expect(html).not.toContain("Bundestagsbüros");
    expect(html).not.toContain("im Bundestag");
    expect(html).not.toContain("aus deinem Wahlkreis");
  });

  it("rathaus: kennzeichnet eine fehlende Zuordnung als Such-Fallback", () => {
    const html = buildEmailHtml(baseParams({
      recipientKind: "rathaus",
      politicianName: "Zuständiges Bürgermeisteramt",
      politicianFirstName: "",
      politicianLastName: "Zuständiges Bürgermeisteramt",
      politicianParty: null,
      politicianPostalAddress: "Zuständiges Bürgermeisteramt",
      politicianAbgeordnetenwatchUrl: null,
      rathausSearch: {
        ort: "",
        kind: "buergermeisteramt",
        address: { source: "fallback" },
      },
    }));

    expect(html).toContain("keine eindeutige amtliche Anschrift");
    expect(html).toContain("Die genaue Anschrift findest du");
    expect(html).toContain(encodeURIComponent("Bürgermeisteramt Postanschrift"));
    expect(html).not.toContain("60261");
  });

  it("bezirksamt: sucht ohne Wohn-PLZ nach der genauen Anschrift", () => {
    const html = buildEmailHtml(baseParams({
      recipientKind: "rathaus",
      politicianName: "Zuständiges Bezirksamt in Berlin",
      politicianFirstName: "",
      politicianLastName: "Zuständiges Bezirksamt in Berlin",
      politicianParty: null,
      politicianPostalAddress: "Zuständiges Bezirksamt in Berlin",
      politicianAbgeordnetenwatchUrl: null,
      rathausSearch: {
        ort: "Berlin",
        kind: "bezirksamt",
        address: { source: "fallback" },
      },
    }));

    expect(html).toContain(encodeURIComponent("Bezirksamt Berlin Postanschrift"));
    expect(html).not.toContain("10245");
    expect(html).not.toContain(encodeURIComponent("Bürgermeisteramt Berlin"));
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
