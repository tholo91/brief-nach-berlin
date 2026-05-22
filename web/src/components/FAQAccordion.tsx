import type { ReactNode } from "react";

type FAQItem = {
  q: string;
  a: string;
  aNode?: ReactNode;
};

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

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  return (
    <div className="divide-y divide-waldgruen/15 border-y border-waldgruen/15 not-prose">
      {items.map((item) => (
        <details
          key={item.q}
          className="group [&[open]_svg]:rotate-180 [&[open]]:bg-waldgruen/[0.03] rounded-lg transition-colors duration-150 -mx-3 px-3"
        >
          <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="font-body text-base md:text-lg font-semibold text-waldgruen-dark pr-2 transition-colors duration-150 group-open:text-waldgruen">
              {item.q}
            </span>
            <ChevronIcon />
          </summary>
          <p className="font-body text-base text-warmgrau leading-relaxed pb-6 pr-8">
            {item.aNode ?? item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
