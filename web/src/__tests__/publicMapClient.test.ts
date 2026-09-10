import type { LetterMapData } from "@/lib/letterSignals/mapTypes";

const firstMap: LetterMapData = {
  points: [{ x: 1, y: 2, count: 3 }],
  totalContributions: 3,
  postcodeAreas: 1,
};
const secondMap: LetterMapData = {
  points: [{ x: 4, y: 5, count: 6 }],
  totalContributions: 6,
  postcodeAreas: 1,
};

function responseFor(body: LetterMapData): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

describe("public map client cache", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shares concurrent requests and serves the successful result within its short TTL", async () => {
    fetchMock.mockResolvedValueOnce(responseFor(firstMap));
    const { loadPublicLetterMapData } = await import(
      "@/lib/letterSignals/publicMapClient"
    );

    const first = loadPublicLetterMapData();
    const second = loadPublicLetterMapData();

    expect(first).toBe(second);
    await expect(Promise.all([first, second])).resolves.toEqual([firstMap, firstMap]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/letter-signals/map");
    await expect(loadPublicLetterMapData()).resolves.toEqual(firstMap);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refetches after the TTL so public aggregate data does not stay stale indefinitely", async () => {
    fetchMock.mockResolvedValueOnce(responseFor(firstMap));
    const { loadPublicLetterMapData } = await import(
      "@/lib/letterSignals/publicMapClient"
    );

    await expect(loadPublicLetterMapData()).resolves.toEqual(firstMap);
    jest.advanceTimersByTime(60_001);
    fetchMock.mockResolvedValueOnce(responseFor(secondMap));

    await expect(loadPublicLetterMapData()).resolves.toEqual(secondMap);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
