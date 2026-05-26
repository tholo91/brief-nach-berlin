import { fetchMdbContext } from "@/lib/enrichment/fetchMdbContext";

type FetchMock = jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit?]>;

const ORIG_FETCH = global.fetch;

function mockFetchOk(body: unknown): FetchMock {
  const fn = jest.fn(async () =>
    new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } })
  ) as unknown as FetchMock;
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

function mockFetchStatus(status: number): FetchMock {
  const fn = jest.fn(async () => new Response("", { status })) as unknown as FetchMock;
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

function mockFetchAborts(): FetchMock {
  // Resolves only when the signal aborts -> mimics real fetch on AbortController.
  const fn = jest.fn(
    (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (!signal) return;
        signal.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      })
  ) as unknown as FetchMock;
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe("fetchMdbContext telemetry", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    global.fetch = ORIG_FETCH;
  });

  function warnedWith(prefix: string): Array<Record<string, unknown>> {
    return warnSpy.mock.calls
      .filter((args) => typeof args[0] === "string" && args[0] === prefix)
      .map((args) => (args[1] ?? {}) as Record<string, unknown>);
  }

  it("warns no_committees_in_cache when cachedCommittees is undefined", async () => {
    mockFetchOk({ data: [] });

    await fetchMdbContext(42, "Tempo 30 in der Innenstadt", undefined);

    const calls = warnedWith("[fetchMdbContext] no_committees_in_cache");
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0]).toMatchObject({ politicianId: 42 });
  });

  it("warns no_committees_in_cache when cachedCommittees is empty array", async () => {
    mockFetchOk({ data: [] });

    await fetchMdbContext(42, "Tempo 30", []);

    expect(warnedWith("[fetchMdbContext] no_committees_in_cache").length).toBeGreaterThan(0);
  });

  it("warns api_error when API returns non-2xx", async () => {
    mockFetchStatus(503);

    const ctx = await fetchMdbContext(7, "Verkehrswende", ["Verkehrsausschuss"]);

    const calls = warnedWith("[fetchMdbContext] api_error");
    expect(calls.length).toBe(1);
    expect(calls[0]).toMatchObject({ status: 503, politicianId: 7 });
    expect(ctx.committees).toEqual(["Verkehrsausschuss"]);
    expect(ctx.recentRelevant).toEqual([]);
  });

  it("warns timeout when AbortController fires", async () => {
    mockFetchAborts();

    const ctx = await fetchMdbContext(11, "Tempo 30", ["Verkehr"], 20);

    const calls = warnedWith("[fetchMdbContext] timeout");
    expect(calls.length).toBe(1);
    expect(calls[0]).toMatchObject({ politicianId: 11, timeoutMs: 20 });
    expect(ctx.recentRelevant).toEqual([]);
  });

  it("warns no_relevant_votes when fetched poll titles do not overlap with issue tokens", async () => {
    // 2 fetched poll labels, neither shares meaningful (>=4 chars, non-stopword)
    // tokens with the issue text.
    mockFetchOk({
      data: [
        { poll: { label: "Beschluss zur Cannabis-Legalisierung", field_poll_date: "2024-02-10" }, vote: "yes" },
        { poll: { label: "Antrag zum EU-Lieferkettengesetz", field_poll_date: "2024-03-01" }, vote: "no" },
      ],
    });

    await fetchMdbContext(99, "Krankenhaus Pflegepersonal", ["Gesundheitsausschuss"]);

    const calls = warnedWith("[fetchMdbContext] no_relevant_votes");
    expect(calls.length).toBe(1);
    expect(calls[0]).toMatchObject({ politicianId: 99, totalVotesFetched: 2 });
  });

  it("warns returning_empty_ctx when committees AND recentRelevant are both empty after fetch", async () => {
    mockFetchOk({ data: [] });

    await fetchMdbContext(123, "Wohnungsnot", undefined);

    const calls = warnedWith("[fetchMdbContext] returning_empty_ctx");
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0]).toMatchObject({ politicianId: 123 });
  });

  it("does NOT warn returning_empty_ctx when committees are present", async () => {
    mockFetchOk({ data: [] });

    await fetchMdbContext(5, "Klima", ["Umweltausschuss"]);

    expect(warnedWith("[fetchMdbContext] returning_empty_ctx")).toEqual([]);
  });
});
