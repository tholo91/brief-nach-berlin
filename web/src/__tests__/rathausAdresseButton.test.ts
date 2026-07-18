import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RathausAdresseButton } from "@/components/wizard/RathausAdresseButton";

describe("RathausAdresseButton", () => {
  it("verkauft eine Anschrift ohne Straße nicht als zuverlässig zustellbar", () => {
    const html = renderToStaticMarkup(
      createElement(RathausAdresseButton, {
        ortsname: "Köln",
        plz: "50667",
        recipientKind: "stadtverwaltung",
      })
    );

    expect(html).toContain("nur eine Orientierung");
    expect(html).toContain("möglicherweise nicht vollständig");
    expect(html).not.toContain("zuverlässig");
    expect(html).toContain("Rathaus-Adresse finden");
  });

  it("sucht bei Berliner Empfängern ausdrücklich nach dem Bezirksamt", () => {
    const html = renderToStaticMarkup(
      createElement(RathausAdresseButton, {
        ortsname: "Berlin",
        plz: "10245",
        recipientKind: "bezirksamt",
      })
    );

    expect(html).toContain("Bezirksamt-Adresse finden");
    expect(html).toContain("Bezirksamt%20Adresse%2010245%20Berlin");
    expect(html).not.toContain("Rathaus%20Adresse%2010245%20Berlin");
  });
});
