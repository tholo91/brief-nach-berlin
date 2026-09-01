"use client";

import Link from "next/link";
import { CONTACT } from "@/lib/contact";
import { useUiCopy } from "@/components/i18n/LocaleProvider";

export default function Roadmap() {
  const copy = useUiCopy();
  return (
    <section id="roadmap" className="py-20 md:py-28 px-6 bg-waldgruen-dark/[0.03]">
      <div className="max-w-5xl mx-auto">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          {copy.roadmap.eyebrow}
        </p>
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-4 md:max-w-none max-w-xl">
          {copy.roadmap.title}
        </h2>
        <p className="font-body text-base md:text-lg text-warmgrau/80 leading-relaxed mb-14 max-w-2xl">
          {copy.roadmap.intro}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-waldgruen/10 p-7 flex flex-col gap-4 md:col-span-1">
            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-waldgruen">
                <line x1="13" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="7" y1="22" x2="29" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="28" x2="32" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50 mb-2">
                {copy.roadmap.levelEyebrow}
              </p>
              <h3 className="font-body text-lg font-bold text-waldgruen-dark leading-snug mb-3">
                {copy.roadmap.levelTitle}
              </h3>
              <p className="font-body text-base text-warmgrau/80 leading-relaxed mb-3">
                {copy.roadmap.levelDescription}
              </p>
              <p className="font-body text-sm text-warmgrau/70 leading-relaxed mb-4">
                <Link href="/kommune-land-bund-eu" prefetch={false} className="text-waldgruen hover:text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-2 hover:decoration-waldgruen transition-colors">
                  {copy.roadmap.levelLink}
                </Link>
              </p>
              <span className="inline-block font-typewriter text-[10px] font-bold tracking-wider uppercase text-waldgruen bg-waldgruen/10 px-2 py-0.5 rounded-full">
                {copy.roadmap.live}
              </span>
            </div>
          </div>

          <div
            id="mitmachen"
            className="bg-white rounded-xl border border-waldgruen/10 p-7 md:p-10 flex flex-col gap-5 md:col-span-2"
          >
            <div>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-waldgruen">
                <path d="M18 4l3.6 7.3 8 1.2-5.8 5.6 1.4 8L18 22.3 10.8 26l1.4-8L6.4 12.5l8-1.2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
                <path d="M12 30h12M15 33h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-typewriter text-xs font-bold tracking-widest uppercase text-waldgruen/50">
              {copy.roadmap.visibilityEyebrow}
            </p>
            <h3 className="font-body text-xl md:text-2xl font-bold text-waldgruen-dark leading-snug">
              {copy.roadmap.visibilityTitle}
            </h3>
            <p className="font-body text-base text-warmgrau leading-relaxed max-w-xl">
              {copy.roadmap.visibilityDescription} {" "}
              <Link
                href="/europe"
                prefetch={false}
                className="text-waldgruen hover:text-waldgruen-dark underline underline-offset-2 transition-colors"
              >
                {copy.roadmap.europeLink}
              </Link>
              .
            </p>
            <div className="mt-1">
              <p className="font-body text-base text-warmgrau leading-relaxed mb-1">
                {copy.roadmap.greeting}
              </p>
              <p className="font-handwriting text-2xl text-waldgruen-dark/60">
                Thomas
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-2 max-w-xl">
              <a
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(copy.roadmap.visibilityTitle)}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap bg-waldgruen text-creme font-body font-semibold text-sm sm:text-base px-5 py-3 rounded-xl hover:bg-waldgruen-dark transition-colors cursor-pointer shadow-lg shadow-waldgruen/20 active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M2 8l10 7 10-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {copy.roadmap.contact}
              </a>
              <Link
                href="/europe"
                prefetch={false}
                className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap bg-white text-waldgruen border-2 border-waldgruen font-body font-semibold text-sm sm:text-base px-5 py-3 rounded-xl hover:bg-waldgruen/5 transition-colors cursor-pointer active:scale-[0.98]"
              >
                {copy.roadmap.viewEurope}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
