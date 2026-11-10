import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RathausAdresseButton } from "@/components/wizard/RathausAdresseButton";
import { buildRathausRecipient } from "@/lib/lookup/rathausRecipient";
import { lookupPLZWithLevel } from "@/lib/lookup/plzLookup";

describe("RathausAdresseButton", () => {
  it("zeigt die vollständige amtliche Anschrift mit Quelle", () => {
    const recipient = buildRathausRecipient({
      gemeindeName: "Duisburg",
      plz: "47051",
      bundeslandKey: "NW",
      officialAddress: {
        ags: "05112000",
        streetAddress: "Burgplatz 19",
        postalCode: "47051",
        city: "Duisburg",
        sourceTitle: "Destatis-Anschriftenverzeichnis",
        sourceUrl: "https://www.destatis.de/anschriften",
        sourceStand: "31.01.2026",
      },
    });
    const html = renderToStaticMarkup(
      createElement(RathausAdresseButton, { recipient })
    );

    expect(html).toContain("Amtliche Postanschrift");
    expect(html).toContain("Burgplatz 19");
    expect(html).toContain("47051 Duisburg");
    expect(html).toContain("Destatis</a>, Stand 31.01.2026");
    expect(html).toContain("https://www.destatis.de/anschriften");
    expect(html).toContain(encodeURIComponent("Bürgermeisteramt Duisburg Postanschrift"));
    expect(html).not.toContain(encodeURIComponent("Bürgermeisteramt 47051 Duisburg"));
  });

  it("kennzeichnet einen fehlenden Treffer als Such-Fallback mit Ort und Button", () => {
    const recipient = buildRathausRecipient({
      gemeindeName: "Frankfurt am Main",
      plz: "60261",
      bundeslandKey: "HE",
    });
    const html = renderToStaticMarkup(
      createElement(RathausAdresseButton, { recipient })
    );

    expect(html).toContain("Die Postanschrift konnte ich für deine PLZ nicht sicher zuordnen.");
    expect(html).toContain(">Adresse suchen</a>");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain(encodeURIComponent("Bürgermeisteramt Frankfurt am Main Postanschrift"));
    expect(html).not.toContain("60261");
  });

  it("listet bei mehrdeutiger Berliner PLZ die Bezirke mit Adresse", () => {
    const recipient = lookupPLZWithLevel("10245").byLevel.Kommune[0];
    const html = renderToStaticMarkup(
      createElement(RathausAdresseButton, { recipient })
    );

    expect(html).toContain("Deine PLZ liegt in Friedrichshain-Kreuzberg oder Pankow. Nimm die Adresse deines Bezirks:");
    expect(html).toContain("Bezirksamt Pankow");
    expect(html).toContain("Postfach 73 01 13");
    expect(html).toContain("13062 Berlin");
    expect(html).not.toContain("Adresse suchen");
  });

  it("zeigt für einen Berliner Bezirk die berlin.de-Anschrift mit Quelle", () => {
    const recipient = buildRathausRecipient({
      gemeindeName: "Berlin",
      plz: "13187",
      bundeslandKey: "BE",
      bezirk: "Pankow",
    });
    const html = renderToStaticMarkup(
      createElement(RathausAdresseButton, { recipient })
    );

    expect(html).toContain("Bezirksamt Pankow von Berlin");
    expect(html).toContain("Postfach 73 01 13");
    expect(html).toContain("13062 Berlin");
    expect(html).toContain("berlin.de</a>, Stand 10.11.2026");
    expect(html).toContain("https://www.berlin.de/ba-pankow/");
    expect(html).toContain(encodeURIComponent("Bezirksamt Pankow Postanschrift"));
    expect(html).not.toContain("13187");
  });
});
