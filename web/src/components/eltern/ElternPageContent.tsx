"use client";

import Image from "next/image";
import Link from "next/link";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ElternExperience } from "@/components/eltern/ElternExperience";
import { useUiCopy } from "@/components/i18n/LocaleProvider";
import { WizardForwardIcon } from "@/components/wizard/WizardForwardIcon";

const linkClass = "font-semibold text-waldgruen underline underline-offset-2";
const h2Class = "font-typewriter text-xl font-bold text-waldgruen-dark sm:text-2xl";
const doorClass =
  "flex items-start justify-between gap-3 rounded-xl border border-waldgruen/20 bg-white p-4 transition-colors hover:border-waldgruen/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2";
const bodyClass = "font-body text-base leading-relaxed text-warmgrau";

// Body of /eltern. The page itself stays a server component so metadata and JSON-LD stay German.
export function ElternPageContent() {
  const copy = useUiCopy().eltern;

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-16 pt-4 sm:pt-10">
      <Image
        src="/images/img-eltern-kuechentisch.webp"
        alt={copy.imageAlt}
        width={1200}
        height={510}
        sizes="(max-width: 576px) 100vw, 576px"
        priority
        className="mb-4 h-24 w-full rounded-xl object-cover object-[center_50%] shadow-md shadow-waldgruen/10 sm:mb-6 sm:h-auto"
      />

      <h1 className="font-typewriter text-2xl font-bold leading-tight tracking-tight text-waldgruen-dark text-balance sm:text-[2rem]">
        {copy.title}
      </h1>
      <p className="mt-2 font-body text-base leading-relaxed text-warmgrau sm:mt-4 sm:text-lg">
        {copy.intro}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a href="#schreiben" className={doorClass}>
          <span>
            <span className="block font-body text-base font-bold text-waldgruen-dark">{copy.doors.write.title}</span>
            <span className="mt-1 block font-body text-sm text-warmgrau/80">
              {copy.doors.write.text}
            </span>
          </span>
          <WizardForwardIcon className="mt-1 shrink-0 rotate-90 text-waldgruen" />
        </a>
        <a href="#sicher" className={doorClass}>
          <span>
            <span className="block font-body text-base font-bold text-waldgruen-dark">{copy.doors.safe.title}</span>
            <span className="mt-1 block font-body text-sm text-warmgrau/80">
              {copy.doors.safe.text}
            </span>
          </span>
          <WizardForwardIcon className="mt-1 shrink-0 rotate-90 text-waldgruen" />
        </a>
      </div>

      <div id="schreiben" className="mt-8 scroll-mt-32">
        <ElternExperience />
      </div>

      <section aria-labelledby="eltern-zustaendig" className="reveal mt-14">
        <h2 id="eltern-zustaendig" className={h2Class}>{copy.responsibility.heading}</h2>
        <div className="mt-5 -rotate-1 border border-warmgrau/20 bg-creme p-5 shadow-[3px_4px_0_rgba(107,100,92,0.15)] motion-reduce:rotate-0 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
            <div>
              <h3 className="font-typewriter text-xl font-bold text-waldgruen">{copy.responsibility.land.title}</h3>
              <p className={`${bodyClass} mt-1`}>
                {copy.responsibility.land.text}
              </p>
              <p className="mt-2 font-body text-sm font-semibold text-waldgruen-dark">
                {copy.responsibility.land.who}
              </p>
            </div>
            <div className="border-t border-dashed border-warmgrau/30 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
              <h3 className="font-typewriter text-xl font-bold text-airmail-blau">{copy.responsibility.school.title}</h3>
              <p className={`${bodyClass} mt-1`}>
                {copy.responsibility.school.text}
              </p>
              <p className="mt-2 font-body text-sm font-semibold text-waldgruen-dark">
                {copy.responsibility.school.who}
              </p>
            </div>
          </div>
        </div>
        <p className={`${bodyClass} mt-4`}>
          {copy.responsibility.note}
        </p>
      </section>

      <section id="sicher" aria-labelledby="eltern-daten" className="reveal mt-14 scroll-mt-32">
        <h2 id="eltern-daten" className={h2Class}>{copy.safety.heading}</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-waldgruen">
          {copy.safety.bullets.map((bullet) => (
            <li key={bullet} className={bodyClass}>
              {bullet}
            </li>
          ))}
        </ul>
        <p className={`${bodyClass} mt-4`}>
          {copy.safety.detailsLead}{" "}
          <Link href="/datenschutz#jugendmodus" className={linkClass}>{copy.safety.privacyLink}</Link>{" "}
          {copy.safety.detailsMiddle}{" "}
          <Link href="/unterricht" className={linkClass}>{copy.safety.schoolsLink}</Link>{copy.safety.detailsEnd}
        </p>
      </section>

      <section aria-labelledby="eltern-faq" className="reveal mt-14">
        <h2 id="eltern-faq" className={`${h2Class} mb-4`}>{copy.faqHeading}</h2>
        <FAQAccordion items={copy.faqs} />
      </section>
    </div>
  );
}
