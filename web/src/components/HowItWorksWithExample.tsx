"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUiCopy } from "@/components/i18n/LocaleProvider";
import { EXAMPLE_LETTERS } from "@/lib/example-letters";
import { LetterActivityCard } from "./letter-signals/LetterActivityCard";
import LetterPaper from "./LetterPaper";

const ROTATION_INTERVAL_MS = 5000;
const stepNumbers = ["1.", "2.", "3."] as const;

type Panel = "letter" | "map" | "story";

const panels: Panel[] = ["letter", "map", "story"];

export default function HowItWorksWithExample() {
  const copy = useUiCopy();
  const steps = [
    { number: stepNumbers[0], title: copy.howItWorks.step1Title, description: copy.howItWorks.step1Description },
    { number: stepNumbers[1], title: copy.howItWorks.step2Title, description: copy.howItWorks.step2Description },
    { number: stepNumbers[2], title: copy.howItWorks.step3Title, description: copy.howItWorks.step3Description },
  ];
  const letter = EXAMPLE_LETTERS[0];
  const recipients = letter.rotatingRecipients ?? [letter.recipient];
  const [recipientIndex, setRecipientIndex] = useState(0);
  const [activePanel, setActivePanel] = useState<Panel>("letter");
  const [rotationCycle, setRotationCycle] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isPanelInteractionActive, setIsPanelInteractionActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const exampleRef = useRef<HTMLDivElement>(null);
  const panelViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recipients.length <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setRecipientIndex((i) => (i + 1) % recipients.length), ROTATION_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [recipients.length]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreferences = () => {
      setIsMobile(mobileQuery.matches);
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    syncPreferences();
    mobileQuery.addEventListener("change", syncPreferences);
    reducedMotionQuery.addEventListener("change", syncPreferences);
    return () => {
      mobileQuery.removeEventListener("change", syncPreferences);
      reducedMotionQuery.removeEventListener("change", syncPreferences);
    };
  }, []);

  useEffect(() => {
    const example = exampleRef.current;
    if (!example) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsPanelVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(example);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncPageVisibility = () => setIsPageVisible(!document.hidden);
    syncPageVisibility();
    document.addEventListener("visibilitychange", syncPageVisibility);
    return () => document.removeEventListener("visibilitychange", syncPageVisibility);
  }, []);

  const selectPanel = useCallback((panel: Panel) => {
    const index = panels.indexOf(panel);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setActivePanel(panel);
    setRotationCycle((cycle) => cycle + 1);
    const viewport = panelViewportRef.current;
    viewport?.scrollTo({ left: index * viewport.clientWidth, behavior: reducedMotion ? "auto" : "smooth" });
  }, []);

  const shouldAutoRotatePanels = isMobile
    && isPanelVisible
    && isPageVisible
    && !isPanelInteractionActive
    && !prefersReducedMotion;

  useEffect(() => {
    if (!shouldAutoRotatePanels) return;
    const id = window.setTimeout(() => {
      const currentIndex = panels.indexOf(activePanel);
      selectPanel(panels[(currentIndex + 1) % panels.length]);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [activePanel, rotationCycle, selectPanel, shouldAutoRotatePanels]);

  const handlePanelScroll = () => {
    const viewport = panelViewportRef.current;
    if (!viewport) return;
    const index = Math.min(
      panels.length - 1,
      Math.round(viewport.scrollLeft / viewport.clientWidth),
    );
    const panel = panels[index];
    if (panel !== activePanel) {
      setActivePanel(panel);
      setRotationCycle((cycle) => cycle + 1);
    }
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const activeIndex = panels.indexOf(activePanel);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? panels.length - 1
        : (activeIndex + (event.key === "ArrowRight" ? 1 : -1) + panels.length) % panels.length;
    selectPanel(panels[nextIndex]);
  };

  const recipient = recipients[recipientIndex];

  return (
    <section id="so-funktionierts" className="scroll-mt-20 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-14">
          <p className="mb-3 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/50">{copy.howItWorks.eyebrow}</p>
          <h2 className="font-body text-3xl font-bold tracking-tight text-waldgruen-dark md:text-4xl">{copy.howItWorks.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-balance font-body text-base leading-relaxed text-warmgrau/80">{copy.howItWorks.intro}</p>
        </div>

        <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <ol className="flex flex-col">
              {steps.map((step, index) => (
                <li key={step.number} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-5 pb-10 last:pb-0 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-6 md:pb-12">
                  <div className="flex justify-center">
                    <span aria-hidden="true" className="-mt-1 font-typewriter text-4xl font-bold leading-none tracking-tight text-waldgruen md:text-5xl">{step.number}</span>
                  </div>
                  <div>
                    <span className="sr-only">{copy.howItWorks.stepLabel.replace("{number}", String(index + 1))}{": "}</span>
                    <h3 className="mb-2 font-body text-xl font-bold leading-snug tracking-tight text-waldgruen-dark md:text-2xl">{step.title}</h3>
                    <p className="max-w-[34rem] font-body text-base leading-relaxed text-warmgrau/80">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

          </div>

          <div ref={exampleRef} id="beispiel" className="min-w-0 scroll-mt-20 md:sticky md:top-24 md:pt-6">
            <div
              className="mb-5 grid grid-cols-3 divide-x divide-waldgruen/10 overflow-hidden rounded-2xl border border-waldgruen/15 bg-waldgruen/8 shadow-[0_8px_18px_-14px_rgba(27,67,50,0.35)] md:flex md:flex-wrap md:items-center md:justify-center md:gap-2 md:divide-x-0 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:shadow-none"
              role="tablist"
              aria-label={copy.howItWorks.panelAriaLabel}
              onFocusCapture={() => setIsPanelInteractionActive(true)}
              onBlurCapture={() => setIsPanelInteractionActive(false)}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") setIsPanelInteractionActive(true);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "touch") setIsPanelInteractionActive(false);
              }}
            >
              <button
                id="letter-panel-tab"
                type="button"
                role="tab"
                aria-controls="letter-panel"
                aria-selected={activePanel === "letter"}
                tabIndex={activePanel === "letter" ? 0 : -1}
                onClick={() => selectPanel("letter")}
                onKeyDown={handleTabKeyDown}
                className={`relative min-w-0 px-2 py-2.5 font-body text-[11px] font-semibold leading-tight tracking-tight transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-inset md:rounded-full md:px-4 md:py-2 md:text-sm md:tracking-normal md:focus-visible:ring-offset-2 md:focus-visible:ring-offset-creme ${activePanel === "letter" ? "bg-waldgruen text-creme md:shadow-none" : "text-waldgruen/75 hover:bg-waldgruen/8 md:bg-waldgruen/8 md:text-waldgruen md:hover:bg-waldgruen/14"}`}
              >
                {copy.howItWorks.letterTab}
                {activePanel === "letter" && shouldAutoRotatePanels && <span key={`letter-${rotationCycle}`} aria-hidden="true" className="absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-creme/75 animate-panel-tab-progress md:hidden" />}
              </button>
              <button
                id="map-panel-tab"
                type="button"
                role="tab"
                aria-controls="map-panel"
                aria-selected={activePanel === "map"}
                tabIndex={activePanel === "map" ? 0 : -1}
                onClick={() => selectPanel("map")}
                onKeyDown={handleTabKeyDown}
                className={`relative min-w-0 px-2 py-2.5 font-body text-[11px] font-semibold leading-tight tracking-tight transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-inset md:rounded-full md:px-4 md:py-2 md:text-sm md:tracking-normal md:focus-visible:ring-offset-2 md:focus-visible:ring-offset-creme ${activePanel === "map" ? "bg-waldgruen text-creme md:shadow-none" : "text-waldgruen/75 hover:bg-waldgruen/8 md:bg-waldgruen/8 md:text-waldgruen md:hover:bg-waldgruen/14"}`}
              >
                {copy.howItWorks.mapTab}
                {activePanel === "map" && shouldAutoRotatePanels && <span key={`map-${rotationCycle}`} aria-hidden="true" className="absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-creme/75 animate-panel-tab-progress md:hidden" />}
              </button>
              <button
                id="story-panel-tab"
                type="button"
                role="tab"
                aria-controls="story-panel"
                aria-selected={activePanel === "story"}
                tabIndex={activePanel === "story" ? 0 : -1}
                onClick={() => selectPanel("story")}
                onKeyDown={handleTabKeyDown}
                className={`relative min-w-0 px-2 py-2.5 font-body text-[11px] font-semibold leading-tight tracking-tight transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-inset md:rounded-full md:px-4 md:py-2 md:text-sm md:tracking-normal md:focus-visible:ring-offset-2 md:focus-visible:ring-offset-creme ${activePanel === "story" ? "bg-waldgruen text-creme md:shadow-none" : "text-waldgruen/75 hover:bg-waldgruen/8 md:bg-waldgruen/8 md:text-waldgruen md:hover:bg-waldgruen/14"}`}
              >
                {copy.howItWorks.storyTab}
                {activePanel === "story" && shouldAutoRotatePanels && <span key={`story-${rotationCycle}`} aria-hidden="true" className="absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-creme/75 animate-panel-tab-progress md:hidden" />}
              </button>
            </div>

            <div ref={panelViewportRef} onScroll={handlePanelScroll} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div id="letter-panel" role="tabpanel" aria-labelledby="letter-panel-tab" className="min-w-full snap-start px-1 py-6">
                <Link href="/beispiele" prefetch={false} className="group mx-auto block max-w-md cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-4 focus-visible:ring-offset-creme" aria-label={copy.howItWorks.exampleAriaLabel}>
                  <div className="transition-[transform,filter] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:drop-shadow-[0_20px_40px_rgba(45,80,22,0.22)]">
                    <LetterPaper letter={letter} recipientOverride={recipient} truncated truncatedParagraphCount={3} size="compact" rotate="left" />
                  </div>
                  <p className="mt-6 text-center font-handwriting text-xl text-waldgruen-dark transition-colors duration-150 group-hover:text-waldgruen">
                    {copy.howItWorks.readExample}
                    <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-150 group-hover:translate-x-1">→</span>
                  </p>
                </Link>
              </div>

              <div id="map-panel" role="tabpanel" aria-labelledby="map-panel-tab" className="min-w-full snap-start px-1 py-6">
                <LetterActivityCard />
              </div>

              <div id="story-panel" role="tabpanel" aria-labelledby="story-panel-tab" className="min-w-full snap-start px-1 py-6">
                <Link
                  href="/brief-schreiben-wirkt"
                  prefetch={false}
                  aria-label={copy.howItWorks.storyAriaLabel}
                  className="group mx-auto block max-w-md overflow-hidden rounded-sm border border-waldgruen/15 bg-white shadow-[0_18px_40px_-20px_rgba(45,80,22,0.25),0_4px_12px_-4px_rgba(45,80,22,0.15)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-20px_rgba(45,80,22,0.3),0_8px_16px_-6px_rgba(45,80,22,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-4 focus-visible:ring-offset-creme"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-waldgruen/5">
                    <Image
                      src="/images/erste-nutzerin-brief-nach-berlin.webp"
                      alt={copy.howItWorks.storyImageAlt}
                      fill
                      sizes="(max-width: 768px) calc(100vw - 3rem), 448px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="px-5 py-5">
                    <p className="font-typewriter text-[11px] font-bold uppercase tracking-[0.13em] text-waldgruen/55">{copy.howItWorks.storyEyebrow}</p>
                    <h3 className="mt-2 font-body text-xl font-bold leading-snug text-waldgruen-dark">{copy.howItWorks.impactTitle}</h3>
                    <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm leading-relaxed text-warmgrau/80 marker:text-waldgruen">
                      <li>{copy.howItWorks.impactPoint1}</li>
                      <li>{copy.howItWorks.impactPoint2}</li>
                      <li>{copy.howItWorks.impactPoint3}</li>
                    </ul>
                    <p className="mt-4 font-body text-sm font-semibold text-waldgruen">
                      {copy.howItWorks.impactLinkLead}{" "}
                      <span className="underline decoration-airmail-rot/70 decoration-2 underline-offset-4">{copy.howItWorks.impactLinkAnchor}</span>{" "}
                      {copy.howItWorks.impactLinkSuffix}
                      <span aria-hidden="true" className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                    </p>
                  </div>
                </Link>
              </div>
            </div>
            <p className="mt-3 text-center font-body text-xs text-warmgrau/55 md:hidden">Wische nach links oder rechts, um die Ansicht zu wechseln.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
