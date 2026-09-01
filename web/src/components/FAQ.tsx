"use client";

import { useUiCopy } from "@/components/i18n/LocaleProvider";

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-waldgruen transition-transform duration-200"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FAQ() {
  const copy = useUiCopy();
  const items = [
    [copy.faq.freeQuestion, copy.faq.freeAnswer],
    [copy.faq.dataQuestion, copy.faq.dataAnswer],
    [copy.faq.lettersQuestion, copy.faq.lettersAnswer],
    [copy.faq.representativeQuestion, copy.faq.representativeAnswer],
    [copy.faq.levelsQuestion, copy.faq.levelsAnswer],
    [copy.faq.aboutQuestion, copy.faq.aboutAnswer],
  ].map(([question, answer]) => ({ question, answer }));
  return (
    <section id="faq" className="py-20 md:py-28 px-6 bg-creme">
      <div className="max-w-2xl mx-auto">
        <p className="font-typewriter text-sm font-bold tracking-widest uppercase text-waldgruen/50 mb-3">
          {copy.faq.eyebrow}
        </p>
        <h2 className="font-body text-2xl md:text-3xl font-bold text-waldgruen-dark tracking-tight mb-12">
          {copy.faq.title}
        </h2>

        <div className="divide-y divide-waldgruen/15 border-y border-waldgruen/15">
          {items.map((item) => (
            <details
              key={item.question}
              className="group [&[open]_svg]:rotate-180 [&[open]]:bg-waldgruen/[0.03] rounded-lg transition-colors duration-150 -mx-3 px-3"
            >
              <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-body text-base md:text-lg font-semibold text-waldgruen-dark pr-2 transition-colors duration-150 group-open:text-waldgruen">
                  {item.question}
                </span>
                <ChevronIcon />
              </summary>
              <p className="font-body text-base text-warmgrau leading-relaxed pb-6 pr-8">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
