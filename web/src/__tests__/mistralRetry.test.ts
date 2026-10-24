jest.mock("@mistralai/mistralai", () => ({ Mistral: class {} }));

import { withMistralRetry } from "@/lib/mistral";

function err(status: number, retryAfter?: string) {
  const e = new Error(`status ${status}`) as Error & { statusCode: number; rawResponse?: Response };
  e.statusCode = status;
  if (retryAfter) e.rawResponse = new Response(null, { status, headers: { "retry-after": retryAfter } });
  return e;
}

describe("withMistralRetry", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  async function run<T>(p: Promise<T>) {
    const settled = p.then(
      (v) => ({ ok: true as const, v }),
      (e) => ({ ok: false as const, e }),
    );
    await jest.runAllTimersAsync();
    return settled;
  }

  it("with budget: 429, 429, success returns the result", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    const fn = jest.fn().mockRejectedValueOnce(err(429)).mockRejectedValueOnce(err(429)).mockResolvedValue("ok");
    const r = await run(withMistralRetry("t", fn, { rateLimitBudgetMs: 20_000 }));
    expect(r).toEqual({ ok: true, v: "ok" });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("with budget: persistent 429 throws, total wait stays within budget", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const timeoutSpy = jest.spyOn(global, "setTimeout");
    const fn = jest.fn().mockRejectedValue(err(429));
    const r = await run(withMistralRetry("t", fn, { rateLimitBudgetMs: 20_000 }));
    expect(r.ok).toBe(false);
    const waits = timeoutSpy.mock.calls.map((c) => Number(c[1])).filter((n) => n >= 4_000);
    expect(waits.length).toBe(fn.mock.calls.length - 1);
    expect(waits.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(20_000);
    expect(fn.mock.calls.length).toBeLessThanOrEqual(6);
  });

  it("with budget: Retry-After is honored", async () => {
    const timeoutSpy = jest.spyOn(global, "setTimeout");
    const fn = jest.fn().mockRejectedValueOnce(err(429, "3")).mockResolvedValue("ok");
    const r = await run(withMistralRetry("t", fn, { rateLimitBudgetMs: 20_000 }));
    expect(r.ok).toBe(true);
    expect(timeoutSpy.mock.calls.some((c) => c[1] === 3_000)).toBe(true);
  });

  it("without option: 429 waits 2 s, 4 s and stops after 3 attempts", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    const timeoutSpy = jest.spyOn(global, "setTimeout");
    const fn = jest.fn().mockRejectedValue(err(429));
    const r = await run(withMistralRetry("t", fn));
    expect(r.ok).toBe(false);
    expect(fn).toHaveBeenCalledTimes(3);
    const waits = timeoutSpy.mock.calls.map((c) => Number(c[1])).filter((n) => n >= 2_000);
    expect(waits).toEqual([2_000, 4_000]);
  });

  it("with budget: 500 still gives 3 attempts", async () => {
    const fn = jest.fn().mockRejectedValue(err(500));
    const r = await run(withMistralRetry("t", fn, { rateLimitBudgetMs: 20_000 }));
    expect(r.ok).toBe(false);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
