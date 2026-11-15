import { classifyDevice } from "@/lib/letterSignals/deviceClass";

describe("classifyDevice", () => {
  it("separates phones, tablets and computers", () => {
    expect(classifyDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148")).toBe("mobile");
    expect(classifyDevice("Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120 Mobile Safari/537.36")).toBe("mobile");
    expect(classifyDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    expect(classifyDevice("Mozilla/5.0 (Linux; Android 14; SM-X710) Chrome/120 Safari/537.36")).toBe("tablet");
    expect(classifyDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15", 5)).toBe("tablet");
    expect(classifyDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15", 0)).toBe("desktop");
    expect(classifyDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120")).toBe("desktop");
  });
});
