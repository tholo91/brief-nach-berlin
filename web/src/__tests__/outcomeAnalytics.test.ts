import { AnalyticsWrapper } from "@/components/AnalyticsWrapper";

jest.mock("@vercel/analytics/next", () => ({ Analytics: () => null }));

it("drops signed outcome and review pages before analytics delivery", () => {
  const element = AnalyticsWrapper();
  const beforeSend = element.props.beforeSend;
  expect(beforeSend({ url: "https://brief-nach-berlin.de/rueckmeldung?a=ja&t=private-token" })).toBeNull();
  expect(beforeSend({ url: "https://brief-nach-berlin.de/feedback?t=private-token" })).toBeNull();
  const event = { url: "https://brief-nach-berlin.de/warum" };
  expect(beforeSend(event)).toEqual(event);
});

describe("analytics privacy filter", () => {
  const origin = "https://brief-nach-berlin.de";
  const beforeSend = AnalyticsWrapper().props.beforeSend;
  const send = (path: string, type: "pageview" | "event" = "pageview") =>
    beforeSend({ type, url: `${origin}${path}` });

  const sensitivePaths = [
    "/debug?d=ANLIEGEN-MARKER",
    "/datenloeschen?t=LOESCH-TOKEN-MARKER&email=marker@example.org",
    "/kampagne/verwalten?token=UEBERNAHME-TOKEN-MARKER",
    "/kampagne/verwalten/uebernehmen?token=UEBERNAHME-TOKEN-MARKER",
    "/kampagne/verwalten/zugang",
    "/kampagne/verwalten/feedback",
    "/feedback/",
  ];

  it.each(sensitivePaths)("drops %s", (path) => {
    expect(send(path)).toBeNull();
  });

  it("matches on path boundaries only", () => {
    expect(send("/kampagne-starten?ref=x")).toEqual({ type: "pageview", url: `${origin}/kampagne-starten` });
    expect(send("/kampagne/starten")).toEqual({ type: "pageview", url: `${origin}/kampagne/starten` });
  });

  it("strips query and hash and keeps the event type", () => {
    const path = "/kampagne/mein-slug?utm_source=newsletter#teilen";
    expect(send(path)).toEqual({ type: "pageview", url: `${origin}/kampagne/mein-slug` });
    expect(send(path, "event")).toEqual({ type: "event", url: `${origin}/kampagne/mein-slug` });
  });

  it("strips the e-mail hash from the letter adjustment page", () => {
    expect(send("/brief/anpassen#email=marker@example.org")).toEqual({
      type: "pageview",
      url: `${origin}/brief/anpassen`,
    });
  });

  it("drops unparseable URLs", () => {
    expect(beforeSend({ type: "pageview", url: "kein-url" })).toBeNull();
  });

  it("does not mutate the input event", () => {
    const event = { type: "pageview", url: `${origin}/warum?x=1#y` };
    beforeSend(event);
    expect(event.url).toBe(`${origin}/warum?x=1#y`);
  });

  it("never lets synthetic markers reach a payload", () => {
    const results = [...sensitivePaths, "/brief/anpassen#email=marker@example.org"].map((path) => send(path));
    const payload = JSON.stringify(results);
    for (const marker of ["ANLIEGEN-MARKER", "marker@example.org", "LOESCH-TOKEN-MARKER", "UEBERNAHME-TOKEN-MARKER"]) {
      expect(payload).not.toContain(marker);
    }
  });
});
