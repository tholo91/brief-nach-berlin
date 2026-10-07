import Link from "next/link";
import { ReactNode } from "react";

interface StartLetterCtaProps {
  eyebrow: ReactNode;
  children: ReactNode;
  className?: string;
}

const AIRMAIL_EDGE =
  "repeating-linear-gradient(-45deg, var(--color-airmail-rot) 0 10px, var(--color-creme) 10px 15px, var(--color-airmail-blau) 15px 25px, var(--color-creme) 25px 30px)";

export function StartLetterCta({
  eyebrow,
  children,
  className = "",
}: StartLetterCtaProps) {
  return (
    <aside
      className={`relative overflow-hidden rounded-xl border border-warmgrau/15 bg-white shadow-sm ${className}`}
    >
      <div aria-hidden className="h-1.5" style={{ background: AIRMAIL_EDGE }} />
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:p-6">
        <div>
          <p className="font-typewriter text-xs font-bold uppercase tracking-widest text-airmail-blau/70 mb-1">
            {eyebrow}
          </p>
          <p className="font-body text-base leading-snug text-waldgruen-dark text-pretty">
            {children}
          </p>
        </div>
        <Link
          href="/app"
          className="shrink-0 self-start sm:self-center inline-block rounded-xl bg-waldgruen px-5 py-3 font-body text-base font-semibold text-creme transition-colors hover:bg-waldgruen-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen-dark"
        >
          Brief starten &rarr;
        </Link>
      </div>
    </aside>
  );
}
