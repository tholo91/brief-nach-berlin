// Shared-element transition for the issue field from the landing page to the
// first wizard step. The destination is deliberately measured only after the
// wizard has rendered: layout, copy, browser chrome, and viewport height can
// all change between the two routes.

import { WIZARD_PATH } from "@/lib/config";

const MORPH_MS = 280;
const MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const REVEAL_TIMEOUT_MS = 6000;

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

function rectToBox(rect: DOMRect): Box {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const COPIED_STYLE_PROPS = [
  "backgroundColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "borderRadius",
  "boxShadow",
  "color",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
] as const;

function buildClone(source: HTMLTextAreaElement, rect: DOMRect): HTMLDivElement {
  const computed = window.getComputedStyle(source);
  const clone = document.createElement("div");
  clone.setAttribute("aria-hidden", "true");
  clone.textContent = source.value;

  for (const property of COPIED_STYLE_PROPS) {
    clone.style[property] = computed[property];
  }

  Object.assign(clone.style, {
    position: "fixed",
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    boxSizing: "border-box",
    overflow: "hidden",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    textAlign: "left",
    pointerEvents: "none",
    zIndex: "9999",
    willChange: "top, left, width, height",
  } satisfies Partial<CSSStyleDeclaration>);

  return clone;
}

function removeAfterMorph(clone: HTMLDivElement, target: HTMLElement): void {
  const from = rectToBox(clone.getBoundingClientRect());
  const to = rectToBox(target.getBoundingClientRect());

  try {
    const animation = clone.animate(
      [
        { top: `${from.top}px`, left: `${from.left}px`, width: `${from.width}px`, height: `${from.height}px` },
        { top: `${to.top}px`, left: `${to.left}px`, width: `${to.width}px`, height: `${to.height}px` },
      ],
      { duration: MORPH_MS, easing: MORPH_EASE, fill: "forwards" }
    );
    animation.finished.then(
      () => clone.remove(),
      () => clone.remove()
    );
  } catch {
    clone.remove();
  }
}

export interface MorphArgs {
  onBeforeNavigate?: () => void;
  navigate: () => void;
}

export function morphAnliegenFieldToWizard({ onBeforeNavigate, navigate }: MorphArgs): void {
  const source = document.getElementById("issueText") as HTMLTextAreaElement | null;

  if (!source || prefersReducedMotion()) {
    onBeforeNavigate?.();
    navigate();
    return;
  }

  const clone = buildClone(source, source.getBoundingClientRect());
  document.body.appendChild(clone);
  source.blur();
  onBeforeNavigate?.();
  navigate();

  const startedAt = Date.now();
  const revealWhenWizardFieldExists = () => {
    const target = document.getElementById("issueText");
    const isWizardField =
      window.location.pathname.startsWith(WIZARD_PATH) &&
      target instanceof HTMLElement &&
      target !== source &&
      target.getBoundingClientRect().width > 0;

    if (isWizardField) {
      removeAfterMorph(clone, target);
      return;
    }

    if (Date.now() - startedAt >= REVEAL_TIMEOUT_MS) {
      clone.remove();
      return;
    }

    requestAnimationFrame(revealWhenWizardFieldExists);
  };

  requestAnimationFrame(revealWhenWizardFieldExists);
}
