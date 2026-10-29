import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const usePathname = jest.fn();

jest.mock("next/navigation", () => ({ usePathname: () => usePathname() }));
jest.mock("@/components/i18n/LanguageSwitcher", () => ({ LanguageSwitcher: () => null }));

import AppHeader from "@/components/AppHeader";

function renderAt(pathname: string) {
  usePathname.mockReturnValue(pathname);
  return renderToStaticMarkup(createElement(AppHeader));
}

describe("AppHeader", () => {
  it("links campaign pages to the other campaigns", () => {
    const markup = renderAt("/kampagne/ehrensache-erbschaftsteuer");

    expect(markup).toContain('href="/ngo-briefkampagne"');
    expect(markup).toContain("Weitere Kampagnen");
    expect(markup).not.toContain("Kampagne starten");
  });

  it.each(["/kampagne/verwalten", "/kampagne/starten", "/kampagne/verifizieren", "/kampagne/foo/erstellt", "/ngo-briefkampagne"])(
    "hides the link on %s",
    (pathname) => {
      expect(renderAt(pathname)).not.toContain("Weitere Kampagnen");
    },
  );

  it.each(["/jung", "/eltern"])("shows the write CTA on %s", (pathname) => {
    const markup = renderAt(pathname);

    expect(markup).toContain('href="#schreiben"');
    expect(markup).toContain("Brief entwerfen");
    expect(markup).toContain(">Schreiben<");
  });

  it("shows the class link CTA on /unterricht", () => {
    const markup = renderAt("/unterricht");

    expect(markup).toContain('href="#klassenlink"');
    expect(markup).toContain("Klassenlink erstellen");
    expect(markup).toContain(">Klassenlink<");
  });

  it.each(["/mitbestimmen-ohne-wahlrecht", "/projekttag-demokratie", "/"])("shows no school CTA on %s", (pathname) => {
    const markup = renderAt(pathname);

    expect(markup).not.toContain("#schreiben");
    expect(markup).not.toContain("#klassenlink");
  });

  it("keeps the campaign CTA on /ngo-briefkampagne", () => {
    const markup = renderAt("/ngo-briefkampagne");

    expect(markup).toContain("Kampagne starten");
    expect(markup).toContain('href="/kampagne/starten"');
  });
});
