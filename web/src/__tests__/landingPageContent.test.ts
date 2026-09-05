import { UI_CATALOG } from "@/lib/i18n/uiCatalog";
import { SUPPORT_CONTENT } from "@/lib/support-content";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const expectedCopy = {
  de: {
    steps: ["Anliegen schildern", "Angaben ergänzen", "Abschreiben und abschicken"],
    stepLabel: "Schritt 1",
    exampleLink: "Ganzen Beispielbrief lesen",
    storyTab: "Echte Geschichte",
    impactTitle: "Meine Mutter schreibt den 1. Brief mit Brief-nach-Berlin",
    projectTitle: "Kostenlos, gemeinnützig, offen",
  },
  en: {
    steps: ["Describe your concern", "Add a few details", "Write it out and send it"],
    stepLabel: "Step 1",
    exampleLink: "Read the full sample letter",
    storyTab: "True story",
    impactTitle: "My mother writes the first letter with Brief-nach-Berlin",
    projectTitle: "Free, non-profit, open",
  },
  tr: {
    steps: ["Talebinizi anlatın", "Bilgileri tamamlayın", "Elinizle yazın ve gönderin"],
    stepLabel: "Adım 1",
    exampleLink: "Örnek mektubun tamamını oku",
    storyTab: "Gerçek hikâye",
    impactTitle: "Annem Brief-nach-Berlin ile ilk mektubunu yazıyor",
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
      expect(copy.howItWorks.readExample).toBe(expected.exampleLink);
      expect(copy.howItWorks.storyTab).toBe(expected.storyTab);
      expect(copy.howItWorks.impactTitle).toBe(expected.impactTitle);
      expect(copy.howItWorks.impactPoint1).toBeTruthy();
      expect(copy.howItWorks.impactPoint2).toBeTruthy();
      expect(copy.howItWorks.impactPoint3).toBeTruthy();
      expect(copy.howItWorks.impactLinkLead).toBeTruthy();
      expect(copy.howItWorks.impactLinkAnchor).toBeTruthy();
      expect(copy.howItWorks.impactLinkSuffix).toBeTruthy();
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

  it("keeps the NGO path in the hero and makes the examples three workflow views", () => {
    const pageSource = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    const workflowSource = readFileSync(join(process.cwd(), "src/components/HowItWorksWithExample.tsx"), "utf8");
    const faqSource = readFileSync(join(process.cwd(), "src/components/FAQ.tsx"), "utf8");
    const mapSource = readFileSync(join(process.cwd(), "src/components/letter-signals/LetterActivityCard.tsx"), "utf8");
    const heroSource = readFileSync(join(process.cwd(), "src/components/Hero.tsx"), "utf8");
    const voicesSource = readFileSync(join(process.cwd(), "src/app/(site)/stimmen/page.tsx"), "utf8");

    expect(pageSource).not.toContain("LetterActivitySection");
    expect(mapSource).toContain(
      "Hier zeigen freiwillige Kartenbeiträge",
    );
    expect(mapSource).toContain('mapData.totalContributions === 1 ? "Kartenbeitrag" : "Kartenbeiträge"');
    expect(mapSource).toContain('mapData.postcodeAreas === 1 ? "Ort" : "Orten"');
    expect(voicesSource).toContain('import { LetterActivityCard } from "@/components/letter-signals/LetterActivityCard";');
    expect(voicesSource).toContain("<LetterActivityCard />");
    expect(workflowSource).toContain("snap-x snap-mandatory");
    expect(workflowSource).toContain('role="tablist"');
    expect(workflowSource).toContain('aria-controls="map-panel"');
    expect(workflowSource).toContain('aria-controls="story-panel"');
    expect(workflowSource).toContain("<LetterActivityCard />");
    expect(faqSource).toContain("<LetterActivityCard />");
    expect(faqSource).toContain("lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.82fr)]");
    expect(workflowSource).toContain('href="/brief-schreiben-wirkt"');
    expect(workflowSource).toContain('src="/images/erste-nutzerin-brief-nach-berlin.webp"');
    expect(workflowSource).toContain('className="min-w-full snap-start px-1 py-6"');
    expect(workflowSource).toContain('className="min-w-0 scroll-mt-20');
    expect(workflowSource).toContain('window.matchMedia("(max-width: 767px)")');
    expect(workflowSource).toContain("animate-panel-tab-progress");
    expect(workflowSource).toContain("IntersectionObserver");
    expect(workflowSource).not.toContain("ghibli-pin.webp");
    expect(workflowSource).toContain("list-disc");
    expect(workflowSource).not.toContain("border-l-airmail-rot");
    expect(heroSource).toContain("NgoCampaignBadge");
    expect(heroSource).toContain('href="/ngo-briefkampagne"');
    expect(heroSource).toContain("prefers-reduced-motion: reduce");
    for (const eventName of ["onWaiting", "onStalled", "onSuspend", "onEmptied", "onPause", "onError"]) {
      expect(heroSource).toContain(`${eventName}={() => setIsVideoPlaying(false)}`);
    }
  });
});
