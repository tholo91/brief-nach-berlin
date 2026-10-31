jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/supabase/server", () => ({ getServiceRoleClient: jest.fn(() => ({})) }));
jest.mock("@/lib/dataDeletion/userData", () => ({
  lookupUserDataByEmail: jest.fn(),
  deleteUserDataByEmail: jest.fn(),
}));
jest.mock("@/lib/actions/deleteData", () => ({ deleteDataAction: jest.fn() }));

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import DatenloeschenPage from "@/app/(site)/datenloeschen/page";
import { createDataDeletionToken } from "@/lib/dataDeletion/token";
import { deleteUserDataByEmail, lookupUserDataByEmail } from "@/lib/dataDeletion/userData";
import { buildDataDeletionMailto } from "@/lib/email/mailLocale";

const mockedLookup = jest.mocked(lookupUserDataByEmail);
const mockedDelete = jest.mocked(deleteUserDataByEmail);

const pageDir = join(process.cwd(), "src/app/(site)/datenloeschen");
const pageSource = readFileSync(join(pageDir, "page.tsx"), "utf8");
const clientSource = readFileSync(join(pageDir, "DatenloeschenClient.tsx"), "utf8");

async function render(searchParams: { t?: string }): Promise<string> {
  const element = await DatenloeschenPage({ searchParams: Promise.resolve(searchParams) });
  return renderToStaticMarkup(element);
}

const mailto = buildDataDeletionMailto("de").replace(/&/g, "&amp;");
// next/image rewrites the src to /_next/image?url=... in the jest env (no next.config).
const AVATAR = /(\/|%2F)images(\/|%2F)thomas-avatar\.jpg/;
const EMPTY = { reviews: [], mapEntries: [], outcomes: [] };

describe("/datenloeschen page", () => {
  const originalSecret = process.env.FEEDBACK_TOKEN_SECRET;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FEEDBACK_TOKEN_SECRET = "test-feedback-secret";
    consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
    if (originalSecret === undefined) delete process.env.FEEDBACK_TOKEN_SECRET;
    else process.env.FEEDBACK_TOKEN_SECRET = originalSecret;
  });

  it("state A without a token: mailto, 90 day hint, no lookup", async () => {
    const markup = await render({});
    expect(markup).toContain(mailto);
    expect(markup).toContain("90 Tage");
    expect(markup).toMatch(AVATAR);
    expect(mockedLookup).not.toHaveBeenCalled();
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("state A with an invalid token: expired heading, no lookup", async () => {
    const markup = await render({ t: "kaputt.kaputt" });
    expect(markup).toContain("nicht mehr gültig");
    expect(markup).toContain(mailto);
    expect(mockedLookup).not.toHaveBeenCalled();
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("state B0 for a valid token without data: explanation, no delete button", async () => {
    mockedLookup.mockResolvedValue(EMPTY);
    const markup = await render({ t: createDataDeletionToken("Person@Example.org") });
    expect(markup).toContain("person@example.org");
    expect(markup).toContain("Newsletter");
    expect(markup).toContain("Rückfrage-Mail");
    expect(markup).toContain('href="/kampagne/verwalten"');
    expect(markup).not.toContain("<button");
    expect(markup).toMatch(AVATAR);
    expect(mockedLookup).toHaveBeenCalledTimes(1);
    expect(mockedLookup.mock.calls[0][1]).toBe("person@example.org");
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("state B for a valid token with data: lists the rows and offers the button", async () => {
    mockedLookup.mockResolvedValue({
      reviews: [{ createdAt: "2026-09-01T10:00:00Z", rating: 4, isPublic: true }],
      mapEntries: [{ createdAt: "2026-09-02T10:00:00Z", plzPrefix: "28" }],
      outcomes: [],
    });
    const markup = await render({ t: createDataDeletionToken("person@example.org") });
    expect(markup).toContain("4 von 5");
    expect(markup).toContain("/stimmen");
    expect(markup).toContain("PLZ-Bereich 28");
    expect(markup).toContain("1. September 2026");
    expect(markup).toContain("Alles löschen");
    expect(markup).toContain('href="/kampagne/verwalten"');
    expect(markup).toContain(mailto);
    expect(markup).toMatch(AVATAR);
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("marks a non-public review as not public", async () => {
    mockedLookup.mockResolvedValue({
      reviews: [{ createdAt: "2026-09-01T10:00:00Z", rating: 2, isPublic: false }],
      mapEntries: [],
      outcomes: [],
    });
    const markup = await render({ t: createDataDeletionToken("person@example.org") });
    expect(markup).toContain("2 von 5");
    expect(markup).toContain("nicht öffentlich");
  });

  it("lists an outcome-only record and offers deletion", async () => {
    mockedLookup.mockResolvedValue({
      reviews: [],
      mapEntries: [],
      outcomes: [{ createdAt: "2026-10-14T09:00:00Z", completed: false, lastStep: "reply_channels" }],
    });
    const markup = await render({ t: createDataDeletionToken("person@example.org") });
    expect(markup).toContain("Rückmeldung vom 14. Oktober 2026");
    expect(markup).toContain("begonnen, noch nicht vollständig abgesendet");
    expect(markup).toContain("Alles löschen");
  });

  it("shows the lookup-failed state with the mailto when the lookup throws", async () => {
    mockedLookup.mockRejectedValue(new Error("data deletion: select on reviews failed (code 500)"));
    const markup = await render({ t: createDataDeletionToken("person@example.org") });
    expect(markup).toContain("nicht nachsehen");
    expect(markup).toContain(mailto);
    expect(markup).not.toContain("Alles löschen");
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain("example.org");
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("page source: noindex, nofollow, no-referrer", () => {
    expect(pageSource).toMatch(/robots:\s*{\s*index:\s*false,\s*follow:\s*false\s*}/);
    expect(pageSource).toContain('referrer: "no-referrer"');
  });

  it("client source: calls the action with only the token and has result copy", () => {
    expect(clientSource).toMatch(/deleteDataAction\(\{ token: view\.token \}\)/);
    expect(clientSource).toContain("Erledigt. Deine Daten sind gelöscht.");
    expect(clientSource).toContain("Da hat etwas nicht geklappt");
    expect(clientSource).toContain("Du hast es gerade mehrmals versucht");
    expect(clientSource).toContain("Danke, dass du einen Brief geschrieben hast.");
  });

  describe("copy gate", () => {
    const plural = /\b(wir|uns|unser|unsere|unseren|unserem|unserer|unseres)\b/i;
    for (const [name, source] of [["page.tsx", pageSource], ["DatenloeschenClient.tsx", clientSource]] as const) {
      it(`${name}: no em dash, no plural first person, brand spelled with hyphens`, () => {
        expect(source).not.toContain("—");
        expect(source).not.toMatch(plural);
        expect(source).not.toContain("Brief nach Berlin");
      });
    }
    it("D-05: the new files never read the sent flag", () => {
      expect(pageSource + clientSource).not.toMatch(/letter_sent|letterSent/);
    });
  });

  it("links the page statically from the privacy policy and the feedback disclosure", () => {
    const datenschutz = readFileSync(join(process.cwd(), "src/app/(site)/datenschutz/page.tsx"), "utf8");
    const disclosure = readFileSync(join(process.cwd(), "src/app/(site)/feedback/PrivacyDisclosure.tsx"), "utf8");
    expect(datenschutz).toContain('href="/datenloeschen"');
    expect(disclosure).toContain('href="/datenloeschen"');
  });
});
