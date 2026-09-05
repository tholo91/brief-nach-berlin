"use client";

import Image from "next/image";
import Link from "next/link";
import { useUiCopy } from "@/components/i18n/LocaleProvider";
import { SUPPORT_CONTENT } from "@/lib/support-content";

const SOURCE_CODE_URL = "https://github.com/tholo91/brief-nach-berlin";

export default function ProjectSupport() {
  const copy = useUiCopy();

  return (
    <section
      id="mitmachen"
      className="scroll-mt-20 bg-waldgruen-dark/[0.03] px-6 py-20 md:py-28"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-[96px_minmax(0,1fr)] items-start gap-x-4 gap-y-0 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] md:items-center md:gap-x-16">
        <div className="col-start-1 row-start-4 w-24 self-center md:col-start-1 md:row-start-1 md:row-span-5 md:mx-0 md:w-full md:max-w-sm md:self-center">
          <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-waldgruen/10 md:aspect-[10/9]">
            <Image
              src={SUPPORT_CONTENT.founder.portraitPath}
              alt={copy.projectSupport.portraitAlt}
              fill
              sizes="(min-width: 768px) 32vw, 96px"
              className="object-cover opacity-75 saturate-[0.78] md:opacity-100 md:saturate-100"
            />
          </div>
        </div>

        <p className="col-span-2 row-start-1 mb-3 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/50 md:col-span-1 md:col-start-2 md:row-start-1">
          {copy.projectSupport.eyebrow}
        </p>
        <h2 className="col-span-2 row-start-2 max-w-2xl text-balance font-body text-3xl font-bold tracking-tight text-waldgruen-dark md:col-span-1 md:col-start-2 md:row-start-2 md:text-4xl">
          {copy.projectSupport.title}
        </h2>

        <p className="col-span-2 row-start-3 mt-6 max-w-2xl font-body text-base leading-relaxed text-warmgrau md:col-span-1 md:col-start-2 md:row-start-3">
          {copy.projectSupport.status}
        </p>

        <p className="col-start-2 row-start-4 mt-4 max-w-2xl self-start font-body text-base leading-relaxed text-warmgrau md:col-start-2 md:row-start-4">
          {copy.projectSupport.founderPrefix}{" "}
          <a
            href={SOURCE_CODE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-waldgruen underline decoration-waldgruen/30 underline-offset-4 transition-colors hover:text-waldgruen-dark hover:decoration-waldgruen"
          >
            {copy.projectSupport.openSourceLabel}
          </a>{" "}
          {copy.projectSupport.founderSuffix}
        </p>

        <div className="col-span-2 row-start-5 mt-8 flex max-w-2xl flex-col gap-3 md:col-span-1 md:col-start-2 md:row-start-5 sm:flex-row">
          <Link
            href={SUPPORT_CONTENT.ctas.learnMore.href}
            prefetch={false}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-waldgruen px-6 py-3 text-center font-body text-base font-semibold text-creme shadow-lg shadow-waldgruen/20 transition-colors hover:bg-waldgruen-dark active:scale-[0.98]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
            </svg>
            {copy.projectSupport.support}
          </Link>
          <Link
            href={SUPPORT_CONTENT.ctas.share.href}
            prefetch={false}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-waldgruen bg-transparent px-6 py-3 text-center font-body text-base font-semibold text-waldgruen transition-colors hover:bg-waldgruen/5 active:scale-[0.98]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="m8.59 13.51 6.83 3.98M15.41 6.51 8.59 10.49" />
            </svg>
            {copy.projectSupport.share}
          </Link>
        </div>
      </div>
    </section>
  );
}
