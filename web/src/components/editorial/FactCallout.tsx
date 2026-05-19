import { ReactNode } from "react";

interface FactCalloutProps {
  number: ReactNode;
  label: ReactNode;
  source?: ReactNode;
}

export function FactCallout({ number, label, source }: FactCalloutProps) {
  return (
    <div className="my-10 md:my-12 border-y border-waldgruen/15 py-6 md:py-8 flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-6">
      <p className="font-body text-5xl md:text-6xl font-bold text-waldgruen leading-none tabular-nums shrink-0">
        {number}
      </p>
      <div className="flex-1">
        <p className="font-body text-base md:text-lg text-waldgruen-dark leading-snug">
          {label}
        </p>
        {source ? (
          <p className="font-typewriter text-xs uppercase tracking-widest text-warmgrau/50 mt-2">
            {source}
          </p>
        ) : null}
      </div>
    </div>
  );
}
