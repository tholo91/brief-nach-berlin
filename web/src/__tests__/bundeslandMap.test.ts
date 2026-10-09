import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BundeslandMap } from "@/components/campaigns/BundeslandMap";
import { BUNDESLAND_KEYS } from "@/lib/campaigns/schema";
import { BUNDESLAND_MAP_PATHS } from "@/lib/campaigns/bundeslandMapGeometry.generated";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("bundeslandMapGeometry", () => {
  it("has a path for every Bundesland key and stays small", () => {
    for (const key of BUNDESLAND_KEYS) {
      expect(BUNDESLAND_MAP_PATHS[key].length).toBeGreaterThan(50);
    }
    expect(JSON.stringify(BUNDESLAND_MAP_PATHS).length).toBeLessThan(30 * 1024);
  });
});

describe("BundeslandMap", () => {
  const regions = [
    { key: "BY" as const, label: "Bayern", count: 31 },
    { key: "NW" as const, label: "Nordrhein-Westfalen", count: 20 },
    { key: "BE" as const, label: "Berlin", count: 10 },
    { key: "HH" as const, label: "Hamburg", count: 6 },
    { key: "HE" as const, label: "Hessen", count: 5 },
  ];

  it("shows the top 3 with percent and the rest as one line, no threshold hint by default", () => {
    const markup = renderToStaticMarkup(createElement(BundeslandMap, { regions, total: 72 }));
    expect(markup).toContain("Bayern");
    expect(markup).toContain("43 %");
    expect(markup).toContain("+ 2 weitere");
    expect(markup).toContain("15 %");
    expect(markup).not.toContain("grau = unter 5 Briefe");
    expect(markup).not.toMatch(/[–—]/);
  });

  it("renders filter links as anchors in the internal mode and drops the sr-only list", () => {
    const hrefs = Object.fromEntries(
      BUNDESLAND_KEYS.map((key) => [key, `/stats?bundesland=${key}`]),
    );
    const markup = renderToStaticMarkup(
      createElement(BundeslandMap, { regions, total: 72, hrefs, selected: "BY" }),
    );
    expect(markup).toContain('href="/stats?bundesland=BY"');
    expect(markup).toContain('aria-current="true"');
    expect(markup).not.toContain("sr-only");
  });
});
