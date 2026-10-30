"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, type ReactNode } from "react";
import LoopVideoBackground from "@/components/LoopVideoBackground";
import { Step2Issue } from "@/components/wizard/Step2Issue";
import { saveHandoff } from "@/lib/wizard-handoff";
import { WIZARD_PATH } from "@/lib/config";
import { useLocale, useUiCopy } from "@/components/i18n/LocaleProvider";
import { HeroCampaignPills } from "@/components/campaigns/HeroCampaignPills";
import type { LandingCampaign } from "@/lib/campaigns/landing";

// Only one sticky note at a time: the school note sits where the NGO note used to.
const SHOW_SCHOOL_NOTE = true;
// NGO sticky note is parked for now; flip to true (and the school note off) to bring it back.
const SHOW_NGO_BADGE = false;

export default function Hero({ campaigns = [] }: { campaigns?: LandingCampaign[] }) {
  const { locale } = useLocale();
  const copy = useUiCopy();
  const showCampaigns = locale === "de" && campaigns.length > 0;
  const router = useRouter();

  // Warm the wizard route on mount so the very first submit navigates snappily.
  // Without this, router.push hits an uncached /app route (RSC fetch in prod,
  // on-demand compile in dev) and the wizard appears noticeably later.
  useEffect(() => {
    router.prefetch(WIZARD_PATH);
  }, [router]);

  const handleSubmit = useCallback(
    (issueText: string, usedSpeechToText: boolean) => {
      saveHandoff({ issueText, usedSpeechToText, source: "landing" });
      router.push(WIZARD_PATH);
    },
    [router]
  );

  return (
    <section
      className="relative min-h-[72vh] lg:min-h-[92vh] flex items-start lg:items-center justify-center overflow-hidden"
    >
      <LoopVideoBackground
        webm="/hero-bg.webm"
        mp4="/hero-bg.mp4"
        poster="/hero-bg.webp"
        playbackRate={0.5}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(250,248,245,0.88) 0%,
            rgba(250,248,245,0.82) 30%,
            rgba(250,248,245,0.78) 50%,
            rgba(250,248,245,0.88) 70%,
            rgba(250,248,245,0.98) 100%
          )`,
        }}
      />

      {/* Extra mobile overlay */}
      <div className="absolute inset-0 bg-creme/20 md:bg-transparent" />

      {/* Content. With campaign pills the top padding shrinks on desktop so the
          press logos below the hero stay where they were on laptop screens. */}
      <div
        className={`relative z-10 text-center max-w-2xl mx-auto px-8 pt-10 pb-24 ${
          showCampaigns ? "lg:pt-12" : "lg:pt-24"
        }`}
      >
        {/* Envelope icon — flies in once on mount */}
        <div className="inline-block -mb-4 md:-mb-5 animate-envelope-fly-x">
          <div className="animate-envelope-fly-y">
            <Image
              src="/images/img-umschlag-icon.webp"
              alt=""
              width={256}
              height={256}
              priority
              className="w-24 h-24 md:w-36 md:h-36"
            />
          </div>
        </div>

        <div className="relative mb-4">
          <h1 className="font-body text-4xl md:text-5xl font-bold text-waldgruen-dark leading-[1.1] tracking-tight text-balance">
            {copy.hero.titleStart}{" "}
            <span className="block text-waldgruen">
              {copy.hero.titleEmphasisShort ? (
                <>
                  <span className="min-[400px]:hidden">{copy.hero.titleEmphasisShort}</span>
                  <span className="hidden min-[400px]:inline">{copy.hero.titleEmphasis}</span>
                </>
              ) : (
                copy.hero.titleEmphasis
              )}
            </span>
          </h1>
          {locale === "de" && SHOW_SCHOOL_NOTE && (
            <SchoolNote className="hidden sm:inline-flex absolute left-1/2 -top-[3.1rem] z-20 ml-[6.75rem] md:-top-12 md:ml-[8.6rem] rotate-[7deg]" />
          )}
          {locale === "de" && SHOW_NGO_BADGE && (
            <NgoCampaignBadge className="hidden sm:inline-flex absolute left-1/2 -top-5 z-20 ml-[9.75rem] rotate-[7deg]" />
          )}
        </div>

        <p className="font-body text-lg md:text-xl text-warmgrau leading-relaxed text-pretty max-w-3xl mx-auto mb-6">
          {copy.hero.subtitle}
        </p>

        {/* Anliegen field — the primary action and the visitor's first contact.
            #hero-cta stays on the wrapper so the sticky-header IntersectionObserver
            keeps working; #anliegen is the scroll target for the header / footer CTAs. */}
        <div id="anliegen" className="scroll-mt-28 mb-0 text-left">
          <div id="hero-cta">
            <Step2Issue
              variant="landing"
              autoFocus
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Trust badges — labels shorten on mobile so the three checks fit
            on one row instead of stacking. */}
        <div className="mt-4 md:mt-5 flex flex-nowrap items-center justify-center gap-x-1.5">
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-xs md:text-sm font-semibold leading-none px-2 md:px-2.5 py-1 md:py-1.5 whitespace-nowrap">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 -translate-y-px">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="md:hidden">{copy.hero.trustFreeShort}</span>
            <span className="hidden md:inline">{copy.hero.trustFree}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-xs md:text-sm font-semibold leading-none px-2 md:px-2.5 py-1 md:py-1.5 whitespace-nowrap">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 -translate-y-px">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="md:hidden">{copy.hero.trustNoAccountShort}</span>
            <span className="hidden md:inline">{copy.hero.trustNoAccount}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-waldgruen font-body text-xs md:text-sm font-semibold leading-none px-2 md:px-2.5 py-1 md:py-1.5 whitespace-nowrap">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0 -translate-y-px">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="md:hidden">{copy.hero.trustPrivacyShort}</span>
            <span className="hidden md:inline">{copy.hero.trustPrivacy}</span>
          </span>
        </div>

        {/* Curated campaigns (landing_rank in Supabase) — tablet and up only,
            so the mobile hero stays focused on the Anliegen field. */}
        {showCampaigns && (
          <div className="hidden md:block mt-8">
            <div className="mx-auto mb-4 flex max-w-md items-center gap-3">
              <span className="h-px flex-1 bg-waldgruen/15" />
              <span className="font-typewriter text-sm text-warmgrau/70">
                oder wähle ein fertiges Anliegen
              </span>
              <span className="h-px flex-1 bg-waldgruen/15" />
            </div>
            <HeroCampaignPills campaigns={campaigns} />
          </div>
        )}

      </div>

      {locale === "de" && SHOW_SCHOOL_NOTE && (
        <SchoolNote className="inline-flex sm:hidden absolute top-6 right-3 z-20 rotate-[6deg]" />
      )}
      {locale === "de" && SHOW_NGO_BADGE && (
        <NgoCampaignBadge className="inline-flex sm:hidden absolute top-6 right-3 z-20 rotate-[6deg]" />
      )}

    </section>
  );
}

function SchoolNote({ className }: { className?: string }) {
  return (
    <HeroNote
      href="/schule"
      ariaLabel="Briefe aus dem Klassenzimmer: zur Seite für Schulen"
      kicker="Schule?"
      className={`${className ?? ""} w-[6.9rem] sm:w-[8rem] md:w-[8.4rem]`}
    >
      <span className="block">Briefe aus dem</span>
      <span className="mt-1 block decoration-airmail-rot/70 decoration-2 underline underline-offset-4">
        Klassenzimmer
      </span>
    </HeroNote>
  );
}

function NgoCampaignBadge({ className }: { className?: string }) {
  return (
    <HeroNote
      href="/ngo-briefkampagne"
      ariaLabel="Briefkampagne für NGO oder Verein starten"
      kicker="NGO oder Verein?"
      className={`${className ?? ""} w-[8.55rem] md:w-[9rem]`}
    >
      <span className="decoration-airmail-rot/70 decoration-2 underline underline-offset-4">
        Briefkampagne
      </span>
      <span className="mt-1 block">starten</span>
    </HeroNote>
  );
}

// Yellow pinned sticky note next to the hero headline.
function HeroNote({
  href,
  ariaLabel,
  kicker,
  className,
  children,
}: {
  href: string;
  ariaLabel: string;
  kicker: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`${className ?? ""} group justify-center min-h-[4.75rem] sm:min-h-[5.25rem] cursor-pointer overflow-visible rounded-[2px] rounded-br-[3.75rem_0.65rem] border border-bernstein/25 bg-[#fff0a6] bg-[linear-gradient(156deg,#fff0a6_0%,#fff0a6_60%,#f3d873_83%,#fae78f_92%,#fffbe2_100%)] px-2.5 pb-2 pt-[1.15rem] sm:px-3.5 sm:pb-2.5 sm:pt-[1.35rem] text-center font-body text-waldgruen-dark shadow-[0_12px_20px_-18px_rgba(27,67,50,0.4),10px_14px_14px_-12px_rgba(27,67,50,0.3)] transition-shadow duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_14px_22px_-18px_rgba(27,67,50,0.48),11px_16px_16px_-12px_rgba(27,67,50,0.38)] active:bg-[#ffe98b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 focus-visible:ring-offset-creme`}
      aria-label={ariaLabel}
    >
      <Image
        src="/images/ghibli-pin.webp"
        alt=""
        width={64}
        height={74}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-[1.15rem] h-[1.9rem] sm:h-[2.125rem] w-auto -translate-x-1/2 rotate-[8deg] drop-shadow-[0_4px_4px_rgba(27,67,50,0.22)] md:-top-[1.35rem] md:h-[2.4rem]"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-2 top-[2.55rem] sm:top-[2.8rem] h-px bg-bernstein/25" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-2 top-[4.15rem] sm:top-[4.55rem] h-px bg-bernstein/20" />
      <span className="relative block">
        <span className="block font-typewriter text-[0.9rem] sm:text-[1rem] font-bold leading-none text-airmail-blau">
          {kicker}
        </span>
        <span className="mt-1 block font-handwriting text-[0.95rem] sm:text-[1.05rem] font-bold leading-[0.9] text-waldgruen-dark md:text-[1.12rem]">
          {children}
        </span>
      </span>
    </Link>
  );
}
