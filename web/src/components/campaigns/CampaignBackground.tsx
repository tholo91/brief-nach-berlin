import Image from "next/image";
import type { ReactNode } from "react";

export function CampaignBackground({ children }: { children: ReactNode }) {
  return (
    <section className="theme-auto relative isolate flex flex-1 flex-col overflow-hidden bg-creme">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(98,138,90,0.14),transparent_42%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(62vw,640px)] min-h-[320px] overflow-hidden"
      >
        <picture className="absolute inset-0">
          <source
            media="(prefers-color-scheme: dark)"
            srcSet="/images/img-campaign-crowd-night.webp"
          />
          <Image
            src="/images/img-campaign-crowd-ghibli.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-bottom"
            style={{
              opacity: 0.18,
              maskImage:
                "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.34) 34%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.34) 34%, rgba(0,0,0,0) 100%)",
            }}
          />
        </picture>
      </div>
      {children}
    </section>
  );
}
