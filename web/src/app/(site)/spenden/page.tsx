import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { APP_URL, DONATION_PROVIDER_URL } from "@/lib/config";
import { SUPPORT_CONTENT } from "@/lib/support-content";

const TITLE = "Brief-nach-Berlin unterstützen";
const DESCRIPTION =
  "Mit deiner Spende hilfst du, Brief-nach-Berlin kostenlos und unabhängig zu halten. Die Abwicklung erfolgt über die WE AID gGmbH.";

export const metadata: Metadata = {
  title: `${TITLE} | Brief-nach-Berlin`,
  description: DESCRIPTION,
  alternates: { canonical: `${APP_URL}/spenden` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "de_DE",
    url: `${APP_URL}/spenden`,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function SpendenPage() {
  return (
    <div className="min-h-screen bg-creme px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-block font-typewriter text-sm text-waldgruen transition-colors hover:text-waldgruen-dark"
        >
          &larr; Zurück
        </Link>

        <p className="mb-3 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
          Gemeinsam unabhängig
        </p>
        <h1 className="mb-6 text-balance font-body text-3xl font-bold tracking-tight text-waldgruen-dark md:text-4xl">
          {SUPPORT_CONTENT.headline}
        </h1>
        <p className="mb-10 text-pretty font-handwriting text-xl leading-relaxed text-warmgrau md:text-2xl">
          {SUPPORT_CONTENT.intro}
        </p>

        <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <figure className="w-full max-w-[180px] shrink-0">
            <Image
              src={SUPPORT_CONTENT.founder.portraitPath}
              alt={`${SUPPORT_CONTENT.founder.name}, Gründer von Brief-nach-Berlin`}
              width={400}
              height={360}
              sizes="180px"
              className="h-auto w-full rounded-2xl border-4 border-creme object-cover shadow-lg shadow-waldgruen/20"
            />
            <figcaption className="mt-3 text-center font-typewriter text-xs text-waldgruen/60">
              {SUPPORT_CONTENT.founder.name}, Bremen
            </figcaption>
          </figure>

          <p className="font-body text-base leading-relaxed text-warmgrau md:text-lg">
            {SUPPORT_CONTENT.founder.text}
          </p>
        </section>

        <section className="my-14 border-y border-waldgruen/15 py-6">
          <p className="font-body text-base font-bold leading-relaxed text-waldgruen-dark">
            {SUPPORT_CONTENT.status}
          </p>
          <p className="mt-2 font-body text-base leading-relaxed text-warmgrau">
            {SUPPORT_CONTENT.fiscalHost.text}
          </p>
        </section>

        <section>
          <p className="mb-3 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Wofür deine Spende eingesetzt wird
          </p>
          <h2 className="font-body text-2xl font-bold tracking-tight text-waldgruen-dark md:text-3xl">
            Ein klarer Überblick statt Kleingedrucktem
          </h2>
          <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-warmgrau md:text-lg">
            {SUPPORT_CONTENT.costIntro}
          </p>

          <ol className="mt-7 border-y border-waldgruen/15">
            {SUPPORT_CONTENT.costCategories.map((category, index) => (
              <li
                key={category.title}
                className="grid gap-2 border-b border-waldgruen/15 py-5 last:border-b-0 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-4"
              >
                <span className="font-typewriter text-sm font-bold text-waldgruen/50">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-body text-lg font-bold text-waldgruen-dark">
                    {category.title}
                  </h3>
                  <p className="mt-1 font-body text-base leading-relaxed text-warmgrau">
                    {category.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 font-body text-sm leading-relaxed text-warmgrau/75">
            {SUPPORT_CONTENT.costNote}
          </p>
        </section>

        <section className="mt-14 rounded-sm border-2 border-waldgruen/20 p-6 sm:p-8">
          <p className="mb-3 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Gemeinsam möglich machen
          </p>
          <h2 className="font-body text-2xl font-bold text-waldgruen-dark md:text-3xl">
            Wenn du kannst, hilf mit.
          </h2>
          <p className="mt-3 font-body text-base leading-relaxed text-warmgrau">
            {SUPPORT_CONTENT.fundingNote}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={DONATION_PROVIDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-waldgruen px-5 py-3 font-body text-base font-bold text-creme transition-colors hover:bg-waldgruen-dark active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
            >
              {SUPPORT_CONTENT.ctas.donate.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
            <Link
              href={SUPPORT_CONTENT.ctas.share.href}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-waldgruen bg-transparent px-5 py-3 font-body text-base font-bold text-waldgruen transition-colors hover:bg-waldgruen/5 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen"
            >
              {SUPPORT_CONTENT.ctas.share.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.6 10.5 6.8-4" />
                <path d="m8.6 13.5 6.8 4" />
              </svg>
            </Link>
          </div>
          <p className="mt-4 font-body text-sm leading-relaxed text-warmgrau/80">
            {SUPPORT_CONTENT.sharePrompt}
          </p>
          <p className="mt-2 font-body text-sm leading-relaxed text-warmgrau/70">
            Die Spende wird auf der Website von {SUPPORT_CONTENT.fiscalHost.name} abgewickelt.
          </p>
        </section>

        <section className="mt-14">
          <p className="mb-3 font-typewriter text-sm font-bold uppercase tracking-widest text-waldgruen/60">
            Noch Fragen?
          </p>
          <h2 className="font-body text-2xl font-bold tracking-tight text-waldgruen-dark md:text-3xl">
            Mehr über das Projekt erfahren
          </h2>
          <nav aria-label="Weiterführende Informationen" className="mt-7 border-y border-waldgruen/15">
            {SUPPORT_CONTENT.relatedLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group grid gap-2 border-b border-waldgruen/15 py-5 transition-colors last:border-b-0 hover:text-waldgruen sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
              >
                <span>
                  <span className="block font-body text-lg font-bold text-waldgruen-dark group-hover:text-waldgruen">
                    {item.title}
                  </span>
                  <span className="mt-1 block font-body text-base leading-relaxed text-warmgrau">
                    {item.description}
                  </span>
                </span>
                <span className="font-typewriter text-sm font-bold text-waldgruen" aria-hidden="true">
                  Weiterlesen &rarr;
                </span>
              </Link>
            ))}
          </nav>
        </section>
      </div>
    </div>
  );
}
