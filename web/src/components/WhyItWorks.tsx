"use client";

import Image from "next/image";
import Link from "next/link";
import { useUiCopy } from "@/components/i18n/LocaleProvider";

export default function WhyItWorks() {
  const copy = useUiCopy();
  const stats = [
    { number: "9.260", label: copy.whyItWorks.stat1, source: copy.whyItWorks.stat1Source },
    { number: "70 %", label: copy.whyItWorks.stat2, source: copy.whyItWorks.stat2Source },
  ];
  return (
    <section id="warum-briefe" className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          {copy.whyItWorks.eyebrow}
        </p>
        <h2 className="font-body text-3xl md:text-4xl font-bold text-waldgruen-dark tracking-tight mb-4 md:max-w-none max-w-xl">
          {copy.whyItWorks.title}
        </h2>
        <p className="font-body text-base text-warmgrau/80 leading-relaxed mb-14 max-w-2xl">
          {copy.whyItWorks.description}{" "}
          <Link
            href="/handschriftliche-briefe-wirkung"
            prefetch={false}
            className="text-waldgruen hover:text-waldgruen-dark underline decoration-waldgruen/30 underline-offset-2 hover:decoration-waldgruen transition-colors"
          >
            {copy.whyItWorks.studiesLink}
          </Link>
        </p>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left column: Ghibli illustration */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-[0_24px_60px_-24px_rgba(45,80,22,0.35)] ring-1 ring-warmgrau/10">
              <Image
                src="/images/letter-on-desk.webp"
                alt={copy.whyItWorks.imageAlt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority={false}
              />
            </div>
          </div>

          {/* Right column: stats */}
          <div className="space-y-10 md:space-y-12">
            {stats.map((stat) => (
              <div key={stat.number} className="pl-5 border-l-2 border-airmail-rot/50">
                <div className="font-typewriter text-5xl md:text-6xl font-bold text-waldgruen mb-3 leading-none">
                  {stat.number}
                </div>
                <p className="font-body text-base text-warmgrau leading-relaxed mb-2">
                  {stat.label}
                </p>
                <p className="font-body text-xs text-warmgrau/40 uppercase tracking-wide">
                  {copy.whyItWorks.source.replace("{source}", stat.source)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
