import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StepLevelSelect } from "@/components/wizard/StepLevelSelect";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import type { LevelRoutingContext } from "@/lib/types/wizard";

function routingContext(
  overrides: Partial<LevelRoutingContext> = {}
): LevelRoutingContext {
  return {
    recommended: { level: "Kommune", confidence: "high" },
    reasoning: "Über den Zustand deiner Straße entscheidet die Stadt",
    byLevel: { Bund: [], Land: [], Kommune: [] },
    optionalByLevel: { Land: [] },
    coverage: {
      landSupported: true,
      kommuneSupported: true,
      stadtstaatEinheitsgemeinde: false,
      landAmbiguous: false,
      landWahlkreisIds: [],
      kommuneAmbiguous: false,
      kommuneBezirke: [],
    },
    bundeslandName: "Nordrhein-Westfalen",
    ortsname: "Köln",
    coverageHint: null,
    ...overrides,
  };
}

function renderStep(routing: LevelRoutingContext): string {
  return renderToStaticMarkup(
    createElement(
      LocaleProvider,
      null,
      createElement(StepLevelSelect, {
        routing,
        onContinue: () => undefined,
      })
    )
  );
}

describe("StepLevelSelect", () => {
  it("zeigt die begründete Vorauswahl ruhig oberhalb der Karten", () => {
    const html = renderStep(routingContext());

    expect(html).toContain(
      "Wahrscheinlich ist dein Anliegen am besten bei der Kommune aufgehoben."
    );
    expect(html).toContain("Über den Zustand deiner Straße entscheidet die Stadt.");
    expect(html).toContain("Du kannst dich trotzdem anders entscheiden.");
    expect(html).not.toContain("Vorausgewählt");
    expect(html).not.toContain("Unsere Empfehlung");
    expect(html).not.toContain("Sicherheit der Einschätzung");
    expect(html).not.toContain("Landtag und Kommune sind neu als Beta dabei");
  });

  it("zeigt bei niedriger Confidence keine sichtbare Confidence oder Begründung", () => {
    const html = renderStep(
      routingContext({
        recommended: { level: "Kommune", confidence: "low" },
      })
    );

    expect(html).toContain(
      "Die passende Ebene ist nicht eindeutig. Wähle selbst, wohin dein Brief gehen soll."
    );
    expect(html).not.toContain("Wahrscheinlich ist dein Anliegen");
    expect(html).not.toContain("Über den Zustand deiner Straße entscheidet die Stadt");
    expect(html).not.toContain("Confidence");
    expect(html).not.toContain("Sicherheit");
  });

  it("erklärt Bremen nur in der deaktivierten Kommune-Karte", () => {
    const base = routingContext();
    const html = renderStep(
      routingContext({
        bundeslandName: "Bremen",
        coverage: {
          ...base.coverage,
          kommuneSupported: false,
          stadtstaatEinheitsgemeinde: true,
        },
      })
    );

    expect(html).toContain(
      "Wahrscheinlich ist dein Anliegen am besten auf Landesebene aufgehoben."
    );
    expect(html).not.toContain("Über den Zustand deiner Straße entscheidet die Stadt");
    expect(html).toContain("In Bremen unter Land");
    expect(html).toContain(
      "Bremen ist Stadt und Bundesland zugleich. Kommunale Anliegen laufen deshalb über die Landesebene."
    );
    expect(html).toMatch(
      /role="radio" aria-checked="false" aria-disabled="true"[^>]*aria-describedby="level-kommune-hint"[^>]*data-level-card="Kommune"/
    );
    expect(html).not.toContain("border-airmail-rot");
  });

  it("bleibt bei den Ebenen und kündigt keinen offenen Empfängertyp an", () => {
    const html = renderStep(routingContext());

    expect(html).toContain("Welche Ebene passt zu deinem Anliegen?");
    expect(html).not.toContain("· Bundestag");
    expect(html).not.toContain("· Landtag");
    expect(html).not.toContain("· Rathaus");
    expect(html).not.toContain("Im nächsten Schritt wählst du");
  });
});
