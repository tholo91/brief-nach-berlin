import Image from "next/image";
import type { ReactNode } from "react";

export function CampaignBackground({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-creme">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(98,138,90,0.14),transparent_42%)]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      >
        <Image
          src="/images/img-campaign-crowd-ghibli.png"
          alt=""
          width={1368}
          height={768}
          sizes="100vw"
          className="h-auto w-full object-cover object-center"
          style={{
            opacity: 0.18,
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.34) 34%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.34) 34%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>
      {children}
    </section>
  );
}
