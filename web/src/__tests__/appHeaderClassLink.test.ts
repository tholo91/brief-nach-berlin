import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const useStoredClassToken = jest.fn();

jest.mock("next/navigation", () => ({ usePathname: () => "/unterricht" }));
jest.mock("@/components/i18n/LanguageSwitcher", () => ({ LanguageSwitcher: () => null }));
jest.mock("@/components/schule/useStoredClassToken", () => ({
  useStoredClassToken: () => useStoredClassToken(),
}));

import AppHeader from "@/components/AppHeader";

describe("AppHeader school tabs with a remembered class link (A1)", () => {
  it("sends the Schüler:innen tab back into the class with ?k", () => {
    useStoredClassToken.mockReturnValue("abc.def");
    const markup = renderToStaticMarkup(createElement(AppHeader));
    expect(markup).toContain('href="/schule?k=abc.def"');
    expect(markup).toContain('href="/unterricht"');
    expect(markup).toContain('href="/eltern"');
  });

  it("keeps the plain /schule link without a remembered link", () => {
    useStoredClassToken.mockReturnValue(null);
    const markup = renderToStaticMarkup(createElement(AppHeader));
    expect(markup).toContain('href="/schule"');
    expect(markup).not.toContain("?k=");
  });
});
