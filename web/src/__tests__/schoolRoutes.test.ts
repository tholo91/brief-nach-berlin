import nextConfig from "../../next.config";
import sitemap from "@/app/sitemap";
import { APP_URL } from "@/lib/config";

type Rule = { source: string; destination: string; statusCode?: number; permanent?: boolean };

async function loadRules(): Promise<Rule[]> {
  const rules = await nextConfig.redirects?.();
  return (rules ?? []) as Rule[];
}

function destinationOf(rules: Rule[], source: string): string | undefined {
  return rules.find((rule) => rule.source === source)?.destination;
}

describe("school redirects (next.config)", () => {
  it("sends the old teacher paths to /unterricht", async () => {
    const rules = await loadRules();
    expect(destinationOf(rules, "/schule/ablauf")).toBe("/unterricht/ablauf");
    expect(destinationOf(rules, "/lehrer")).toBe("/unterricht");
    expect(destinationOf(rules, "/lehrkraefte")).toBe("/unterricht");
  });

  it("sends the old kids paths to /schule and keeps /schule/ablauf on the teacher print page", async () => {
    const rules = await loadRules();
    expect(destinationOf(rules, "/jung")).toBe("/schule");
    expect(destinationOf(rules, "/genz")).toBe("/schule");
    expect(destinationOf(rules, "/schueler")).toBe("/schule");
    expect(destinationOf(rules, "/schule/ablauf")).toBe("/unterricht/ablauf");
    expect(rules.findIndex((rule) => rule.source === "/schule/ablauf")).toBeGreaterThanOrEqual(0);
  });

  it("uses plain 301 without the permanent key", async () => {
    const rules = await loadRules();
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule.statusCode).toBe(301);
      expect(rule).not.toHaveProperty("permanent");
    }
  });

  it("only redirects to internal paths (no open redirect)", async () => {
    const rules = await loadRules();
    for (const rule of rules) {
      expect(rule.destination.startsWith("/")).toBe(true);
      expect(rule.destination.startsWith("//")).toBe(false);
    }
  });

  it("never redirects /schule itself and has no /schule wildcard", async () => {
    const rules = await loadRules();
    for (const rule of rules) {
      expect(rule.source).not.toBe("/schule");
      expect(rule.source.startsWith("/schule/:")).toBe(false);
    }
  });

  it("has no chains or loops", async () => {
    const rules = await loadRules();
    const sources = new Set(rules.map((rule) => rule.source));
    for (const rule of rules) {
      expect(sources.has(rule.destination)).toBe(false);
    }
  });
});

describe("sitemap school URLs", () => {
  const urls = sitemap().map((entry) => entry.url);

  it("lists the teacher pages and keeps the other audience pages", () => {
    expect(urls).toContain(`${APP_URL}/unterricht`);
    expect(urls).toContain(`${APP_URL}/unterricht/ablauf`);
    expect(urls).toContain(`${APP_URL}/eltern`);
    expect(urls).toContain(`${APP_URL}/projekttag-demokratie`);
    expect(urls).not.toContain(`${APP_URL}/schule/ablauf`);
  });

  it("lists /schule once and no /jung URL", () => {
    expect(urls.filter((url) => url === `${APP_URL}/schule`)).toHaveLength(1);
    expect(urls.some((url) => url.endsWith("/jung"))).toBe(false);
  });

  it("has no duplicates", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });
});
