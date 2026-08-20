import { morphAnliegenFieldToWizard } from "@/lib/field-morph";

type FakeElement = {
  value: string;
  style: Record<string, string>;
  setAttribute: jest.Mock;
  getBoundingClientRect: jest.Mock;
  blur: jest.Mock;
  animate: jest.Mock;
  remove: jest.Mock;
  closest: jest.Mock;
};

function element(rect: { top: number; left: number; width: number; height: number }): FakeElement {
  return {
    value: "Ein Anliegen mit ausreichend viel Text für den Wizard.",
    style: {},
    setAttribute: jest.fn(),
    getBoundingClientRect: jest.fn(() => rect),
    blur: jest.fn(),
    animate: jest.fn(() => ({ finished: Promise.resolve() })),
    remove: jest.fn(),
    closest: jest.fn(() => null),
  };
}

describe("landing field morph", () => {
  let source: FakeElement;
  let target: FakeElement;
  let currentField: FakeElement;
  let createElement: jest.Mock;

  beforeEach(() => {
    source = element({ top: 80, left: 24, width: 327, height: 112 });
    target = element({ top: 260, left: 48, width: 576, height: 160 });
    currentField = source;
    createElement = jest.fn(() => element({ top: 80, left: 24, width: 327, height: 112 }));

    Object.defineProperty(globalThis, "HTMLElement", {
      configurable: true,
      value: function HTMLElement() {},
    });
    Object.setPrototypeOf(target, HTMLElement.prototype);
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        matchMedia: jest.fn(() => ({ matches: false })),
        getComputedStyle: jest.fn(() => new Proxy({}, { get: () => "" })),
        location: { pathname: "/" },
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementById: jest.fn(() => currentField),
        createElement,
        body: { appendChild: jest.fn() },
      },
    });
    Object.defineProperty(globalThis, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) => callback(0),
    });
  });

  it("measures the rendered wizard field after navigation", async () => {
    const navigate = jest.fn(() => {
      currentField = target;
      window.location.pathname = "/app";
    });

    morphAnliegenFieldToWizard({ navigate });
    await Promise.resolve();

    const clone = createElement.mock.results[0]?.value as FakeElement;
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(clone.animate).toHaveBeenCalledWith(
      [
        { top: "80px", left: "24px", width: "327px", height: "112px" },
        { top: "260px", left: "48px", width: "576px", height: "160px" },
      ],
      expect.objectContaining({ duration: 280 })
    );
  });

  it("skips the morph when reduced motion is requested", () => {
    window.matchMedia = jest.fn(() => ({ matches: true })) as typeof window.matchMedia;
    const beforeNavigate = jest.fn();
    const navigate = jest.fn();

    morphAnliegenFieldToWizard({ onBeforeNavigate: beforeNavigate, navigate });

    expect(beforeNavigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(createElement).not.toHaveBeenCalled();
  });
});
