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
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] md:gap-16">
        <div className="mx-auto w-full max-w-sm md:mx-0">
          <div className="relative aspect-[10/9] overflow-hidden rounded-2xl ring-1 ring-waldgruen/10">
            <Image
              src={SUPPORT_CONTENT.founder.portraitPath}
              alt={copy.projectSupport.portraitAlt}
              fill
              sizes="(min-width: 768px) 32vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <p className="mb-3 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/50">
            {copy.projectSupport.eyebrow}
          </p>
          <h2 className="max-w-2xl text-balance font-body text-3xl font-bold tracking-tight text-waldgruen-dark md:text-4xl">
            {copy.projectSupport.title}
          </h2>

          <div className="mt-6 max-w-2xl space-y-4 font-body text-base leading-relaxed text-warmgrau">
            <p>{copy.projectSupport.status}</p>
            <p>
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
          </div>

          <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <Link
              href={SUPPORT_CONTENT.ctas.learnMore.href}
              prefetch={false}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-waldgruen px-6 py-3 text-center font-body text-base font-semibold text-creme shadow-lg shadow-waldgruen/20 transition-colors hover:bg-waldgruen-dark active:scale-[0.98]"
            >
              {copy.projectSupport.support}
            </Link>
            <Link
              href={SUPPORT_CONTENT.ctas.share.href}
              prefetch={false}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-waldgruen bg-transparent px-6 py-3 text-center font-body text-base font-semibold text-waldgruen transition-colors hover:bg-waldgruen/5 active:scale-[0.98]"
            >
              {copy.projectSupport.share}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
