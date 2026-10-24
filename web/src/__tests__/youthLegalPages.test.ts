jest.mock("@/lib/mistral", () => ({
  MISTRAL_MODELS: {
    letter: "mistral-large-latest",
    moderation: "mistral-moderation-latest",
    transcription: "voxtral-mini-latest",
    levelRouting: "mistral-small-latest",
  },
}));

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Datenschutz from "@/app/(site)/datenschutz/page";
import KiTransparenz from "@/app/(site)/ki-transparenz/page";

describe("youth mode sections on legal pages", () => {
  it("datenschutz has the Jugendmodus section", () => {
    const html = renderToStaticMarkup(createElement(Datenschutz));
    expect(html).toContain('id="jugendmodus"');
    expect(html).toContain("22. Jugendmodus für Schülerinnen und Schüler");
  });

  it("ki-transparenz has the Schüler:innen section", () => {
    const html = renderToStaticMarkup(createElement(KiTransparenz));
    expect(html).toContain("Briefe von Schüler:innen");
    expect(html).toContain("150 bis 200 Wörtern");
  });
});
