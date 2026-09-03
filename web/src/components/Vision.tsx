"use client";

import Image from "next/image";
import Link from "next/link";
import { useUiCopy } from "@/components/i18n/LocaleProvider";

export default function Vision() {
  const copy = useUiCopy();
  return (
    <section id="idee" className="py-20 md:py-28 px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div className="text-center md:text-left">
          <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
            {copy.vision.eyebrow}
          </p>
          <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-10">
            {copy.vision.title}
          </h2>

          <div className="font-body text-base text-warmgrau leading-relaxed space-y-5 text-left">
            <p>
              {copy.vision.paragraph1}
            </p>
            <p>{copy.vision.paragraph2}</p>
            <p>
              {copy.vision.paragraph3}{" "}
              <Link
                href="/warum"
                prefetch={false}
                className="text-waldgruen hover:text-waldgruen-dark underline decoration-waldgruen/40 underline-offset-4 hover:decoration-waldgruen transition-colors"
              >
                {copy.vision.storyLink}
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="relative aspect-square w-full max-w-md mx-auto md:max-w-none rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/images/bundestag-team-besprechung.webp"
            alt={copy.vision.imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
