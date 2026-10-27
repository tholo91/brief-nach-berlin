import Image from "next/image";
import Link from "next/link";
import { SUPPORT_CONTENT, SUPPORT_EMAIL_COPY } from "@/lib/support-content";

export function DonationCard({
  titleId,
  title,
  body,
  className,
}: {
  titleId: string;
  title: string;
  body: string;
  className?: string;
}) {
  const sectionClass = [
    "overflow-hidden rounded-2xl border border-waldgruen/15 bg-creme/90 px-5 py-5 shadow-[0_18px_50px_-38px_rgba(24,70,51,0.7)] backdrop-blur-[2px] sm:px-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section aria-labelledby={titleId} className={sectionClass}>
      <h2 id={titleId} className="font-body text-lg font-semibold leading-snug text-waldgruen-dark">
        {title}
      </h2>

      <div className="mt-4 flex items-start gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-waldgruen/10">
          <Image
            src={SUPPORT_CONTENT.founder.portraitPath}
            alt="Thomas Lorenz, der Brief-nach-Berlin entwickelt"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <p className="font-body text-sm leading-relaxed text-warmgrau/75">{body}</p>
      </div>

      <div className="mt-4 grid gap-2 min-[440px]:grid-cols-2">
        <a
          href={SUPPORT_CONTENT.ctas.donate.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-waldgruen px-5 py-2.5 font-body text-sm font-semibold text-creme transition-[background-color,transform] duration-200 hover:bg-waldgruen-dark active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
          {SUPPORT_EMAIL_COPY.de.compactButton}
        </a>
        <Link
          href={SUPPORT_CONTENT.ctas.learnMore.href}
          prefetch={false}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-waldgruen/30 bg-white/45 px-5 py-2.5 font-body text-sm font-semibold text-waldgruen transition-[border-color,background-color,transform] duration-200 hover:border-waldgruen hover:bg-white/80 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
        >
          {SUPPORT_EMAIL_COPY.de.infoButton}
        </Link>
      </div>
    </section>
  );
}
