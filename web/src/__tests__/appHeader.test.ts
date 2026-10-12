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
});
