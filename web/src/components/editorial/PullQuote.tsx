import { ReactNode } from "react";

interface PullQuoteProps {
  children: ReactNode;
  attribution?: ReactNode;
  align?: "left" | "right";
  /** When true, renders a large decorative „ behind the quote. Use sparingly. */
  decorative?: boolean;
}

export function PullQuote({
  children,
  attribution,
  align = "left",
  decorative = false,
}: PullQuoteProps) {
  const borderSide =
    align === "right"
      ? "border-r-4 pr-6 md:pr-8 text-right ml-auto"
      : "border-l-4 pl-6 md:pl-8";

  const ornamentPosition =
    align === "right"
      ? "-top-3 right-0 md:-right-2"
      : "-top-3 left-0 md:-left-2";

  return (
    <aside className="my-10 md:my-14 relative">
      {decorative ? (
        <span
          aria-hidden
          className={`absolute ${ornamentPosition} font-handwriting text-7xl md:text-8xl text-waldgruen/10 leading-none select-none pointer-events-none`}
        >
          „
        </span>
      ) : null}
      <div className={`relative border-waldgruen/70 ${borderSide} max-w-xl`}>
        <p className="font-handwriting text-2xl md:text-3xl text-waldgruen-dark leading-snug text-balance">
          {children}
        </p>
        {attribution ? (
          <p className="font-typewriter text-xs uppercase tracking-widest text-waldgruen/60 mt-3">
            {attribution}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
