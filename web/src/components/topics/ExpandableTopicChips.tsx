"use client";

import { useState, type ReactNode } from "react";
import { ChevronIcon } from "@/components/FAQAccordion";
import { TopicStarterGrid, type TopicStarterGridProps } from "./TopicStarterGrid";

type Props = Omit<TopicStarterGridProps, "variant" | "expanded" | "id"> & {
  heading: ReactNode;
  gridId: string;
  hint?: ReactNode;
};

export function ExpandableTopicChips({ heading, gridId, hint, ...gridProps }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        {heading}
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={gridId}
          onClick={() => setExpanded((value) => !value)}
          className="-my-2.5 inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 font-body text-sm font-semibold text-waldgruen hover:text-waldgruen-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-waldgruen focus-visible:ring-offset-2 [&[aria-expanded=true]_svg]:rotate-180"
        >
          {expanded ? "Weniger" : "Alle Themen"}
          <ChevronIcon />
        </button>
      </div>
      {hint}
      <TopicStarterGrid {...gridProps} variant="scroll" id={gridId} expanded={expanded} />
    </>
  );
}
