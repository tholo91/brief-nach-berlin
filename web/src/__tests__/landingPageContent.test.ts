import { UI_CATALOG } from "@/lib/i18n/uiCatalog";
import { SUPPORT_CONTENT } from "@/lib/support-content";

const expectedCopy = {
  de: {
    steps: ["Anliegen schildern", "Angaben ergänzen", "Abschreiben und abschicken"],
    stepLabel: "Schritt 1",
    resultLabel: "Dein Ergebnis",
    projectTitle: "Kostenlos, gemeinnützig, offen",
  },
  en: {
    steps: ["Describe your concern", "Add a few details", "Write it out and send it"],
    stepLabel: "Step 1",
    resultLabel: "Your result",
    projectTitle: "Free, non-profit, open",
  },
  tr: {
    steps: ["Talebinizi anlatın", "Bilgileri tamamlayın", "Elinizle yazın ve gönderin"],
    stepLabel: "Adım 1",
    resultLabel: "Sonuç",
    projectTitle: "Ücretsiz, kâr amacı gütmeyen, açık",
  },
} as const;

describe("landing page content", () => {
  it.each(["de", "en", "tr"] as const)(
    "provides the three-step flow and project support copy in %s",
    (locale) => {
      const copy = UI_CATALOG[locale];
      const expected = expectedCopy[locale];

      expect([
        copy.howItWorks.step1Title,
        copy.howItWorks.step2Title,
        copy.howItWorks.step3Title,
      ]).toEqual(expected.steps);
      expect(copy.howItWorks.stepLabel.replace("{number}", "1")).toBe(
        expected.stepLabel,
      );
      expect(copy.howItWorks.resultLabel).toBe(expected.resultLabel);
      expect(copy.howItWorks.exampleAriaLabel).toBeTruthy();
      expect(copy.projectSupport.title).toBe(expected.projectTitle);
      expect(copy.projectSupport.portraitAlt).toBeTruthy();
      expect(copy.projectSupport.support).toBeTruthy();
      expect(copy.projectSupport.share).toBeTruthy();
      expect(Object.values(copy.projectSupport).join(" ")).not.toContain(
        "WE AID",
      );
    },
  );

  it("keeps support actions on the existing internal destinations", () => {
    expect(SUPPORT_CONTENT.ctas.learnMore.href).toBe("/spenden");
    expect(SUPPORT_CONTENT.ctas.share.href).toBe("/weitersagen");
  });
});
