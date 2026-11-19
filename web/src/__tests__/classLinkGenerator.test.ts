import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@/lib/mistral", () => ({}));
const createClassLinkAction = jest.fn();
jest.mock("@/lib/actions/createClassLink", () => ({
  createClassLinkAction: (...args: unknown[]) => createClassLinkAction(...args),
}));

import { ClassLinkGenerator } from "@/components/schule/ClassLinkGenerator";
import { LEVEL_OPTIONS, STEP_INFO, levelSummary } from "@/components/schule/classLinkHelpers";

describe("ClassLinkGenerator Empfänger (A4)", () => {
  const html = renderToStaticMarkup(createElement(ClassLinkGenerator));

  it("offers Automatisch (default), Land and Bund with hints", () => {
    expect(html).toContain("Empfänger");
    expect(html).toContain("Automatisch (empfohlen)");
    expect(html).toContain("Bildungssenator:in oder Bundestagsabgeordnete:r");
    expect(STEP_INFO[3]).toContain("Eine feste Ebene passt am besten, wenn die ganze Klasse zu einem Thema schreibt.");
    expect(LEVEL_OPTIONS.map((option) => option.value)).toEqual(["auto", "Land", "Bund"]);
    const radios = html.match(/name="schule-level"[^>]*>/g) ?? [];
    expect(radios).toHaveLength(3);
    expect(radios[0]).toContain('checked=""');
    expect(radios[1]).not.toContain('checked=""');
  });

  it("has no Kommune option and no em dashes", () => {
    expect(html).not.toContain("Kommune");
    expect(html).not.toMatch(/[–—]/);
    expect(JSON.stringify(LEVEL_OPTIONS)).not.toMatch(/[–—]/);
  });

  it("summarises the level in one sentence", () => {
    expect(levelSummary("auto")).toContain("passend zum Thema");
    expect(levelSummary("Land")).toContain("Landesebene");
    expect(levelSummary("Bund")).toContain("Bundesebene");
  });
});
