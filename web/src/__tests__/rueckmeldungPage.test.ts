jest.mock("@/lib/actions/submitOutcome", () => ({ submitOutcomeAction: jest.fn() }));

import { renderToStaticMarkup } from "react-dom/server";
import RueckmeldungPage, { metadata } from "@/app/(site)/rueckmeldung/page";
import { createRueckmeldungToken } from "@/lib/rueckmeldung/token";
import { submitOutcomeAction } from "@/lib/actions/submitOutcome";

const previousSecret = process.env.FEEDBACK_TOKEN_SECRET;
beforeEach(() => { process.env.FEEDBACK_TOKEN_SECRET = "local-page-test-secret"; jest.clearAllMocks(); });
afterAll(() => {
  if (previousSecret === undefined) delete process.env.FEEDBACK_TOKEN_SECRET;
  else process.env.FEEDBACK_TOKEN_SECRET = previousSecret;
});

it.each([undefined, "invalid.signed.token"])("rejects missing or invalid tokens without writing", async (t) => {
  const view = await RueckmeldungPage({ searchParams: Promise.resolve({ a: "ja", t }) });
  expect(renderToStaticMarkup(view)).toContain("nicht mehr gültig");
  expect(submitOutcomeAction).not.toHaveBeenCalled();
});

it.each(["ja", "nein", "nicht"])("renders the %s entry without exposing identity or collecting answers before explicit consent", async (a) => {
  const view = await RueckmeldungPage({ searchParams: Promise.resolve({ a, t: createRueckmeldungToken("private@example.org") }) });
  const html = renderToStaticMarkup(view);
  expect(html).toContain("Dauert ca. 2 Minuten");
  expect(html).toContain("Ich willige ausdrücklich ein");
  expect(html).not.toContain("private@example.org");
  expect(html).not.toContain("political_self_efficacy");
  expect(html).not.toContain('type="submit"');
  expect(html).not.toContain('checked=""');
  expect(submitOutcomeAction).not.toHaveBeenCalled();
});

it("rejects an unknown entry choice instead of silently counting it as yes", async () => {
  const view = await RueckmeldungPage({ searchParams: Promise.resolve({ a: "unknown", t: createRueckmeldungToken("private@example.org") }) });
  expect(renderToStaticMarkup(view)).toContain("nicht mehr gültig");
});

it("prevents indexing and referrer leakage", () => {
  expect(metadata.robots).toEqual({ index: false, follow: false });
  expect(metadata.referrer).toBe("no-referrer");
});
