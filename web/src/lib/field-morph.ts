// Manueller FLIP / Shared-Element-Klon fuer den Anliegen-Feld-Morph
// Landing -> Wizard. Ersetzt Reacts <ViewTransition>, das bei der cross-layout
// Navigation (/ -> /app) beweisbar abbrach (InvalidStateError, harter Schnitt,
// weisser Screen beim 1. Klick in dev).
//
// Ablauf beim gueltigen Submit:
//   1. Echtes Feld (#issueText) vermessen -> Start-Box.
//   2. Ziel-Box des Wizard-Step-1-Felds aus der Viewport-Breite berechnen.
//   3. Fixierten Klon (computed styles des echten Felds) auf die Start-Box legen.
//   4. Hero-Inhalt wegblenden.
//   5. Naechster Frame: Klon per Transition auf die Ziel-Box fahren.
//   6. Parallel navigieren (Compile/Load laeuft hinter dem Klon).
//   7. Klon ERST entfernen, wenn das echte Wizard-Feld gemalt ist (rAF-Poll)
//      -> kein weisser Gap, auch wenn der dev-Compile mehrere Sekunden dauert.

import { WIZARD_PATH } from "@/lib/config";

const MORPH_MS = 280;
// Sanfte Beschleunigungskurve (ease-out), damit das Feld "ankommt" statt linear.
const MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
// Notbremse: Klon spaetestens nach diesem Fenster entfernen, falls der Wizard
// (z.B. wegen langem dev-Compile) nie auftaucht. Lieber harter Schnitt als
// ein fuer immer haengender Klon ueber der App.
const REVEAL_TIMEOUT_MS = 6000;

// Gemessene Ziel-Geometrie des Wizard-Felds (#issueText in Step 1), live mit
// den Preview-Tools gegengecheckt (375 / 780 / 1280) Stand 2026-06-26:
//   - Breite: max-w-xl (576) Container, Padding sm:px-8 (32) bzw. px-4 (16).
//   - top haengt nur an der Breite (content-flow von oben), nicht an der Hoehe:
//     ueber dem Feld stehen AppHeader (~65px) + H1 + Intro. sm-Breakpoint = 640.
const SM_BREAKPOINT = 640;
const CONTAINER_MAX_W = 576; // Tailwind max-w-xl
const WIZARD_FIELD_TOP_DESKTOP = 349; // vw >= 640
const WIZARD_FIELD_TOP_MOBILE = 398; // vw <  640
const WIZARD_FIELD_HEIGHT = 160; // HEIGHT_MIN_WIZARD

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

function wizardTargetBox(startHeight: number): Box {
  const vw = window.innerWidth;
  const pad = vw >= SM_BREAKPOINT ? 32 : 16;
  const containerW = Math.min(vw, CONTAINER_MAX_W);
  const width = containerW - 2 * pad;
  const left = (vw - containerW) / 2 + pad;
  const top = vw >= SM_BREAKPOINT ? WIZARD_FIELD_TOP_DESKTOP : WIZARD_FIELD_TOP_MOBILE;
  // Wenn schon viel getippt wurde, ist das Landing-Feld hoeher als 160 und das
  // vorbefuellte Wizard-Feld waechst ebenfalls -> Start-Hoehe als Annaeherung
  // nehmen, damit der Reveal nicht nachsetzt (siehe Todo "kleine Unschaerfe").
  const height = Math.max(WIZARD_FIELD_HEIGHT, Math.round(startHeight));
  return { top, left, width, height };
}

// Computed-Style-Eigenschaften, die den Klon optisch zum echten Feld machen.
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

function buildClone(source: HTMLElement, startRect: DOMRect): HTMLDivElement {
  const cs = window.getComputedStyle(source);
  const clone = document.createElement("div");
  // Reiner Deko-Klon, fuer AT unsichtbar.
  clone.setAttribute("aria-hidden", "true");
  clone.textContent = (source as HTMLTextAreaElement).value ?? "";

  for (const prop of COPIED_STYLE_PROPS) {
    clone.style[prop] = cs[prop];
  }
  clone.style.position = "fixed";
  clone.style.top = `${startRect.top}px`;
  clone.style.left = `${startRect.left}px`;
  clone.style.width = `${startRect.width}px`;
  clone.style.height = `${startRect.height}px`;
  clone.style.margin = "0";
  clone.style.boxSizing = "border-box";
  clone.style.overflow = "hidden";
  clone.style.whiteSpace = "pre-wrap";
  clone.style.wordBreak = "break-word";
  clone.style.textAlign = "left";
  clone.style.pointerEvents = "none";
  clone.style.zIndex = "9999";
  clone.style.willChange = "top, left, width, height";
  // Die Animation selbst laeuft ueber die Web Animations API (siehe unten), die
  // ein verlaessliches .finished-Promise liefert -> deterministische Sequenz
  // (morphen -> navigieren -> reveal) ohne rAF/transitionend-Races.
  // top/left/width/height bewusst animiert (nicht transform): scale() wuerde
  // Text + Border-Radius verzerren. Ein einzelner Klon ueber 280ms ist dafuer
  // unkritisch (kein Scroll-/Listen-Kontext).
  return clone;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export interface MorphArgs {
  // Wird VOR der Navigation gefeuert (z.B. saveHandoff).
  onBeforeNavigate?: () => void;
  // Loest die eigentliche Navigation aus (router.push(WIZARD_PATH)).
  navigate: () => void;
}

// Startet den Morph und navigiert. Robust gegen fehlendes Feld / reduced-motion:
// faellt dann auf sofortige Navigation zurueck.
export function morphAnliegenFieldToWizard({ onBeforeNavigate, navigate }: MorphArgs): void {
  const source = document.getElementById("issueText") as HTMLTextAreaElement | null;

  // Fallback: kein Feld oder Animation unerwuenscht -> direkt navigieren.
  if (!source || prefersReducedMotion()) {
    onBeforeNavigate?.();
    navigate();
    return;
  }

  const startRect = source.getBoundingClientRect();
  // Mobile-Tastatur einklappen, bevor die Box neu vermessen / animiert wird.
  source.blur();

  const target = wizardTargetBox(startRect.height);
  const clone = buildClone(source, startRect);
  document.body.appendChild(clone);

  // Hero-Inhalt wegblenden (alles ausser dem Klon, der auf <body> liegt).
  const heroSection = source.closest("section");
  if (heroSection instanceof HTMLElement) {
    heroSection.style.transition = `opacity ${MORPH_MS}ms ease`;
    heroSection.style.opacity = "0";
  }

  // Erst morphen, DANN navigieren (NICHT parallel). top/left/width/height sind
  // Layout-Properties und werden auf dem Main-Thread interpoliert. Feuert man
  // router.push parallel, blockiert der Wizard-Render den Main-Thread und friert
  // den Morph mitten in der Bewegung ein (auf 1280 reproduziert: Klon bleibt auf
  // halber Strecke stehen und springt beim Reveal). Solange der Morph laeuft,
  // bleibt der Main-Thread frei. Die ~280ms schaut der User ohnehin auf den
  // Morph; /app ist via router.prefetch (Hero) geprefetcht, laedt danach schnell.
  let navigated = false;
  const startNavigation = () => {
    if (navigated) return;
    navigated = true;
    onBeforeNavigate?.();
    navigate();

    // Klon erst entfernen, wenn das ECHTE Wizard-Feld gemalt ist (kein weisser
    // Gap, auch wenn der dev-Compile mehrere Sekunden dauert). Diskriminator:
    // ein #issueText, der nicht mehr der Landing-Knoten ist (source ist nach dem
    // Unmount detached) und sichtbar gerendert wurde.
    const startedAt = Date.now();
    const tryReveal = () => {
      const wizardField = document.getElementById("issueText");
      const onWizard = window.location.pathname.startsWith(WIZARD_PATH);
      const painted =
        !!wizardField &&
        wizardField !== source &&
        wizardField.getBoundingClientRect().width > 0;

      if (onWizard && painted) {
        requestAnimationFrame(() => clone.remove());
        return;
      }
      if (Date.now() - startedAt > REVEAL_TIMEOUT_MS) {
        clone.remove();
        return;
      }
      requestAnimationFrame(tryReveal);
    };
    requestAnimationFrame(tryReveal);
  };

  // Morph via Web Animations API: das .finished-Promise loest deterministisch
  // nach Ablauf der Dauer aus (kein rAF/transitionend-Race), erst dann wird
  // navigiert. fill: "forwards" laesst den Klon bis zum Reveal auf der Ziel-Box
  // stehen. Faellt die API/Animation aus, navigiert der Timer-Fallback.
  let animation: Animation | null = null;
  try {
    animation = clone.animate(
      [
        { top: `${startRect.top}px`, left: `${startRect.left}px`, width: `${startRect.width}px`, height: `${startRect.height}px` },
        { top: `${target.top}px`, left: `${target.left}px`, width: `${target.width}px`, height: `${target.height}px` },
      ],
      { duration: MORPH_MS, easing: MORPH_EASE, fill: "forwards" }
    );
  } catch {
    animation = null;
  }
  if (animation) {
    animation.finished.then(startNavigation, startNavigation);
  }
  // Fallback: navigiert auch ohne (funktionierende) Animation.
  window.setTimeout(startNavigation, MORPH_MS + 120);
}
