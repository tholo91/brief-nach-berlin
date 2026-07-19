import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RathausAdresseButton } from "@/components/wizard/RathausAdresseButton";
import { buildRathausRecipient } from "@/lib/lookup/rathausRecipient";

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

  it("kennzeichnet einen fehlenden eindeutigen Treffer als Such-Fallback", () => {
    const recipient = buildRathausRecipient({
      gemeindeName: "Frankfurt am Main",
      plz: "60261",
      bundeslandKey: "HE",
    });
    const html = renderToStaticMarkup(
      createElement(RathausAdresseButton, { recipient })
    );

    expect(html).toContain("keine eindeutige amtliche Anschrift");
    expect(html).toContain("Die genaue Anschrift findest du");
    expect(html).toContain(encodeURIComponent("Bürgermeisteramt Postanschrift"));
    expect(html).not.toContain("60261");
  });

  it("sucht bei Berliner Empfängern ausdrücklich nach dem Bezirksamt", () => {
    const recipient = buildRathausRecipient({
      gemeindeName: "Berlin",
      plz: "10245",
      bundeslandKey: "BE",
      bezirk: "Friedrichshain-Kreuzberg",
    });
    const html = renderToStaticMarkup(
      createElement(RathausAdresseButton, { recipient })
    );

    expect(html).toContain(
      encodeURIComponent("Bezirksamt Friedrichshain-Kreuzberg Postanschrift")
    );
    expect(html).not.toContain("10245");
    expect(html).not.toContain(encodeURIComponent("Bürgermeisteramt Berlin"));
  });
});
