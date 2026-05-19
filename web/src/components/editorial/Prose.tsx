import { ReactNode } from "react";

interface ProseProps {
  children: ReactNode;
  className?: string;
}

/**
 * Editorial article wrapper.
 * - Creates a block formatting context (flow-root) that contains floated Figures.
 * - Clears structured siblings (h2, lists, asides, sections, divs) so floats
 *   don't bleed into them.
 * - Bakes in baseline h2 styling for magazine consistency across pages.
 */
export function Prose({ children, className = "" }: ProseProps) {
  return (
    <article
      className={`
        font-body text-warmgrau leading-[1.85] space-y-7 text-base md:text-lg
        flow-root
        [&>h2]:clear-both [&>h3]:clear-both
        [&>ul]:clear-both [&>ol]:clear-both
        [&>aside]:clear-both [&>section]:clear-both [&>div]:clear-both
        [&>h2]:font-body [&>h2]:text-2xl md:[&>h2]:text-3xl
        [&>h2]:font-bold [&>h2]:text-waldgruen-dark [&>h2]:pt-4
        ${className}
      `}
    >
      {children}
    </article>
  );
}
